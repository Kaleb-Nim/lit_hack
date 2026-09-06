/**
 * Streaming client for the OpenAI Responses API.
 *
 * A regulatory review runs web search and reasons over a whole contract, so a
 * single call takes two to three minutes. Requested without `stream`, the API
 * sends no bytes at all for that entire window, and a connection that idles
 * that long does not survive every network path between here and OpenAI — the
 * socket is reset mid-flight and undici surfaces it as `TypeError: fetch failed`
 * with `cause: Error: read ECONNRESET`. Measured on the development machine:
 * three non-streaming calls failed at 30s, 69s and 34s; the same three requests
 * with `stream: true` completed in 165s, 164s and 177s with the first byte
 * arriving after 0.9s.
 *
 * Streaming is used only to keep bytes moving. Nothing renders incrementally —
 * the events are consumed until the terminal one, and its `response` object is
 * returned in the same shape a non-streaming call would have produced.
 */

export type OpenAIResponse = Record<string, unknown>;

type StreamEvent = {
  type?: string;
  response?: OpenAIResponse;
  message?: string;
  error?: { message?: string };
};

const terminalEvents = new Set(["response.completed", "response.incomplete", "response.failed"]);

function errorMessage(response: OpenAIResponse) {
  return (response.error as { message?: string } | undefined)?.message;
}

/**
 * Send one Responses API request and resolve with the completed response.
 *
 * Throws when the request is rejected, when the stream reports an error, or
 * when it ends without a terminal event. An `incomplete` response is returned
 * rather than thrown, so callers can explain the truncation in their own words.
 */
export async function createResponse(apiKey: string, request: Record<string, unknown>, signal?: AbortSignal): Promise<OpenAIResponse> {
  const httpResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({ ...request, stream: true }),
    signal,
  });

  if (!httpResponse.ok || !httpResponse.body) {
    const payload = await httpResponse.json().catch(() => null) as { error?: { message?: string } } | null;
    throw new Error(payload?.error?.message ?? `OpenAI returned ${httpResponse.status}`);
  }

  const reader = httpResponse.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let completed: OpenAIResponse | null = null;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let newline = buffer.indexOf("\n");
    while (newline >= 0) {
      const line = buffer.slice(0, newline).trim();
      buffer = buffer.slice(newline + 1);
      newline = buffer.indexOf("\n");
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (!data || data === "[DONE]") continue;

      let event: StreamEvent;
      try {
        event = JSON.parse(data) as StreamEvent;
      } catch {
        continue; // A partial frame is completed by the next chunk.
      }

      if (event.type === "error") throw new Error(event.message ?? event.error?.message ?? "OpenAI reported a stream error.");
      if (event.type && terminalEvents.has(event.type) && event.response) completed = event.response;
    }
  }

  if (!completed) throw new Error("OpenAI ended the response stream without returning a result.");
  if (completed.status === "failed") throw new Error(errorMessage(completed) ?? "OpenAI could not complete the request.");
  return completed;
}

/** Read the assistant's text out of a completed response. */
export function responseText(response: OpenAIResponse) {
  if (typeof response.output_text === "string") return response.output_text;
  const output = Array.isArray(response.output) ? response.output : [];
  for (const item of output as Array<{ content?: Array<{ type?: string; text?: string }> }>) {
    const text = item.content?.find((part) => part.type === "output_text")?.text;
    if (text) return text;
  }
  return "";
}

/** Read a refusal out of a completed response, when the model declined instead of answering. */
export function responseRefusal(response: OpenAIResponse) {
  const output = Array.isArray(response.output) ? response.output : [];
  for (const item of output as Array<{ content?: Array<{ type?: string; refusal?: string }> }>) {
    const refusal = item.content?.find((part) => part.type === "refusal")?.refusal;
    if (refusal) return refusal;
  }
  return "";
}

/** Explain a response the model could not finish, in the caller's own terms. */
export function incompleteReason(response: OpenAIResponse) {
  if (response.status !== "incomplete") return null;
  return (response.incomplete_details as { reason?: string } | undefined)?.reason ?? "unknown reason";
}

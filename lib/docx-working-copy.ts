"use client";

import JSZip from "jszip";

const WORD_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
const XML_NS = "http://www.w3.org/XML/1998/namespace";

export type EditableParagraph = { index: number; text: string };

function parseDocument(xml: string) {
  const document = new DOMParser().parseFromString(xml, "application/xml");
  if (document.querySelector("parsererror")) throw new Error("The Word document XML could not be parsed.");
  return document;
}

function wordParagraphs(document: XMLDocument) {
  return Array.from(document.getElementsByTagNameNS(WORD_NS, "p"));
}

function textNodes(paragraph: Element) {
  return Array.from(paragraph.getElementsByTagNameNS(WORD_NS, "t"));
}

export async function readDocxParagraphs(source: ArrayBuffer): Promise<EditableParagraph[]> {
  const zip = await JSZip.loadAsync(source);
  const part = zip.file("word/document.xml");
  if (!part) throw new Error("This file is not a supported Word document.");
  const document = parseDocument(await part.async("string"));
  return wordParagraphs(document).map((paragraph, index) => ({ index, text: textNodes(paragraph).map((node) => node.textContent ?? "").join("") })).filter((paragraph) => paragraph.text.trim().length > 0);
}

export async function buildWorkingCopy(source: ArrayBuffer, edits: Map<number, string>) {
  const zip = await JSZip.loadAsync(source);
  const part = zip.file("word/document.xml");
  if (!part) throw new Error("This file is not a supported Word document.");
  const document = parseDocument(await part.async("string"));
  const paragraphs = wordParagraphs(document);
  edits.forEach((value, index) => {
    const nodes = textNodes(paragraphs[index]);
    if (!nodes.length) return;
    nodes[0].textContent = value;
    nodes[0].setAttributeNS(XML_NS, "xml:space", "preserve");
    nodes.slice(1).forEach((node) => { node.textContent = ""; });
  });
  zip.file("word/document.xml", new XMLSerializer().serializeToString(document));
  return zip.generateAsync({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", compression: "DEFLATE" });
}

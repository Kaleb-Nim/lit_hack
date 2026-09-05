"use client";

/**
 * Turn a `DocModel` into a real Word document in the browser and hand it to
 * the user as a download. The `docx` package is imported lazily so it stays
 * out of the initial bundle for every page.
 *
 * Resolves to `false` (never throws) when the file cannot be built or the
 * browser refuses the download, so callers can show an inline note.
 */

import { downloadBlob } from "@/lib/download";
import type { DocBlock, DocModel } from "@/lib/docx-model";

const SANS = "Calibri";
const SERIF = "Cambria";
const INK = "16202C";
const MUTED = "6B6459";
const GOLD = "8A6A2F";
const RULE = "D8D2C7";

/** Half-points: 11pt body, 24pt title. */
const PT = (n: number) => n * 2;

export async function buildDocxBlob(model: DocModel): Promise<Blob> {
  const {
    BorderStyle,
    Document,
    HeadingLevel,
    Packer,
    PageBreak,
    Paragraph,
    Table,
    TableCell,
    TableRow,
    TextRun,
    WidthType,
  } = await import("docx");

  const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
  const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

  const render = (b: DocBlock) => {
    switch (b.kind) {
      case "kicker":
        return [
          new Paragraph({
            spacing: { after: 80 },
            children: [new TextRun({ text: b.text.toUpperCase(), font: SANS, size: PT(8), color: MUTED, characterSpacing: 40 })],
          }),
        ];
      case "title":
        return [
          new Paragraph({
            heading: HeadingLevel.TITLE,
            spacing: { after: 120 },
            children: [new TextRun({ text: b.text, font: SERIF, size: PT(22), bold: true, color: INK })],
          }),
        ];
      case "subtitle":
        return [
          new Paragraph({
            spacing: { after: 60 },
            children: [new TextRun({ text: b.text, font: SANS, size: PT(10), color: MUTED })],
          }),
        ];
      case "heading": {
        const level = b.level ?? 2;
        const heading = level === 1 ? HeadingLevel.HEADING_1 : level === 3 ? HeadingLevel.HEADING_3 : HeadingLevel.HEADING_2;
        const size = level === 1 ? PT(16) : level === 3 ? PT(11) : PT(13);
        return [
          new Paragraph({
            heading,
            spacing: { before: level === 3 ? 160 : 280, after: 100 },
            children: [new TextRun({ text: b.text, font: SERIF, size, bold: true, color: INK })],
          }),
        ];
      }
      case "para":
        return [
          new Paragraph({
            spacing: { after: 140, line: 300 },
            children: [new TextRun({ text: b.text, font: SERIF, size: PT(11), italics: b.italic, color: b.muted ? MUTED : INK })],
          }),
        ];
      case "label":
        return [
          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({ text: `${b.label}: `, font: SANS, size: PT(10), bold: true, color: GOLD }),
              new TextRun({ text: b.text, font: SANS, size: PT(10), color: INK }),
            ],
          }),
        ];
      case "clause":
        return [
          new Paragraph({
            spacing: { after: 140, line: 300 },
            indent: { left: 720, hanging: 720 },
            tabStops: [{ type: "left" as const, position: 720 }],
            children: [
              new TextRun({ text: b.number, font: SANS, size: PT(9), color: MUTED }),
              new TextRun({ text: "\t" }),
              new TextRun({ text: b.text, font: SERIF, size: PT(11), color: INK }),
            ],
          }),
        ];
      case "bullet":
        return [
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 80 },
            children: [
              ...(b.strong ? [new TextRun({ text: `${b.strong} `, font: SERIF, size: PT(10.5), bold: true, color: INK })] : []),
              new TextRun({ text: b.text, font: SERIF, size: PT(10.5), color: INK }),
            ],
          }),
        ];
      case "rule":
        return [
          new Paragraph({
            spacing: { before: 200, after: 200 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: RULE, space: 1 } },
            children: [],
          }),
        ];
      case "signature": {
        const line = new Paragraph({
          spacing: { before: 480, after: 60 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: INK, space: 4 } },
          children: [new TextRun({ text: b.name ?? " ", font: SERIF, size: PT(12), bold: Boolean(b.name), color: INK })],
        });
        const label = new Paragraph({
          spacing: { after: 40 },
          children: [new TextRun({ text: b.party, font: SANS, size: PT(9.5), color: MUTED })],
        });
        const date = new Paragraph({
          spacing: { after: 160 },
          children: [new TextRun({ text: b.date ? `Date: ${b.date}` : "Date: ____________", font: SANS, size: PT(9.5), color: MUTED })],
        });
        return [
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: { ...noBorders, insideHorizontal: noBorder, insideVertical: noBorder },
            rows: [new TableRow({ children: [new TableCell({ borders: noBorders, width: { size: 60, type: WidthType.PERCENTAGE }, children: [line, label, date] })] })],
          }),
        ];
      }
      case "pagebreak":
        return [new Paragraph({ children: [new PageBreak()] })];
    }
  };

  const doc = new Document({
    title: model.title,
    creator: model.creator ?? "Pearson",
    description: model.description,
    styles: { default: { document: { run: { font: SERIF, size: PT(11), color: INK } } } },
    sections: [
      {
        properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
        children: model.blocks.flatMap(render),
      },
    ],
  });

  return Packer.toBlob(doc);
}

export async function downloadDocx(filename: string, model: DocModel): Promise<boolean> {
  try {
    const blob = await buildDocxBlob(model);
    return downloadBlob(filename.endsWith(".docx") ? filename : `${filename}.docx`, blob);
  } catch {
    return false;
  }
}

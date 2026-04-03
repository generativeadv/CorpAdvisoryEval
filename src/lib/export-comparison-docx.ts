import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  BorderStyle,
  Packer,
} from "docx";

export async function generateComparisonDocx(
  firmNames: string,
  content: string,
  generatedAt: string | null
): Promise<Blob> {
  const dateStr = generatedAt
    ? new Date(generatedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  // Parse markdown into docx paragraphs
  const paragraphs: Paragraph[] = [];
  const lines = content.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("### ")) {
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 240, after: 80 },
          children: [new TextRun({ text: trimmed.replace(/^### /, ""), bold: true, size: 24 })],
        })
      );
    } else if (trimmed.startsWith("## ")) {
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 120 },
          children: [new TextRun({ text: trimmed.replace(/^## /, ""), bold: true, size: 28 })],
        })
      );
    } else if (trimmed.startsWith("# ")) {
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 360, after: 120 },
          children: [new TextRun({ text: trimmed.replace(/^# /, ""), bold: true, size: 32 })],
        })
      );
    } else if (trimmed.startsWith("- **") || trimmed.startsWith("* **")) {
      // Bold list item
      const match = trimmed.match(/^[-*]\s+\*\*(.+?)\*\*:?\s*(.*)/);
      if (match) {
        paragraphs.push(
          new Paragraph({
            spacing: { after: 80 },
            indent: { left: 360 },
            children: [
              new TextRun({ text: `${match[1]}: `, bold: true, size: 22, font: "Calibri" }),
              new TextRun({ text: match[2], size: 22, font: "Calibri" }),
            ],
          })
        );
      } else {
        paragraphs.push(
          new Paragraph({
            spacing: { after: 80 },
            indent: { left: 360 },
            children: [new TextRun({ text: trimmed.replace(/^[-*]\s+/, ""), size: 22, font: "Calibri" })],
          })
        );
      }
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      paragraphs.push(
        new Paragraph({
          spacing: { after: 80 },
          indent: { left: 360 },
          children: [new TextRun({ text: `• ${trimmed.replace(/^[-*]\s+/, "")}`, size: 22, font: "Calibri" })],
        })
      );
    } else if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
      paragraphs.push(
        new Paragraph({
          spacing: { before: 160, after: 80 },
          children: [new TextRun({ text: trimmed.replace(/\*\*/g, ""), bold: true, size: 22, font: "Calibri" })],
        })
      );
    } else {
      // Regular paragraph — handle inline bold
      const parts: TextRun[] = [];
      const regex = /\*\*(.+?)\*\*/g;
      let lastIndex = 0;
      let match;
      while ((match = regex.exec(trimmed)) !== null) {
        if (match.index > lastIndex) {
          parts.push(new TextRun({ text: trimmed.slice(lastIndex, match.index), size: 22, font: "Calibri" }));
        }
        parts.push(new TextRun({ text: match[1], bold: true, size: 22, font: "Calibri" }));
        lastIndex = regex.lastIndex;
      }
      if (lastIndex < trimmed.length) {
        parts.push(new TextRun({ text: trimmed.slice(lastIndex), size: 22, font: "Calibri" }));
      }
      if (parts.length > 0) {
        paragraphs.push(new Paragraph({ spacing: { after: 120 }, children: parts }));
      }
    }
  }

  const doc = new Document({
    styles: {
      default: { document: { run: { font: "Calibri", size: 22 } } },
    },
    sections: [
      {
        properties: {
          page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } },
        },
        children: [
          new Paragraph({
            spacing: { after: 40 },
            children: [new TextRun({ text: "CONFIDENTIAL", size: 16, color: "888888", allCaps: true })],
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 80 },
            children: [new TextRun({ text: `Custom Comparison: ${firmNames}`, bold: true })],
          }),
          new Paragraph({
            spacing: { after: 200 },
            children: [new TextRun({ text: dateStr, size: 22, color: "666666" })],
          }),
          new Paragraph({
            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "CCCCCC" } },
            spacing: { after: 200 },
            children: [],
          }),
          ...paragraphs,
          new Paragraph({ spacing: { before: 400 }, children: [] }),
          new Paragraph({
            border: { top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" } },
            spacing: { before: 100 },
            children: [
              new TextRun({
                text: "This analysis was generated by Claude Opus using structured evaluation data and deep research reports. AI-generated content should be reviewed in the context of the underlying evidence.",
                size: 18,
                color: "888888",
              }),
            ],
          }),
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
}

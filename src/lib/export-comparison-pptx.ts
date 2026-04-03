import PptxGenJS from "pptxgenjs";

const DARK = "1a1a1a";
const GRAY = "666666";
const LIGHT_GRAY = "999999";

export async function generateComparisonPptx(
  firmNames: string,
  content: string,
  generatedAt: string | null
): Promise<Blob> {
  const dateStr = generatedAt
    ? new Date(generatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const firms = firmNames.split(", ");

  // Parse sections from markdown
  const sections: { heading: string; body: string }[] = [];
  const lines = content.split("\n");
  let currentHeading = "";
  let currentBody: string[] = [];

  for (const line of lines) {
    if (line.startsWith("## ") || line.startsWith("### ")) {
      if (currentHeading) {
        sections.push({ heading: currentHeading, body: currentBody.join("\n").trim() });
      }
      currentHeading = line.replace(/^#{2,3}\s+/, "");
      currentBody = [];
    } else {
      currentBody.push(line);
    }
  }
  if (currentHeading) {
    sections.push({ heading: currentHeading, body: currentBody.join("\n").trim() });
  }

  // Find dimension sections and overall assessment
  const dimensionSections = sections.filter(
    (s) =>
      !s.heading.toLowerCase().includes("introduction") &&
      !s.heading.toLowerCase().includes("overall") &&
      !s.heading.toLowerCase().includes("key differentiator") &&
      !s.heading.toLowerCase().includes("surprising") &&
      !s.heading.toLowerCase().includes("strategic") &&
      s.body.length > 50
  );

  const overallSections = sections.filter(
    (s) =>
      s.heading.toLowerCase().includes("overall") ||
      s.heading.toLowerCase().includes("key differentiator") ||
      s.heading.toLowerCase().includes("surprising") ||
      s.heading.toLowerCase().includes("strategic")
  );

  const intro = sections.find((s) => s.heading.toLowerCase().includes("introduction"));

  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Advisory AI Eval";
  pptx.title = `Comparison: ${firmNames}`;

  // ====== SLIDE 1: Title ======
  const slide1 = pptx.addSlide();
  slide1.addText("Custom Comparison", {
    x: 0.6, y: 0.3, w: 8, h: 0.3,
    fontSize: 10, color: LIGHT_GRAY, fontFace: "Calibri", bold: true,
  });
  slide1.addText(firmNames, {
    x: 0.6, y: 1.5, w: 12, h: 1,
    fontSize: 32, color: DARK, fontFace: "Calibri", bold: true,
  });
  slide1.addText(dateStr, {
    x: 0.6, y: 2.8, w: 12, h: 0.4,
    fontSize: 14, color: LIGHT_GRAY, fontFace: "Calibri",
  });
  if (intro) {
    // Strip markdown formatting
    const cleanIntro = intro.body.replace(/\*\*/g, "").replace(/\[.*?\]\(.*?\)/g, "");
    slide1.addText(cleanIntro.substring(0, 500), {
      x: 0.6, y: 3.6, w: 12, h: 2,
      fontSize: 12, color: GRAY, fontFace: "Calibri",
      valign: "top",
    });
  }
  // Firm name badges
  firms.forEach((firm, i) => {
    slide1.addShape(pptx.ShapeType.roundRect, {
      x: 0.6 + i * 3.2, y: 6.2, w: 2.8, h: 0.5,
      fill: { color: "F5F5F5" },
      rectRadius: 0.1,
    });
    slide1.addText(firm, {
      x: 0.6 + i * 3.2, y: 6.2, w: 2.8, h: 0.5,
      fontSize: 11, color: DARK, fontFace: "Calibri", bold: true,
      align: "center", valign: "middle",
    });
  });

  // ====== SLIDE 2: Dimension Summary Table ======
  const slide2 = pptx.addSlide();
  slide2.addText("Dimension-by-Dimension Summary", {
    x: 0.6, y: 0.3, w: 8, h: 0.3,
    fontSize: 10, color: LIGHT_GRAY, fontFace: "Calibri", bold: true,
  });
  slide2.addText(`${firmNames}`, {
    x: 0.6, y: 0.7, w: 12, h: 0.4,
    fontSize: 18, color: DARK, fontFace: "Calibri", bold: true,
  });

  const tableRows: PptxGenJS.TableRow[] = [
    [
      { text: "Dimension", options: { fill: { color: "F5F5F5" }, fontSize: 9, bold: true, color: LIGHT_GRAY } },
      { text: "Key Insight", options: { fill: { color: "F5F5F5" }, fontSize: 9, bold: true, color: LIGHT_GRAY } },
    ],
  ];

  for (const dim of dimensionSections.slice(0, 10)) {
    // Extract first meaningful sentence as key insight
    const cleanBody = dim.body
      .replace(/\*\*/g, "")
      .replace(/\[.*?\]\(.*?\)/g, "")
      .split("\n")
      .filter((l) => l.trim().length > 20)
      .slice(0, 2)
      .join(" ")
      .substring(0, 200);

    tableRows.push([
      { text: dim.heading, options: { fontSize: 8, color: DARK, bold: true } },
      { text: cleanBody || "See full analysis", options: { fontSize: 8, color: GRAY } },
    ]);
  }

  slide2.addTable(tableRows, {
    x: 0.4, y: 1.3, w: 12.4,
    colW: [3.0, 9.4],
    fontSize: 8,
    border: { type: "solid", pt: 0.5, color: "E5E5E5" },
    fontFace: "Calibri",
    valign: "top",
  });

  // ====== SLIDE 3: Overall Assessment ======
  const slide3 = pptx.addSlide();
  slide3.addText("Overall Assessment", {
    x: 0.6, y: 0.3, w: 8, h: 0.3,
    fontSize: 10, color: LIGHT_GRAY, fontFace: "Calibri", bold: true,
  });
  slide3.addText(`${firmNames}`, {
    x: 0.6, y: 0.7, w: 12, h: 0.4,
    fontSize: 18, color: DARK, fontFace: "Calibri", bold: true,
  });

  let y3 = 1.4;
  for (const section of overallSections.slice(0, 3)) {
    slide3.addText(section.heading, {
      x: 0.6, y: y3, w: 12, h: 0.3,
      fontSize: 12, color: DARK, fontFace: "Calibri", bold: true,
    });
    y3 += 0.35;

    const cleanBody = section.body
      .replace(/\*\*/g, "")
      .replace(/\[.*?\]\(.*?\)/g, "")
      .substring(0, 600);

    slide3.addText(cleanBody, {
      x: 0.6, y: y3, w: 12, h: 1.5,
      fontSize: 10, color: GRAY, fontFace: "Calibri",
      valign: "top",
    });
    y3 += 1.7;
  }

  // Disclaimer
  slide3.addText(
    "AI-generated analysis based on structured evaluation data and deep research reports.",
    {
      x: 0.6, y: 6.8, w: 12, h: 0.3,
      fontSize: 8, color: LIGHT_GRAY, fontFace: "Calibri", italic: true,
    }
  );

  return (await pptx.write({ outputType: "blob" })) as Blob;
}

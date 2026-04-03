import PptxGenJS from "pptxgenjs";

interface TimelineEvent {
  firm: string;
  firmSlug: string;
  date: string;
  quarter: string;
  type: string;
  description: string;
}

const TYPE_COLORS: Record<string, string> = {
  Action: "3b82f6",
  "Thought Leadership": "8b5cf6",
  Hiring: "f59e0b",
  Partnership: "10b981",
  Acquisition: "ef4444",
  "Product Launch": "06b6d4",
};

const DARK = "1a1a1a";
const GRAY = "666666";
const LIGHT_GRAY = "999999";

function normalizeType(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes("hiring") || lower.includes("hire") || lower.includes("appointment")) return "Hiring";
  if (lower.includes("acquisition") || lower.includes("acquire") || lower.includes("m&a")) return "Acquisition";
  if (lower.includes("partnership") || lower.includes("alliance") || lower.includes("collaboration")) return "Partnership";
  if (lower.includes("product") || lower.includes("launch") || lower.includes("platform")) return "Product Launch";
  if (lower.includes("thought") || lower.includes("content") || lower.includes("publication") || lower.includes("report") || lower.includes("podcast") || lower.includes("blog") || lower.includes("speaking") || lower.includes("event") || lower.includes("messaging")) return "Thought Leadership";
  return "Action";
}

function generateQuarters(start: string, end: string): string[] {
  const quarters: string[] = [];
  const [sy, sq] = start.split("-Q").map(Number);
  const [ey, eq] = end.split("-Q").map(Number);
  let y = sy, q = sq;
  while (y < ey || (y === ey && q <= eq)) {
    quarters.push(`${y}-Q${q}`);
    q++;
    if (q > 4) { q = 1; y++; }
  }
  return quarters;
}

export async function generateTimelinePptx(
  rawEvents: TimelineEvent[]
): Promise<Blob> {
  const events = rawEvents.map((e) => ({ ...e, type: normalizeType(e.type) }));

  const quarters = events.map((e) => e.quarter).sort();
  const minQ = quarters[0] || "2023-Q1";
  const maxQ = quarters[quarters.length - 1] || "2026-Q1";
  const allQuarters = generateQuarters(minQ, maxQ);

  const types = Object.keys(TYPE_COLORS).filter(
    (t) => events.some((e) => e.type === t)
  );

  const typeCounts = types.map((t) => ({
    type: t,
    count: events.filter((e) => e.type === t).length,
  }));

  // Build quarterly data
  const quarterData = allQuarters.map((q) => {
    const qEvents = events.filter((e) => e.quarter === q);
    const byType: Record<string, number> = {};
    types.forEach((t) => {
      byType[t] = qEvents.filter((e) => e.type === t).length;
    });
    return { quarter: q, total: qEvents.length, byType };
  });

  // Events by quarter (reverse chron)
  const eventsByQuarter: { quarter: string; events: TimelineEvent[] }[] = [];
  for (const q of [...allQuarters].reverse()) {
    const qEvents = events.filter((e) => e.quarter === q);
    if (qEvents.length > 0) {
      eventsByQuarter.push({ quarter: q, events: qEvents });
    }
  }

  const firmCount = new Set(events.map((e) => e.firm)).size;

  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Advisory AI Eval";
  pptx.title = "Market Activity Timeline";

  // ====== SLIDE 1: Chart Summary ======
  const slide1 = pptx.addSlide();

  slide1.addText("Market Activity Timeline", {
    x: 0.6, y: 0.3, w: 8, h: 0.3,
    fontSize: 10, color: LIGHT_GRAY, fontFace: "Calibri", bold: true,
  });
  slide1.addText(
    `Aggregate AI-related activity across ${firmCount} firms, ${events.length} events`,
    {
      x: 0.6, y: 0.7, w: 12, h: 0.5,
      fontSize: 20, color: DARK, fontFace: "Calibri", bold: true,
    }
  );

  // Type legend
  typeCounts.forEach((tc, i) => {
    const x = 0.6 + (i % 3) * 4.2;
    const y = 1.5 + Math.floor(i / 3) * 0.35;
    slide1.addShape(pptx.ShapeType.ellipse, {
      x, y: y + 0.05, w: 0.15, h: 0.15,
      fill: { color: TYPE_COLORS[tc.type] },
    });
    slide1.addText(`${tc.type} (${tc.count})`, {
      x: x + 0.25, y, w: 3.5, h: 0.25,
      fontSize: 10, color: GRAY, fontFace: "Calibri",
    });
  });

  // Quarterly activity table
  const legendRows = Math.ceil(typeCounts.length / 3);
  const tableY = 1.5 + legendRows * 0.35 + 0.3;

  const headerRow: PptxGenJS.TableRow = [
    { text: "", options: { fill: { color: "F5F5F5" }, fontSize: 8, bold: true, color: LIGHT_GRAY } },
    ...allQuarters.map((q) => ({
      text: q.replace("20", "'"),
      options: { fill: { color: "F5F5F5" }, fontSize: 7, bold: true, color: LIGHT_GRAY, align: "center" as const },
    })),
  ];

  const typeRows: PptxGenJS.TableRow[] = types.map((t) => [
    {
      text: t,
      options: { fontSize: 8, color: GRAY, bold: true },
    },
    ...allQuarters.map((q) => {
      const count = quarterData.find((d) => d.quarter === q)?.byType[t] || 0;
      return {
        text: count > 0 ? String(count) : "",
        options: {
          fontSize: 8,
          color: count > 0 ? DARK : "EEEEEE",
          align: "center" as const,
          fill: count > 0 ? { color: TYPE_COLORS[t] + "25" } : undefined,
        },
      };
    }),
  ]);

  const totalRow: PptxGenJS.TableRow = [
    { text: "Total", options: { fontSize: 8, bold: true, color: DARK } },
    ...allQuarters.map((q) => ({
      text: String(quarterData.find((d) => d.quarter === q)?.total || 0),
      options: { fontSize: 8, bold: true, color: DARK, align: "center" as const },
    })),
  ];

  const colW = [1.4, ...allQuarters.map(() => (11.2 / allQuarters.length))];

  slide1.addTable([headerRow, ...typeRows, totalRow], {
    x: 0.6, y: tableY, w: 12.6,
    colW,
    fontSize: 8,
    border: { type: "solid", pt: 0.5, color: "E5E5E5" },
    fontFace: "Calibri",
    valign: "middle",
  });

  // ====== SLIDES 2+: Event Detail ======
  const EVENTS_PER_SLIDE = 28;
  const LINE_HEIGHT = 0.15;

  // Flatten events with quarter headers
  const lines: { type: "header" | "event"; text: string; color?: string }[] = [];
  for (const group of eventsByQuarter) {
    lines.push({ type: "header", text: group.quarter });
    for (const e of group.events) {
      lines.push({
        type: "event",
        text: `${e.firm} — ${e.description}`,
        color: TYPE_COLORS[e.type] || "999999",
      });
    }
  }

  // Chunk into slides
  for (let i = 0; i < lines.length; i += EVENTS_PER_SLIDE) {
    const chunk = lines.slice(i, i + EVENTS_PER_SLIDE);
    const slideNum = Math.floor(i / EVENTS_PER_SLIDE) + 1;
    const slide = pptx.addSlide();

    slide.addText("Event Detail", {
      x: 0.6, y: 0.3, w: 8, h: 0.3,
      fontSize: 10, color: LIGHT_GRAY, fontFace: "Calibri", bold: true,
    });
    slide.addText(
      `${events.length} events across ${firmCount} firms${lines.length > EVENTS_PER_SLIDE ? ` (${slideNum} of ${Math.ceil(lines.length / EVENTS_PER_SLIDE)})` : ""}`,
      {
        x: 0.6, y: 0.7, w: 12, h: 0.4,
        fontSize: 16, color: DARK, fontFace: "Calibri", bold: true,
      }
    );

    let y = 1.3;
    for (const line of chunk) {
      if (line.type === "header") {
        slide.addText(line.text, {
          x: 0.6, y, w: 12, h: 0.25,
          fontSize: 9, color: DARK, fontFace: "Calibri", bold: true,
        });
        y += 0.28;
      } else {
        // Color dot
        slide.addShape(pptx.ShapeType.ellipse, {
          x: 0.6, y: y + 0.04, w: 0.1, h: 0.1,
          fill: { color: line.color || "999999" },
        });
        slide.addText(line.text, {
          x: 0.8, y, w: 12, h: 0.2,
          fontSize: 8, color: GRAY, fontFace: "Calibri",
          valign: "top",
        });
        y += LINE_HEIGHT;
      }
    }
  }

  return (await pptx.write({ outputType: "blob" })) as Blob;
}

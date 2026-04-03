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

  // ====== SLIDE 1: Stacked Bar Chart ======
  const slide1 = pptx.addSlide();

  slide1.addText("Market Activity Timeline", {
    x: 0.6, y: 0.2, w: 8, h: 0.3,
    fontSize: 10, color: LIGHT_GRAY, fontFace: "Calibri", bold: true,
  });
  slide1.addText(
    `Aggregate AI-related activity across ${firmCount} firms, by type and quarter`,
    {
      x: 0.6, y: 0.55, w: 12, h: 0.4,
      fontSize: 18, color: DARK, fontFace: "Calibri", bold: true,
    }
  );

  // Build chart data series — one series per activity type
  const chartData: PptxGenJS.OptsChartData[] = types.map((t) => ({
    name: `${t} (${typeCounts.find((tc) => tc.type === t)?.count || 0})`,
    labels: allQuarters,
    values: allQuarters.map(
      (q) => quarterData.find((d) => d.quarter === q)?.byType[t] || 0
    ),
  }));

  slide1.addChart(pptx.ChartType.bar, chartData, {
    x: 0.4,
    y: 1.1,
    w: 12.4,
    h: 6.0,
    barGrouping: "stacked",
    showTitle: false,
    showLegend: true,
    legendPos: "b",
    legendFontSize: 9,
    legendColor: GRAY,
    showValue: false,
    catAxisOrientation: "minMax",
    catAxisLabelFontSize: 9,
    catAxisLabelColor: GRAY,
    catAxisLineShow: false,
    valAxisLabelFontSize: 9,
    valAxisLabelColor: GRAY,
    valAxisLineShow: false,
    valGridLine: { color: "E5E7EB", style: "dash", size: 0.5 },
    valAxisMinVal: 0,
    chartColors: types.map((t) => TYPE_COLORS[t]),
    barGapWidthPct: 80,
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

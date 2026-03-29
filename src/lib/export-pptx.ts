import PptxGenJS from "pptxgenjs";
import type { FirmWithEvaluation, MaturityStage, Archetype } from "./types";
import { MATURITY_LABELS, ARCHETYPE_LABELS } from "./types";
import { GROUP_LABELS } from "./firms";

export async function generateSlidesPptx(
  firms: FirmWithEvaluation[]
): Promise<Blob> {
  const coreFirms = firms.filter(
    (f) => f.evaluation && f.slug !== "fti-total"
  );

  const sorted = [...coreFirms].sort(
    (a, b) =>
      (b.evaluation?.compositeScoreWeighted ?? 0) -
      (a.evaluation?.compositeScoreWeighted ?? 0)
  );

  const scaling = sorted.filter(
    (f) => (f.evaluation?.maturityStage ?? 0) >= 4
  );
  const formalizing = sorted.filter(
    (f) => f.evaluation?.maturityStage === 3
  );
  const early = sorted.filter(
    (f) => (f.evaluation?.maturityStage ?? 0) <= 2
  );

  const group1 = sorted.filter((f) => f.group === 1);
  const fgs = coreFirms.find((f) => f.slug === "fgs-global");
  const fgsGroup1Rank = fgs
    ? group1.findIndex((f) => f.slug === "fgs-global") + 1
    : 0;

  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Advisory AI Eval";
  pptx.title = "AI Strategy Competitive Assessment";

  const DARK = "1a1a1a";
  const GRAY = "666666";
  const LIGHT_GRAY = "999999";
  const ACCENT = "3b82f6";

  // ====== SLIDE 1: Situation ======
  const slide1 = pptx.addSlide();
  slide1.addText("AI Strategy Competitive Assessment", {
    x: 0.6,
    y: 0.3,
    w: 8,
    h: 0.3,
    fontSize: 10,
    color: LIGHT_GRAY,
    fontFace: "Calibri",
    bold: true,
  });
  slide1.addText(
    "The sector has moved past experimentation — but the gap between positioning and infrastructure is widening",
    {
      x: 0.6,
      y: 0.7,
      w: 12,
      h: 0.7,
      fontSize: 20,
      color: DARK,
      fontFace: "Calibri",
      bold: true,
    }
  );

  // Three columns
  const colW = 3.8;
  const colY = 1.8;
  const cols = [
    {
      header: "WHERE THE SECTOR STANDS",
      bullets: [
        "Most firms have appointed AI leadership, launched practices, and begun deploying internal tools",
        "Fewer have made the engineering and commercial investments that translate positioning into verified capability",
        `${scaling.length} firms Scaling or Leading · ${formalizing.length} Formalizing · ${early.length} Early stage`,
      ],
    },
    {
      header: "THE DEFINING FAULT LINE",
      bullets: [
        "Proprietary technology + engineering talent separates leaders from positioners",
        "Firms with internal platforms and AI acquisitions consistently outperform those leading with thought leadership alone",
        "Holding company networks (WPP, IPG) provide structural advantages in platform scale",
      ],
    },
    {
      header: "FGS GLOBAL POSITIONING",
      bullets: [
        "Most complete AI posture among pure-play advisory firms",
        "AI Advisory practice + Fergus platform (1,500+ users) + Memetica acquisition + FGS Labs engineering team",
        `Ranked #${fgsGroup1Rank} in Group 1 · Stage ${fgs?.evaluation?.maturityStage ?? "–"} (${fgs?.evaluation ? MATURITY_LABELS[fgs.evaluation.maturityStage] : "–"})`,
      ],
    },
  ];

  cols.forEach((col, i) => {
    const x = 0.6 + i * (colW + 0.3);
    slide1.addText(col.header, {
      x,
      y: colY,
      w: colW,
      h: 0.3,
      fontSize: 8,
      color: LIGHT_GRAY,
      fontFace: "Calibri",
      bold: true,
    });
    slide1.addShape(pptx.ShapeType.line, {
      x,
      y: colY + 0.35,
      w: colW,
      h: 0,
      line: { color: "DDDDDD", width: 1 },
    });
    col.bullets.forEach((bullet, j) => {
      slide1.addText(bullet, {
        x,
        y: colY + 0.5 + j * 0.75,
        w: colW,
        h: 0.7,
        fontSize: 11,
        color: j === col.bullets.length - 1 ? LIGHT_GRAY : GRAY,
        fontFace: "Calibri",
        valign: "top",
      });
    });
  });

  // ====== SLIDE 2: Competitive Landscape Table ======
  const slide2 = pptx.addSlide();
  slide2.addText("Competitive Landscape", {
    x: 0.6,
    y: 0.3,
    w: 8,
    h: 0.3,
    fontSize: 10,
    color: LIGHT_GRAY,
    fontFace: "Calibri",
    bold: true,
  });
  slide2.addText(
    "A clear leader tier is emerging, with most firms in a scaling-to-formalizing middle",
    {
      x: 0.6,
      y: 0.7,
      w: 12,
      h: 0.5,
      fontSize: 20,
      color: DARK,
      fontFace: "Calibri",
      bold: true,
    }
  );

  const tiers = [
    {
      tier: "Leaders",
      firms: sorted
        .filter((f) => (f.evaluation?.maturityStage ?? 0) >= 5)
        .map((f) => f.shortName)
        .join(", ") || "—",
      desc: "Deep proprietary tech, large engineering orgs, verifiable commercial AI revenue",
      stage: "Stage 5",
    },
    {
      tier: "Scaling",
      firms: sorted
        .filter((f) => f.evaluation?.maturityStage === 4)
        .map((f) => f.shortName)
        .join(", "),
      desc: "Proprietary platforms in production, dedicated AI leadership, active client practices",
      stage: "Stage 4",
    },
    {
      tier: "Formalizing",
      firms: formalizing.map((f) => f.shortName).join(", "),
      desc: "AI leadership appointed, pilots underway, thinner on tooling and engineering depth",
      stage: "Stage 3",
    },
    {
      tier: "Early",
      firms:
        early.map((f) => f.shortName).join(", ") || "—",
      desc: "Limited public evidence of dedicated AI activity",
      stage: "Stage 1–2",
    },
  ];

  const tableRows: PptxGenJS.TableRow[] = [
    [
      { text: "Tier", options: { bold: true, fontSize: 9, color: LIGHT_GRAY, fill: { color: "F5F5F5" } } },
      { text: "Firms", options: { bold: true, fontSize: 9, color: LIGHT_GRAY, fill: { color: "F5F5F5" } } },
      { text: "Characterization", options: { bold: true, fontSize: 9, color: LIGHT_GRAY, fill: { color: "F5F5F5" } } },
      { text: "Stage", options: { bold: true, fontSize: 9, color: LIGHT_GRAY, fill: { color: "F5F5F5" } } },
    ],
    ...tiers.map((t) => [
      { text: t.tier, options: { bold: true, fontSize: 11, color: DARK } },
      { text: t.firms, options: { fontSize: 10, color: GRAY } },
      { text: t.desc, options: { fontSize: 9, color: LIGHT_GRAY } },
      { text: t.stage, options: { fontSize: 9, color: LIGHT_GRAY } },
    ] as PptxGenJS.TableRow),
  ];

  slide2.addTable(tableRows, {
    x: 0.6,
    y: 1.5,
    w: 12,
    colW: [1.2, 3.5, 5.5, 1.0],
    fontSize: 10,
    border: { type: "solid", pt: 0.5, color: "E5E5E5" },
    rowH: [0.35, 0.6, 0.6, 0.6, 0.6],
    fontFace: "Calibri",
    valign: "middle",
  });

  slide2.addText(
    "FTI Consulting (Total Firm) excluded from peer rankings; included as contextual reference.",
    {
      x: 0.6,
      y: 4.6,
      w: 12,
      h: 0.3,
      fontSize: 8,
      color: LIGHT_GRAY,
      fontFace: "Calibri",
      italic: true,
    }
  );

  // ====== SLIDE 3: Key Observations ======
  const slide3 = pptx.addSlide();
  slide3.addText("Key Observations", {
    x: 0.6,
    y: 0.3,
    w: 8,
    h: 0.3,
    fontSize: 10,
    color: LIGHT_GRAY,
    fontFace: "Calibri",
    bold: true,
  });
  slide3.addText("Six things the Board should know", {
    x: 0.6,
    y: 0.7,
    w: 12,
    h: 0.5,
    fontSize: 20,
    color: DARK,
    fontFace: "Calibri",
    bold: true,
  });

  const observations = [
    {
      headline: "Past experimentation, not yet mature",
      body: "Most firms are formalizing or scaling. Only one has reached Leading with measurable AI revenue.",
    },
    {
      headline: "Proprietary tech is the strongest differentiator",
      body: "Firms that build their own platforms and hire engineers outperform those relying on positioning.",
    },
    {
      headline: "FGS has the most complete posture among advisory peers",
      body: "Named practice, proprietary platform, targeted acquisition, and dedicated engineering team.",
    },
    {
      headline: "Group structure creates different competitive dynamics",
      body: "PR networks benefit from holding company tech investments. Independents must build from own resources.",
    },
    {
      headline: "Evidence confidence matters as much as the scores",
      body: "Where public evidence is thin, rankings are directional. The confidence grade flags information scarcity.",
    },
    {
      headline: "The landscape is moving fast",
      body: "Multiple firms have made major AI moves in the past six months. Positions may shift within 2–3 quarters.",
    },
  ];

  observations.forEach((obs, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.6 + col * 6.3;
    const y = 1.5 + row * 1.3;

    slide3.addText(`${i + 1}`, {
      x,
      y,
      w: 0.4,
      h: 0.4,
      fontSize: 16,
      color: "CCCCCC",
      fontFace: "Calibri",
      bold: true,
    });
    slide3.addText(obs.headline, {
      x: x + 0.45,
      y,
      w: 5.5,
      h: 0.35,
      fontSize: 12,
      color: DARK,
      fontFace: "Calibri",
      bold: true,
    });
    slide3.addText(obs.body, {
      x: x + 0.45,
      y: y + 0.4,
      w: 5.5,
      h: 0.6,
      fontSize: 10,
      color: GRAY,
      fontFace: "Calibri",
      valign: "top",
    });
  });

  return (await pptx.write({ outputType: "blob" })) as Blob;
}

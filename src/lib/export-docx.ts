import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  PageBreak,
  BorderStyle,
  Packer,
} from "docx";
import type { FirmWithEvaluation, MaturityStage, Archetype } from "./types";
import {
  MATURITY_LABELS,
  ARCHETYPE_LABELS,
  DIMENSION_NAMES,
  getDimensionScores,
} from "./types";
import { GROUP_LABELS } from "./firms";

function heading(text: string, level: (typeof HeadingLevel)[keyof typeof HeadingLevel]) {
  return new Paragraph({
    heading: level,
    spacing: { before: 300, after: 120 },
    children: [new TextRun({ text, bold: true })],
  });
}

function body(text: string) {
  return new Paragraph({
    spacing: { after: 160 },
    children: [new TextRun({ text, size: 22, font: "Calibri" })],
  });
}

function boldBody(boldText: string, normalText: string) {
  return new Paragraph({
    spacing: { after: 160 },
    children: [
      new TextRun({ text: boldText, bold: true, size: 22, font: "Calibri" }),
      new TextRun({ text: normalText, size: 22, font: "Calibri" }),
    ],
  });
}

export async function generatePreReadDocx(
  firms: FirmWithEvaluation[]
): Promise<Blob> {
  const coreFirms = firms.filter(
    (f) => f.evaluation && f.slug !== "fti-total"
  );
  const ftiTotal = firms.find(
    (f) => f.slug === "fti-total" && f.evaluation
  );
  const fgs = coreFirms.find((f) => f.slug === "fgs-global");

  const sorted = [...coreFirms].sort(
    (a, b) =>
      (b.evaluation?.compositeScoreWeighted ?? 0) -
      (a.evaluation?.compositeScoreWeighted ?? 0)
  );

  const avgWeighted =
    coreFirms.reduce(
      (s, f) => s + (f.evaluation?.compositeScoreWeighted ?? 0),
      0
    ) / coreFirms.length;

  const avgMaturity =
    coreFirms.reduce(
      (s, f) => s + (f.evaluation?.maturityStage ?? 0),
      0
    ) / coreFirms.length;

  const stageDistribution = [1, 2, 3, 4, 5]
    .map((stage) => ({
      stage: stage as MaturityStage,
      label: MATURITY_LABELS[stage as MaturityStage],
      count: coreFirms.filter((f) => f.evaluation?.maturityStage === stage)
        .length,
    }))
    .filter((s) => s.count > 0);

  const dimAverages = DIMENSION_NAMES.map((name, i) => ({
    name,
    avg:
      coreFirms.reduce(
        (s, f) => s + getDimensionScores(f.evaluation!)[i],
        0
      ) / coreFirms.length,
  }));
  const strongestDim = [...dimAverages].sort((a, b) => b.avg - a.avg)[0];
  const weakestDim = [...dimAverages].sort((a, b) => a.avg - b.avg)[0];

  const highConfidence = coreFirms.filter(
    (f) => f.evaluation?.confidenceGrade === "A"
  ).length;

  const group1Sorted = sorted.filter((f) => f.group === 1);
  const fgsGroup1Rank = fgs
    ? group1Sorted.findIndex((f) => f.slug === "fgs-global") + 1
    : 0;

  const scaling = sorted.filter(
    (f) => (f.evaluation?.maturityStage ?? 0) >= 4
  );
  const formalizing = sorted.filter(
    (f) => f.evaluation?.maturityStage === 3
  );

  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 22 },
        },
      },
    },
    sections: [
      {
        properties: {
          page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } },
        },
        children: [
          // PAGE 1
          new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({
                text: "CONFIDENTIAL",
                size: 16,
                font: "Calibri",
                color: "888888",
                allCaps: true,
              }),
            ],
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 80 },
            children: [
              new TextRun({
                text: "AI Strategy Competitive Assessment",
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: `Board Pre-Read — ${dateStr}`,
                size: 22,
                color: "666666",
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 40 },
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 6, color: "CCCCCC" },
            },
            children: [],
          }),

          heading("Purpose", HeadingLevel.HEADING_2),
          body(
            `This memo summarizes the findings of a structured competitive assessment of ${coreFirms.length} advisory, communications, and consulting firms on their AI strategies.${ftiTotal ? " FTI Consulting (Total Firm) is included separately as a contextual reference point but is not weighted in sector-level averages or rankings given that the total-firm evaluation encompasses capabilities well beyond the strategic communications scope of this assessment." : ""} The assessment covers both client-facing AI advisory offerings and internal AI adoption for employee productivity and capability building. The evaluation uses a three-framework model: a five-stage AI Maturity classification, a ten-dimension weighted scorecard, and an evidence confidence index.`
          ),

          heading("Headline Findings", HeadingLevel.HEADING_2),
          body(
            `Most firms in this assessment have moved past the experimentation phase. The majority have appointed dedicated AI leadership, launched named practices or service lines, and begun deploying proprietary tools internally. But there is a meaningful distance between firms that have announced AI ambitions and those that have built the engineering infrastructure, commercial offerings, and organizational structures to deliver on them. The sector's average maturity is ${avgMaturity.toFixed(1)} out of 5 — firmly in the formalizing-to-scaling range, with considerable variance between the leaders and the field.`
          ),
          body(
            `The clearest pattern across the assessment is that firms which invest in proprietary technology and dedicated engineering talent outperform those that rely on positioning and thought leadership alone. Several firms have built or acquired AI-powered platforms — for media monitoring, threat intelligence, stakeholder analytics, or content generation — and embedded them in daily consultant workflows. Others have strong public narratives around AI but thinner evidence of internal tooling, technical hiring, or commercial traction. This gap between narrative and infrastructure is the defining fault line in the sector today.`
          ),
          body(
            `Among Group 1 firms (corporate advisory and strategic communications), FGS Global has assembled the most complete AI posture: a dedicated AI Advisory practice, a proprietary internal platform (Fergus) used by 1,500+ consultants, a targeted acquisition in AI-driven threat intelligence (Memetica), and a global engineering team (FGS Labs) actively building integrations across the firm's enterprise systems.`
          ),
          body(
            `The larger PR holding company networks (Weber Shandwick, Edelman, Burson, FleishmanHillard) benefit from parent-company technology investments and larger engineering organizations, which gives them structural advantages in platform development and scale. Accenture Song operates in a different category entirely, with the deepest technology bench, the broadest AI service lines, and verifiable commercial AI revenue — though its inclusion here serves primarily as a ceiling reference rather than a direct peer comparison.`
          ),
          body(
            `Evidence confidence across the assessment is strong: ${highConfidence} of ${coreFirms.length} firms have scores backed by multiple independent sources. Where evidence is thinner, our confidence ratings flag it explicitly.`
          ),

          // PAGE 2
          new Paragraph({ children: [new PageBreak()] }),
          heading("Competitive Landscape", HeadingLevel.HEADING_2),
          boldBody(
            "The leaders. ",
            `${sorted[0]?.shortName} stands apart as the most advanced firm in the assessment, with deep proprietary technology, a large engineering organization, and identifiable commercial AI revenue. Among the communications-focused firms, ${sorted[1]?.shortName} has made significant strides in embedding AI across its service delivery.${fgs ? ` FGS Global has built what is arguably the most coherent AI strategy among the pure-play advisory firms — combining a launched AI Advisory practice, the Fergus platform deployed firm-wide, the Memetica acquisition for AI-driven threat intelligence, and an engineering team actively hiring across multiple global offices.` : ""}`
          ),
          boldBody(
            "The scaling middle. ",
            `A cluster of firms — including ${scaling.filter((f) => f.slug !== sorted[0]?.slug && f.slug !== sorted[1]?.slug && f.slug !== "fgs-global").slice(0, 4).map((f) => f.shortName).join(", ")} — have reached Stage 4 (Scaling), with proprietary platforms in production, dedicated AI leadership, and active client-facing practices. Several benefit from holding company resources, which provide access to shared technology platforms that independent advisory firms must build on their own.`
          ),
          boldBody(
            "The formalizing tier. ",
            `${formalizing.map((f) => f.shortName).join(", ")} have all taken meaningful steps — appointing AI leaders, launching internal pilots, or producing regular thought leadership — but have not yet demonstrated the proprietary tooling, engineering depth, or commercial proof points that characterize the scaling firms.`
          ),
          boldBody(
            "Early stage. ",
            `${sorted[sorted.length - 1]?.shortName} shows the least public evidence of AI activity among the assessed firms. This may reflect a genuinely early-stage posture or simply limited public disclosure.`
          ),
          ...(ftiTotal
            ? [
                new Paragraph({ spacing: { before: 200 }, children: [] }),
                new Paragraph({
                  spacing: { after: 160 },
                  children: [
                    new TextRun({
                      text: "Note on FTI Consulting (Total Firm): ",
                      bold: true,
                      italics: true,
                      size: 22,
                    }),
                    new TextRun({
                      text: "FTI's total-firm AI capabilities — spanning its consulting, forensic, and technology segments — are substantial and extend well beyond the strategic communications practice assessed in the core rankings. The total-firm evaluation is included as a contextual reference but is not factored into sector-level averages or peer rankings.",
                      italics: true,
                      size: 22,
                    }),
                  ],
                }),
              ]
            : []),

          // PAGE 3
          new Paragraph({ children: [new PageBreak()] }),
          heading("Key Observations for the Board", HeadingLevel.HEADING_2),
          boldBody(
            "1. The sector has moved beyond experimentation but has not yet reached maturity. ",
            `The majority of firms are at Stage 3 (Formalizing) or Stage 4 (Scaling). However, only ${stageDistribution.find((s) => s.stage === 5)?.count || 0} firm has reached Stage 5 (Leading), where AI is a verified strategic differentiator with measurable commercial revenue.`
          ),
          boldBody(
            "2. Proprietary technology and engineering talent are the strongest differentiators. ",
            "Firms that invest in building their own AI platforms and maintaining dedicated engineering teams consistently outperform those that rely primarily on third-party tools or positioning-led strategies."
          ),
          boldBody(
            "3. Among pure-play advisory firms, FGS Global represents the most complete AI posture. ",
            `FGS ranks ${fgsGroup1Rank === 1 ? "first" : `#${fgsGroup1Rank}`} among Group 1 firms. What distinguishes FGS is the breadth of its investment: a named AI Advisory practice, a proprietary internal platform (Fergus) deployed across 1,500+ consultants, a targeted acquisition (Memetica) in AI-driven threat intelligence, dedicated AI leadership, and an engineering team (FGS Labs) actively hiring across multiple global offices.`
          ),
          boldBody(
            "4. Group structure reflects different competitive dynamics. ",
            `Group 1 firms (${GROUP_LABELS[1]}) and Group 2 firms (${GROUP_LABELS[2]}) approach AI from fundamentally different business models and resource bases. Direct cross-group comparisons should account for these structural differences.`
          ),
          boldBody(
            "5. Evidence confidence should inform how scores are interpreted. ",
            `${highConfidence} firms have High Confidence (A) ratings. The Board should weight confidence alongside scores when making investment or competitive positioning decisions.`
          ),
          boldBody(
            "6. The landscape is evolving rapidly. ",
            "These scores represent a point-in-time assessment. Several firms have announced major AI initiatives in the past six months, and the pace suggests relative positions may shift materially within the next two to three quarters."
          ),

          new Paragraph({ spacing: { before: 400 }, children: [] }),
          new Paragraph({
            border: {
              top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
            },
            spacing: { before: 100 },
            children: [
              new TextRun({
                text: "This assessment was prepared using publicly available information. FTI Consulting (Total Firm) is included as a contextual reference but excluded from sector-level averages. Alternative weightings and custom analyses are available via the AI Chat interface.",
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

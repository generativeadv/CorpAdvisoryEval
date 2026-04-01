import { getAllFirmsWithEvaluations } from "@/lib/queries";
import {
  MATURITY_LABELS,
  ARCHETYPE_LABELS,
  DIMENSION_NAMES,
  getDimensionScores,
  type MaturityStage,
  type Archetype,
} from "@/lib/types";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function FindingsPage() {
  const firms = await getAllFirmsWithEvaluations();
  const evaluated = firms.filter((f) => f.evaluation);

  if (evaluated.length === 0) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <p className="text-muted-foreground">
          No firms have been evaluated yet. Run the scoring pipeline first.
        </p>
      </div>
    );
  }

  // Compute findings from the data
  const avgWeighted =
    evaluated.reduce(
      (sum, f) => sum + (f.evaluation?.compositeScoreWeighted ?? 0),
      0
    ) / evaluated.length;

  const stageDistribution = [1, 2, 3, 4, 5].map((stage) => ({
    stage: stage as MaturityStage,
    label: MATURITY_LABELS[stage as MaturityStage],
    count: evaluated.filter((f) => f.evaluation?.maturityStage === stage).length,
  }));

  const topFirm = [...evaluated].sort(
    (a, b) =>
      (b.evaluation?.compositeScoreWeighted ?? 0) -
      (a.evaluation?.compositeScoreWeighted ?? 0)
  )[0];

  const dimAverages = DIMENSION_NAMES.map((name, i) => {
    const avg =
      evaluated.reduce((sum, f) => {
        const scores = getDimensionScores(f.evaluation!);
        return sum + scores[i];
      }, 0) / evaluated.length;
    return { name, avg, index: i };
  });

  const strongestDim = [...dimAverages].sort((a, b) => b.avg - a.avg)[0];
  const weakestDim = [...dimAverages].sort((a, b) => a.avg - b.avg)[0];

  const archetypeCounts = (
    Object.keys(ARCHETYPE_LABELS) as Archetype[]
  ).map((a) => ({
    archetype: a,
    label: ARCHETYPE_LABELS[a],
    count: evaluated.filter((f) => f.evaluation?.archetype === a).length,
  }));

  const highConfidence = evaluated.filter(
    (f) => f.evaluation?.confidenceGrade === "A"
  ).length;
  const lowConfidence = evaluated.filter(
    (f) =>
      f.evaluation?.confidenceGrade === "C" ||
      f.evaluation?.confidenceGrade === "D"
  ).length;

  const findings = [
    {
      title: "The sector is early-stage overall",
      body: `The average maturity stage across ${evaluated.length} firms is ${(evaluated.reduce((s, f) => s + (f.evaluation?.maturityStage ?? 0), 0) / evaluated.length).toFixed(1)} out of 5. ${stageDistribution.filter((s) => s.count > 0).map((s) => `${s.count} firms at Stage ${s.stage} (${s.label})`).join(", ")}. Most firms are still experimenting or formalizing rather than scaling AI capabilities.`,
    },
    {
      title: `${topFirm.name} leads the field`,
      body: `With a weighted composite score of ${topFirm.evaluation!.compositeScoreWeighted.toFixed(1)} out of 60, ${topFirm.shortName} ranks highest overall. The average weighted score is ${avgWeighted.toFixed(1)}.`,
    },
    {
      title: `${strongestDim.name} is the sector's strongest dimension`,
      body: `The highest average dimension score is ${strongestDim.name} at ${strongestDim.avg.toFixed(1)}/5. This suggests the sector is generally furthest along in this area.`,
    },
    {
      title: `${weakestDim.name} is the biggest gap`,
      body: `The lowest average dimension score is ${weakestDim.name} at ${weakestDim.avg.toFixed(1)}/5. This represents the most significant capability gap across the sector.`,
    },
    {
      title: "Archetype distribution reveals strategic divergence",
      body: archetypeCounts
        .filter((a) => a.count > 0)
        .map((a) => `${a.count} firms classified as ${a.label}`)
        .join(". ") + ".",
    },
    {
      title: "Evidence quality varies significantly",
      body: `${highConfidence} firms have High Confidence (A) evidence ratings, while ${lowConfidence} firms have Low or Insufficient evidence (C/D). Board decisions should weight the evidence confidence alongside the scores.`,
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <Link
        href="/compare"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={14} />
        Back to Compare
      </Link>
      <div>
        <h1 className="text-2xl font-bold">Key Findings</h1>
        <p className="text-muted-foreground mt-1">
          Board-ready observations from cross-firm analysis
        </p>
      </div>
      <div className="space-y-4">
        {findings.map((finding, i) => (
          <div key={i} className="border rounded-lg p-5">
            <div className="flex items-start gap-3">
              <span className="bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shrink-0">
                {i + 1}
              </span>
              <div>
                <h3 className="font-semibold">{finding.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {finding.body}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

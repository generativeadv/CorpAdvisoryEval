import { getAllFirmsWithEvaluations } from "@/lib/queries";
import {
  MATURITY_LABELS,
  ARCHETYPE_LABELS,
  DIMENSION_NAMES,
  getDimensionScores,
  type MaturityStage,
  type Archetype,
  type ConfidenceGrade,
} from "@/lib/types";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { PreReadPrintButton } from "./print-button";

export default async function PreReadPage() {
  const firms = await getAllFirmsWithEvaluations();
  const evaluated = firms.filter((f) => f.evaluation);

  const avgWeighted =
    evaluated.length > 0
      ? evaluated.reduce(
          (sum, f) => sum + (f.evaluation?.compositeScoreWeighted ?? 0),
          0
        ) / evaluated.length
      : 0;

  const sorted = [...evaluated].sort(
    (a, b) =>
      (b.evaluation?.compositeScoreWeighted ?? 0) -
      (a.evaluation?.compositeScoreWeighted ?? 0)
  );

  const stageDistribution = [1, 2, 3, 4, 5].map((stage) => ({
    stage: stage as MaturityStage,
    label: MATURITY_LABELS[stage as MaturityStage],
    count: evaluated.filter((f) => f.evaluation?.maturityStage === stage).length,
  }));

  const dimAverages = DIMENSION_NAMES.map((name, i) => {
    const avg =
      evaluated.length > 0
        ? evaluated.reduce((sum, f) => {
            const scores = getDimensionScores(f.evaluation!);
            return sum + scores[i];
          }, 0) / evaluated.length
        : 0;
    return { name, avg };
  });

  const archetypeCounts = (
    Object.keys(ARCHETYPE_LABELS) as Archetype[]
  ).map((a) => ({
    label: ARCHETYPE_LABELS[a],
    count: evaluated.filter((f) => f.evaluation?.archetype === a).length,
  }));

  return (
    <div>
      <div className="p-6 max-w-7xl mx-auto print:hidden">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/board"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={14} />
            Back to Board Outputs
          </Link>
          <PreReadPrintButton />
        </div>
      </div>

      {/* Print-optimized content */}
      <div className="max-w-4xl mx-auto p-8 print:p-0 print:max-w-none" id="pre-read-content">
        {/* PAGE 1: Executive Overview */}
        <div className="print:break-after-page mb-12 print:mb-0">
          <div className="border-b-2 border-primary pb-4 mb-6">
            <h1 className="text-2xl font-bold">
              AI Strategy Competitive Assessment
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Board Pre-Read &mdash; {evaluated.length} Advisory Firms Evaluated
            </p>
            <p className="text-xs text-muted-foreground">
              Generated {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>

          <h2 className="text-lg font-semibold mb-3">Executive Summary</h2>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="border rounded p-3 text-center">
              <p className="text-3xl font-bold">{evaluated.length}</p>
              <p className="text-xs text-muted-foreground">Firms Evaluated</p>
            </div>
            <div className="border rounded p-3 text-center">
              <p className="text-3xl font-bold">{avgWeighted.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">
                Avg Score (of 56)
              </p>
            </div>
            <div className="border rounded p-3 text-center">
              <p className="text-3xl font-bold">
                {(
                  evaluated.reduce(
                    (s, f) => s + (f.evaluation?.maturityStage ?? 0),
                    0
                  ) / evaluated.length
                ).toFixed(1)}
              </p>
              <p className="text-xs text-muted-foreground">
                Avg Maturity (of 5)
              </p>
            </div>
          </div>

          <h3 className="font-semibold mb-2">Maturity Distribution</h3>
          <div className="flex gap-2 mb-6">
            {stageDistribution.map((s) => (
              <div
                key={s.stage}
                className="flex-1 border rounded p-2 text-center"
              >
                <p className="text-lg font-bold">{s.count}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          <h3 className="font-semibold mb-2">Archetype Classification</h3>
          <div className="grid grid-cols-4 gap-2 mb-6">
            {archetypeCounts.map((a) => (
              <div key={a.label} className="border rounded p-2 text-center">
                <p className="text-lg font-bold">{a.count}</p>
                <p className="text-xs text-muted-foreground">{a.label}</p>
              </div>
            ))}
          </div>

          <h3 className="font-semibold mb-2">Dimension Averages (Sector-Wide)</h3>
          <div className="space-y-1 text-sm">
            {[...dimAverages]
              .sort((a, b) => b.avg - a.avg)
              .map((d) => (
                <div key={d.name} className="flex items-center gap-2">
                  <span className="w-48 text-xs">{d.name}</span>
                  <div className="flex-1 bg-muted rounded-full h-3">
                    <div
                      className="bg-primary rounded-full h-3"
                      style={{ width: `${(d.avg / 5) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 text-xs font-mono text-right">
                    {d.avg.toFixed(1)}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* PAGE 2: Comparative Matrix */}
        <div className="print:break-after-page mb-12 print:mb-0">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">
            Comparative Analysis
          </h2>

          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-1.5">Firm</th>
                <th className="text-center p-1.5">Grp</th>
                <th className="text-center p-1.5">Stage</th>
                <th className="text-center p-1.5">Score</th>
                <th className="text-center p-1.5">Conf</th>
                <th className="text-left p-1.5">Archetype</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((firm) => (
                <tr key={firm.slug} className="border-b">
                  <td className="p-1.5 font-medium">{firm.shortName}</td>
                  <td className="text-center p-1.5">{firm.group}</td>
                  <td className="text-center p-1.5">
                    {firm.evaluation!.maturityStage}
                  </td>
                  <td className="text-center p-1.5 font-mono">
                    {firm.evaluation!.compositeScoreWeighted.toFixed(1)}
                  </td>
                  <td className="text-center p-1.5">
                    {firm.evaluation!.confidenceGrade}
                  </td>
                  <td className="p-1.5 text-muted-foreground">
                    {
                      ARCHETYPE_LABELS[
                        firm.evaluation!.archetype as Archetype
                      ]
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGE 3: Key Findings */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">
            Key Findings
          </h2>
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-semibold">
                1. The sector is predominantly early-stage in AI adoption
              </p>
              <p className="text-muted-foreground mt-1">
                {stageDistribution
                  .filter((s) => s.count > 0)
                  .map((s) => `${s.count} firms at ${s.label}`)
                  .join(", ")}
                . The average maturity stage is{" "}
                {(
                  evaluated.reduce(
                    (s, f) => s + (f.evaluation?.maturityStage ?? 0),
                    0
                  ) / evaluated.length
                ).toFixed(1)}{" "}
                out of 5.
              </p>
            </div>
            <div>
              <p className="font-semibold">
                2. A clear leader group is emerging
              </p>
              <p className="text-muted-foreground mt-1">
                The top-scoring firms are{" "}
                {sorted
                  .slice(0, 3)
                  .map((f) => f.shortName)
                  .join(", ")}
                , separated from the field by weighted scores of{" "}
                {sorted
                  .slice(0, 3)
                  .map((f) =>
                    f.evaluation!.compositeScoreWeighted.toFixed(1)
                  )
                  .join(", ")}{" "}
                respectively.
              </p>
            </div>
            <div>
              <p className="font-semibold">
                3. Proprietary technology separates leaders from positioners
              </p>
              <p className="text-muted-foreground mt-1">
                The largest variance across firms is in Proprietary AI Technology
                and Technical Talent. Firms scoring high on these dimensions tend
                to score high overall, suggesting that genuine engineering
                investment is the strongest predictor of AI maturity.
              </p>
            </div>
            <div>
              <p className="font-semibold">4. Evidence quality demands caution</p>
              <p className="text-muted-foreground mt-1">
                {evaluated.filter((f) => f.evaluation?.confidenceGrade === "C" || f.evaluation?.confidenceGrade === "D").length}{" "}
                firms have Low or Insufficient evidence confidence. Rankings for
                these firms should be treated as directional rather than
                definitive.
              </p>
            </div>
            <div>
              <p className="font-semibold">
                5. Management consultancies vs. advisory firms show different
                patterns
              </p>
              <p className="text-muted-foreground mt-1">
                Group 2 firms (PR networks and management consulting) tend to
                score differently from Group 1 (corporate advisory), reflecting
                fundamentally different business models and resource bases for AI
                investment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

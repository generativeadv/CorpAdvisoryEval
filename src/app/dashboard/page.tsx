import { getAllFirmsWithEvaluations } from "@/lib/queries";
import { SummaryMatrix } from "@/components/compare/summary-matrix";
import { MATURITY_LABELS, type MaturityStage } from "@/lib/types";

export default async function DashboardPage() {
  const firms = await getAllFirmsWithEvaluations();

  const evaluated = firms.filter((f) => f.evaluation);
  const avgScore =
    evaluated.length > 0
      ? evaluated.reduce(
          (sum, f) => sum + (f.evaluation?.compositeScoreWeighted ?? 0),
          0
        ) / evaluated.length
      : 0;

  const stageDistribution = [1, 2, 3, 4, 5].map((stage) => ({
    stage: stage as MaturityStage,
    label: MATURITY_LABELS[stage as MaturityStage],
    count: evaluated.filter((f) => f.evaluation?.maturityStage === stage).length,
  }));

  const maxStage = evaluated.length > 0
    ? Math.max(...evaluated.map((f) => f.evaluation?.maturityStage ?? 0))
    : 0;

  // Distribution stats
  const allScores = evaluated.map((f) => f.evaluation!.compositeScoreWeighted).sort((a, b) => a - b);
  const sd = allScores.length > 0
    ? Math.sqrt(allScores.reduce((a, b) => a + Math.pow(b - avgScore, 2), 0) / allScores.length)
    : 0;
  const q1 = allScores.length > 0 ? allScores[Math.floor(allScores.length * 0.25)] : 0;
  const q3 = allScores.length > 0 ? allScores[Math.floor(allScores.length * 0.75)] : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Advisory AI Strategy Evaluation</h1>
        <p className="text-muted-foreground mt-1">
          Board-level competitive intelligence across {firms.length} firms
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Firms Evaluated</p>
          <p className="text-3xl font-bold">{evaluated.length}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Avg Weighted Score</p>
          <p className="text-3xl font-bold">{avgScore.toFixed(1)}</p>
          <p className="text-xs text-muted-foreground">out of 60</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Highest Maturity</p>
          <p className="text-3xl font-bold">{maxStage || "--"}</p>
          {maxStage > 0 && (
            <p className="text-xs text-muted-foreground">
              {MATURITY_LABELS[maxStage as MaturityStage]}
            </p>
          )}
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Maturity Distribution</p>
          <div className="flex gap-1 mt-2">
            {stageDistribution.map((s) => (
              <div key={s.stage} className="flex-1 text-center">
                <div
                  className="bg-primary/20 rounded-sm mx-0.5"
                  style={{
                    height: `${Math.max(4, (s.count / Math.max(1, evaluated.length)) * 60)}px`,
                  }}
                />
                <p className="text-xs mt-1">{s.count}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-1 text-[10px] text-muted-foreground">
            {stageDistribution.map((s) => (
              <div key={s.stage} className="flex-1 text-center">
                S{s.stage}
              </div>
            ))}
          </div>
        </div>
      </div>

      {evaluated.length > 0 && (
        <div className="border rounded-lg p-4 bg-muted/20">
          <p className="text-sm font-medium mb-1">How to read the scores</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The middle 50% of firms score between {q1} and {q3} (a{" "}
            {q3 - q1}-point band out of 60). The standard deviation is{" "}
            {sd.toFixed(1)}, meaning firms need to be roughly{" "}
            {Math.round(sd)} points apart to be in meaningfully different
            tiers. Firms within the same quartile are not reliably
            differentiated by score alone — look to the dimension-level
            breakdown and confidence grade for sharper distinctions.
          </p>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-4">Summary Matrix</h2>
        <SummaryMatrix firms={firms} />
      </div>
    </div>
  );
}

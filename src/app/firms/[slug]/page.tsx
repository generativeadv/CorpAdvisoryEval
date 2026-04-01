import { notFound } from "next/navigation";
import { getFirmBySlug, getFirmReportContent, getAllFirmsWithEvaluations } from "@/lib/queries";
import { MaturityBadge } from "@/components/evaluation/maturity-badge";
import { ConfidenceBadge } from "@/components/evaluation/confidence-badge";
import { DimensionRadar } from "@/components/evaluation/dimension-radar";
import { ScorecardTable } from "@/components/evaluation/scorecard-table";
import { ReportViewer } from "@/components/reports/report-viewer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getDimensionScores,
  MATURITY_LABELS,
  ARCHETYPE_LABELS,
  CONFIDENCE_LABELS,
  type MaturityStage,
  type ConfidenceGrade,
  type Archetype,
} from "@/lib/types";
import { GROUP_LABELS } from "@/lib/firms";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function FirmDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const firm = await getFirmBySlug(slug);
  if (!firm) notFound();

  const reportContent = await getFirmReportContent(slug);
  const allFirms = await getAllFirmsWithEvaluations();
  const evaluation = firm.evaluation;
  const scores = evaluation ? getDimensionScores(evaluation) : [];

  // Compute percentile and gap from mean
  const allScores = allFirms
    .filter((f) => f.evaluation)
    .map((f) => f.evaluation!.compositeScoreWeighted);
  const mean = allScores.length > 0
    ? allScores.reduce((a, b) => a + b, 0) / allScores.length
    : 0;
  const percentile = evaluation
    ? Math.round(
        (allScores.filter((s) => s < evaluation.compositeScoreWeighted).length /
          (allScores.length - 1)) *
          100
      )
    : null;
  const gapFromMean = evaluation
    ? Math.round((evaluation.compositeScoreWeighted - mean) * 10) / 10
    : null;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <Link
        href="/firms"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={14} />
        Back to Firms
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{firm.name}</h1>
          <p className="text-muted-foreground">
            Group {firm.group} &mdash; {GROUP_LABELS[firm.group]}
          </p>
        </div>
        {evaluation && (
          <div className="flex items-center gap-2">
            <MaturityBadge stage={evaluation.maturityStage} />
            <ConfidenceBadge grade={evaluation.confidenceGrade} />
          </div>
        )}
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="report">Full Report</TabsTrigger>
          <TabsTrigger value="evaluation">Evaluation Detail</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {evaluation ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="border rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold">Key Metrics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Maturity Stage
                      </p>
                      <p className="font-medium">
                        {evaluation.maturityStage}.{" "}
                        {MATURITY_LABELS[evaluation.maturityStage]}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Weighted Score
                      </p>
                      <p className="font-medium font-mono">
                        {evaluation.compositeScoreWeighted.toFixed(1)} / 60
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Percentile
                      </p>
                      <p className="font-medium font-mono">
                        {percentile !== null ? `${percentile}th` : "--"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        vs. Mean
                      </p>
                      <p className={`font-medium font-mono ${gapFromMean !== null && gapFromMean > 0 ? "text-green-600" : gapFromMean !== null && gapFromMean < 0 ? "text-red-500" : ""}`}>
                        {gapFromMean !== null
                          ? `${gapFromMean > 0 ? "+" : ""}${gapFromMean.toFixed(1)}`
                          : "--"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Confidence
                      </p>
                      <p className="font-medium">
                        {evaluation.confidenceGrade} &mdash;{" "}
                        {
                          CONFIDENCE_LABELS[
                            evaluation.confidenceGrade as ConfidenceGrade
                          ]
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Archetype</p>
                      <p className="font-medium">
                        {ARCHETYPE_LABELS[evaluation.archetype as Archetype]}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Maturity Rationale</h3>
                  <p className="text-sm text-muted-foreground">
                    {evaluation.maturityRationale}
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Confidence Rationale</h3>
                  <p className="text-sm text-muted-foreground">
                    {evaluation.confidenceRationale}
                  </p>
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Dimension Scores</h3>
                <DimensionRadar scores={scores} />
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">
              This firm has not yet been evaluated. Use the{" "}
              <Link href="/chat" className="underline">
                AI Chat
              </Link>{" "}
              to trigger an evaluation.
            </p>
          )}
        </TabsContent>

        <TabsContent value="report" className="mt-6">
          {reportContent ? (
            <ReportViewer content={reportContent} />
          ) : (
            <p className="text-muted-foreground">
              No research report available for this firm.
            </p>
          )}
        </TabsContent>

        <TabsContent value="evaluation" className="mt-6">
          {evaluation ? (
            <div className="space-y-6">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-4">Dimension Scorecard</h3>
                <ScorecardTable scores={scores} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <p className="text-xs text-muted-foreground">
                    Unweighted Score
                  </p>
                  <p className="text-2xl font-bold font-mono">
                    {evaluation.compositeScoreUnweighted} / 50
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <p className="text-xs text-muted-foreground">
                    Weighted Score (1.5x on dims 1,2,4,9)
                  </p>
                  <p className="text-2xl font-bold font-mono">
                    {evaluation.compositeScoreWeighted.toFixed(1)} / 60
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No evaluation data available.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

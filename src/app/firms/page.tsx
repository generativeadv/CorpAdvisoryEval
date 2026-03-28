import { getAllFirmsWithEvaluations } from "@/lib/queries";
import { MaturityBadge } from "@/components/evaluation/maturity-badge";
import { ConfidenceBadge } from "@/components/evaluation/confidence-badge";
import { GROUP_LABELS } from "@/lib/firms";
import Link from "next/link";

export default async function FirmsPage() {
  const firms = await getAllFirmsWithEvaluations();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Firms</h1>
        <p className="text-muted-foreground mt-1">
          {firms.length} firms across 3 groups
        </p>
      </div>

      {([1, 2, 3] as const).map((group) => {
        const groupFirms = firms.filter((f) => f.group === group);
        return (
          <div key={group}>
            <h2 className="text-lg font-semibold mb-1">Group {group}</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {GROUP_LABELS[group]}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupFirms.map((firm) => (
                <Link
                  key={firm.slug}
                  href={`/firms/${firm.slug}`}
                  className="border rounded-lg p-4 hover:border-primary transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{firm.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Group {firm.group}
                      </p>
                    </div>
                    {firm.evaluation && (
                      <ConfidenceBadge grade={firm.evaluation.confidenceGrade} />
                    )}
                  </div>
                  {firm.evaluation && (
                    <div className="mt-3 flex items-center gap-3">
                      <MaturityBadge stage={firm.evaluation.maturityStage} />
                      <span className="text-sm font-mono">
                        {firm.evaluation.compositeScoreWeighted.toFixed(1)}
                      </span>
                    </div>
                  )}
                  {!firm.evaluation && (
                    <p className="mt-3 text-sm text-muted-foreground">
                      Not yet evaluated
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

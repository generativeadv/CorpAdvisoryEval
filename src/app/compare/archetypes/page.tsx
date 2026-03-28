import { getAllFirmsWithEvaluations } from "@/lib/queries";
import { MaturityBadge } from "@/components/evaluation/maturity-badge";
import { ConfidenceBadge } from "@/components/evaluation/confidence-badge";
import { ARCHETYPE_LABELS, type Archetype } from "@/lib/types";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const ARCHETYPE_DESCRIPTIONS: Record<Archetype, string> = {
  "technology-builder":
    "Firms investing heavily in proprietary AI technology and engineering talent. Strong on internal platforms and technical depth.",
  "advisory-positioner":
    "Firms with strong AI messaging, thought leadership, and positioning but lighter on proprietary technology and engineering investment.",
  acquirer:
    "Firms building AI capabilities primarily through M&A, partnerships, and acquisitions rather than organic development.",
  "dormant-lagging":
    "Firms with minimal visible AI activity across most dimensions. May be active but evidence is thin.",
};

const ARCHETYPE_ICONS: Record<Archetype, string> = {
  "technology-builder": "bg-blue-50 border-blue-200",
  "advisory-positioner": "bg-purple-50 border-purple-200",
  acquirer: "bg-amber-50 border-amber-200",
  "dormant-lagging": "bg-gray-50 border-gray-200",
};

export default async function ArchetypesPage() {
  const firms = await getAllFirmsWithEvaluations();
  const evaluated = firms.filter((f) => f.evaluation);

  const archetypeGroups = (Object.keys(ARCHETYPE_LABELS) as Archetype[]).map(
    (archetype) => ({
      archetype,
      label: ARCHETYPE_LABELS[archetype],
      description: ARCHETYPE_DESCRIPTIONS[archetype],
      firms: evaluated.filter((f) => f.evaluation?.archetype === archetype),
    })
  );

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
        <h1 className="text-2xl font-bold">Archetype Classification</h1>
        <p className="text-muted-foreground mt-1">
          Firms grouped by their strategic AI posture based on score profiles
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {archetypeGroups.map((group) => (
          <div
            key={group.archetype}
            className={`border rounded-lg p-5 ${ARCHETYPE_ICONS[group.archetype]}`}
          >
            <h3 className="font-semibold text-lg">{group.label}</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              {group.description}
            </p>
            <div className="space-y-2">
              {group.firms.length === 0 && (
                <p className="text-sm text-muted-foreground italic">
                  No firms in this archetype
                </p>
              )}
              {group.firms
                .sort(
                  (a, b) =>
                    (b.evaluation?.compositeScoreWeighted ?? 0) -
                    (a.evaluation?.compositeScoreWeighted ?? 0)
                )
                .map((firm) => (
                  <Link
                    key={firm.slug}
                    href={`/firms/${firm.slug}`}
                    className="flex items-center justify-between bg-background/50 rounded p-2 hover:bg-background transition-colors"
                  >
                    <span className="font-medium text-sm">{firm.shortName}</span>
                    <div className="flex items-center gap-2">
                      <MaturityBadge
                        stage={firm.evaluation!.maturityStage}
                      />
                      <span className="text-xs font-mono">
                        {firm.evaluation!.compositeScoreWeighted.toFixed(1)}
                      </span>
                      <ConfidenceBadge
                        grade={firm.evaluation!.confidenceGrade}
                      />
                    </div>
                  </Link>
                ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              {group.firms.length} firm{group.firms.length !== 1 ? "s" : ""}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

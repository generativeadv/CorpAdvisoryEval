import { getAllFirmsWithEvaluations } from "@/lib/queries";
import { DimensionHeatmap } from "@/components/compare/dimension-heatmap";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function HeatmapPage() {
  const firms = await getAllFirmsWithEvaluations();

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
        <h1 className="text-2xl font-bold">Dimension Heatmap</h1>
        <p className="text-muted-foreground mt-1">
          Click column headers to sort. Color scale: red (1) to green (5).
        </p>
      </div>
      <DimensionHeatmap firms={firms} />
    </div>
  );
}

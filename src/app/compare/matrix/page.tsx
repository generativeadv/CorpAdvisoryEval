import { getAllFirmsWithEvaluations } from "@/lib/queries";
import { SummaryMatrix } from "@/components/compare/summary-matrix";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function MatrixPage() {
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
        <h1 className="text-2xl font-bold">Summary Matrix</h1>
        <p className="text-muted-foreground mt-1">
          All firms ranked and filterable across key metrics
        </p>
      </div>
      <SummaryMatrix firms={firms} />
    </div>
  );
}

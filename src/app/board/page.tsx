import Link from "next/link";
import { FileText, Presentation } from "lucide-react";

export default function BoardPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Board Outputs</h1>
        <p className="text-muted-foreground mt-1">
          Cross-firm deliverables for board-level readout
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/board/pre-read"
          className="border rounded-lg p-6 hover:border-primary transition-colors"
        >
          <FileText size={24} className="text-primary mb-3" />
          <h3 className="font-semibold">3-Page Board Pre-Read</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Print-optimized executive summary with key metrics, comparative
            analysis, and findings narrative. Export to PDF via print.
          </p>
        </Link>
        <Link
          href="/board/slides"
          className="border rounded-lg p-6 hover:border-primary transition-colors"
        >
          <Presentation size={24} className="text-primary mb-3" />
          <h3 className="font-semibold">3-Slide Visual Summary</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Full-screen 16:9 slide deck with 2x2 matrix, dimension heatmap, and
            key takeaways. Keyboard navigation supported.
          </p>
        </Link>
      </div>
    </div>
  );
}

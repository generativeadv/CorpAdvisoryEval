import Link from "next/link";
import { FileText, Presentation, History } from "lucide-react";

const REVISIONS = [
  {
    version: "v2",
    date: "April 2026",
    label: "Current",
    note: "Adds McKinsey (QuantumBlack) and BCG to evaluation. Includes 4-group structure (Corporate Advisory, Global PR Networks, Management Consulting, Emerging & Specialist). Incorporates distribution statistics (percentile rank, gap from mean, IQR) to contextualize score differences. Updated competitive landscape and key observations.",
    preReadHref: "/board/pre-read",
    slidesHref: "/board/slides",
  },
  {
    version: "v1",
    date: "March 2026",
    label: "First draft",
    note: "Initial 17-firm assessment across 3 groups. Does not include McKinsey or BCG. Pre-distribution-stats version — scores presented without percentile or variance context.",
    preReadHref: "/board/pre-read-v1",
    slidesHref: "/board/slides-v1",
  },
];

export default function BoardPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Board Outputs</h1>
        <p className="text-muted-foreground mt-1">
          Cross-firm deliverables for board-level readout
        </p>
      </div>

      {/* Current version */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/board/pre-read"
          className="border rounded-lg p-6 hover:border-primary transition-colors"
        >
          <FileText size={24} className="text-primary mb-3" />
          <h3 className="font-semibold">3-Page Board Pre-Read</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Text-only memo format. Executive summary, competitive landscape,
            and key observations. Export to PDF or Word.
          </p>
        </Link>
        <Link
          href="/board/slides"
          className="border rounded-lg p-6 hover:border-primary transition-colors"
        >
          <Presentation size={24} className="text-primary mb-3" />
          <h3 className="font-semibold">3-Slide Summary</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Consulting-style readout. Situation, competitive landscape table,
            and key observations. Download as PowerPoint.
          </p>
        </Link>
      </div>

      {/* Revision history */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <History size={18} className="text-muted-foreground" />
          <h2 className="text-lg font-semibold">Revision History</h2>
        </div>
        <div className="space-y-3">
          {REVISIONS.map((rev) => (
            <div
              key={rev.version}
              className="border rounded-lg p-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono text-sm font-bold">
                  {rev.version}
                </span>
                {rev.label === "Current" && (
                  <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-semibold">
                    Current
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  {rev.date}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {rev.note}
              </p>
              <div className="flex gap-3">
                <Link
                  href={rev.preReadHref}
                  className="text-xs text-primary hover:underline"
                >
                  Pre-Read
                </Link>
                <Link
                  href={rev.slidesHref}
                  className="text-xs text-primary hover:underline"
                >
                  Slides
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

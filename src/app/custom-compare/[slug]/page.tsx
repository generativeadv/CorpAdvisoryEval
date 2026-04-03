"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { ArrowLeft, FileDown } from "lucide-react";
import { ProgressView } from "../progress-view";

interface Comparison {
  slug: string;
  firmSlugs: string;
  firmNames: string;
  content: string | null;
  status: string;
  generatedAt: string | null;
}

export default function ComparisonPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [comparison, setComparison] = useState<Comparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingDocx, setDownloadingDocx] = useState(false);
  const [downloadingPptx, setDownloadingPptx] = useState(false);

  const fetchComparison = useCallback(async () => {
    try {
      const res = await fetch(`/api/comparisons/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setComparison(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchComparison();
  }, [fetchComparison]);

  const handleDownloadDocx = async () => {
    if (!comparison?.content) return;
    setDownloadingDocx(true);
    try {
      const { generateComparisonDocx } = await import("@/lib/export-comparison-docx");
      const blob = await generateComparisonDocx(comparison.firmNames, comparison.content, comparison.generatedAt);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Comparison-${comparison.firmNames.replace(/[^a-zA-Z0-9]/g, "-")}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloadingDocx(false);
    }
  };

  const handleDownloadPptx = async () => {
    if (!comparison?.content) return;
    setDownloadingPptx(true);
    try {
      const { generateComparisonPptx } = await import("@/lib/export-comparison-pptx");
      const blob = await generateComparisonPptx(comparison.firmNames, comparison.content, comparison.generatedAt);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Comparison-${comparison.firmNames.replace(/[^a-zA-Z0-9]/g, "-")}.pptx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloadingPptx(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!comparison) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <p className="text-muted-foreground">Comparison not found.</p>
      </div>
    );
  }

  if (comparison.status === "generating") {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Link
          href="/custom-compare"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft size={14} /> Back
        </Link>
        <ProgressView
          firmNames={comparison.firmNames}
          onComplete={fetchComparison}
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/custom-compare"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={14} /> Back
        </Link>
        <div className="flex gap-2">
          <button
            onClick={handleDownloadDocx}
            disabled={downloadingDocx}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-md text-xs hover:bg-muted transition-colors disabled:opacity-50"
          >
            <FileDown size={14} />
            {downloadingDocx ? "..." : "Word"}
          </button>
          <button
            onClick={handleDownloadPptx}
            disabled={downloadingPptx}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-md text-xs hover:bg-muted transition-colors disabled:opacity-50"
          >
            <FileDown size={14} />
            {downloadingPptx ? "..." : "PPT"}
          </button>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">
          Custom Comparison
        </p>
        <h1 className="text-2xl font-bold">{comparison.firmNames}</h1>
        {comparison.generatedAt && (
          <p className="text-xs text-muted-foreground mt-1">
            Generated{" "}
            {new Date(comparison.generatedAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        )}
      </div>

      {comparison.status === "error" && (
        <div className="border border-red-200 bg-red-50 rounded-lg p-4">
          <p className="text-sm text-red-800">
            An error occurred generating this comparison. Please try again.
          </p>
        </div>
      )}

      {comparison.content && (
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {comparison.content}
          </ReactMarkdown>
        </div>
      )}

      <p className="text-xs text-muted-foreground border-t pt-4">
        This analysis was generated by Claude Opus using the structured
        evaluation data and deep research reports for each firm. It is
        AI-generated and should be reviewed in the context of the underlying
        evidence.
      </p>
    </div>
  );
}

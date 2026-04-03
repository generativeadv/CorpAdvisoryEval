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
    // Row may not exist yet (POST still creating it) — show progress and keep polling
    const firmNames = slug.split("_").join(", ");
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Link
          href="/custom-compare"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft size={14} /> Back
        </Link>
        <ProgressView firmNames={firmNames} onComplete={fetchComparison} />
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
        <div className="max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 className="text-2xl font-bold mt-10 mb-4 pb-3 border-b-2 border-primary/20 first:mt-0">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl font-bold mt-10 mb-3 pb-2 border-b border-border first:mt-0">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-base font-semibold mt-8 mb-2 text-foreground/90">
                  {children}
                </h3>
              ),
              h4: ({ children }) => (
                <h4 className="text-sm font-semibold mt-6 mb-1.5 text-foreground/80">
                  {children}
                </h4>
              ),
              p: ({ children }) => (
                <p className="text-sm leading-relaxed text-foreground/80 mb-4">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="text-sm leading-relaxed text-foreground/80 space-y-2 mb-5 ml-1">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="text-sm leading-relaxed text-foreground/80 space-y-2 mb-5 ml-1 list-decimal list-inside">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="flex items-start gap-2">
                  <span className="text-primary/40 mt-1.5 shrink-0 text-[8px]">&#9679;</span>
                  <span className="flex-1">{children}</span>
                </li>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-foreground">{children}</strong>
              ),
              em: ({ children }) => (
                <em className="italic text-foreground/70">{children}</em>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-3 border-primary/30 pl-4 py-1 my-4 text-sm text-foreground/70 italic">
                  {children}
                </blockquote>
              ),
              hr: () => <hr className="my-8 border-border/50" />,
              table: ({ children }) => (
                <div className="overflow-x-auto my-6 border rounded-lg">
                  <table className="min-w-full text-xs">{children}</table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="bg-muted/50 border-b">{children}</thead>
              ),
              th: ({ children }) => (
                <th className="text-left px-3 py-2 font-semibold text-foreground/70 text-xs">{children}</th>
              ),
              td: ({ children }) => (
                <td className="px-3 py-2 border-b border-border/30 text-foreground/80 text-xs leading-relaxed align-top">{children}</td>
              ),
              tr: ({ children }) => (
                <tr className="hover:bg-muted/30 transition-colors">{children}</tr>
              ),
            }}
          >
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

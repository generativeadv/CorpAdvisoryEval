"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { X, Zap } from "lucide-react";

interface FirmOption {
  slug: string;
  name: string;
  shortName: string;
  group: number;
}

export function FirmPicker({ firms }: { firms: FirmOption[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toggle = (slug: string) => {
    if (selected.includes(slug)) {
      setSelected(selected.filter((s) => s !== slug));
    } else if (selected.length < 3) {
      setSelected([...selected, slug]);
    }
  };

  const handleRun = async () => {
    if (selected.length !== 3 || loading) return;
    setLoading(true);

    // Compute slug client-side and redirect immediately to progress page
    const slug = [...selected].sort().join("_");

    // Fire off the POST (don't await — let the comparison page handle polling)
    fetch("/api/comparisons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firmSlugs: selected }),
    }).catch(console.error);

    // Redirect to comparison page which shows progress UI
    router.push(`/custom-compare/${slug}`);
  };

  const groups = [1, 2, 3, 4];

  return (
    <div className="space-y-4">
      {/* Selected chips */}
      <div className="flex items-center gap-2 min-h-[40px]">
        {selected.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Select 3 firms to compare
          </p>
        )}
        {selected.map((slug) => {
          const firm = firms.find((f) => f.slug === slug);
          return (
            <button
              key={slug}
              onClick={() => toggle(slug)}
              className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-sm font-medium"
            >
              {firm?.shortName}
              <X size={14} />
            </button>
          );
        })}
        {selected.length > 0 && selected.length < 3 && (
          <span className="text-xs text-muted-foreground">
            {3 - selected.length} more
          </span>
        )}
      </div>

      {/* Firm grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {groups.map((g) => (
          <div key={g} className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">
              Group {g}
            </p>
            {firms
              .filter((f) => f.group === g)
              .map((firm) => {
                const isSelected = selected.includes(firm.slug);
                const isDisabled = !isSelected && selected.length >= 3;
                return (
                  <button
                    key={firm.slug}
                    onClick={() => toggle(firm.slug)}
                    disabled={isDisabled}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm transition-all",
                      isSelected
                        ? "bg-primary text-primary-foreground font-medium"
                        : isDisabled
                          ? "text-muted-foreground/40 cursor-not-allowed"
                          : "hover:bg-muted text-foreground"
                    )}
                  >
                    {firm.shortName}
                  </button>
                );
              })}
          </div>
        ))}
      </div>

      {/* Run button */}
      <button
        onClick={handleRun}
        disabled={selected.length !== 3 || loading}
        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-lg py-3 font-medium text-sm hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        <Zap size={16} />
        {loading ? "Starting comparison..." : "Run Comparison"}
      </button>
    </div>
  );
}

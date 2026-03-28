"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { CONFIDENCE_LABELS, type ConfidenceGrade } from "@/lib/types";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const GRADES: { grade: ConfidenceGrade; definition: string; color: string }[] = [
  { grade: "A", definition: "Multiple independent primary sources confirm key claims. Official announcements, verifiable job postings, named leaders, third-party coverage all align.", color: "border-green-400 bg-green-50" },
  { grade: "B", definition: "Primary sources confirm core claims but some dimensions rely on inference. Key gaps exist but the overall picture is supported.", color: "border-emerald-400 bg-emerald-50" },
  { grade: "C", definition: "Evidence is thin, relies heavily on marketing language, or comes predominantly from self-reported sources. Key claims are plausible but unverified.", color: "border-yellow-400 bg-yellow-50" },
  { grade: "D", definition: "Very little public information available. Rating reflects information scarcity, not necessarily firm inactivity.", color: "border-red-400 bg-red-50" },
];

export default function ConfidencePage() {
  const [active, setActive] = useState<ConfidenceGrade | null>(null);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <Link href="/methodology" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={14} /> Methodology
      </Link>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 mb-1">Framework 3</p>
        <h1 className="text-2xl font-bold">Evidence Confidence Index</h1>
        <p className="text-muted-foreground mt-2">
          For each firm, we assess evidence quality and density so decision-makers can distinguish genuine capability from strong marketing with thin proof.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {GRADES.map((c) => (
          <button
            key={c.grade}
            onClick={() => setActive(active === c.grade ? null : c.grade)}
            onMouseEnter={() => setActive(c.grade)}
            onMouseLeave={() => setActive(null)}
            className={cn("border-2 rounded-xl p-6 text-center transition-all duration-200 cursor-pointer", c.color, active === c.grade ? "scale-105 shadow-lg" : "opacity-60 hover:opacity-85")}
          >
            <span className="text-4xl font-bold block">{c.grade}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wide block mt-1">{CONFIDENCE_LABELS[c.grade]}</span>
          </button>
        ))}
      </div>

      <div className={cn("border-2 rounded-xl p-5 transition-all min-h-[80px]", active ? GRADES.find((c) => c.grade === active)!.color : "bg-muted/20 border-dashed")}>
        {active ? (
          <p className="text-sm">{GRADES.find((c) => c.grade === active)!.definition}</p>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-3">Select a grade above to see what it means</p>
        )}
      </div>
    </div>
  );
}

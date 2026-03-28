"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { MATURITY_LABELS, type MaturityStage } from "@/lib/types";
import { ArrowLeft, Search } from "lucide-react";
import Link from "next/link";

const STAGES: {
  stage: MaturityStage;
  definition: string;
  evidence: string;
  color: string;
  bgColor: string;
}[] = [
  { stage: 1, definition: "No meaningful public AI activity. AI may appear in generic website copy but no dedicated practice, leadership, tooling, or thought leadership.", evidence: "No AI-specific hires, no named practice, no proprietary tools, no AI-themed content beyond boilerplate.", color: "text-red-600", bgColor: "bg-red-50 border-red-200" },
  { stage: 2, definition: "Early-stage exploration. Some thought leadership, possibly a working group or internal pilot, but no formalized offering, no dedicated AI leadership, and no visible engineering investment.", evidence: "A few blog posts or podcast episodes on AI; generic \"we're exploring AI\" language; no named AI leader; no job postings for technical AI roles.", color: "text-orange-600", bgColor: "bg-orange-50 border-orange-200" },
  { stage: 3, definition: "AI becoming a named priority. Dedicated leadership appointed, practice or service line announced, some proprietary tooling in development or early deployment, active hiring of technical talent.", evidence: "Named AI leader hired; practice announced; 1\u20133 technical job postings; internal tool referenced; thought leadership becoming regular.", color: "text-yellow-600", bgColor: "bg-yellow-50 border-yellow-200" },
  { stage: 4, definition: "AI embedded in operations and client delivery at meaningful scale. Proprietary platform in production use, dedicated engineering team, active client-facing practice, evidence of commercial traction.", evidence: "Proprietary platform at scale; 10+ technical staff; defined service pillars; client references; acquisitions reinforcing capability.", color: "text-blue-600", bgColor: "bg-blue-50 border-blue-200" },
  { stage: 5, definition: "AI is a core strategic differentiator. Deep proprietary technology, significant engineering organization, measurable commercial AI revenue, published case studies, governance framework in place.", evidence: "Large engineering team (50+); named AI products; published case studies; identifiable AI revenue; formal governance; strategic acquisitions.", color: "text-green-600", bgColor: "bg-green-50 border-green-200" },
];

export default function MaturityPage() {
  const [active, setActive] = useState<MaturityStage | null>(null);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <Link href="/methodology" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={14} /> Methodology
      </Link>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">Framework 1</p>
        <h1 className="text-2xl font-bold">AI Maturity Model</h1>
        <p className="text-muted-foreground mt-2">
          Five stages from Dormant to Leading. Classification is conservative: a firm is placed at the <strong>lowest stage at which all criteria are met</strong>.
        </p>
      </div>

      {/* Staircase */}
      <div className="flex items-end gap-2 h-56">
        {STAGES.map((s) => (
          <button
            key={s.stage}
            onMouseEnter={() => setActive(s.stage)}
            onMouseLeave={() => setActive(null)}
            onClick={() => setActive(active === s.stage ? null : s.stage)}
            className={cn("flex-1 rounded-t-xl transition-all duration-200 relative cursor-pointer border-2", s.bgColor, active === s.stage ? "opacity-100 scale-[1.03] shadow-lg" : "opacity-60 hover:opacity-85")}
            style={{ height: `${(s.stage / 5) * 100}%` }}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn("text-3xl font-bold", s.color)}>{s.stage}</span>
              <span className={cn("text-[10px] font-semibold uppercase tracking-wide", s.color)}>{MATURITY_LABELS[s.stage]}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Detail panel */}
      <div className={cn("border-2 rounded-xl p-5 transition-all duration-200 min-h-[120px]", active ? STAGES[active - 1].bgColor : "bg-muted/20 border-dashed")}>
        {active ? (
          <div className="space-y-2">
            <h3 className={cn("font-semibold text-lg", STAGES[active - 1].color)}>
              Stage {active}: {MATURITY_LABELS[active]}
            </h3>
            <p className="text-sm">{STAGES[active - 1].definition}</p>
            <div className="flex items-start gap-2 mt-3 pt-3 border-t border-current/10">
              <Search size={14} className="mt-0.5 shrink-0 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Typical evidence: </span>
                {STAGES[active - 1].evidence}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-6">Select a stage above to explore its criteria</p>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { WEIGHTED_DIMENSIONS } from "@/lib/types";
import { ArrowLeft, ChevronDown, Target, Cpu, Brain, Wrench, Handshake, Megaphone, Award, Zap, TrendingUp, Compass } from "lucide-react";
import Link from "next/link";

const DIMENSIONS: { name: string; icon: React.ElementType; anchors: { score: number; label: string }[] }[] = [
  { name: "Client-Facing AI Offering", icon: Target, anchors: [{ score: 1, label: "None visible" }, { score: 2, label: "AI mentioned generically" }, { score: 3, label: "Named AI practice announced" }, { score: 4, label: "Defined service pillars" }, { score: 5, label: "Pillars + published case studies" }] },
  { name: "Proprietary AI Technology", icon: Cpu, anchors: [{ score: 1, label: "No evidence" }, { score: 2, label: "Generic \u201Cusing AI\u201D claims" }, { score: 3, label: "Named internal tool in dev" }, { score: 4, label: "Platform in production" }, { score: 5, label: "Platform at scale + client products" }] },
  { name: "AI Leadership & Governance", icon: Brain, anchors: [{ score: 1, label: "No named AI leader" }, { score: 2, label: "AI in broader mandate" }, { score: 3, label: "Dedicated AI leader" }, { score: 4, label: "Leader + org structure" }, { score: 5, label: "Full leadership + governance" }] },
  { name: "Technical Talent & Engineering", icon: Wrench, anchors: [{ score: 1, label: "No evidence" }, { score: 2, label: "1\u20132 roles evident" }, { score: 3, label: "Small team (3\u201310), hiring" }, { score: 4, label: "Established team (10\u201330)" }, { score: 5, label: "Large org (30+) with leads" }] },
  { name: "AI Partnerships, Acquisitions & Ecosystem", icon: Handshake, anchors: [{ score: 1, label: "None identified" }, { score: 2, label: "Generic vendors or adjacent M&A" }, { score: 3, label: "1\u20132 named partnerships or 1 AI acquisition" }, { score: 4, label: "Multiple partnerships and/or acquisitions" }, { score: 5, label: "Deep alliances + targeted M&A program" }] },
  { name: "Thought Leadership & Content", icon: Megaphone, anchors: [{ score: 1, label: "None" }, { score: 2, label: "Occasional mentions" }, { score: 3, label: "Regular AI content" }, { score: 4, label: "Dedicated content franchise" }, { score: 5, label: "Industry-recognized, original research" }] },
  { name: "Case Studies & Evidence", icon: Award, anchors: [{ score: 1, label: "No published proof points" }, { score: 2, label: "Vague AI success references" }, { score: 3, label: "1\u20132 named examples" }, { score: 4, label: "Multiple case studies or outcomes" }, { score: 5, label: "Extensive evidence, named clients, quantified" }] },
  { name: "Internal AI Adoption", icon: Zap, anchors: [{ score: 1, label: "No evidence" }, { score: 2, label: "Generic claims" }, { score: 3, label: "Named tools, some adoption" }, { score: 4, label: "Platform at scale + training" }, { score: 5, label: "Deeply embedded, measurable" }] },
  { name: "Commercial Momentum", icon: TrendingUp, anchors: [{ score: 1, label: "No evidence" }, { score: 2, label: "Announced, no traction" }, { score: 3, label: "Hiring client-facing roles" }, { score: 4, label: "Indirect engagement evidence" }, { score: 5, label: "Named clients or AI revenue" }] },
  { name: "Strategic Coherence", icon: Compass, anchors: [{ score: 1, label: "No strategy" }, { score: 2, label: "Scattered activities" }, { score: 3, label: "Emerging coherence" }, { score: 4, label: "Clear connected strategy" }, { score: 5, label: "Fully integrated, board-level" }] },
];

export default function ScorecardPage() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <Link href="/methodology" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={14} /> Methodology
      </Link>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-purple-600 mb-1">Framework 1</p>
        <h1 className="text-2xl font-bold">Dimension Scorecard</h1>
        <p className="text-muted-foreground mt-2">
          Ten dimensions scored 1&ndash;5. Dimensions marked <span className="inline-flex items-center bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full text-[10px] font-semibold">1.5x</span> carry higher weight.
        </p>
      </div>

      <div className="space-y-1">
        {DIMENSIONS.map((d, i) => {
          const isWeighted = (WEIGHTED_DIMENSIONS as readonly number[]).includes(i);
          const isOpen = expanded === i;
          const Icon = d.icon;
          return (
            <button key={i} onClick={() => setExpanded(isOpen ? null : i)} className={cn("w-full text-left border rounded-lg transition-all duration-200", isOpen ? "bg-primary/5 border-primary/30 shadow-sm" : "hover:bg-muted/50")}>
              <div className="flex items-center gap-3 p-3">
                <div className={cn("w-8 h-8 rounded-md flex items-center justify-center shrink-0", isWeighted ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">{i + 1}.</span>
                  <span className="font-medium text-sm truncate">{d.name}</span>
                  {isWeighted && <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-semibold shrink-0">1.5x</span>}
                </div>
                <ChevronDown size={16} className={cn("shrink-0 text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")} />
              </div>
              {isOpen && (
                <div className="px-3 pb-4 pt-1">
                  <div className="flex gap-1.5">
                    {d.anchors.map((a) => (
                      <div key={a.score} className="flex-1 text-center">
                        <div className={cn("mx-auto w-full aspect-square max-w-[44px] rounded-lg flex items-center justify-center text-sm font-bold mb-1.5 border", a.score >= 4 ? "bg-green-100 text-green-700 border-green-200" : a.score >= 3 ? "bg-blue-100 text-blue-700 border-blue-200" : a.score >= 2 ? "bg-yellow-100 text-yellow-700 border-yellow-200" : "bg-red-100 text-red-700 border-red-200")}>
                          {a.score}
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-tight">{a.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="bg-muted/30 rounded-xl p-4 grid grid-cols-2 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold">50</p>
          <p className="text-xs text-muted-foreground">Max unweighted</p>
        </div>
        <div>
          <p className="text-2xl font-bold">56</p>
          <p className="text-xs text-muted-foreground">Max weighted (1.5x on dims 1, 2, 4, 9)</p>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ARCHETYPE_LABELS, type Archetype } from "@/lib/types";
import {
  BarChart3,
  Target,
  Shield,
  ChevronRight,
  ChevronDown,
  Cpu,
  Megaphone,
  ShoppingCart,
  AlertTriangle,
} from "lucide-react";

export default function HomePage() {
  const [researchOpen, setResearchOpen] = useState(false);
  const [limitationsOpen, setLimitationsOpen] = useState(false);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-12">
      {/* Hero */}
      <div className="text-center max-w-2xl mx-auto pt-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
          Advisory AI Eval
        </p>
        <h1 className="text-3xl font-bold">
          AI Strategy Competitive Assessment
        </h1>
        <p className="text-muted-foreground mt-3 leading-relaxed">
          This site evaluates how leading advisory, communications, and
          consulting firms are deploying AI — both in their client offerings
          and their internal operations. Each firm is assessed against a
          structured evaluation model using deep research drawn from public
          sources. The results are designed for board-level decision-making
          about competitive positioning and AI investment.
        </p>
      </div>

      {/* Methodology heading */}
      <div>
        <h2 className="text-xl font-semibold text-center mb-1">
          Evaluation Framework
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Three interlocking frameworks that answer where each firm stands,
          how they compare, and how confident we are in what we know
        </p>
      </div>

      {/* Three Framework Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            href: "/methodology/scorecard",
            num: "1",
            title: "Dimension Scorecard",
            question: "How do they compare?",
            summary:
              "Ten dimensions scored 1\u20135 with weighted composite scoring.",
            color: "text-purple-600",
            border: "border-purple-500",
            icon: Target,
          },
          {
            href: "/methodology/maturity",
            num: "2",
            title: "AI Maturity Model",
            question: "Where is this firm?",
            summary:
              "Five stages from Dormant to Leading. The headline classification.",
            color: "text-blue-600",
            border: "border-blue-500",
            icon: BarChart3,
          },
          {
            href: "/methodology/confidence",
            num: "3",
            title: "Evidence Confidence",
            question: "How sure are we?",
            summary:
              "A\u2013D rating separating verified depth from marketing veneer.",
            color: "text-amber-600",
            border: "border-amber-500",
            icon: Shield,
          },
        ].map((f) => {
          const Icon = f.icon;
          return (
            <Link
              key={f.href}
              href={f.href}
              className={cn(
                "group border-2 border-t-4 rounded-xl p-6 bg-gradient-to-b from-muted/30 to-transparent transition-all duration-200 hover:shadow-lg hover:scale-[1.02]",
                f.border
              )}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <Icon size={20} className={f.color} />
                </div>
                <p
                  className={cn(
                    "text-[10px] font-semibold uppercase tracking-wider",
                    f.color
                  )}
                >
                  Framework {f.num}
                </p>
              </div>
              <h3 className="font-bold text-lg mb-1">{f.question}</h3>
              <p className="text-sm text-muted-foreground">{f.summary}</p>
              <div className="mt-4 flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                Learn more <ChevronRight size={14} />
              </div>
            </Link>
          );
        })}
      </div>

      {/* How It Fits Together */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">How It All Fits Together</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The Dimension Scorecard breaks each firm&rsquo;s AI posture across ten
          capability areas with a weighted composite. The Maturity Model
          distills that into a single headline stage. The Confidence Index
          tells you how much to trust the scores. Cross-firm, this produces
          a summary matrix, dimension heatmap, key findings narrative, and
          archetype classification.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          {(
            [
              {
                key: "technology-builder" as Archetype,
                icon: Cpu,
                color: "bg-blue-50 border-blue-200",
                desc: "Firms investing in proprietary AI platforms and dedicated engineering teams. Score high on technology, talent, and internal adoption. Their competitive advantage is built, not bought or narrated.",
              },
              {
                key: "advisory-positioner" as Archetype,
                icon: Megaphone,
                color: "bg-purple-50 border-purple-200",
                desc: "Firms with strong AI messaging, thought leadership, and market positioning but lighter on proprietary technology and engineering depth. They lead the conversation but may lag on delivery infrastructure.",
              },
              {
                key: "acquirer" as Archetype,
                icon: ShoppingCart,
                color: "bg-amber-50 border-amber-200",
                desc: "Firms assembling AI capabilities primarily through M&A, partnerships, and strategic investments rather than organic development. Speed to capability comes at the cost of integration complexity.",
              },
              {
                key: "dormant-lagging" as Archetype,
                icon: AlertTriangle,
                color: "bg-gray-50 border-gray-200",
                desc: "Minimal visible AI activity across most dimensions. These firms may be active behind closed doors, but the public evidence base is too thin to classify higher. The confidence grade matters most here.",
              },
            ] as const
          ).map((a) => {
            const Icon = a.icon;
            return (
              <div
                key={a.key}
                className={cn("border rounded-xl p-4", a.color)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={16} className="shrink-0" />
                  <span className="font-semibold text-sm">
                    {ARCHETYPE_LABELS[a.key]}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {a.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Collapsible: Research Process */}
      <section className="border rounded-xl">
        <button
          onClick={() => setResearchOpen(!researchOpen)}
          className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/30 transition-colors rounded-xl"
        >
          <h2 className="font-semibold">Research Process</h2>
          <ChevronDown
            size={18}
            className={cn(
              "text-muted-foreground transition-transform duration-200",
              researchOpen && "rotate-180"
            )}
          />
        </button>
        {researchOpen && (
          <div className="px-5 pb-5 space-y-4 border-t pt-4">
            <p className="text-sm text-muted-foreground">
              For each firm, a deep research report covers nine sections from
              Executive Summary through Bottom-Line Assessment. Sources are
              tiered:
            </p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="border rounded-lg p-3 bg-green-50/50 border-t-2 border-t-green-500">
                <p className="font-semibold">Primary</p>
                <p className="text-muted-foreground mt-1">
                  Official sites, press releases, job postings, bios
                </p>
              </div>
              <div className="border rounded-lg p-3 bg-blue-50/50 border-t-2 border-t-blue-500">
                <p className="font-semibold">Secondary</p>
                <p className="text-muted-foreground mt-1">
                  Business press, trades, conference coverage
                </p>
              </div>
              <div className="border rounded-lg p-3 bg-purple-50/50 border-t-2 border-t-purple-500">
                <p className="font-semibold">Social</p>
                <p className="text-muted-foreground mt-1">
                  YouTube, X, LinkedIn, Reddit
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              All claims are dated and sourced. Fact is distinguished from
              inference. Gaps are flagged, never filled with assumptions.
            </p>
          </div>
        )}
      </section>

      {/* Collapsible: Limitations */}
      <section className="border rounded-xl mb-8">
        <button
          onClick={() => setLimitationsOpen(!limitationsOpen)}
          className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/30 transition-colors rounded-xl"
        >
          <h2 className="font-semibold">Limitations &amp; Caveats</h2>
          <ChevronDown
            size={18}
            className={cn(
              "text-muted-foreground transition-transform duration-200",
              limitationsOpen && "rotate-180"
            )}
          />
        </button>
        {limitationsOpen && (
          <div className="px-5 pb-5 space-y-2 border-t pt-4">
            {[
              "Based on publicly available evidence only. Firms with strong internal programs but limited disclosure may score lower.",
              "Confidence grades (C/D) flag information scarcity, not necessarily inactivity.",
              "Point-in-time assessments. Scores may shift materially within quarters.",
              "Weighted scoring (1.5x on dims 1, 2, 4, 9) prioritizes commercial substance. Alternative weights available via AI Chat.",
            ].map((c, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <AlertTriangle
                  size={14}
                  className="shrink-0 text-amber-500 mt-0.5"
                />
                <p>{c}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

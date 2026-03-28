"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  WEIGHTED_DIMENSIONS,
  MATURITY_LABELS,
  CONFIDENCE_LABELS,
  ARCHETYPE_LABELS,
  type MaturityStage,
  type ConfidenceGrade,
  type Archetype,
} from "@/lib/types";
import {
  BarChart3,
  Shield,
  Search,
  AlertTriangle,
  ChevronRight,
  Zap,
  Target,
  Brain,
  Wrench,
  Handshake,
  Megaphone,
  ShoppingCart,
  Cpu,
  TrendingUp,
  Compass,
  ArrowLeft,
  ChevronDown,
} from "lucide-react";

// ============================================================
// DATA
// ============================================================

const MATURITY_STAGES: {
  stage: MaturityStage;
  definition: string;
  evidence: string;
  color: string;
  bgColor: string;
}[] = [
  { stage: 1, definition: "No meaningful public AI activity. AI may appear in generic website copy but no dedicated practice, leadership, tooling, or thought leadership.", evidence: "No AI-specific hires, no named practice, no proprietary tools, no AI-themed content beyond boilerplate.", color: "text-red-600", bgColor: "bg-red-50 border-red-200" },
  { stage: 2, definition: "Early-stage exploration. Some thought leadership, possibly a working group or internal pilot, but no formalized offering, no dedicated AI leadership, and no visible engineering investment.", evidence: "A few blog posts or podcast episodes on AI; generic \"we're exploring AI\" language; no named AI leader; no job postings for technical AI roles.", color: "text-orange-600", bgColor: "bg-orange-50 border-orange-200" },
  { stage: 3, definition: "AI becoming a named priority. Dedicated leadership appointed, practice or service line announced, some proprietary tooling in development or early deployment, active hiring of technical talent.", evidence: "Named AI leader hired; practice announced; 1\u20133 technical job postings; internal tool referenced but limited public detail; thought leadership becoming regular.", color: "text-yellow-600", bgColor: "bg-yellow-50 border-yellow-200" },
  { stage: 4, definition: "AI embedded in operations and client delivery at meaningful scale. Proprietary platform in production use across the firm, dedicated engineering team, active client-facing practice with defined service lines, evidence of commercial traction.", evidence: "Proprietary platform at scale; 10+ technical staff; multiple AI-specific hires; defined service pillars; client references; regular thought leadership; acquisitions reinforcing capability.", color: "text-blue-600", bgColor: "bg-blue-50 border-blue-200" },
  { stage: 5, definition: "AI is a core strategic differentiator. Deep proprietary technology, significant engineering organization, measurable commercial AI revenue, published case studies, recognized market position, governance framework in place.", evidence: "Large engineering team (50+); named AI products; published case studies; identifiable AI revenue; formal governance framework; industry recognition; strategic acquisitions.", color: "text-green-600", bgColor: "bg-green-50 border-green-200" },
];

const DIMENSION_ANCHORS: { name: string; icon: React.ElementType; anchors: { score: number; label: string }[] }[] = [
  { name: "Client-Facing AI Offering", icon: Target, anchors: [{ score: 1, label: "None visible" }, { score: 2, label: "AI mentioned generically" }, { score: 3, label: "Named AI practice announced" }, { score: 4, label: "Defined service pillars" }, { score: 5, label: "Pillars + published case studies" }] },
  { name: "Proprietary AI Technology", icon: Cpu, anchors: [{ score: 1, label: "No evidence" }, { score: 2, label: "Generic \u201Cusing AI\u201D claims" }, { score: 3, label: "Named internal tool in dev" }, { score: 4, label: "Platform in production" }, { score: 5, label: "Platform at scale + client products" }] },
  { name: "AI Leadership & Governance", icon: Brain, anchors: [{ score: 1, label: "No named AI leader" }, { score: 2, label: "AI in broader mandate" }, { score: 3, label: "Dedicated AI leader" }, { score: 4, label: "Leader + org structure" }, { score: 5, label: "Full leadership + governance" }] },
  { name: "Technical Talent & Engineering", icon: Wrench, anchors: [{ score: 1, label: "No evidence" }, { score: 2, label: "1\u20132 roles evident" }, { score: 3, label: "Small team (3\u201310), hiring" }, { score: 4, label: "Established team (10\u201330)" }, { score: 5, label: "Large org (30+) with leads" }] },
  { name: "AI Partnerships & Ecosystem", icon: Handshake, anchors: [{ score: 1, label: "None identified" }, { score: 2, label: "Generic vendor relationships" }, { score: 3, label: "1\u20132 named partnerships" }, { score: 4, label: "Multiple strategic partnerships" }, { score: 5, label: "Deep alliances, major players" }] },
  { name: "Thought Leadership & Content", icon: Megaphone, anchors: [{ score: 1, label: "None" }, { score: 2, label: "Occasional mentions" }, { score: 3, label: "Regular AI content" }, { score: 4, label: "Dedicated content franchise" }, { score: 5, label: "Industry-recognized, original research" }] },
  { name: "Acquisitions & Investment", icon: ShoppingCart, anchors: [{ score: 1, label: "None" }, { score: 2, label: "Adjacent acquisitions" }, { score: 3, label: "1 AI-relevant acquisition" }, { score: 4, label: "Multiple AI/data acquisitions" }, { score: 5, label: "Strategic M&A program" }] },
  { name: "Internal AI Adoption", icon: Zap, anchors: [{ score: 1, label: "No evidence" }, { score: 2, label: "Generic claims" }, { score: 3, label: "Named tools, some adoption" }, { score: 4, label: "Platform at scale + training" }, { score: 5, label: "Deeply embedded, measurable" }] },
  { name: "Commercial Momentum", icon: TrendingUp, anchors: [{ score: 1, label: "No evidence" }, { score: 2, label: "Announced, no traction" }, { score: 3, label: "Hiring client-facing roles" }, { score: 4, label: "Indirect engagement evidence" }, { score: 5, label: "Named clients or AI revenue" }] },
  { name: "Strategic Coherence", icon: Compass, anchors: [{ score: 1, label: "No strategy" }, { score: 2, label: "Scattered activities" }, { score: 3, label: "Emerging coherence" }, { score: 4, label: "Clear connected strategy" }, { score: 5, label: "Fully integrated, board-level" }] },
];

const CONFIDENCE_GRADES: { grade: ConfidenceGrade; definition: string; color: string }[] = [
  { grade: "A", definition: "Multiple independent primary sources confirm key claims. Official announcements, verifiable job postings, named leaders, third-party coverage all align.", color: "border-green-400 bg-green-50" },
  { grade: "B", definition: "Primary sources confirm core claims but some dimensions rely on inference. Key gaps exist but the overall picture is supported.", color: "border-blue-400 bg-blue-50" },
  { grade: "C", definition: "Evidence is thin, relies heavily on marketing language, or comes predominantly from self-reported sources. Key claims are plausible but unverified.", color: "border-yellow-400 bg-yellow-50" },
  { grade: "D", definition: "Very little public information available. Rating reflects information scarcity, not necessarily firm inactivity.", color: "border-red-400 bg-red-50" },
];

type FrameworkId = "maturity" | "scorecard" | "confidence";

const FRAMEWORKS: { id: FrameworkId; num: string; title: string; question: string; summary: string; color: string; borderColor: string; icon: React.ElementType }[] = [
  { id: "maturity", num: "1", title: "AI Maturity Model", question: "Where is this firm?", summary: "Single-label classification into 5 stages from Dormant to Leading, based on the totality of evidence", color: "text-blue-600", borderColor: "border-blue-500", icon: BarChart3 },
  { id: "scorecard", num: "2", title: "Dimension Scorecard", question: "How do they compare?", summary: "10 dimensions scored 1\u20135 with weighted composite. The hardest-to-fake dimensions carry 1.5x weight", color: "text-purple-600", borderColor: "border-purple-500", icon: Target },
  { id: "confidence", num: "3", title: "Evidence Confidence", question: "How sure are we?", summary: "Epistemic honesty layer (A\u2013D) so decision-makers know when scores rest on thin evidence", color: "text-amber-600", borderColor: "border-amber-500", icon: Shield },
];

// ============================================================
// FRAMEWORK DETAIL PANELS
// ============================================================

function MaturityDetail() {
  const [hoveredStage, setHoveredStage] = useState<MaturityStage | null>(null);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground leading-relaxed">
        Each firm is classified into one of five stages. The rule is conservative: a firm is placed at the <strong>lowest stage at which all criteria are met</strong>, not the highest individual signal. A flashy announcement with no engineering team does not earn a higher stage.
      </p>

      {/* Staircase */}
      <div className="flex items-end gap-2 h-52">
        {MATURITY_STAGES.map((s) => {
          const heightPct = (s.stage / 5) * 100;
          const isActive = hoveredStage === s.stage;
          return (
            <button
              key={s.stage}
              onMouseEnter={() => setHoveredStage(s.stage)}
              onMouseLeave={() => setHoveredStage(null)}
              onClick={() => setHoveredStage(hoveredStage === s.stage ? null : s.stage)}
              className={cn("flex-1 rounded-t-xl transition-all duration-200 relative cursor-pointer border-2", s.bgColor, isActive ? "opacity-100 scale-[1.03] shadow-lg" : "opacity-60 hover:opacity-85")}
              style={{ height: `${heightPct}%` }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={cn("text-3xl font-bold", s.color)}>{s.stage}</span>
                <span className={cn("text-[10px] font-semibold uppercase tracking-wide", s.color)}>{MATURITY_LABELS[s.stage]}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail */}
      <div className={cn("border-2 rounded-xl p-5 transition-all duration-200 min-h-[120px]", hoveredStage ? MATURITY_STAGES[hoveredStage - 1].bgColor : "bg-muted/20 border-dashed")}>
        {hoveredStage ? (
          <div className="space-y-2">
            <h3 className={cn("font-semibold text-lg", MATURITY_STAGES[hoveredStage - 1].color)}>
              Stage {hoveredStage}: {MATURITY_LABELS[hoveredStage]}
            </h3>
            <p className="text-sm">{MATURITY_STAGES[hoveredStage - 1].definition}</p>
            <div className="flex items-start gap-2 mt-3 pt-3 border-t border-current/10">
              <Search size={14} className="mt-0.5 shrink-0 text-muted-foreground" />
              <p className="text-xs text-muted-foreground"><span className="font-medium">Typical evidence: </span>{MATURITY_STAGES[hoveredStage - 1].evidence}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-6">Select a stage above to explore its criteria</p>
        )}
      </div>
    </div>
  );
}

function ScorecardDetail() {
  const [expandedDim, setExpandedDim] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground leading-relaxed">
        Ten dimensions scored 1&ndash;5 using specific anchors. Dimensions marked <span className="inline-flex items-center bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full text-[10px] font-semibold">1.5x</span> receive higher weight because they are the hardest to fake and the most commercially meaningful.
      </p>

      <div className="space-y-1">
        {DIMENSION_ANCHORS.map((d, i) => {
          const isWeighted = (WEIGHTED_DIMENSIONS as readonly number[]).includes(i);
          const isExpanded = expandedDim === i;
          const Icon = d.icon;
          return (
            <button key={i} onClick={() => setExpandedDim(isExpanded ? null : i)} className={cn("w-full text-left border rounded-lg transition-all duration-200", isExpanded ? "bg-primary/5 border-primary/30 shadow-sm" : "hover:bg-muted/50")}>
              <div className="flex items-center gap-3 p-3">
                <div className={cn("w-8 h-8 rounded-md flex items-center justify-center shrink-0", isWeighted ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">{i + 1}.</span>
                    <span className="font-medium text-sm truncate">{d.name}</span>
                    {isWeighted && <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-semibold shrink-0">1.5x</span>}
                  </div>
                </div>
                <ChevronDown size={16} className={cn("shrink-0 text-muted-foreground transition-transform duration-200", isExpanded && "rotate-180")} />
              </div>
              {isExpanded && (
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

function ConfidenceDetail() {
  const [activeGrade, setActiveGrade] = useState<ConfidenceGrade | null>(null);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground leading-relaxed">
        For each firm, we assess evidence quality and density so decision-makers can distinguish between genuine capability and strong marketing with thin proof.
      </p>
      <div className="grid grid-cols-4 gap-3">
        {CONFIDENCE_GRADES.map((c) => {
          const isActive = activeGrade === c.grade;
          return (
            <button key={c.grade} onClick={() => setActiveGrade(isActive ? null : c.grade)} onMouseEnter={() => setActiveGrade(c.grade)} onMouseLeave={() => setActiveGrade(null)} className={cn("border-2 rounded-xl p-5 text-center transition-all duration-200 cursor-pointer", c.color, isActive ? "scale-105 shadow-lg" : "opacity-60 hover:opacity-85")}>
              <span className="text-4xl font-bold block">{c.grade}</span>
              <span className="text-[10px] font-semibold uppercase tracking-wide block mt-1">{CONFIDENCE_LABELS[c.grade]}</span>
            </button>
          );
        })}
      </div>
      <div className={cn("border-2 rounded-xl p-5 transition-all min-h-[80px]", activeGrade ? CONFIDENCE_GRADES.find((c) => c.grade === activeGrade)!.color : "bg-muted/20 border-dashed")}>
        {activeGrade ? (
          <p className="text-sm">{CONFIDENCE_GRADES.find((c) => c.grade === activeGrade)!.definition}</p>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-3">Select a grade above to see what it means</p>
        )}
      </div>
    </div>
  );
}

// ============================================================
// MAIN
// ============================================================

export function MethodologyClient() {
  const [activeFramework, setActiveFramework] = useState<FrameworkId | null>(null);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-16">
      {/* ---- HERO ---- */}
      <div className="text-center max-w-2xl mx-auto space-y-3 pt-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Evaluation Framework</p>
        <h1 className="text-3xl font-bold">Methodology</h1>
        <p className="text-muted-foreground">
          A transparent, evidence-based approach to evaluating AI strategies across the advisory sector. Three interlocking frameworks designed for board-level decision-making.
        </p>
      </div>

      {/* ---- THREE FRAMEWORKS (horizontal cards or detail view) ---- */}
      {activeFramework === null ? (
        <section className="space-y-4">
          <p className="text-center text-sm text-muted-foreground">Click a framework to explore its criteria and scoring methodology</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {FRAMEWORKS.map((f) => {
              const Icon = f.icon;
              return (
                <button
                  key={f.id}
                  onClick={() => setActiveFramework(f.id)}
                  className={cn(
                    "text-left border-2 border-t-4 rounded-xl p-6 bg-gradient-to-b from-muted/30 to-transparent transition-all duration-200 hover:shadow-lg hover:scale-[1.02] group",
                    f.borderColor
                  )}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center group-hover:bg-muted/80 transition-colors">
                      <Icon size={22} className={f.color} />
                    </div>
                    <div>
                      <p className={cn("text-[10px] font-semibold uppercase tracking-wider", f.color)}>Framework {f.num}</p>
                      <h3 className="font-bold">{f.title}</h3>
                    </div>
                  </div>
                  <p className="text-lg font-semibold mb-2">{f.question}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.summary}</p>
                  <div className="mt-4 flex items-center gap-1 text-xs font-medium text-primary">
                    Explore details <ChevronRight size={14} />
                  </div>
                </button>
              );
            })}
          </div>
          <div className="border-l-4 border-primary bg-primary/5 rounded-r-xl p-4 max-w-2xl mx-auto">
            <p className="text-sm font-medium">Why three frameworks?</p>
            <p className="text-xs text-muted-foreground mt-1">
              The Maturity Model provides the headline. The Scorecard enables granular comparison. The Confidence Index prevents the common trap of treating well-marketed firms as equivalent to those with verified, deep capability.
            </p>
          </div>
        </section>
      ) : (
        <section className="space-y-6">
          {/* Back button + framework indicator pills */}
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveFramework(null)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft size={16} />
              All Frameworks
            </button>
          </div>

          {/* Framework selector tabs */}
          <div className="flex gap-2 border-b pb-3">
            {FRAMEWORKS.map((f) => {
              const Icon = f.icon;
              const isActive = activeFramework === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setActiveFramework(f.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                    isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <Icon size={16} />
                  <span className="hidden sm:inline">{f.title}</span>
                  <span className="sm:hidden">F{f.num}</span>
                </button>
              );
            })}
          </div>

          {/* Active framework title */}
          <div>
            {(() => {
              const f = FRAMEWORKS.find((fw) => fw.id === activeFramework)!;
              return (
                <>
                  <p className={cn("text-xs font-semibold uppercase tracking-wider mb-1", f.color)}>Framework {f.num}</p>
                  <h2 className="text-2xl font-bold">{f.title}</h2>
                  <p className="text-muted-foreground mt-1">{f.question}</p>
                </>
              );
            })()}
          </div>

          {/* Framework content */}
          {activeFramework === "maturity" && <MaturityDetail />}
          {activeFramework === "scorecard" && <ScorecardDetail />}
          {activeFramework === "confidence" && <ConfidenceDetail />}
        </section>
      )}

      {/* ---- HOW FRAMEWORKS COMBINE ---- */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold">How the Frameworks Combine</h2>
        <p className="text-sm text-muted-foreground">The three frameworks produce four cross-firm deliverables:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { title: "Summary Matrix", desc: "All firms on one page: Maturity Stage, Composite Score, and Evidence Confidence.", num: "1" },
            { title: "Dimension Heatmap", desc: "Firms as rows, 10 dimensions as columns, color-coded 1\u20135.", num: "2" },
            { title: "Archetype Classification", desc: "Firms grouped by strategic AI posture based on score profiles.", num: "3" },
            { title: "Key Findings Narrative", desc: "Board-ready observations on sector standing, leaders vs. marketing-forward, and trajectory.", num: "4" },
          ].map((d) => (
            <div key={d.num} className="flex items-start gap-3 border rounded-xl p-4 hover:bg-muted/30 transition-colors">
              <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">{d.num}</span>
              <div>
                <h3 className="font-semibold text-sm">{d.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{d.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Archetypes nested here */}
        <div className="space-y-4 pt-4">
          <h3 className="font-semibold">Archetype Classification</h3>
          <p className="text-sm text-muted-foreground">Based on score profiles across all ten dimensions, firms are classified into strategic archetypes that reveal distinct patterns in how they approach AI.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {([
              { key: "technology-builder" as Archetype, icon: Cpu, color: "border-blue-300 bg-blue-50", signals: "High on Proprietary Tech + Technical Talent" },
              { key: "advisory-positioner" as Archetype, icon: Megaphone, color: "border-purple-300 bg-purple-50", signals: "High on Thought Leadership + Positioning" },
              { key: "acquirer" as Archetype, icon: ShoppingCart, color: "border-amber-300 bg-amber-50", signals: "High on Acquisitions + Partnerships" },
              { key: "dormant-lagging" as Archetype, icon: AlertTriangle, color: "border-gray-300 bg-gray-50", signals: "Low scores across most dimensions" },
            ]).map((a) => {
              const Icon = a.icon;
              return (
                <div key={a.key} className={cn("border-2 rounded-xl p-4 transition-all hover:shadow-md", a.color)}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-white/60 flex items-center justify-center"><Icon size={16} /></div>
                    <h4 className="font-semibold text-sm">{ARCHETYPE_LABELS[a.key]}</h4>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{a.signals}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---- RESEARCH PROCESS ---- */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold">Research Process</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          For each firm, a comprehensive deep research report is generated covering nine structured sections, from Executive Summary through Bottom-Line Assessment.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { tier: "Tier 1", label: "Primary Sources", items: "Official websites, service pages, press releases, job postings, leadership bios, official videos & podcasts, LinkedIn posts", color: "border-t-green-500 bg-green-50/50" },
            { tier: "Tier 2", label: "Secondary Sources", items: "Major business press, industry trades, conference sites, credible advisory coverage, transcript-supported content", color: "border-t-blue-500 bg-blue-50/50" },
            { tier: "Tier 3", label: "Social & Media", items: "YouTube, X, LinkedIn, Reddit searched for executive appearances, events, third-party interviews", color: "border-t-purple-500 bg-purple-50/50" },
          ].map((t) => (
            <div key={t.tier} className={cn("border border-t-4 rounded-xl p-4", t.color)}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t.tier}</p>
              <h3 className="font-semibold text-sm mt-1">{t.label}</h3>
              <p className="text-xs text-muted-foreground mt-2">{t.items}</p>
            </div>
          ))}
        </div>

        <div className="bg-muted/30 rounded-xl p-5 space-y-3">
          <h3 className="font-semibold text-sm">Research Standards</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {["All major claims include dates and source attribution", "Verified fact clearly distinguished from inference", "Evidence gaps noted explicitly, never filled with assumptions", "Firms assessed independently \u2014 no cross-firm comparisons in reports"].map((s, i) => (
              <div key={i} className="flex items-start gap-2 bg-background rounded-lg p-3 border">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-primary">{i + 1}</span>
                </div>
                <p className="text-xs text-muted-foreground">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- LIMITATIONS ---- */}
      <section className="space-y-6 pb-12">
        <h2 className="text-xl font-semibold">Limitations &amp; Caveats</h2>
        <div className="space-y-3">
          {[
            "Evaluations are based on publicly available evidence. Firms with strong internal programs but limited disclosure may score lower than actual capability.",
            "The Evidence Confidence Index flags this risk. A C or D rating reflects information scarcity, not necessarily inactivity.",
            "Scores are point-in-time assessments. The sector is evolving rapidly; scores may shift materially within quarters.",
            "Research draws on web-accessible sources. Paywalled or internal-only materials are not included.",
            "Weighted scoring (1.5x on dims 1, 2, 4, 9) reflects a view that commercial substance outweighs positioning. Alternative weightings can be explored via the AI Chat.",
          ].map((caveat, i) => (
            <div key={i} className="flex items-start gap-3 border border-dashed rounded-lg p-4">
              <AlertTriangle size={16} className="shrink-0 text-amber-500 mt-0.5" />
              <p className="text-sm text-muted-foreground">{caveat}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

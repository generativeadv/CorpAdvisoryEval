"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  DIMENSION_NAMES,
  WEIGHTED_DIMENSIONS,
  MATURITY_LABELS,
  CONFIDENCE_LABELS,
  ARCHETYPE_LABELS,
  type MaturityStage,
  type ConfidenceGrade,
  type Archetype,
} from "@/lib/types";
import {
  Layers,
  BarChart3,
  Shield,
  Users,
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
} from "lucide-react";

// --- DATA ---

const MATURITY_STAGES: {
  stage: MaturityStage;
  definition: string;
  evidence: string;
  color: string;
  bgColor: string;
}[] = [
  {
    stage: 1,
    definition:
      "No meaningful public AI activity. AI may appear in generic website copy but no dedicated practice, leadership, tooling, or thought leadership.",
    evidence:
      "No AI-specific hires, no named practice, no proprietary tools, no AI-themed content beyond boilerplate.",
    color: "text-red-600",
    bgColor: "bg-red-50 border-red-200",
  },
  {
    stage: 2,
    definition:
      "Early-stage exploration. Some thought leadership, possibly a working group or internal pilot, but no formalized offering, no dedicated AI leadership, and no visible engineering investment.",
    evidence:
      'A few blog posts or podcast episodes on AI; generic "we\'re exploring AI" language; no named AI leader; no job postings for technical AI roles.',
    color: "text-orange-600",
    bgColor: "bg-orange-50 border-orange-200",
  },
  {
    stage: 3,
    definition:
      "AI becoming a named priority. Dedicated leadership appointed, practice or service line announced, some proprietary tooling in development or early deployment, active hiring of technical talent.",
    evidence:
      "Named AI leader hired; practice announced; 1\u20133 technical job postings; internal tool referenced but limited public detail; thought leadership becoming regular.",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50 border-yellow-200",
  },
  {
    stage: 4,
    definition:
      "AI embedded in operations and client delivery at meaningful scale. Proprietary platform in production use across the firm, dedicated engineering team, active client-facing practice with defined service lines, evidence of commercial traction.",
    evidence:
      "Proprietary platform at scale; 10+ technical staff; multiple AI-specific hires; defined service pillars; client references; regular thought leadership; acquisitions reinforcing capability.",
    color: "text-blue-600",
    bgColor: "bg-blue-50 border-blue-200",
  },
  {
    stage: 5,
    definition:
      "AI is a core strategic differentiator. Deep proprietary technology, significant engineering organization, measurable commercial AI revenue, published case studies, recognized market position, governance framework in place.",
    evidence:
      "Large engineering team (50+); named AI products; published case studies; identifiable AI revenue; formal governance framework; industry recognition; strategic acquisitions.",
    color: "text-green-600",
    bgColor: "bg-green-50 border-green-200",
  },
];

const DIMENSION_ANCHORS: {
  name: string;
  icon: React.ElementType;
  anchors: { score: number; label: string }[];
}[] = [
  {
    name: "Client-Facing AI Offering",
    icon: Target,
    anchors: [
      { score: 1, label: "None visible" },
      { score: 2, label: "AI mentioned in generic service descriptions" },
      { score: 3, label: "Named AI practice or service line announced" },
      { score: 4, label: "Defined service pillars with distinct propositions" },
      { score: 5, label: "Defined pillars + published case studies" },
    ],
  },
  {
    name: "Proprietary AI Technology",
    icon: Cpu,
    anchors: [
      { score: 1, label: "No evidence" },
      { score: 2, label: 'Generic "using AI" without specifics' },
      { score: 3, label: "Named internal tool in development" },
      { score: 4, label: "Proprietary platform in production" },
      { score: 5, label: "Platform at scale + client-facing products" },
    ],
  },
  {
    name: "AI Leadership & Governance",
    icon: Brain,
    anchors: [
      { score: 1, label: "No named AI leader" },
      { score: 2, label: "AI in a senior leader\u2019s broader mandate" },
      { score: 3, label: "Dedicated AI leader appointed" },
      { score: 4, label: "Leader + supporting org structure" },
      { score: 5, label: "Full leadership + governance framework" },
    ],
  },
  {
    name: "Technical Talent & Engineering",
    icon: Wrench,
    anchors: [
      { score: 1, label: "No evidence" },
      { score: 2, label: "1\u20132 technical roles evident" },
      { score: 3, label: "Small team (3\u201310) with active hiring" },
      { score: 4, label: "Established team (10\u201330), specialized roles" },
      { score: 5, label: "Large org (30+) with leads and PMs" },
    ],
  },
  {
    name: "AI Partnerships & Ecosystem",
    icon: Handshake,
    anchors: [
      { score: 1, label: "None identified" },
      { score: 2, label: "Generic vendor relationships" },
      { score: 3, label: "1\u20132 named AI partnerships" },
      { score: 4, label: "Multiple strategic partnerships" },
      { score: 5, label: "Deep alliances with major AI players" },
    ],
  },
  {
    name: "Thought Leadership & Content",
    icon: Megaphone,
    anchors: [
      { score: 1, label: "None" },
      { score: 2, label: "Occasional mentions in broader content" },
      { score: 3, label: "Regular AI-themed content" },
      { score: 4, label: "Dedicated AI content franchise" },
      { score: 5, label: "Industry-recognized, original research" },
    ],
  },
  {
    name: "Acquisitions & Investment",
    icon: ShoppingCart,
    anchors: [
      { score: 1, label: "None" },
      { score: 2, label: "Adjacent acquisitions, no AI focus" },
      { score: 3, label: "1 AI-relevant acquisition" },
      { score: 4, label: "Multiple AI/data acquisitions" },
      { score: 5, label: "Strategic M&A program for AI" },
    ],
  },
  {
    name: "Internal AI Adoption",
    icon: Zap,
    anchors: [
      { score: 1, label: "No evidence" },
      { score: 2, label: 'Generic "using AI" claims' },
      { score: 3, label: "Named internal tools, some adoption" },
      { score: 4, label: "Platform at scale with training" },
      { score: 5, label: "Deeply embedded, measurable impact" },
    ],
  },
  {
    name: "Commercial Momentum",
    icon: TrendingUp,
    anchors: [
      { score: 1, label: "No evidence" },
      { score: 2, label: "Practice announced, no traction" },
      { score: 3, label: "Hiring client-facing AI roles" },
      { score: 4, label: "Indirect evidence of engagements" },
      { score: 5, label: "Named clients or identifiable revenue" },
    ],
  },
  {
    name: "Strategic Coherence",
    icon: Compass,
    anchors: [
      { score: 1, label: "No discernible strategy" },
      { score: 2, label: "Scattered, unconnected activities" },
      { score: 3, label: "Emerging coherence, central narrative" },
      { score: 4, label: "Clear connected strategy" },
      { score: 5, label: "Fully integrated, board-level sponsorship" },
    ],
  },
];

const CONFIDENCE_GRADES: {
  grade: ConfidenceGrade;
  definition: string;
  color: string;
}[] = [
  {
    grade: "A",
    definition:
      "Multiple independent primary sources confirm key claims. Official announcements, verifiable job postings, named leaders, third-party coverage all align.",
    color: "border-green-400 bg-green-50",
  },
  {
    grade: "B",
    definition:
      "Primary sources confirm core claims but some dimensions rely on inference. Key gaps exist but the overall picture is supported.",
    color: "border-blue-400 bg-blue-50",
  },
  {
    grade: "C",
    definition:
      "Evidence is thin, relies heavily on marketing language, or comes predominantly from self-reported sources. Key claims are plausible but unverified.",
    color: "border-yellow-400 bg-yellow-50",
  },
  {
    grade: "D",
    definition:
      "Very little public information available. Rating reflects information scarcity, not necessarily firm inactivity.",
    color: "border-red-400 bg-red-50",
  },
];

// --- SECTION NAV ---

type SectionId =
  | "overview"
  | "research"
  | "maturity"
  | "scorecard"
  | "confidence"
  | "archetypes"
  | "combined"
  | "limitations";

const SECTIONS: { id: SectionId; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: Layers },
  { id: "research", label: "Research Process", icon: Search },
  { id: "maturity", label: "Maturity Model", icon: BarChart3 },
  { id: "scorecard", label: "Dimension Scorecard", icon: Target },
  { id: "confidence", label: "Confidence Index", icon: Shield },
  { id: "archetypes", label: "Archetypes", icon: Users },
  { id: "combined", label: "How It Combines", icon: Layers },
  { id: "limitations", label: "Limitations", icon: AlertTriangle },
];

// --- COMPONENTS ---

function MaturityStaircase() {
  const [hoveredStage, setHoveredStage] = useState<MaturityStage | null>(null);
  const active = hoveredStage;

  return (
    <div className="space-y-4">
      {/* Visual staircase */}
      <div className="flex items-end gap-1.5 h-48 px-4">
        {MATURITY_STAGES.map((s) => {
          const heightPct = (s.stage / 5) * 100;
          const isActive = active === s.stage;
          return (
            <button
              key={s.stage}
              onMouseEnter={() => setHoveredStage(s.stage)}
              onMouseLeave={() => setHoveredStage(null)}
              onClick={() =>
                setHoveredStage(hoveredStage === s.stage ? null : s.stage)
              }
              className={cn(
                "flex-1 rounded-t-lg transition-all duration-200 relative group cursor-pointer border-2",
                s.bgColor,
                isActive ? "opacity-100 scale-[1.03]" : "opacity-70 hover:opacity-90"
              )}
              style={{ height: `${heightPct}%` }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={cn("text-2xl font-bold", s.color)}>
                  {s.stage}
                </span>
                <span
                  className={cn(
                    "text-[10px] font-semibold uppercase tracking-wide",
                    s.color
                  )}
                >
                  {MATURITY_LABELS[s.stage]}
                </span>
              </div>
            </button>
          );
        })}
      </div>
      {/* Detail panel */}
      <div
        className={cn(
          "border rounded-lg p-5 transition-all duration-200 min-h-[120px]",
          active
            ? MATURITY_STAGES[active - 1].bgColor
            : "bg-muted/30 border-dashed"
        )}
      >
        {active ? (
          <div className="space-y-2">
            <h3
              className={cn(
                "font-semibold",
                MATURITY_STAGES[active - 1].color
              )}
            >
              Stage {active}: {MATURITY_LABELS[active]}
            </h3>
            <p className="text-sm">{MATURITY_STAGES[active - 1].definition}</p>
            <div className="flex items-start gap-2 mt-3 pt-3 border-t border-current/10">
              <Search size={14} className="mt-0.5 shrink-0 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Typical evidence: </span>
                {MATURITY_STAGES[active - 1].evidence}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Hover or tap a stage above to explore its definition and evidence
            criteria
          </p>
        )}
      </div>
      <p className="text-xs text-muted-foreground text-center">
        Classification rule: a firm is placed at the{" "}
        <strong>lowest stage at which all criteria are met</strong>, not the
        highest individual signal.
      </p>
    </div>
  );
}

function DimensionExplorer() {
  const [expandedDim, setExpandedDim] = useState<number | null>(null);

  return (
    <div className="space-y-1">
      {DIMENSION_ANCHORS.map((d, i) => {
        const isWeighted = (WEIGHTED_DIMENSIONS as readonly number[]).includes(
          i
        );
        const isExpanded = expandedDim === i;
        const Icon = d.icon;

        return (
          <button
            key={i}
            onClick={() => setExpandedDim(isExpanded ? null : i)}
            className={cn(
              "w-full text-left border rounded-lg transition-all duration-200",
              isExpanded
                ? "bg-primary/5 border-primary/30"
                : "hover:bg-muted/50"
            )}
          >
            <div className="flex items-center gap-3 p-3">
              <div
                className={cn(
                  "w-8 h-8 rounded-md flex items-center justify-center shrink-0",
                  isWeighted
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <Icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">
                    {i + 1}.
                  </span>
                  <span className="font-medium text-sm truncate">
                    {d.name}
                  </span>
                  {isWeighted && (
                    <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-semibold shrink-0">
                      1.5x
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight
                size={16}
                className={cn(
                  "shrink-0 text-muted-foreground transition-transform",
                  isExpanded && "rotate-90"
                )}
              />
            </div>
            {isExpanded && (
              <div className="px-3 pb-4 pt-1">
                <div className="flex gap-1">
                  {d.anchors.map((a) => (
                    <div key={a.score} className="flex-1 text-center">
                      <div
                        className={cn(
                          "mx-auto w-full aspect-square max-w-[40px] rounded-md flex items-center justify-center text-sm font-bold mb-1.5",
                          a.score >= 4
                            ? "bg-green-100 text-green-700"
                            : a.score >= 3
                              ? "bg-blue-100 text-blue-700"
                              : a.score >= 2
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                        )}
                      >
                        {a.score}
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-tight">
                        {a.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

function ConfidenceScale() {
  const [activeGrade, setActiveGrade] = useState<ConfidenceGrade | null>(null);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        {CONFIDENCE_GRADES.map((c) => {
          const isActive = activeGrade === c.grade;
          return (
            <button
              key={c.grade}
              onClick={() =>
                setActiveGrade(isActive ? null : c.grade)
              }
              onMouseEnter={() => setActiveGrade(c.grade)}
              onMouseLeave={() => setActiveGrade(null)}
              className={cn(
                "border-2 rounded-xl p-4 text-center transition-all duration-200 cursor-pointer",
                c.color,
                isActive ? "scale-105 shadow-md" : "opacity-70 hover:opacity-90"
              )}
            >
              <span className="text-3xl font-bold block">{c.grade}</span>
              <span className="text-xs font-medium block mt-1">
                {CONFIDENCE_LABELS[c.grade]}
              </span>
            </button>
          );
        })}
      </div>
      <div
        className={cn(
          "border rounded-lg p-4 transition-all min-h-[80px]",
          activeGrade
            ? CONFIDENCE_GRADES.find((c) => c.grade === activeGrade)!.color
            : "bg-muted/30 border-dashed"
        )}
      >
        {activeGrade ? (
          <p className="text-sm">
            {
              CONFIDENCE_GRADES.find((c) => c.grade === activeGrade)!
                .definition
            }
          </p>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-2">
            Hover or tap a grade to see what it means
          </p>
        )}
      </div>
    </div>
  );
}

function ArchetypeCards() {
  const archetypes: {
    key: Archetype;
    icon: React.ElementType;
    color: string;
    description: string;
    signals: string;
  }[] = [
    {
      key: "technology-builder",
      icon: Cpu,
      color: "border-blue-300 bg-blue-50",
      description:
        "Invests in building proprietary AI platforms and capabilities with dedicated engineering teams.",
      signals: "High on Proprietary Tech + Technical Talent",
    },
    {
      key: "advisory-positioner",
      icon: Megaphone,
      color: "border-purple-300 bg-purple-50",
      description:
        "Leads with strategic narrative and thought leadership, lighter on proprietary technology.",
      signals: "High on Thought Leadership + Positioning",
    },
    {
      key: "acquirer",
      icon: ShoppingCart,
      color: "border-amber-300 bg-amber-50",
      description:
        "Builds AI capabilities primarily through M&A, partnerships, and acquisitions.",
      signals: "High on Acquisitions + Partnerships",
    },
    {
      key: "dormant-lagging",
      icon: AlertTriangle,
      color: "border-gray-300 bg-gray-50",
      description:
        "Minimal visible AI activity. May be active internally but evidence is insufficient.",
      signals: "Low scores across most dimensions",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {archetypes.map((a) => {
        const Icon = a.icon;
        return (
          <div
            key={a.key}
            className={cn(
              "border-2 rounded-xl p-5 transition-all hover:shadow-md",
              a.color
            )}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-white/60 flex items-center justify-center">
                <Icon size={20} />
              </div>
              <h3 className="font-semibold">{ARCHETYPE_LABELS[a.key]}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{a.description}</p>
            <div className="mt-3 pt-3 border-t border-current/10">
              <p className="text-xs font-medium text-muted-foreground">
                Key signal: {a.signals}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FrameworkDiagram() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[
        {
          num: "1",
          title: "Maturity Model",
          subtitle: "Where is this firm?",
          desc: "Single-label headline classification into 5 stages",
          color: "border-t-blue-500",
          icon: BarChart3,
        },
        {
          num: "2",
          title: "Dimension Scorecard",
          subtitle: "How do they compare?",
          desc: "Granular 10-dimension scoring with weighted composite",
          color: "border-t-purple-500",
          icon: Target,
        },
        {
          num: "3",
          title: "Confidence Index",
          subtitle: "How sure are we?",
          desc: "Epistemic honesty layer preventing false equivalence",
          color: "border-t-amber-500",
          icon: Shield,
        },
      ].map((f) => {
        const Icon = f.icon;
        return (
          <div
            key={f.num}
            className={cn(
              "border-2 border-t-4 rounded-xl p-5 bg-gradient-to-b from-muted/30 to-transparent",
              f.color
            )}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Icon size={18} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  Framework {f.num}
                </p>
                <h3 className="font-semibold text-sm">{f.title}</h3>
              </div>
            </div>
            <p className="text-sm font-medium text-primary mb-1">{f.subtitle}</p>
            <p className="text-xs text-muted-foreground">{f.desc}</p>
          </div>
        );
      })}
    </div>
  );
}

// --- MAIN ---

export function MethodologyClient() {
  const [activeSection, setActiveSection] = useState<SectionId>("overview");

  const scrollToSection = (id: SectionId) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="flex">
      {/* Sticky section nav */}
      <nav className="hidden lg:flex flex-col w-56 shrink-0 border-r p-4 sticky top-0 self-start h-screen">
        <p className="text-xs font-semibold uppercase text-muted-foreground mb-3 tracking-wider">
          Methodology
        </p>
        <div className="space-y-0.5">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => scrollToSection(s.id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors text-left",
                  activeSection === s.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon size={14} />
                {s.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 max-w-4xl mx-auto p-6 space-y-16">
        {/* Header */}
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
              Evaluation Framework
            </p>
            <h1 className="text-3xl font-bold">Methodology</h1>
            <p className="text-muted-foreground mt-2 text-lg">
              A transparent, evidence-based approach to evaluating AI strategies
              across the advisory sector
            </p>
          </div>
        </div>

        {/* Overview */}
        <section id="overview" className="space-y-6">
          <h2 className="text-xl font-semibold">Three Interlocking Frameworks</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Each firm is assessed using a three-part evaluation architecture
            designed for board-level decision-making. The model prioritizes
            evidence over narrative, separates what we know from what we infer,
            and explicitly flags where information is limited.
          </p>
          <FrameworkDiagram />
          <div className="border-l-4 border-primary bg-primary/5 rounded-r-lg p-4">
            <p className="text-sm font-medium">
              The third framework is critical for a board audience
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              It prevents the common trap of treating a firm with strong
              marketing but thin evidence as equivalent to one with verified,
              deep capability.
            </p>
          </div>
        </section>

        {/* Research Process */}
        <section id="research" className="space-y-6">
          <h2 className="text-xl font-semibold">Research Process</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            For each firm, a comprehensive deep research report is generated
            covering nine structured sections, from Executive Summary through
            Bottom-Line Assessment.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                tier: "Tier 1",
                label: "Primary Sources",
                items:
                  "Official websites, service pages, press releases, job postings, leadership bios, official videos & podcasts, LinkedIn posts",
                color: "border-t-green-500 bg-green-50/50",
              },
              {
                tier: "Tier 2",
                label: "Secondary Sources",
                items:
                  "Major business press, industry trades, conference sites, credible advisory coverage, transcript-supported content",
                color: "border-t-blue-500 bg-blue-50/50",
              },
              {
                tier: "Tier 3",
                label: "Social & Media",
                items:
                  "YouTube, X, LinkedIn, Reddit searched for executive appearances, events, third-party interviews, community discussion",
                color: "border-t-purple-500 bg-purple-50/50",
              },
            ].map((t) => (
              <div
                key={t.tier}
                className={cn(
                  "border border-t-4 rounded-xl p-4",
                  t.color
                )}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t.tier}
                </p>
                <h3 className="font-semibold text-sm mt-1">{t.label}</h3>
                <p className="text-xs text-muted-foreground mt-2">{t.items}</p>
              </div>
            ))}
          </div>

          <div className="bg-muted/30 rounded-xl p-5 space-y-3">
            <h3 className="font-semibold text-sm">Research Standards</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                "All major claims include dates and source attribution",
                "Verified fact clearly distinguished from inference",
                "Evidence gaps noted explicitly, never filled with assumptions",
                "Firms assessed independently \u2014 no cross-firm comparisons in reports",
              ].map((standard, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 bg-background rounded-lg p-3 border"
                >
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-primary">
                      {i + 1}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{standard}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Framework 1: Maturity */}
        <section id="maturity" className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
              Framework 1
            </p>
            <h2 className="text-xl font-semibold">AI Maturity Model</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Five stages from Dormant to Leading. The headline finding &mdash;
              the single-label answer to &ldquo;where is this firm?&rdquo;
            </p>
          </div>
          <MaturityStaircase />
        </section>

        {/* Framework 2: Scorecard */}
        <section id="scorecard" className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-purple-600 mb-1">
              Framework 2
            </p>
            <h2 className="text-xl font-semibold">Dimension Scorecard</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Ten dimensions scored 1&ndash;5. Tap any dimension to see the full
              scoring anchors. Dimensions marked{" "}
              <span className="inline-flex items-center bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full text-[10px] font-semibold">
                1.5x
              </span>{" "}
              receive higher weight because they are the hardest to fake and the
              most commercially meaningful.
            </p>
          </div>
          <DimensionExplorer />
          <div className="bg-muted/30 rounded-xl p-4 grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">50</p>
              <p className="text-xs text-muted-foreground">
                Max unweighted score
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold">56</p>
              <p className="text-xs text-muted-foreground">
                Max weighted score (1.5x on dims 1, 2, 4, 9)
              </p>
            </div>
          </div>
        </section>

        {/* Framework 3: Confidence */}
        <section id="confidence" className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 mb-1">
              Framework 3
            </p>
            <h2 className="text-xl font-semibold">Evidence Confidence Index</h2>
            <p className="text-sm text-muted-foreground mt-1">
              The epistemic honesty layer. Distinguishes between &ldquo;we know
              this firm is advanced&rdquo; and &ldquo;this firm appears advanced
              but we&rsquo;re working with thin evidence.&rdquo;
            </p>
          </div>
          <ConfidenceScale />
        </section>

        {/* Archetypes */}
        <section id="archetypes" className="space-y-6">
          <h2 className="text-xl font-semibold">Archetype Classification</h2>
          <p className="text-sm text-muted-foreground">
            Based on score profiles across all ten dimensions, firms are
            classified into strategic archetypes that reveal distinct patterns in
            how they approach AI.
          </p>
          <ArchetypeCards />
        </section>

        {/* How Frameworks Combine */}
        <section id="combined" className="space-y-6">
          <h2 className="text-xl font-semibold">How the Frameworks Combine</h2>
          <p className="text-sm text-muted-foreground">
            The three frameworks produce four cross-firm deliverables:
          </p>
          <div className="space-y-3">
            {[
              {
                title: "Summary Matrix",
                desc: "All firms on one page: Maturity Stage, Composite Score, and Evidence Confidence. The instant landscape view.",
                icon: "1",
              },
              {
                title: "Dimension Heatmap",
                desc: "Firms as rows, 10 dimensions as columns, color-coded 1\u20135. Reveals where the field clusters or diverges.",
                icon: "2",
              },
              {
                title: "Archetype Classification",
                desc: "Grouping firms by strategic AI posture, surfacing distinct approaches.",
                icon: "3",
              },
              {
                title: "Key Findings Narrative",
                desc: "Board-ready observations: where the sector stands, genuine leaders vs. marketing-forward, and trajectory.",
                icon: "4",
              },
            ].map((d) => (
              <div
                key={d.icon}
                className="flex items-start gap-4 border rounded-xl p-4 hover:bg-muted/30 transition-colors"
              >
                <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                  {d.icon}
                </span>
                <div>
                  <h3 className="font-semibold text-sm">{d.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {d.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Limitations */}
        <section id="limitations" className="space-y-6 pb-12">
          <h2 className="text-xl font-semibold">Limitations &amp; Caveats</h2>
          <div className="space-y-3">
            {[
              "Evaluations are based on publicly available evidence. Firms with strong internal programs but limited disclosure may score lower than actual capability.",
              "The Evidence Confidence Index flags this risk. A C or D rating reflects information scarcity, not necessarily inactivity.",
              "Scores are point-in-time assessments. The sector is evolving rapidly; scores may shift materially within quarters.",
              "Research draws on web-accessible sources. Paywalled or internal-only materials are not included.",
              "Weighted scoring (1.5x on dims 1, 2, 4, 9) reflects a view that commercial substance outweighs positioning. Alternative weightings can be explored via the AI Chat.",
            ].map((caveat, i) => (
              <div
                key={i}
                className="flex items-start gap-3 border border-dashed rounded-lg p-4"
              >
                <AlertTriangle
                  size={16}
                  className="shrink-0 text-amber-500 mt-0.5"
                />
                <p className="text-sm text-muted-foreground">{caveat}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

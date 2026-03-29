"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MATURITY_LABELS,
  ARCHETYPE_LABELS,
  type FirmWithEvaluation,
  type MaturityStage,
  type Archetype,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Link from "next/link";

export function SlideViewer({ firms }: { firms: FirmWithEvaluation[] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 3;

  const next = useCallback(() => {
    setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1));
  }, []);

  const prev = useCallback(() => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Escape") window.history.back();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev]);

  // Exclude FTI Total from core analysis
  const coreFirms = firms.filter((f) => f.slug !== "fti-total");

  const sorted = [...coreFirms].sort(
    (a, b) =>
      (b.evaluation?.compositeScoreWeighted ?? 0) -
      (a.evaluation?.compositeScoreWeighted ?? 0)
  );

  const scaling = sorted.filter(
    (f) => (f.evaluation?.maturityStage ?? 0) >= 4
  );
  const formalizing = sorted.filter(
    (f) => f.evaluation?.maturityStage === 3
  );
  const early = sorted.filter(
    (f) => (f.evaluation?.maturityStage ?? 0) <= 2
  );

  const group1 = sorted.filter((f) => f.group === 1);
  const fgs = coreFirms.find((f) => f.slug === "fgs-global");

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Controls */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/80 text-white">
        <Link href="/board" className="hover:text-white/80">
          <X size={20} />
        </Link>
        <div className="flex items-center gap-4">
          <button
            onClick={prev}
            disabled={currentSlide === 0}
            className="disabled:opacity-30"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm">
            {currentSlide + 1} / {totalSlides}
          </span>
          <button
            onClick={next}
            disabled={currentSlide === totalSlides - 1}
            className="disabled:opacity-30"
          >
            <ChevronRight size={20} />
          </button>
        </div>
        <span className="text-xs text-white/50">
          Arrow keys to navigate
        </span>
      </div>

      {/* Slide Container */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[1200px] aspect-video bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* ====== SLIDE 1: Situation ====== */}
          {currentSlide === 0 && (
            <div className="h-full p-10 flex flex-col">
              <div className="mb-6">
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">
                  AI Strategy Competitive Assessment
                </p>
                <h1 className="text-2xl font-bold text-gray-900">
                  The sector has moved past experimentation — but the gap
                  between positioning and infrastructure is widening
                </h1>
              </div>

              <div className="flex-1 grid grid-cols-3 gap-8">
                {/* Column 1 */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 border-b border-gray-200 pb-2">
                    Where the sector stands
                  </p>
                  <div className="space-y-3 text-sm text-gray-700">
                    <p>
                      Most firms have appointed AI leadership, launched
                      practices, and begun deploying internal tools
                    </p>
                    <p>
                      But fewer have made the engineering and commercial
                      investments that translate positioning into verified
                      capability
                    </p>
                    <p className="text-gray-500 text-xs">
                      {scaling.length} firms at Scaling or Leading &middot;{" "}
                      {formalizing.length} Formalizing &middot;{" "}
                      {early.length} Early stage
                    </p>
                  </div>
                </div>

                {/* Column 2 */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 border-b border-gray-200 pb-2">
                    The defining fault line
                  </p>
                  <div className="space-y-3 text-sm text-gray-700">
                    <p>
                      <strong>Proprietary technology + engineering talent</strong>{" "}
                      separates leaders from positioners
                    </p>
                    <p>
                      Firms with internal platforms, dedicated engineering
                      teams, and AI acquisitions consistently outperform
                      those leading with thought leadership alone
                    </p>
                    <p>
                      Holding company networks (WPP, IPG) provide structural
                      advantages in platform scale that independents must
                      build on their own
                    </p>
                  </div>
                </div>

                {/* Column 3 */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 border-b border-gray-200 pb-2">
                    FGS Global positioning
                  </p>
                  <div className="space-y-3 text-sm text-gray-700">
                    {fgs && fgs.evaluation && (
                      <>
                        <p>
                          <strong>
                            Most complete AI posture among pure-play
                            advisory firms
                          </strong>
                        </p>
                        <p>
                          AI Advisory practice + Fergus platform (1,500+
                          users) + Memetica acquisition + FGS Labs
                          engineering team
                        </p>
                        <p>
                          Ranked #{group1.findIndex((f) => f.slug === "fgs-global") + 1} in
                          Group 1 &middot; Stage{" "}
                          {fgs.evaluation.maturityStage} (
                          {MATURITY_LABELS[fgs.evaluation.maturityStage]})
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ====== SLIDE 2: Competitive Landscape ====== */}
          {currentSlide === 1 && (
            <div className="h-full p-10 flex flex-col">
              <div className="mb-5">
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">
                  Competitive Landscape
                </p>
                <h2 className="text-2xl font-bold text-gray-900">
                  A clear leader tier is emerging, with most firms in a
                  scaling-to-formalizing middle
                </h2>
              </div>

              <div className="flex-1 overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-200 text-xs uppercase tracking-wider text-gray-400">
                      <th className="text-left py-2 pr-4 w-12">Tier</th>
                      <th className="text-left py-2 pr-4">Firms</th>
                      <th className="text-left py-2 pr-4">Characterization</th>
                      <th className="text-left py-2 w-24">Stage</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700">
                    <tr className="border-b border-gray-100 align-top">
                      <td className="py-3 pr-4 font-bold text-gray-900">
                        Leaders
                      </td>
                      <td className="py-3 pr-4">
                        {sorted
                          .filter(
                            (f) => (f.evaluation?.maturityStage ?? 0) >= 5
                          )
                          .map((f) => f.shortName)
                          .join(", ") || "—"}
                      </td>
                      <td className="py-3 pr-4 text-xs text-gray-600">
                        Deep proprietary tech, large engineering orgs,
                        verifiable commercial AI revenue, published case
                        studies
                      </td>
                      <td className="py-3 text-xs">Stage 5</td>
                    </tr>
                    <tr className="border-b border-gray-100 align-top">
                      <td className="py-3 pr-4 font-bold text-gray-900">
                        Scaling
                      </td>
                      <td className="py-3 pr-4">
                        {sorted
                          .filter(
                            (f) => f.evaluation?.maturityStage === 4
                          )
                          .map((f) => f.shortName)
                          .join(", ")}
                      </td>
                      <td className="py-3 pr-4 text-xs text-gray-600">
                        Proprietary platforms in production, dedicated AI
                        leadership, active client practices, organizational
                        commitment beyond positioning
                      </td>
                      <td className="py-3 text-xs">Stage 4</td>
                    </tr>
                    <tr className="border-b border-gray-100 align-top">
                      <td className="py-3 pr-4 font-bold text-gray-900">
                        Formalizing
                      </td>
                      <td className="py-3 pr-4">
                        {formalizing
                          .map((f) => f.shortName)
                          .join(", ")}
                      </td>
                      <td className="py-3 pr-4 text-xs text-gray-600">
                        AI leadership appointed, internal pilots underway,
                        thought leadership active — but thinner on
                        proprietary tooling, engineering depth, or
                        commercial proof points
                      </td>
                      <td className="py-3 text-xs">Stage 3</td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-3 pr-4 font-bold text-gray-900">
                        Early
                      </td>
                      <td className="py-3 pr-4">
                        {early.length > 0
                          ? early.map((f) => f.shortName).join(", ")
                          : "—"}
                      </td>
                      <td className="py-3 pr-4 text-xs text-gray-600">
                        Limited public evidence of dedicated AI activity;
                        may reflect early posture or limited disclosure
                      </td>
                      <td className="py-3 text-xs">Stage 1–2</td>
                    </tr>
                  </tbody>
                </table>

                <p className="text-[10px] text-gray-400 mt-3 italic">
                  FTI Consulting (Total Firm) excluded from peer rankings;
                  included as contextual reference given enterprise-scale
                  resources beyond strategic communications scope.
                </p>
              </div>
            </div>
          )}

          {/* ====== SLIDE 3: Key Observations ====== */}
          {currentSlide === 2 && (
            <div className="h-full p-10 flex flex-col">
              <div className="mb-5">
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">
                  Key Observations
                </p>
                <h2 className="text-2xl font-bold text-gray-900">
                  Six things the Board should know
                </h2>
              </div>

              <div className="flex-1 grid grid-cols-2 gap-x-10 gap-y-5">
                {[
                  {
                    num: "1",
                    headline: "Past experimentation, not yet mature",
                    body: "Most firms are formalizing or scaling. Only one has reached Leading with measurable AI revenue and published case studies.",
                  },
                  {
                    num: "2",
                    headline:
                      "Proprietary tech is the strongest differentiator",
                    body: "Firms that build their own platforms and hire engineers outperform those relying on positioning and third-party tools.",
                  },
                  {
                    num: "3",
                    headline:
                      "FGS has the most complete posture among advisory peers",
                    body: "Named practice, proprietary platform, targeted acquisition, and dedicated engineering team — rare breadth for an advisory-scale firm.",
                  },
                  {
                    num: "4",
                    headline:
                      "Group structure creates different competitive dynamics",
                    body: "PR networks benefit from holding company tech investments. Independent advisory firms must build AI capability from their own resource base.",
                  },
                  {
                    num: "5",
                    headline:
                      "Evidence confidence matters as much as the scores",
                    body: "Where public evidence is thin, rankings are directional. The confidence grade flags information scarcity, not inactivity.",
                  },
                  {
                    num: "6",
                    headline:
                      "The landscape is moving fast",
                    body: "Multiple firms have made major AI moves in the past six months. Relative positions may shift materially within 2–3 quarters.",
                  },
                ].map((obs) => (
                  <div key={obs.num} className="flex gap-3">
                    <span className="text-2xl font-bold text-gray-300 leading-none mt-0.5">
                      {obs.num}
                    </span>
                    <div>
                      <p className="font-bold text-sm text-gray-900">
                        {obs.headline}
                      </p>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                        {obs.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Slide dots */}
      <div className="flex items-center justify-center gap-2 py-3">
        {Array.from({ length: totalSlides }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={cn(
              "w-2 h-2 rounded-full transition-colors",
              i === currentSlide ? "bg-white" : "bg-white/30"
            )}
          />
        ))}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MATURITY_LABELS,
  ARCHETYPE_LABELS,
  DIMENSION_NAMES,
  getDimensionScores,
  type FirmWithEvaluation,
  type MaturityStage,
  type ConfidenceGrade,
  type Archetype,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Link from "next/link";

const CONFIDENCE_ORDER: Record<string, number> = { A: 4, B: 3, C: 2, D: 1 };

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

  const sorted = [...firms].sort(
    (a, b) =>
      (b.evaluation?.compositeScoreWeighted ?? 0) -
      (a.evaluation?.compositeScoreWeighted ?? 0)
  );

  const dimAverages = DIMENSION_NAMES.map((name, i) => {
    const avg =
      firms.length > 0
        ? firms.reduce((sum, f) => sum + getDimensionScores(f.evaluation!)[i], 0) /
          firms.length
        : 0;
    return { name, avg };
  });

  const MATURITY_COLORS_SLIDE: Record<number, string> = {
    1: "#ef4444",
    2: "#f97316",
    3: "#eab308",
    4: "#3b82f6",
    5: "#22c55e",
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Controls */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/80 text-white">
        <Link href="/board" className="hover:text-white/80">
          <X size={20} />
        </Link>
        <div className="flex items-center gap-4">
          <button onClick={prev} disabled={currentSlide === 0} className="disabled:opacity-30">
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
        <span className="text-xs text-white/50">Arrow keys to navigate</span>
      </div>

      {/* Slide Container */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[1200px] aspect-video bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Slide 1: Title + 2x2 Matrix */}
          {currentSlide === 0 && (
            <div className="h-full p-8 flex flex-col">
              <h1 className="text-3xl font-bold text-gray-900">
                AI Strategy Competitive Assessment
              </h1>
              <p className="text-lg text-gray-500 mt-1">
                {firms.length} Advisory & Consulting Firms
              </p>
              <div className="flex-1 mt-6 relative">
                {/* 2x2 Grid */}
                <div className="absolute inset-0">
                  <div className="w-full h-full border-l-2 border-b-2 border-gray-200 relative">
                    {/* Axis labels */}
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-400">
                      AI Maturity Stage &rarr;
                    </span>
                    <span className="absolute -left-6 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-gray-400">
                      Evidence Confidence &rarr;
                    </span>
                    {/* Quadrant labels */}
                    <span className="absolute top-2 left-2 text-[10px] text-gray-300 uppercase">
                      Low Maturity / High Evidence
                    </span>
                    <span className="absolute top-2 right-2 text-[10px] text-gray-300 uppercase">
                      High Maturity / High Evidence
                    </span>
                    <span className="absolute bottom-2 left-2 text-[10px] text-gray-300 uppercase">
                      Low Maturity / Low Evidence
                    </span>
                    <span className="absolute bottom-2 right-2 text-[10px] text-gray-300 uppercase">
                      High Maturity / Low Evidence
                    </span>
                    {/* Grid lines */}
                    <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-gray-100" />
                    <div className="absolute left-1/2 top-0 bottom-0 border-l border-dashed border-gray-100" />

                    {/* Plot firms */}
                    {firms.map((firm) => {
                      const stage = firm.evaluation?.maturityStage ?? 1;
                      const conf =
                        CONFIDENCE_ORDER[
                          firm.evaluation?.confidenceGrade ?? "D"
                        ];
                      const x = ((stage - 0.5) / 5) * 100;
                      const y = (1 - (conf - 0.5) / 4) * 100;
                      return (
                        <div
                          key={firm.slug}
                          className="absolute transform -translate-x-1/2 -translate-y-1/2"
                          style={{ left: `${x}%`, top: `${y}%` }}
                        >
                          <div
                            className="w-3 h-3 rounded-full border-2 border-white shadow"
                            style={{
                              backgroundColor:
                                MATURITY_COLORS_SLIDE[stage] || "#999",
                            }}
                          />
                          <span className="absolute top-3 left-1/2 -translate-x-1/2 text-[9px] text-gray-600 whitespace-nowrap font-medium">
                            {firm.shortName}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Slide 2: Heatmap */}
          {currentSlide === 1 && (
            <div className="h-full p-6 flex flex-col">
              <h2 className="text-2xl font-bold text-gray-900">
                Dimension Heatmap
              </h2>
              <p className="text-sm text-gray-500">
                10 dimensions scored 1-5 across {firms.length} firms
              </p>
              <div className="flex-1 mt-4 overflow-auto">
                <table className="w-full text-[10px]">
                  <thead>
                    <tr>
                      <th className="text-left p-1 min-w-[100px]">Firm</th>
                      {DIMENSION_NAMES.map((name, i) => (
                        <th key={i} className="p-0.5 text-center w-8">
                          <span className="block truncate" title={name}>
                            D{i + 1}
                          </span>
                        </th>
                      ))}
                      <th className="p-1 text-center">Tot</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((firm) => {
                      const scores = getDimensionScores(firm.evaluation!);
                      return (
                        <tr key={firm.slug}>
                          <td className="p-1 font-medium whitespace-nowrap">
                            {firm.shortName}
                          </td>
                          {scores.map((score, i) => (
                            <td key={i} className="p-0.5">
                              <div
                                className={cn(
                                  "w-6 h-5 rounded flex items-center justify-center text-[9px] font-bold mx-auto",
                                  score >= 4
                                    ? "bg-green-400 text-green-900"
                                    : score >= 3
                                      ? "bg-blue-300 text-blue-900"
                                      : score >= 2
                                        ? "bg-yellow-300 text-yellow-900"
                                        : "bg-red-300 text-red-900"
                                )}
                              >
                                {score}
                              </div>
                            </td>
                          ))}
                          <td className="p-1 text-center font-bold">
                            {firm.evaluation!.compositeScoreWeighted.toFixed(0)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Slide 3: Key Takeaways */}
          {currentSlide === 2 && (
            <div className="h-full p-8 flex flex-col justify-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                Key Takeaways
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shrink-0">
                    1
                  </span>
                  <p className="text-lg text-gray-700">
                    The advisory sector is still{" "}
                    <strong>early-stage in AI adoption</strong>. Most firms are
                    experimenting, not scaling.
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shrink-0">
                    2
                  </span>
                  <p className="text-lg text-gray-700">
                    <strong>{sorted[0]?.shortName}</strong> leads the field with
                    a weighted score of{" "}
                    {sorted[0]?.evaluation?.compositeScoreWeighted.toFixed(1)}.
                    The gap between leaders and laggards is significant.
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shrink-0">
                    3
                  </span>
                  <p className="text-lg text-gray-700">
                    <strong>
                      Proprietary technology and engineering talent
                    </strong>{" "}
                    are the strongest differentiators. Firms that invest in
                    building outperform those that only position.
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shrink-0">
                    4
                  </span>
                  <p className="text-lg text-gray-700">
                    Evidence quality varies. Scores should be weighted by{" "}
                    <strong>confidence grade</strong>&mdash;several firms may
                    appear stronger or weaker than reality due to information
                    availability.
                  </p>
                </div>
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

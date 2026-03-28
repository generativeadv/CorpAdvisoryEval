"use client";

import { DIMENSION_NAMES, getDimensionScores, type FirmWithEvaluation } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";

const SCORE_COLORS: Record<number, string> = {
  1: "bg-red-200 text-red-900",
  2: "bg-orange-200 text-orange-900",
  3: "bg-yellow-200 text-yellow-900",
  4: "bg-blue-200 text-blue-900",
  5: "bg-green-200 text-green-900",
};

export function DimensionHeatmap({ firms }: { firms: FirmWithEvaluation[] }) {
  const [sortDim, setSortDim] = useState<number | null>(null);

  const evaluated = firms.filter((f) => f.evaluation);

  const sorted = sortDim !== null
    ? [...evaluated].sort((a, b) => {
        const aScores = getDimensionScores(a.evaluation!);
        const bScores = getDimensionScores(b.evaluation!);
        return bScores[sortDim] - aScores[sortDim];
      })
    : [...evaluated].sort(
        (a, b) =>
          (b.evaluation?.compositeScoreWeighted ?? 0) -
          (a.evaluation?.compositeScoreWeighted ?? 0)
      );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-xs">
        <thead>
          <tr>
            <th className="text-left p-2 sticky left-0 bg-background z-10 min-w-[140px]">
              Firm
            </th>
            {DIMENSION_NAMES.map((name, i) => (
              <th
                key={i}
                className="p-1 text-center cursor-pointer hover:bg-muted/50 min-w-[40px]"
                onClick={() => setSortDim(sortDim === i ? null : i)}
                title={`Sort by ${name}`}
              >
                <div className="writing-mode-vertical text-[10px] leading-tight h-20 flex items-end justify-center">
                  <span
                    className={cn(
                      "transform -rotate-45 origin-center whitespace-nowrap",
                      sortDim === i && "font-bold text-primary"
                    )}
                  >
                    {name.split(" ").slice(0, 2).join(" ")}
                  </span>
                </div>
              </th>
            ))}
            <th className="p-2 text-center font-semibold">Score</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((firm) => {
            const scores = getDimensionScores(firm.evaluation!);
            return (
              <tr key={firm.slug} className="border-t">
                <td className="p-2 font-medium sticky left-0 bg-background z-10">
                  {firm.shortName}
                </td>
                {scores.map((score, i) => (
                  <td key={i} className="p-0.5 text-center">
                    <Tooltip>
                      <TooltipTrigger
                        className={cn(
                          "w-8 h-8 rounded flex items-center justify-center font-mono font-medium text-xs mx-auto cursor-default",
                          SCORE_COLORS[score] || "bg-muted"
                        )}
                      >
                        {score}
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-medium">{firm.name}</p>
                        <p>
                          {DIMENSION_NAMES[i]}: {score}/5
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </td>
                ))}
                <td className="p-2 text-center font-mono font-semibold">
                  {firm.evaluation!.compositeScoreWeighted.toFixed(1)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

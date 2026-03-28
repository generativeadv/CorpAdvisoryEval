"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { DIMENSION_NAMES, WEIGHTED_DIMENSIONS } from "@/lib/types";

interface DimensionRadarProps {
  scores: number[];
  className?: string;
}

export function DimensionRadar({ scores, className }: DimensionRadarProps) {
  const data = DIMENSION_NAMES.map((name, i) => ({
    dimension: name.replace(/& /g, "&\n").replace(/ /g, "\n"),
    shortName: name.split(" ").slice(0, 2).join(" "),
    score: scores[i],
    fullMark: 5,
    weighted: (WEIGHTED_DIMENSIONS as readonly number[]).includes(i),
  }));

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={350}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis
            dataKey="shortName"
            tick={{ fontSize: 10, fill: "#6b7280" }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 5]}
            tick={{ fontSize: 10 }}
            tickCount={6}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#2563eb"
            fill="#3b82f6"
            fillOpacity={0.2}
            strokeWidth={2}
          />
          <Tooltip
            content={({ payload }) => {
              if (!payload?.[0]) return null;
              const d = payload[0].payload;
              return (
                <div className="bg-background border rounded p-2 text-xs shadow-lg">
                  <p className="font-medium">{DIMENSION_NAMES[data.indexOf(d)]}</p>
                  <p>
                    Score: {d.score}/5{d.weighted ? " (1.5x weight)" : ""}
                  </p>
                </div>
              );
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

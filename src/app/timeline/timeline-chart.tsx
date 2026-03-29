"use client";

import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

interface TimelineEvent {
  firm: string;
  firmSlug: string;
  date: string;
  quarter: string;
  type: string;
  description: string;
}

const TYPE_COLORS: Record<string, string> = {
  Action: "#3b82f6",
  "Thought Leadership": "#8b5cf6",
  Hiring: "#f59e0b",
  Partnership: "#10b981",
  Acquisition: "#ef4444",
  "Product Launch": "#06b6d4",
};

const TYPE_LABELS = Object.keys(TYPE_COLORS);

// Normalize messy type strings into standard categories
function normalizeType(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes("hiring") || lower.includes("hire") || lower.includes("appointment")) return "Hiring";
  if (lower.includes("acquisition") || lower.includes("acquire") || lower.includes("m&a")) return "Acquisition";
  if (lower.includes("partnership") || lower.includes("alliance") || lower.includes("collaboration")) return "Partnership";
  if (lower.includes("product") || lower.includes("launch") || lower.includes("platform")) return "Product Launch";
  if (lower.includes("thought") || lower.includes("content") || lower.includes("publication") || lower.includes("report") || lower.includes("podcast") || lower.includes("blog") || lower.includes("speaking") || lower.includes("event") || lower.includes("messaging")) return "Thought Leadership";
  return "Action";
}

function generateQuarters(start: string, end: string): string[] {
  const quarters: string[] = [];
  const [sy, sq] = start.split("-Q").map(Number);
  const [ey, eq] = end.split("-Q").map(Number);
  let y = sy, q = sq;
  while (y < ey || (y === ey && q <= eq)) {
    quarters.push(`${y}-Q${q}`);
    q++;
    if (q > 4) { q = 1; y++; }
  }
  return quarters;
}

export function TimelineChart({ events }: { events: TimelineEvent[] }) {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const { chartData, allQuarters, typeCounts, eventsByQuarter } = useMemo(() => {
    // Normalize types
    const normalized = events.map((e) => ({
      ...e,
      type: normalizeType(e.type),
    }));

    // Get quarter range
    const quarters = normalized.map((e) => e.quarter).sort();
    const minQ = quarters[0] || "2023-Q1";
    const maxQ = quarters[quarters.length - 1] || "2026-Q1";
    const allQuarters = generateQuarters(minQ, maxQ);

    // Count by quarter and type
    const data = allQuarters.map((q) => {
      const qEvents = normalized.filter((e) => e.quarter === q);
      const row: Record<string, number | string> = { quarter: q };
      for (const type of TYPE_LABELS) {
        row[type] = qEvents.filter((e) => e.type === type).length;
      }
      row.total = qEvents.length;
      return row;
    });

    // Type totals
    const typeCounts = TYPE_LABELS.map((type) => ({
      type,
      count: normalized.filter((e) => e.type === type).length,
    })).filter((t) => t.count > 0);

    // Events grouped by quarter for detail view
    const eventsByQuarter: Record<string, typeof normalized> = {};
    for (const e of normalized) {
      if (!eventsByQuarter[e.quarter]) eventsByQuarter[e.quarter] = [];
      eventsByQuarter[e.quarter].push(e);
    }

    return { chartData: data, allQuarters, typeCounts, eventsByQuarter };
  }, [events]);

  const activeTypes = selectedType
    ? [selectedType]
    : typeCounts.map((t) => t.type);

  return (
    <div className="space-y-6">
      {/* Type filter pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedType(null)}
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
            !selectedType
              ? "bg-primary text-primary-foreground border-primary"
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          All Types ({events.length})
        </button>
        {typeCounts.map((t) => (
          <button
            key={t.type}
            onClick={() =>
              setSelectedType(selectedType === t.type ? null : t.type)
            }
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
              selectedType === t.type
                ? "text-white border-transparent"
                : "text-muted-foreground hover:bg-muted"
            )}
            style={
              selectedType === t.type
                ? { backgroundColor: TYPE_COLORS[t.type] }
                : undefined
            }
          >
            <span
              className="inline-block w-2 h-2 rounded-full mr-1.5"
              style={{ backgroundColor: TYPE_COLORS[t.type] }}
            />
            {t.type} ({t.count})
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="border rounded-xl p-4">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="quarter"
              tick={{ fontSize: 11, fill: "#6b7280" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#6b7280" }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload) return null;
                const total = payload.reduce(
                  (sum, p) => sum + (Number(p.value) || 0),
                  0
                );
                return (
                  <div className="bg-white border rounded-lg shadow-lg p-3 text-xs">
                    <p className="font-bold mb-1">{label}</p>
                    {payload
                      .filter((p) => Number(p.value) > 0)
                      .map((p) => (
                        <div
                          key={p.name}
                          className="flex items-center gap-2"
                        >
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: p.color }}
                          />
                          <span>{p.name}:</span>
                          <span className="font-bold">{p.value}</span>
                        </div>
                      ))}
                    <div className="border-t mt-1 pt-1 font-bold">
                      Total: {total}
                    </div>
                  </div>
                );
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11 }}
              iconType="circle"
              iconSize={8}
            />
            {activeTypes.map((type) => (
              <Bar
                key={type}
                dataKey={type}
                stackId="a"
                fill={TYPE_COLORS[type] || "#999"}
                radius={
                  activeTypes.indexOf(type) === activeTypes.length - 1
                    ? [2, 2, 0, 0]
                    : [0, 0, 0, 0]
                }
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Event detail list */}
      <div className="border rounded-xl p-4">
        <h3 className="font-semibold text-sm mb-3">
          Event Detail ({events.length} total)
        </h3>
        <div className="space-y-4 max-h-96 overflow-auto">
          {allQuarters
            .filter((q) => eventsByQuarter[q]?.length)
            .reverse()
            .map((q) => {
              const qEvents = (eventsByQuarter[q] || []).filter(
                (e) => !selectedType || e.type === selectedType
              );
              if (qEvents.length === 0) return null;
              return (
                <div key={q}>
                  <p className="text-xs font-bold text-muted-foreground mb-1.5">
                    {q}
                  </p>
                  <div className="space-y-1.5">
                    {qEvents.map((e, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 text-xs"
                      >
                        <span
                          className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                          style={{
                            backgroundColor: TYPE_COLORS[e.type] || "#999",
                          }}
                        />
                        <div>
                          <span className="font-medium">{e.firm}</span>
                          <span className="text-muted-foreground">
                            {" "}&mdash; {e.description}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

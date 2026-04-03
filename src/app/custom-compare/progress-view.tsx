"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const STEPS = [
  "Reading research reports...",
  "Analyzing dimension scores...",
  "Comparing firm strategies...",
  "Identifying key differentiators...",
  "Generating insights...",
  "Finalizing analysis...",
];

export function ProgressView({
  firmNames,
  onComplete,
}: {
  firmNames: string;
  onComplete: () => void;
}) {
  const [step, setStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  // Cycle through steps
  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % STEPS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Track elapsed time
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Poll for completion
  useEffect(() => {
    const slug = window.location.pathname.split("/").pop();
    if (!slug) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/comparisons/${slug}`);
        const data = await res.json();
        if (data.status === "complete" || data.status === "error") {
          onComplete();
        }
      } catch {
        // ignore poll errors
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [onComplete]);

  const firms = firmNames.split(", ");

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
      {/* Animated firm badges */}
      <div className="flex gap-3">
        {firms.map((name, i) => (
          <div
            key={name}
            className={cn(
              "px-4 py-2 rounded-full border-2 text-sm font-medium transition-all duration-1000",
              step % firms.length === i
                ? "border-primary bg-primary/10 text-primary scale-110"
                : "border-muted text-muted-foreground"
            )}
          >
            {name}
          </div>
        ))}
      </div>

      {/* Spinner + step */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-muted" />
          <div
            className="absolute inset-0 w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin"
          />
        </div>
        <p className="text-sm font-medium animate-pulse">{STEPS[step]}</p>
      </div>

      {/* Time estimate */}
      <div className="text-center space-y-1">
        <p className="text-xs text-muted-foreground">
          {elapsed}s elapsed · Typically takes 60–120 seconds
        </p>
        <p className="text-xs text-muted-foreground">
          Claude Opus is analyzing research reports across 10 dimensions
        </p>
      </div>

      {/* Progress bar (approximate) */}
      <div className="w-64 bg-muted rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-1000 ease-linear"
          style={{ width: `${Math.min(95, (elapsed / 100) * 100)}%` }}
        />
      </div>
    </div>
  );
}

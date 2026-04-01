export type MaturityStage = 1 | 2 | 3 | 4 | 5;

export const MATURITY_LABELS: Record<MaturityStage, string> = {
  1: "Dormant",
  2: "Experimenting",
  3: "Formalizing",
  4: "Scaling",
  5: "Leading",
};

export const MATURITY_COLORS: Record<MaturityStage, string> = {
  1: "bg-red-100 text-red-800 border-red-200",
  2: "bg-orange-100 text-orange-800 border-orange-200",
  3: "bg-yellow-100 text-yellow-800 border-yellow-200",
  4: "bg-blue-100 text-blue-800 border-blue-200",
  5: "bg-green-100 text-green-800 border-green-200",
};

export type ConfidenceGrade = "A" | "B" | "C" | "D";

export const CONFIDENCE_LABELS: Record<ConfidenceGrade, string> = {
  A: "High Confidence",
  B: "Moderate Confidence",
  C: "Low Confidence",
  D: "Insufficient Evidence",
};

export const CONFIDENCE_COLORS: Record<ConfidenceGrade, string> = {
  A: "bg-green-100 text-green-800 border-green-200",
  B: "bg-emerald-50 text-emerald-700 border-emerald-200",
  C: "bg-yellow-100 text-yellow-800 border-yellow-200",
  D: "bg-red-100 text-red-800 border-red-200",
};

export type Archetype =
  | "technology-builder"
  | "advisory-positioner"
  | "acquirer"
  | "dormant-lagging";

export const ARCHETYPE_LABELS: Record<Archetype, string> = {
  "technology-builder": "Technology Builder",
  "advisory-positioner": "Advisory Positioner",
  acquirer: "Acquirer",
  "dormant-lagging": "Dormant / Lagging",
};

export const DIMENSION_NAMES = [
  "Client-Facing AI Offering",
  "Proprietary AI Technology",
  "AI Leadership & Governance",
  "Technical Talent & Engineering",
  "AI Partnerships, Acquisitions & Ecosystem",
  "Thought Leadership & Content",
  "Case Studies & Evidence",
  "Internal AI Adoption",
  "Commercial Momentum",
  "Strategic Coherence",
] as const;

export const WEIGHTED_DIMENSIONS = [0, 1, 3, 8] as const; // indices with 1.5x weight

export interface Evaluation {
  id: number;
  firmId: number;
  maturityStage: MaturityStage;
  maturityRationale: string;
  dim1: number;
  dim2: number;
  dim3: number;
  dim4: number;
  dim5: number;
  dim6: number;
  dim7: number;
  dim8: number;
  dim9: number;
  dim10: number;
  compositeScoreUnweighted: number;
  compositeScoreWeighted: number;
  confidenceGrade: ConfidenceGrade;
  confidenceRationale: string;
  archetype: Archetype;
  scoredAt: string;
}

export interface FirmWithEvaluation {
  id: number;
  slug: string;
  name: string;
  shortName: string;
  group: 1 | 2 | 3;
  evaluation: Evaluation | null;
}

export function getDimensionScores(evaluation: Evaluation): number[] {
  return [
    evaluation.dim1,
    evaluation.dim2,
    evaluation.dim3,
    evaluation.dim4,
    evaluation.dim5,
    evaluation.dim6,
    evaluation.dim7,
    evaluation.dim8,
    evaluation.dim9,
    evaluation.dim10,
  ];
}

export function computeWeightedScore(dims: number[]): number {
  let total = 0;
  for (let i = 0; i < 10; i++) {
    const weight = (WEIGHTED_DIMENSIONS as readonly number[]).includes(i)
      ? 1.5
      : 1.0;
    total += dims[i] * weight;
  }
  return Math.round(total * 100) / 100;
}

export function computeUnweightedScore(dims: number[]): number {
  return dims.reduce((sum, d) => sum + d, 0);
}

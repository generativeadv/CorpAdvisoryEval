import { DIMENSION_NAMES, MATURITY_LABELS, CONFIDENCE_LABELS, ARCHETYPE_LABELS, getDimensionScores, type Evaluation, type MaturityStage, type ConfidenceGrade, type Archetype } from "../../src/lib/types";

interface FirmContext {
  name: string;
  shortName: string;
  group: number;
  evaluation: Evaluation;
  reportExcerpt: string; // trimmed report content
}

export function buildComparisonPrompt(firms: FirmContext[]): string {
  const firmSummaries = firms.map((f) => {
    const dims = getDimensionScores(f.evaluation);
    return `### ${f.name} (${f.shortName})
- **Maturity:** Stage ${f.evaluation.maturityStage} (${MATURITY_LABELS[f.evaluation.maturityStage]})
- **Weighted Score:** ${f.evaluation.compositeScoreWeighted} / 60
- **Confidence:** ${f.evaluation.confidenceGrade} (${CONFIDENCE_LABELS[f.evaluation.confidenceGrade as ConfidenceGrade]})
- **Archetype:** ${ARCHETYPE_LABELS[f.evaluation.archetype as Archetype]}
- **Dimension Scores:** ${DIMENSION_NAMES.map((name, i) => `${name}: ${dims[i]}/5`).join("; ")}

#### Research Report Excerpt
${f.reportExcerpt}
`;
  }).join("\n---\n\n");

  return `You are a senior strategy analyst producing a board-quality competitive comparison. You have structured evaluation data and deep research report excerpts for three firms. Produce a detailed, evidence-based dimension-by-dimension comparison.

## FIRMS TO COMPARE

${firmSummaries}

## DIMENSION DEFINITIONS (for reference)

${DIMENSION_NAMES.map((name, i) => `${i + 1}. ${name}`).join("\n")}

## INSTRUCTIONS

Produce a structured markdown analysis with these sections:

### Introduction
2-3 sentences on which firms are being compared and what makes this comparison interesting (e.g., different group types, similar scores but different strategies, etc.).

### Dimension-by-Dimension Analysis
For EACH of the 10 dimensions:
- **Heading:** The dimension name
- **Scores:** List each firm's score (e.g., "FGS: 4, Edelman: 3, BCG: 5")
- **Analysis:** 2-4 sentences explaining WHY the scores differ. Cite SPECIFIC evidence from the research reports — named tools, practices, hires, partnerships, or proof points. Do not just restate the numbers; explain the underlying reality.
- **Key differentiator:** One sentence on what separates the leader from the others on this dimension.

### Overall Assessment
- **Key differentiators:** What fundamentally separates these three firms in their AI strategies?
- **Surprising similarities:** Where are they more alike than the scores suggest?
- **Strategic implications:** What should a board member take away from this comparison?

## TONE
Write like a senior McKinsey or BCG partner: precise, evidence-based, commercially useful. Be direct. Acknowledge where evidence is thin. Do not hedge excessively or use filler. Every claim should be grounded in the research report excerpts provided.`;
}

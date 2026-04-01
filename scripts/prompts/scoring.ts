/**
 * Builds the scoring prompt that instructs Claude Opus to evaluate a firm's
 * deep research report using the 3-framework evaluation model.
 */
export function buildScoringPrompt(reportContent: string, firmName: string): string {
  return `You are a senior strategy analyst conducting a board-level competitive evaluation of how advisory firms are deploying AI. You have been given a deep research report on ${firmName}. Your task is to apply three evaluation frameworks to this report and return structured scores.

## RESEARCH REPORT

${reportContent}

## EVALUATION FRAMEWORKS

### Framework 1: AI Maturity Model (5 Stages)

Classify the firm into ONE stage based on the totality of evidence. Classification is based on the LOWEST stage at which ALL criteria are met, not the highest individual signal.

Stage 1 - Dormant: No meaningful public AI activity. AI may appear in generic website copy but no dedicated practice, leadership, tooling, or thought leadership.
Stage 2 - Experimenting: Early-stage exploration. Some thought leadership, possibly a working group or internal pilot, but no formalized offering, no dedicated AI leadership, and no visible engineering investment.
Stage 3 - Formalizing: AI becoming a named priority. Dedicated leadership appointed, practice or service line announced, some proprietary tooling in development or early deployment, active hiring of technical talent.
Stage 4 - Scaling: AI embedded in operations and client delivery at meaningful scale. Proprietary platform in production use across the firm, dedicated engineering team, active client-facing practice with defined service lines, evidence of commercial traction.
Stage 5 - Leading: AI is a core strategic differentiator. Deep proprietary technology, significant engineering organization, measurable commercial AI revenue, published case studies, recognized market position as AI-forward, governance framework in place.

### Framework 2: Dimension Scorecard (10 Dimensions, 1-5 Scale)

Score each dimension 1-5 using the anchors below:

1. Client-Facing AI Offering: 1=None visible. 2=AI mentioned generically. 3=Named AI practice announced. 4=Defined service pillars. 5=Pillars + published case studies/proof points.
2. Proprietary AI Technology: 1=No evidence. 2=Generic "using AI" claims. 3=Named internal tool in development. 4=Proprietary platform in production. 5=Platform at scale + client-facing AI products.
3. AI Leadership & Governance: 1=No named AI leader. 2=AI in broader mandate. 3=Dedicated AI leader. 4=Leader + team/structure. 5=Full leadership + governance/responsible AI framework.
4. Technical Talent & Engineering: 1=No evidence. 2=1-2 technical roles. 3=Small team (3-10) hiring. 4=Established team (10-30). 5=Large org (30+) with leads and PMs.
5. AI Partnerships, Acquisitions & Ecosystem: 1=None identified. 2=Generic vendor relationships or adjacent acquisitions without AI focus. 3=1-2 named AI partnerships or 1 AI-relevant acquisition. 4=Multiple strategic partnerships and/or acquisitions building an AI capability stack. 5=Deep strategic alliances with major AI ecosystem players combined with targeted M&A systematically reinforcing AI capabilities.
6. Thought Leadership & Content: 1=None. 2=Occasional mentions. 3=Regular AI content. 4=Dedicated AI content franchise. 5=Industry-recognized with original research.
7. Case Studies & Evidence: 1=No published case studies or proof points. 2=Vague references to AI success without specifics. 3=1-2 named examples of AI-driven work (internal productivity gains or client engagements). 4=Multiple published case studies or measurable outcomes demonstrating AI impact. 5=Extensive published evidence with named clients, quantified results, and/or industry recognition of AI-driven success.
8. Internal AI Adoption: 1=No evidence. 2=Generic claims. 3=Named internal tools. 4=Platform at scale with training. 5=AI deeply embedded with measurable impact.
9. Commercial Momentum: 1=No evidence. 2=Practice announced, no traction. 3=Hiring client-facing AI roles. 4=Indirect evidence of engagements. 5=Named clients/case studies/identifiable revenue.
10. Strategic Coherence: 1=No strategy. 2=Scattered activities. 3=Emerging coherence. 4=Clear connected strategy. 5=Fully integrated with board/CEO sponsorship.

Weighted dimensions (1.5x weight): Dimensions 1, 2, 4, and 9.

### Framework 3: Evidence Confidence Index

A - High Confidence: Multiple independent primary sources confirm key claims.
B - Moderate Confidence: Primary sources confirm core claims but some dimensions rely on inference.
C - Low Confidence: Evidence thin, relies heavily on marketing language or self-reported sources.
D - Insufficient Evidence: Very little public information available.

### Archetype Classification

Based on the score profile, classify the firm as one of:
- "technology-builder": High on proprietary tech and engineering, may be lower on thought leadership
- "advisory-positioner": Strong on messaging and thought leadership, weaker on technology and talent
- "acquirer": Building through M&A rather than organic development
- "dormant-lagging": Minimal activity across most dimensions

## INSTRUCTIONS

Analyze the research report carefully. For each framework, provide your assessment with brief rationale. Return your response as a JSON object with exactly this structure:

\`\`\`json
{
  "maturityStage": <1-5>,
  "maturityRationale": "<2-3 sentences explaining the classification>",
  "dimensions": {
    "dim1": <1-5>,
    "dim2": <1-5>,
    "dim3": <1-5>,
    "dim4": <1-5>,
    "dim5": <1-5>,
    "dim6": <1-5>,
    "dim7": <1-5>,
    "dim8": <1-5>,
    "dim9": <1-5>,
    "dim10": <1-5>
  },
  "confidenceGrade": "<A|B|C|D>",
  "confidenceRationale": "<2-3 sentences explaining confidence assessment>",
  "archetype": "<technology-builder|advisory-positioner|acquirer|dormant-lagging>"
}
\`\`\`

Be rigorous and evidence-based. Do not inflate scores. If evidence is thin for a dimension, score it low. The maturity classification should be based on the LOWEST stage where ALL criteria are met.`;
}

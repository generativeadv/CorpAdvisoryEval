import { getAllFirmsWithEvaluations } from "@/lib/queries";
import {
  MATURITY_LABELS,
  ARCHETYPE_LABELS,
  DIMENSION_NAMES,
  getDimensionScores,
  type MaturityStage,
  type Archetype,
} from "@/lib/types";
import { GROUP_LABELS } from "@/lib/firms";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PreReadPrintButton } from "./print-button";

export default async function PreReadPage() {
  const firms = await getAllFirmsWithEvaluations();
  const evaluated = firms.filter((f) => f.evaluation);

  // Separate FTI Total for contextual treatment
  const coreFirms = evaluated.filter((f) => f.slug !== "fti-total");
  const ftiTotal = evaluated.find((f) => f.slug === "fti-total");
  const fgs = evaluated.find((f) => f.slug === "fgs-global");

  const avgWeighted =
    coreFirms.length > 0
      ? coreFirms.reduce(
          (sum, f) => sum + (f.evaluation?.compositeScoreWeighted ?? 0),
          0
        ) / coreFirms.length
      : 0;

  const avgMaturity =
    coreFirms.length > 0
      ? coreFirms.reduce(
          (s, f) => s + (f.evaluation?.maturityStage ?? 0),
          0
        ) / coreFirms.length
      : 0;

  const sorted = [...coreFirms].sort(
    (a, b) =>
      (b.evaluation?.compositeScoreWeighted ?? 0) -
      (a.evaluation?.compositeScoreWeighted ?? 0)
  );

  const stageDistribution = [1, 2, 3, 4, 5].map((stage) => ({
    stage: stage as MaturityStage,
    label: MATURITY_LABELS[stage as MaturityStage],
    count: coreFirms.filter((f) => f.evaluation?.maturityStage === stage)
      .length,
  }));

  const dimAverages = DIMENSION_NAMES.map((name, i) => {
    const avg =
      coreFirms.length > 0
        ? coreFirms.reduce((sum, f) => {
            const scores = getDimensionScores(f.evaluation!);
            return sum + scores[i];
          }, 0) / coreFirms.length
        : 0;
    return { name, avg };
  });

  const strongestDim = [...dimAverages].sort((a, b) => b.avg - a.avg)[0];
  const weakestDim = [...dimAverages].sort((a, b) => a.avg - b.avg)[0];

  const archetypeCounts = (Object.keys(ARCHETYPE_LABELS) as Archetype[])
    .map((a) => ({
      label: ARCHETYPE_LABELS[a],
      count: coreFirms.filter((f) => f.evaluation?.archetype === a).length,
    }))
    .filter((a) => a.count > 0);

  const highConfidence = coreFirms.filter(
    (f) => f.evaluation?.confidenceGrade === "A"
  ).length;
  const lowConfidence = coreFirms.filter(
    (f) =>
      f.evaluation?.confidenceGrade === "C" ||
      f.evaluation?.confidenceGrade === "D"
  ).length;

  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // FGS-specific data
  const fgsE = fgs?.evaluation;
  const fgsDims = fgsE ? getDimensionScores(fgsE) : [];
  const fgsRank = fgs ? sorted.findIndex((f) => f.slug === "fgs-global") + 1 : 0;
  const fgsTopDimIdx = fgsDims.length > 0 ? fgsDims.indexOf(Math.max(...fgsDims)) : 0;
  const fgsBottomDimIdx = fgsDims.length > 0 ? fgsDims.indexOf(Math.min(...fgsDims)) : 0;

  // Group 1 ranking for FGS
  const group1Sorted = sorted.filter((f) => f.group === 1);
  const fgsGroup1Rank = fgs ? group1Sorted.findIndex((f) => f.slug === "fgs-global") + 1 : 0;

  return (
    <div>
      <div className="p-6 max-w-4xl mx-auto print:hidden">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/board"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={14} />
            Back to Board Outputs
          </Link>
          <PreReadPrintButton />
        </div>
      </div>

      <div
        className="max-w-3xl mx-auto px-8 print:px-0 print:max-w-none font-serif"
        id="pre-read-content"
      >
        {/* ============ PAGE 1 ============ */}
        <div className="print:break-after-page mb-16 print:mb-0">
          <div className="mb-8 pb-4 border-b">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
              Confidential
            </p>
            <h1 className="text-xl font-bold font-sans">
              AI Strategy Competitive Assessment
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Board Pre-Read &mdash; {dateStr}
            </p>
          </div>

          <h2 className="text-base font-bold font-sans mb-3">Purpose</h2>
          <p className="text-sm leading-relaxed mb-6">
            This memo summarizes the findings of a structured competitive
            assessment of {coreFirms.length} advisory, communications, and
            consulting firms on their AI strategies.{" "}
            {ftiTotal && (
              <>
                FTI Consulting (Total Firm) is included separately as a
                contextual reference point given its scale and adjacency to
                Accenture Song, but is not weighted in sector-level averages
                or rankings given that the total-firm evaluation encompasses
                capabilities well beyond the strategic communications scope
                of this assessment.{" "}
              </>
            )}
            The assessment covers both client-facing AI advisory offerings
            and internal AI adoption for employee productivity and capability
            building. The evaluation uses a three-framework model: a
            five-stage AI Maturity classification, a ten-dimension weighted
            scorecard, and an evidence confidence index. The underlying
            research for each firm is based on a comprehensive deep research
            report drawing on public sources including official firm
            communications, press coverage, job postings, executive
            commentary, and third-party reporting.
          </p>

          <h2 className="text-base font-bold font-sans mb-3">
            Headline Findings
          </h2>
          <div className="text-sm leading-relaxed space-y-3 mb-6">
            <p>
              The sector is in the middle stages of AI adoption. The average
              maturity stage across the {coreFirms.length} core firms is{" "}
              {avgMaturity.toFixed(1)} out of 5, and the average weighted
              composite score is {avgWeighted.toFixed(1)} out of a possible
              56. The distribution is as follows:{" "}
              {stageDistribution
                .filter((s) => s.count > 0)
                .map(
                  (s) =>
                    `${s.count} firm${s.count !== 1 ? "s" : ""} at Stage ${s.stage} (${s.label})`
                )
                .join("; ")}
              .
            </p>
            <p>
              {sorted[0]?.shortName} leads the field with a weighted score
              of{" "}
              {sorted[0]?.evaluation?.compositeScoreWeighted.toFixed(1)},
              followed by {sorted[1]?.shortName} (
              {sorted[1]?.evaluation?.compositeScoreWeighted.toFixed(1)}) and{" "}
              {sorted[2]?.shortName} (
              {sorted[2]?.evaluation?.compositeScoreWeighted.toFixed(1)}).
              {fgsE && (
                <>
                  {" "}Among Group 1 firms (corporate advisory and strategic
                  communications), FGS Global ranks{" "}
                  {fgsGroup1Rank === 1
                    ? "first"
                    : fgsGroup1Rank === 2
                      ? "second"
                      : `${fgsGroup1Rank}th`}{" "}
                  with a weighted score of{" "}
                  {fgsE.compositeScoreWeighted.toFixed(1)} and a Stage{" "}
                  {fgsE.maturityStage} ({MATURITY_LABELS[fgsE.maturityStage]})
                  classification, reflecting its dedicated AI practice launch,
                  proprietary platform (Fergus), and the Memetica acquisition.
                </>
              )}
              {" "}At the other end of the spectrum,{" "}
              {sorted[sorted.length - 1]?.shortName} scored lowest at{" "}
              {sorted[
                sorted.length - 1
              ]?.evaluation?.compositeScoreWeighted.toFixed(1)}
              , classified at Stage{" "}
              {sorted[sorted.length - 1]?.evaluation?.maturityStage} (
              {
                MATURITY_LABELS[
                  sorted[sorted.length - 1]?.evaluation
                    ?.maturityStage as MaturityStage
                ]
              }
              ).
            </p>
            <p>
              Across the ten scoring dimensions, the sector is strongest in{" "}
              {strongestDim.name} (average {strongestDim.avg.toFixed(1)}/5)
              and weakest in {weakestDim.name} (average{" "}
              {weakestDim.avg.toFixed(1)}/5). The gap between these two
              dimensions underscores a common pattern: many firms have begun
              positioning around AI and investing in thought leadership, but
              fewer have made the engineering and commercial investments that
              translate positioning into verified capability.
            </p>
            <p>
              Evidence confidence is generally strong: {highConfidence} of{" "}
              {coreFirms.length} core firms received an A (High Confidence)
              rating, meaning key claims are corroborated by multiple
              independent sources.{" "}
              {lowConfidence > 0
                ? `${lowConfidence} firm${lowConfidence !== 1 ? "s" : ""} received a C or D rating, indicating that scores for those firms should be treated as directional rather than definitive.`
                : "No firms received a C or D rating, suggesting sufficient public evidence exists for all assessed firms."}
            </p>
          </div>

          <h2 className="text-base font-bold font-sans mb-3">
            Archetype Distribution
          </h2>
          <p className="text-sm leading-relaxed">
            Firms cluster into distinct strategic postures:{" "}
            {archetypeCounts
              .map(
                (a) =>
                  `${a.count} classified as ${a.label}${a.count > 1 ? "s" : ""}`
              )
              .join(", ")}
            . These archetypes reflect fundamentally different approaches to
            AI — whether a firm is building proprietary technology, leading
            with advisory positioning, assembling capability through
            acquisition, or still in early stages of engagement.
          </p>
        </div>

        {/* ============ PAGE 2 ============ */}
        <div className="print:break-after-page mb-16 print:mb-0">
          <h2 className="text-base font-bold font-sans mb-4 pb-2 border-b">
            Firm-by-Firm Summary
          </h2>
          <div className="text-sm leading-relaxed space-y-4">
            {sorted.map((firm, i) => {
              const e = firm.evaluation!;
              const dims = getDimensionScores(e);
              const topDimIdx = dims.indexOf(Math.max(...dims));
              const bottomDimIdx = dims.indexOf(Math.min(...dims));
              const isFgs = firm.slug === "fgs-global";
              return (
                <div key={firm.slug}>
                  <p>
                    <span className="font-bold font-sans">
                      {i + 1}. {firm.name}
                    </span>{" "}
                    &mdash; Stage {e.maturityStage} (
                    {MATURITY_LABELS[e.maturityStage]}), weighted score{" "}
                    {e.compositeScoreWeighted.toFixed(1)}, confidence{" "}
                    {e.confidenceGrade},{" "}
                    {ARCHETYPE_LABELS[e.archetype as Archetype]}.
                    {isFgs
                      ? ` FGS stands out among Group 1 peers for combining a named AI practice with a proprietary internal platform and a targeted AI acquisition, suggesting institutional commitment beyond positioning. Strongest dimension: ${DIMENSION_NAMES[topDimIdx]} (${dims[topDimIdx]}/5). Weakest: ${DIMENSION_NAMES[bottomDimIdx]} (${dims[bottomDimIdx]}/5).`
                      : ` Strongest dimension: ${DIMENSION_NAMES[topDimIdx]} (${dims[topDimIdx]}/5). Weakest: ${DIMENSION_NAMES[bottomDimIdx]} (${dims[bottomDimIdx]}/5).`}
                  </p>
                </div>
              );
            })}

            {/* FTI Total as contextual appendix */}
            {ftiTotal && ftiTotal.evaluation && (
              <div className="pt-4 mt-4 border-t border-dashed">
                <p className="text-xs text-muted-foreground italic mb-2">
                  Contextual reference (not included in sector rankings):
                </p>
                <p>
                  <span className="font-bold font-sans">
                    {ftiTotal.name}
                  </span>{" "}
                  &mdash; Stage {ftiTotal.evaluation.maturityStage} (
                  {MATURITY_LABELS[ftiTotal.evaluation.maturityStage]}
                  ), weighted score{" "}
                  {ftiTotal.evaluation.compositeScoreWeighted.toFixed(1)},
                  confidence {ftiTotal.evaluation.confidenceGrade},{" "}
                  {
                    ARCHETYPE_LABELS[
                      ftiTotal.evaluation.archetype as Archetype
                    ]
                  }
                  . Included for contextual reference given FTI&rsquo;s
                  total-firm AI investments across its consulting, forensic,
                  and technology segments, which extend well beyond the
                  strategic communications practice assessed in the core
                  rankings. The total-firm score reflects enterprise-scale
                  resources and is not directly comparable to
                  communications-focused firms.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ============ PAGE 3 ============ */}
        <div className="mb-16">
          <h2 className="text-base font-bold font-sans mb-4 pb-2 border-b">
            Key Observations for the Board
          </h2>
          <div className="text-sm leading-relaxed space-y-4">
            <p>
              <span className="font-bold font-sans">
                1. The sector has moved beyond experimentation but has not
                yet reached maturity.
              </span>{" "}
              The majority of firms are at Stage 3 (Formalizing) or Stage 4
              (Scaling), meaning they have appointed AI leadership, launched
              dedicated practices, and in many cases deployed proprietary
              platforms. However, only{" "}
              {stageDistribution.find((s) => s.stage === 5)?.count || 0} firm
              {(stageDistribution.find((s) => s.stage === 5)?.count || 0) !==
              1
                ? "s have"
                : " has"}{" "}
              reached Stage 5 (Leading), where AI is a verified strategic
              differentiator with measurable commercial revenue and published
              case studies.
            </p>
            <p>
              <span className="font-bold font-sans">
                2. Proprietary technology and engineering talent are the
                strongest differentiators.
              </span>{" "}
              Firms that invest in building their own AI platforms and
              maintaining dedicated engineering teams consistently outperform
              those that rely primarily on third-party tools or
              positioning-led strategies. The weighted scoring model
              intentionally amplifies this signal: Client-Facing AI Offering,
              Proprietary AI Technology, Technical Talent, and Commercial
              Momentum each carry 1.5x weight.
            </p>
            <p>
              <span className="font-bold font-sans">
                3. Among pure-play advisory firms, FGS Global represents the
                most complete AI posture.
              </span>{" "}
              {fgsE && (
                <>
                  FGS ranks {fgsGroup1Rank === 1 ? "first" : `${fgsGroup1Rank}th`}{" "}
                  among Group 1 firms with a weighted score of{" "}
                  {fgsE.compositeScoreWeighted.toFixed(1)}. What
                  distinguishes FGS is the breadth of its investment: a
                  named AI Advisory practice, a proprietary internal platform
                  (Fergus) deployed across 1,500+ consultants, a targeted
                  acquisition (Memetica) in AI-driven threat intelligence,
                  dedicated AI leadership under a Global Head of AI &amp;
                  Innovation, and an engineering team (FGS Labs) actively
                  hiring across multiple global offices. This combination of
                  client offering, internal tooling, organizational structure,
                  and M&amp;A activity is rare among firms of comparable size
                  and advisory heritage.
                </>
              )}
            </p>
            <p>
              <span className="font-bold font-sans">
                4. Group structure reflects different competitive dynamics.
              </span>{" "}
              Group 1 firms ({GROUP_LABELS[1]}) and Group 2 firms (
              {GROUP_LABELS[2]}) approach AI from fundamentally different
              business models and resource bases. Group 2 firms, particularly
              the larger PR networks, tend to benefit from parent company
              technology investments and larger scale, while Group 1 firms
              are building capability more independently within
              advisory-scale organizations. Direct cross-group comparisons
              should account for these structural differences.
            </p>
            <p>
              <span className="font-bold font-sans">
                5. Evidence confidence should inform how scores are
                interpreted.
              </span>{" "}
              {highConfidence} firms have High Confidence (A) ratings,
              meaning their scores are well-supported by verifiable public
              evidence.
              {lowConfidence > 0
                ? ` The ${lowConfidence} firm${lowConfidence !== 1 ? "s" : ""} with lower confidence ratings may be more active than scores suggest — the ratings reflect information availability, not necessarily capability.`
                : " All firms have sufficient public evidence for meaningful assessment."}{" "}
              The Board should weight confidence alongside scores when making
              investment or competitive positioning decisions.
            </p>
            <p>
              <span className="font-bold font-sans">
                6. The landscape is evolving rapidly.
              </span>{" "}
              These scores represent a point-in-time assessment. Several
              firms have announced major AI initiatives in the past six
              months, and the pace of hiring, partnerships, and product
              launches suggests that relative positions may shift materially
              within the next two to three quarters. We recommend re-running
              this assessment on a semi-annual basis.
            </p>
          </div>

          <div className="mt-8 pt-4 border-t text-xs text-muted-foreground">
            <p>
              This assessment was prepared using publicly available
              information. Firms with limited public disclosure may score
              lower than their actual capability warrants. FTI Consulting
              (Total Firm) is included as a contextual reference but excluded
              from sector-level averages and rankings. Scores use the
              three-framework evaluation model described in the Methodology
              section. Alternative weightings and custom analyses are
              available via the AI Chat interface.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

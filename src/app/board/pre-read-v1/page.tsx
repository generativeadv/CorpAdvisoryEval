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
              Most firms in this assessment have moved past the
              experimentation phase. The majority have appointed dedicated AI
              leadership, launched named practices or service lines, and begun
              deploying proprietary tools internally. But there is a
              meaningful distance between firms that have announced AI
              ambitions and those that have built the engineering
              infrastructure, commercial offerings, and organizational
              structures to deliver on them. The sector&rsquo;s average
              maturity is {avgMaturity.toFixed(1)} out of 5 &mdash; firmly in
              the formalizing-to-scaling range, with considerable variance
              between the leaders and the field.
            </p>
            <p>
              The clearest pattern across the assessment is that firms which
              invest in proprietary technology and dedicated engineering
              talent outperform those that rely on positioning and thought
              leadership alone. Several firms have built or acquired
              AI-powered platforms &mdash; for media monitoring, threat
              intelligence, stakeholder analytics, or content generation
              &mdash; and embedded them in daily consultant workflows. Others
              have strong public narratives around AI but thinner evidence of
              internal tooling, technical hiring, or commercial traction.
              This gap between narrative and infrastructure is the defining
              fault line in the sector today.
            </p>
            <p>
              Among Group 1 firms (corporate advisory and strategic
              communications), FGS Global has assembled the most complete AI
              posture: a dedicated AI Advisory practice, a proprietary
              internal platform (Fergus) used by 1,500+ consultants, a
              targeted acquisition in AI-driven threat intelligence
              (Memetica), and a global engineering team (FGS Labs) actively
              building integrations across the firm&rsquo;s enterprise
              systems. This breadth of investment &mdash; spanning client
              offering, internal adoption, organizational structure, and
              M&amp;A &mdash; is uncommon among firms of comparable size and
              advisory heritage.
            </p>
            <p>
              The larger PR holding company networks (Weber Shandwick,
              Edelman, Burson, FleishmanHillard) benefit from parent-company
              technology investments and larger engineering organizations,
              which gives them structural advantages in platform development
              and scale. Accenture Song operates in a different category
              entirely, with the deepest technology bench, the broadest AI
              service lines, and verifiable commercial AI revenue &mdash;
              though its inclusion here serves primarily as a ceiling
              reference rather than a direct peer comparison.
            </p>
            <p>
              Evidence confidence across the assessment is strong:{" "}
              {highConfidence} of {coreFirms.length} firms have scores backed
              by multiple independent sources. Where evidence is thinner, our
              confidence ratings flag it explicitly &mdash; a low confidence
              grade reflects limited public disclosure, not necessarily
              limited internal activity.
            </p>
          </div>
        </div>

        {/* ============ PAGE 2 ============ */}
        <div className="print:break-after-page mb-16 print:mb-0">
          <h2 className="text-base font-bold font-sans mb-4 pb-2 border-b">
            Competitive Landscape
          </h2>
          <div className="text-sm leading-relaxed space-y-4">
            <p>
              <span className="font-bold font-sans">The leaders.</span>{" "}
              {sorted[0]?.shortName} stands apart as the most advanced firm
              in the assessment, with deep proprietary technology, a large
              engineering organization, and identifiable commercial AI
              revenue. Among the communications-focused firms,{" "}
              {sorted[1]?.shortName} has made significant strides in
              embedding AI across its service delivery and building
              client-facing AI capabilities at scale.{" "}
              {fgsE && (
                <>
                  FGS Global has built what is arguably the most coherent AI
                  strategy among the pure-play advisory firms &mdash;
                  combining a launched AI Advisory practice, the Fergus
                  platform deployed firm-wide, the Memetica acquisition for
                  AI-driven threat intelligence, and an engineering team
                  actively hiring across New York, Washington, London, and
                  Berlin. The question for FGS is whether its advisory-scale
                  resources can sustain the pace of investment needed to stay
                  ahead of larger competitors with deeper technology benches.
                </>
              )}
            </p>
            <p>
              <span className="font-bold font-sans">
                The scaling middle.
              </span>{" "}
              A cluster of firms &mdash; including Edelman, Burson, APCO,
              Penta, and FleishmanHillard &mdash; have reached Stage 4
              (Scaling), with proprietary platforms in production, dedicated
              AI leadership, and active client-facing practices. These firms
              have moved beyond experimentation into sustained organizational
              commitment, though the depth of their engineering investment
              and commercial traction varies. Several benefit from holding
              company resources (WPP in the case of Burson and
              FleishmanHillard; IPG for Weber Shandwick), which provide
              access to shared technology platforms and data infrastructure
              that independent advisory firms must build on their own.
            </p>
            <p>
              <span className="font-bold font-sans">
                The formalizing tier.
              </span>{" "}
              Teneo, FTI&rsquo;s Strategic Communications group, Brunswick,
              H/Advisors, Kekst, and Orchestra have all taken meaningful
              steps &mdash; appointing AI leaders, launching internal pilots,
              or producing regular thought leadership &mdash; but have not
              yet demonstrated the proprietary tooling, engineering depth, or
              commercial proof points that characterize the scaling firms.
              For several of these firms, the gap is less about ambition than
              about the infrastructure and talent investment required to move
              from strategy to execution.
            </p>
            <p>
              <span className="font-bold font-sans">
                Early stage.
              </span>{" "}
              {sorted[sorted.length - 1]?.shortName} shows the least public
              evidence of AI activity among the assessed firms. This may
              reflect a genuinely early-stage posture or simply limited
              public disclosure; the confidence grade captures this
              distinction.
            </p>

            {/* FTI Total as contextual note */}
            {ftiTotal && ftiTotal.evaluation && (
              <div className="pt-3 mt-3 border-t border-dashed">
                <p>
                  <span className="font-bold font-sans italic">
                    Note on FTI Consulting (Total Firm):
                  </span>{" "}
                  FTI&rsquo;s total-firm AI capabilities &mdash; spanning its
                  consulting, forensic, and technology segments &mdash; are
                  substantial and extend well beyond the strategic
                  communications practice assessed in the core rankings. The
                  total-firm evaluation is included here as a contextual
                  reference for understanding the broader enterprise
                  resources available to FTI&rsquo;s Strat Comms group, but
                  is not factored into sector-level averages or peer
                  rankings, as the comparison would conflate advisory-scale
                  and enterprise-scale capability.
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

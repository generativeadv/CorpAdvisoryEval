import { DIMENSION_NAMES, WEIGHTED_DIMENSIONS, MATURITY_LABELS, CONFIDENCE_LABELS, ARCHETYPE_LABELS, type MaturityStage, type ConfidenceGrade, type Archetype } from "@/lib/types";

const MATURITY_STAGES: { stage: MaturityStage; definition: string; evidence: string }[] = [
  {
    stage: 1,
    definition: "No meaningful public AI activity. AI may appear in generic website copy but no dedicated practice, leadership, tooling, or thought leadership.",
    evidence: "No AI-specific hires, no named practice, no proprietary tools, no AI-themed content beyond boilerplate.",
  },
  {
    stage: 2,
    definition: "Early-stage exploration. Some thought leadership, possibly a working group or internal pilot, but no formalized offering, no dedicated AI leadership, and no visible engineering investment.",
    evidence: "A few blog posts or podcast episodes on AI; generic \"we're exploring AI\" language; no named AI leader; no job postings for technical AI roles.",
  },
  {
    stage: 3,
    definition: "AI becoming a named priority. Dedicated leadership appointed, practice or service line announced, some proprietary tooling in development or early deployment, active hiring of technical talent.",
    evidence: "Named AI leader hired; practice announced; 1\u20133 technical job postings; internal tool referenced but limited public detail on adoption; thought leadership becoming regular; no published case studies.",
  },
  {
    stage: 4,
    definition: "AI embedded in operations and client delivery at meaningful scale. Proprietary platform in production use across the firm, dedicated engineering team, active client-facing practice with defined service lines, evidence of commercial traction.",
    evidence: "Proprietary platform used at scale; 10+ technical staff evident; multiple AI-specific hires; defined service pillars; some client references or proof points; regular AI thought leadership; acquisitions or partnerships reinforcing capability.",
  },
  {
    stage: 5,
    definition: "AI is a core strategic differentiator. Deep proprietary technology, significant engineering organization, measurable commercial AI revenue, published case studies, recognized market position as AI-forward, governance framework in place.",
    evidence: "Large engineering team (50+); named AI products with external users; published case studies; AI revenue identifiable; formal governance/ethics framework; industry recognition; strategic acquisitions.",
  },
];

const DIMENSION_ANCHORS: { name: string; anchors: string }[] = [
  { name: "Client-Facing AI Offering", anchors: "1 = None visible. 2 = AI mentioned in generic service descriptions. 3 = Named AI practice or service line announced. 4 = Defined service pillars with distinct client propositions. 5 = Defined pillars + published case studies or named client proof points." },
  { name: "Proprietary AI Technology", anchors: "1 = No evidence. 2 = Generic references to \u201Cusing AI\u201D without specifics. 3 = Named internal tool in development or early use. 4 = Proprietary platform in production across the firm. 5 = Proprietary platform at scale + client-facing AI products." },
  { name: "AI Leadership & Governance", anchors: "1 = No named AI leader. 2 = AI mentioned in a senior leader\u2019s broader mandate. 3 = Dedicated AI leader appointed. 4 = Dedicated leader + supporting organizational structure. 5 = Full AI leadership structure + visible governance/responsible AI framework." },
  { name: "Technical Talent & Engineering", anchors: "1 = No evidence. 2 = 1\u20132 technical roles evident. 3 = Small team (3\u201310) with active hiring. 4 = Established team (10\u201330) with specialized roles. 5 = Large engineering organization (30+) with team leads, product managers, and multiple active postings." },
  { name: "AI Partnerships & Ecosystem", anchors: "1 = None identified. 2 = Generic technology vendor relationships. 3 = 1\u20132 named partnerships with AI relevance. 4 = Multiple strategic partnerships across technology, data, or research. 5 = Deep, named strategic alliances with major AI ecosystem players." },
  { name: "Thought Leadership & Content", anchors: "1 = None. 2 = Occasional mentions in broader content. 3 = Regular AI-themed content. 4 = Dedicated AI content franchise. 5 = Industry-recognized AI thought leadership with original research and major speaking engagements." },
  { name: "Acquisitions & Investment", anchors: "1 = None. 2 = Acquisitions in adjacent areas without explicit AI focus. 3 = 1 acquisition with clear AI relevance. 4 = Multiple acquisitions building an AI/data capability stack. 5 = Strategic M&A program systematically building AI capabilities." },
  { name: "Internal AI Adoption", anchors: "1 = No evidence. 2 = Generic claims about \u201Cusing AI.\u201D 3 = Named internal tool(s) with some adoption evidence. 4 = Platform used at scale with adoption management. 5 = AI deeply embedded in delivery model with measurable productivity/quality evidence." },
  { name: "Commercial Momentum", anchors: "1 = No evidence. 2 = Practice announced but no traction signals. 3 = Active pitch/business development. 4 = Indirect evidence of client engagements. 5 = Named clients, published case studies, or identifiable AI revenue." },
  { name: "Strategic Coherence", anchors: "1 = No discernible strategy. 2 = Scattered, unconnected AI activities. 3 = Emerging coherence with a central narrative but gaps. 4 = Clear strategy connecting internal tooling, client offering, talent, and positioning. 5 = Fully integrated AI strategy with visible board/CEO sponsorship and execution roadmap." },
];

const CONFIDENCE_GRADES: { grade: ConfidenceGrade; definition: string }[] = [
  { grade: "A", definition: "Multiple independent primary sources confirm key claims. Official announcements, verifiable job postings, named leaders, third-party coverage all align." },
  { grade: "B", definition: "Primary sources confirm core claims but some dimensions rely on inference. Key gaps exist (e.g., team size, commercial traction) but the overall picture is supported." },
  { grade: "C", definition: "Evidence is thin, relies heavily on marketing language, or comes predominantly from self-reported sources without independent corroboration. Key claims are plausible but unverified." },
  { grade: "D", definition: "Very little public information available. Firm may be active in AI but evidence base is too thin to assess meaningfully. Rating reflects information scarcity, not necessarily firm inactivity." },
];

export default function MethodologyPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-10">
      <div>
        <h1 className="text-2xl font-bold">Methodology</h1>
        <p className="text-muted-foreground mt-1">
          How we research, evaluate, and score each firm
        </p>
      </div>

      {/* Overview */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold border-b pb-2">Overview</h2>
        <p className="text-sm leading-relaxed">
          Each firm is assessed using a three-part evaluation architecture designed for board-level decision-making. The model prioritizes evidence over narrative, separates what we know from what we infer, and explicitly flags where information is limited. The three frameworks work together: the Maturity Model provides a headline classification, the Dimension Scorecard enables granular comparison, and the Evidence Confidence Index prevents the common trap of treating well-marketed firms as equivalent to those with verified, deep capability.
        </p>
      </section>

      {/* Research Process */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold border-b pb-2">Research Process</h2>
        <p className="text-sm leading-relaxed">
          For each firm, a comprehensive deep research report is generated covering nine structured sections: Executive Summary, AI Fact Base, Internal AI Usage Analysis, Client-Facing AI Analysis, Leadership &amp; Organizational Structure, Partnerships &amp; Ecosystem, Positioning &amp; Messaging, Timeline Since 2023, and Bottom-Line Assessment.
        </p>
        <div className="border rounded-lg p-4 space-y-2">
          <h3 className="font-medium text-sm">Source Hierarchy</h3>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li><strong>Primary sources:</strong> Official firm websites, service pages, leadership bios, press releases, job postings, event pages, official videos/podcasts, LinkedIn posts from senior leaders</li>
            <li><strong>High-quality secondary sources:</strong> Major business press, industry trades, conference sites, credible advisory/consulting coverage</li>
            <li><strong>Social &amp; media platforms:</strong> YouTube, X, LinkedIn, and Reddit searched for executive appearances, events, and third-party interviews</li>
          </ol>
        </div>
        <div className="border rounded-lg p-4 space-y-2">
          <h3 className="font-medium text-sm">Research Standards</h3>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>All major claims include dates and source attribution</li>
            <li>Verified fact is clearly distinguished from inference</li>
            <li>Where evidence is limited, ambiguous, or absent, this is noted explicitly</li>
            <li>Gaps are not filled with assumptions</li>
            <li>Firms are assessed independently — no cross-firm comparisons within individual reports</li>
          </ul>
        </div>
      </section>

      {/* Framework 1 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold border-b pb-2">Framework 1: AI Maturity Model</h2>
        <p className="text-sm leading-relaxed">
          Each firm is classified into one of five stages based on the totality of evidence. The classification rule is conservative: a firm is placed at the <strong>lowest stage at which all criteria are met</strong>, not the highest individual signal. A firm with a high-profile announcement but no engineering team does not receive credit for a higher stage.
        </p>
        <div className="space-y-3">
          {MATURITY_STAGES.map((s) => (
            <div key={s.stage} className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">
                  {s.stage}
                </span>
                <h3 className="font-semibold">{MATURITY_LABELS[s.stage]}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{s.definition}</p>
              <p className="text-xs text-muted-foreground mt-2">
                <span className="font-medium">Typical evidence:</span> {s.evidence}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Framework 2 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold border-b pb-2">Framework 2: Dimension Scorecard</h2>
        <p className="text-sm leading-relaxed">
          Ten dimensions are scored on a 1&ndash;5 scale using specific anchors tied to the evidence in each research report. Dimensions 1, 2, 4, and 9 (Client-Facing AI Offering, Proprietary AI Technology, Technical Talent &amp; Engineering, and Commercial Momentum) receive <strong>1.5x weight</strong> in the composite score because they are the hardest to fake and the most commercially meaningful. The maximum unweighted score is 50; the maximum weighted score is 56.
        </p>
        <div className="space-y-2">
          {DIMENSION_ANCHORS.map((d, i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-muted-foreground w-5">{i + 1}.</span>
                <h3 className="font-medium text-sm">
                  {d.name}
                  {(WEIGHTED_DIMENSIONS as readonly number[]).includes(i) && (
                    <span className="ml-2 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">1.5x weight</span>
                  )}
                </h3>
              </div>
              <p className="text-xs text-muted-foreground ml-7">{d.anchors}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Framework 3 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold border-b pb-2">Framework 3: Evidence Confidence Index</h2>
        <p className="text-sm leading-relaxed">
          This is the epistemic honesty layer. For each firm, we assess the quality and density of available evidence so that decision-makers can distinguish between &ldquo;we know this firm is advanced&rdquo; and &ldquo;this firm appears advanced but we&rsquo;re working with thin evidence.&rdquo;
        </p>
        <div className="space-y-2">
          {CONFIDENCE_GRADES.map((c) => (
            <div key={c.grade} className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-muted rounded px-2 py-0.5 font-mono font-bold text-sm">{c.grade}</span>
                <h3 className="font-medium text-sm">{CONFIDENCE_LABELS[c.grade]}</h3>
              </div>
              <p className="text-xs text-muted-foreground">{c.definition}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Archetypes */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold border-b pb-2">Archetype Classification</h2>
        <p className="text-sm leading-relaxed">
          Based on their score profiles across all ten dimensions, firms are classified into one of four strategic archetypes. These groupings reveal distinct patterns in how firms approach AI — whether through building, positioning, acquiring, or not yet engaging.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(Object.entries(ARCHETYPE_LABELS) as [Archetype, string][]).map(([key, label]) => {
            const descriptions: Record<Archetype, string> = {
              "technology-builder": "High scores on Proprietary AI Technology and Technical Talent & Engineering. These firms invest in building their own AI platforms and capabilities, typically with dedicated engineering teams.",
              "advisory-positioner": "Strong on Thought Leadership & Content and market positioning, but lighter on proprietary technology and engineering investment. These firms lead with strategic narrative rather than technical depth.",
              "acquirer": "Building AI capabilities primarily through M&A, partnerships, and acquisitions rather than organic development. May score well on partnerships and investment dimensions.",
              "dormant-lagging": "Minimal visible AI activity across most dimensions. The firm may be active internally, but public evidence is insufficient to classify higher.",
            };
            return (
              <div key={key} className="border rounded-lg p-4">
                <h3 className="font-medium text-sm">{label}</h3>
                <p className="text-xs text-muted-foreground mt-1">{descriptions[key]}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How Frameworks Combine */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold border-b pb-2">How the Frameworks Combine</h2>
        <div className="space-y-2 text-sm leading-relaxed">
          <p>
            The three frameworks produce four cross-firm deliverables:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li><strong>Summary Matrix</strong> — All firms on one page: Maturity Stage, Composite Score, and Evidence Confidence. The instant landscape view.</li>
            <li><strong>Dimension Heatmap</strong> — Firms as rows, 10 dimensions as columns, color-coded 1&ndash;5. Reveals which firms lead on which capabilities and where the field clusters or diverges.</li>
            <li><strong>Archetype Classification</strong> — Grouping firms into strategic archetypes based on score profiles, surfacing distinct strategic approaches to AI.</li>
            <li><strong>Key Findings Narrative</strong> — Board-ready observations synthesizing the cross-firm analysis: where the sector stands, which firms are genuine leaders vs. marketing-forward, and what the trajectory suggests.</li>
          </ol>
        </div>
      </section>

      {/* Limitations */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold border-b pb-2">Limitations &amp; Caveats</h2>
        <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
          <li>Evaluations are based on publicly available evidence. Firms with strong internal AI programs but limited public disclosure may score lower than their actual capability warrants.</li>
          <li>The Evidence Confidence Index exists specifically to flag this risk. A low confidence rating (C or D) reflects information scarcity, not necessarily firm inactivity.</li>
          <li>Scores are point-in-time assessments. The advisory sector&rsquo;s AI landscape is evolving rapidly; scores may shift materially within quarters.</li>
          <li>Research reports draw on web-accessible sources including firm websites, press coverage, job postings, social media, and event records. Paywalled or internal-only materials are not included.</li>
          <li>Weighted scoring (1.5x on dimensions 1, 2, 4, and 9) reflects a view that commercial substance outweighs positioning. Alternative weightings can be explored via the AI Chat interface.</li>
        </ul>
      </section>
    </div>
  );
}

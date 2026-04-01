import { config } from "dotenv";
const envResult = config({ path: ".env.local" });

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";
import * as schema from "../src/lib/db/schema";
import { FIRMS } from "../src/lib/firms";
import { computeUnweightedScore, computeWeightedScore } from "../src/lib/types";

const apiKey = envResult.parsed?.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
if (!apiKey) throw new Error("ANTHROPIC_API_KEY not found");
const anthropic = new Anthropic({ apiKey });
const MODEL = "claude-opus-4-20250514";
const REPORTS_DIR = path.join(process.cwd(), "content", "reports");

const client = createClient({
  url: envResult.parsed?.TURSO_DATABASE_URL || process.env.TURSO_DATABASE_URL!,
  authToken: envResult.parsed?.TURSO_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN,
});
const db = drizzle(client, { schema });

function buildRescorePrompt(reportContent: string, firmName: string): string {
  return `You are a senior strategy analyst. You have a deep research report on ${firmName}. Score ONLY the following two dimensions on a 1-5 scale:

## RESEARCH REPORT

${reportContent}

## DIMENSIONS TO SCORE

**Dimension 5: AI Partnerships, Acquisitions & Ecosystem**
This dimension now combines partnerships AND acquisitions/M&A into a single measure.
1 = No partnerships or acquisitions identified.
2 = Generic vendor relationships or adjacent acquisitions without explicit AI focus.
3 = 1-2 named AI partnerships or 1 AI-relevant acquisition.
4 = Multiple strategic partnerships and/or acquisitions building an AI capability stack.
5 = Deep strategic alliances with major AI ecosystem players combined with targeted M&A systematically reinforcing AI capabilities.

**Dimension 7: Case Studies & Evidence**
This dimension measures the degree to which the firm has disclosed concrete proof of AI-related success — whether internal adoption of tools or client work.
1 = No published case studies or proof points of any kind.
2 = Vague references to AI success without specifics (e.g., "we use AI to improve efficiency" with no detail).
3 = 1-2 named examples of AI-driven work (internal productivity gains, specific tool deployments, or client engagements described with enough detail to verify).
4 = Multiple published case studies or measurable outcomes demonstrating AI impact (internal or external).
5 = Extensive published evidence with named clients, quantified results, and/or industry recognition of AI-driven success.

## INSTRUCTIONS

Return ONLY a JSON object:
\`\`\`json
{
  "dim5": <1-5>,
  "dim7": <1-5>
}
\`\`\`

Be rigorous. Score based on evidence in the report. If evidence is thin, score low.`;
}

async function main() {
  console.log("=== Targeted Re-scoring: dim5 (Partnerships+Acquisitions) + dim7 (Case Studies) ===\n");

  for (const firm of FIRMS) {
    const reportPath = path.join(REPORTS_DIR, `${firm.slug}.md`);
    if (!fs.existsSync(reportPath)) {
      console.log(`[SKIP] ${firm.name} - no report`);
      continue;
    }

    // Get firm from DB
    const dbFirm = await db.select().from(schema.firms).where(eq(schema.firms.slug, firm.slug)).limit(1);
    if (!dbFirm[0]) {
      console.log(`[SKIP] ${firm.name} - not in DB`);
      continue;
    }

    // Get existing evaluation
    const existingEval = await db.select().from(schema.evaluations).where(eq(schema.evaluations.firmId, dbFirm[0].id)).limit(1);
    if (!existingEval[0]) {
      console.log(`[SKIP] ${firm.name} - no evaluation`);
      continue;
    }

    console.log(`[RESCORE] ${firm.name}...`);

    try {
      const reportContent = fs.readFileSync(reportPath, "utf-8");
      const prompt = buildRescorePrompt(reportContent.substring(0, 30000), firm.name);

      const response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 256,
        messages: [{ role: "user", content: prompt }],
      });

      const textBlock = response.content.find((b) => b.type === "text");
      if (!textBlock || textBlock.type !== "text") throw new Error("No text");

      const jsonMatch = textBlock.text.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, textBlock.text];
      const parsed = JSON.parse(jsonMatch[1]!.trim());

      if (parsed.dim5 < 1 || parsed.dim5 > 5 || parsed.dim7 < 1 || parsed.dim7 > 5) {
        throw new Error(`Invalid scores: dim5=${parsed.dim5}, dim7=${parsed.dim7}`);
      }

      // Recompute composites with old dims 1-4,6,8-10 + new dim5,dim7
      const e = existingEval[0];
      const dims = [e.dim1, e.dim2, e.dim3, e.dim4, parsed.dim5, e.dim6, parsed.dim7, e.dim8, e.dim9, e.dim10];

      await db.update(schema.evaluations)
        .set({
          dim5: parsed.dim5,
          dim7: parsed.dim7,
          compositeScoreUnweighted: computeUnweightedScore(dims),
          compositeScoreWeighted: computeWeightedScore(dims),
        })
        .where(eq(schema.evaluations.id, e.id));

      console.log(`  dim5: ${e.dim5} → ${parsed.dim5} | dim7: ${e.dim7} → ${parsed.dim7} | weighted: ${e.compositeScoreWeighted} → ${computeWeightedScore(dims)}`);

      await new Promise((r) => setTimeout(r, 1000));
    } catch (error) {
      console.error(`  [ERROR] ${firm.name}: ${error}`);
    }
  }

  console.log("\n=== Re-scoring Complete ===");
}

main().catch(console.error);

import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";
import * as schema from "../src/lib/db/schema";
import { FIRMS } from "../src/lib/firms";
import { buildScoringPrompt } from "./prompts/scoring";
import { computeUnweightedScore, computeWeightedScore } from "../src/lib/types";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
const MODEL = "claude-opus-4-20250514";
const REPORTS_DIR = path.join(process.cwd(), "content", "reports");

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const db = drizzle(client, { schema });

interface ScoringResult {
  maturityStage: number;
  maturityRationale: string;
  dimensions: {
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
  };
  confidenceGrade: string;
  confidenceRationale: string;
  archetype: string;
}

function parseScoringResponse(text: string): ScoringResult {
  // Extract JSON from the response (may be wrapped in markdown code block)
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, text];
  const jsonStr = jsonMatch[1]!.trim();
  const parsed = JSON.parse(jsonStr);

  // Validate
  if (parsed.maturityStage < 1 || parsed.maturityStage > 5) {
    throw new Error(`Invalid maturity stage: ${parsed.maturityStage}`);
  }
  for (let i = 1; i <= 10; i++) {
    const val = parsed.dimensions[`dim${i}`];
    if (val < 1 || val > 5) {
      throw new Error(`Invalid dimension ${i} score: ${val}`);
    }
  }
  if (!["A", "B", "C", "D"].includes(parsed.confidenceGrade)) {
    throw new Error(`Invalid confidence grade: ${parsed.confidenceGrade}`);
  }
  const validArchetypes = [
    "technology-builder",
    "advisory-positioner",
    "acquirer",
    "dormant-lagging",
  ];
  if (!validArchetypes.includes(parsed.archetype)) {
    throw new Error(`Invalid archetype: ${parsed.archetype}`);
  }

  return parsed;
}

async function scoreFirm(
  firmName: string,
  reportContent: string
): Promise<ScoringResult> {
  const prompt = buildScoringPrompt(reportContent, firmName);

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text in response");
  }

  return parseScoringResponse(textBlock.text);
}

async function main() {
  console.log("=== Evaluation Scoring Pipeline ===\n");

  // First, ensure all firms are in the database
  console.log("Seeding firms table...");
  for (const firm of FIRMS) {
    const existing = await db
      .select()
      .from(schema.firms)
      .where(eq(schema.firms.slug, firm.slug))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(schema.firms).values({
        slug: firm.slug,
        name: firm.name,
        shortName: firm.shortName,
        group: firm.group,
        reportPath: `${firm.slug}.md`,
      });
      console.log(`  Inserted: ${firm.name}`);
    }
  }

  console.log("\nScoring firms...\n");

  for (const firm of FIRMS) {
    // Read report
    const reportPath = path.join(REPORTS_DIR, `${firm.slug}.md`);
    if (!fs.existsSync(reportPath)) {
      console.log(`[SKIP] ${firm.name} - no report file`);
      continue;
    }

    // Check if already scored
    const dbFirm = await db
      .select()
      .from(schema.firms)
      .where(eq(schema.firms.slug, firm.slug))
      .limit(1);

    if (!dbFirm[0]) continue;

    const existingEval = await db
      .select()
      .from(schema.evaluations)
      .where(eq(schema.evaluations.firmId, dbFirm[0].id))
      .limit(1);

    if (existingEval.length > 0) {
      console.log(`[SKIP] ${firm.name} - already scored`);
      continue;
    }

    console.log(`[SCORING] ${firm.name}...`);
    const startTime = Date.now();

    try {
      const reportContent = fs.readFileSync(reportPath, "utf-8");
      const result = await scoreFirm(firm.name, reportContent);

      const dims = [
        result.dimensions.dim1,
        result.dimensions.dim2,
        result.dimensions.dim3,
        result.dimensions.dim4,
        result.dimensions.dim5,
        result.dimensions.dim6,
        result.dimensions.dim7,
        result.dimensions.dim8,
        result.dimensions.dim9,
        result.dimensions.dim10,
      ];

      await db.insert(schema.evaluations).values({
        firmId: dbFirm[0].id,
        maturityStage: result.maturityStage,
        maturityRationale: result.maturityRationale,
        dim1: result.dimensions.dim1,
        dim2: result.dimensions.dim2,
        dim3: result.dimensions.dim3,
        dim4: result.dimensions.dim4,
        dim5: result.dimensions.dim5,
        dim6: result.dimensions.dim6,
        dim7: result.dimensions.dim7,
        dim8: result.dimensions.dim8,
        dim9: result.dimensions.dim9,
        dim10: result.dimensions.dim10,
        compositeScoreUnweighted: computeUnweightedScore(dims),
        compositeScoreWeighted: computeWeightedScore(dims),
        confidenceGrade: result.confidenceGrade,
        confidenceRationale: result.confidenceRationale,
        archetype: result.archetype,
      });

      const elapsed = Math.round((Date.now() - startTime) / 1000);
      console.log(
        `  [DONE] Stage ${result.maturityStage} | Score ${computeWeightedScore(dims)} | ${result.confidenceGrade} | ${elapsed}s`
      );

      // Rate limit - 2s between calls
      await new Promise((r) => setTimeout(r, 2000));
    } catch (error) {
      console.error(`  [ERROR] ${firm.name}: ${error}`);
    }
  }

  console.log("\n=== Scoring Complete ===");
}

main().catch(console.error);

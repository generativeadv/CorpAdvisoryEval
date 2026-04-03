import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { comparisons } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getAnthropicClient, CLAUDE_MODEL } from "@/lib/anthropic";
import { getFirmBySlug, getFirmReportContent } from "@/lib/queries";
import { buildComparisonPrompt } from "../../../../scripts/prompts/comparison";
import { getDimensionScores } from "@/lib/types";

export const maxDuration = 120;

function makeSlug(firmSlugs: string[]): string {
  return [...firmSlugs].sort().join("_");
}

export async function GET() {
  const all = await db.select().from(comparisons);
  return NextResponse.json(all);
}

export async function POST(req: Request) {
  const { firmSlugs } = (await req.json()) as { firmSlugs: string[] };

  if (!firmSlugs || firmSlugs.length !== 3) {
    return NextResponse.json({ error: "Exactly 3 firm slugs required" }, { status: 400 });
  }

  const slug = makeSlug(firmSlugs);

  // Check if comparison already exists
  const existing = await db
    .select()
    .from(comparisons)
    .where(eq(comparisons.slug, slug))
    .limit(1);

  if (existing[0]) {
    if (existing[0].status === "complete") {
      return NextResponse.json({ redirect: slug });
    }
    if (existing[0].status === "generating") {
      return NextResponse.json({ redirect: slug, generating: true });
    }
  }

  // Fetch firm data + reports
  const firmContexts = await Promise.all(
    firmSlugs.map(async (s) => {
      const firm = await getFirmBySlug(s);
      const report = await getFirmReportContent(s);
      return { firm, report };
    })
  );

  const invalidFirm = firmContexts.find((f) => !f.firm || !f.firm.evaluation);
  if (invalidFirm) {
    return NextResponse.json(
      { error: "One or more firms not found or not evaluated" },
      { status: 400 }
    );
  }

  const firmNames = firmContexts.map((f) => f.firm!.name).join(", ");

  // Insert generating row
  await db.insert(comparisons).values({
    slug,
    firmSlugs: JSON.stringify(firmSlugs.sort()),
    firmNames,
    status: "generating",
  });

  // Kick off Claude generation (don't await — let client poll)
  const validContexts = firmContexts as { firm: NonNullable<(typeof firmContexts)[0]["firm"]>; report: string | null }[];
  generateComparison(slug, validContexts).catch(console.error);

  return NextResponse.json({ redirect: slug, generating: true });
}

async function generateComparison(
  slug: string,
  firmContexts: { firm: NonNullable<Awaited<ReturnType<typeof getFirmBySlug>>>; report: string | null }[]
) {
  try {
    const anthropic = getAnthropicClient();

    const promptFirms = firmContexts.map((fc) => {
      const f = fc.firm!;
      const e = f.evaluation!;
      // Trim report to ~5000 words (first ~25000 chars)
      const excerpt = fc.report
        ? fc.report.substring(0, 25000)
        : "No research report available.";

      return {
        name: f.name,
        shortName: f.shortName,
        group: f.group,
        evaluation: e,
        reportExcerpt: excerpt,
      };
    });

    const prompt = buildComparisonPrompt(promptFirms);

    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const content = textBlock?.type === "text" ? textBlock.text : "Error: No content generated.";

    await db
      .update(comparisons)
      .set({
        content,
        status: "complete",
        generatedAt: new Date().toISOString(),
      })
      .where(eq(comparisons.slug, slug));
  } catch (error) {
    console.error("Comparison generation failed:", error);
    await db
      .update(comparisons)
      .set({
        content: `Error generating comparison: ${String(error)}`,
        status: "error",
      })
      .where(eq(comparisons.slug, slug));
  }
}

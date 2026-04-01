import { config } from "dotenv";
config({ path: ".env.local" });
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { FIRMS } from "../src/lib/firms";
import { buildResearchPrompt } from "./prompts/deep-research";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const REPORTS_DIR = path.join(process.cwd(), "content", "reports");
const CONCURRENCY = 2; // run 2 at a time to stay within TPM limits

fs.mkdirSync(REPORTS_DIR, { recursive: true });

const REQUIRED_SECTION_PATTERNS = [
  /section\s*1.*executive\s*summary/i,
  /section\s*2.*fact\s*base/i,
  /section\s*3.*internal\s*ai/i,
  /section\s*4.*client.?facing/i,
  /section\s*5.*leadership/i,
  /section\s*6.*partnership/i,
  /section\s*7.*positioning/i,
  /section\s*8.*timeline/i,
  /section\s*9.*bottom.?line/i,
];

function validateReport(content: string): string[] {
  const sectionNames = ["Exec Summary", "Fact Base", "Internal AI", "Client-Facing", "Leadership", "Partnerships", "Positioning", "Timeline", "Bottom-Line"];
  const missing: string[] = [];
  REQUIRED_SECTION_PATTERNS.forEach((pattern, i) => {
    if (!pattern.test(content)) missing.push(sectionNames[i]);
  });
  return missing;
}

async function generateOne(firmName: string, shortName: string, slug: string): Promise<{ slug: string; status: string; elapsed: number; chars?: number; issues?: string[] }> {
  const filePath = path.join(REPORTS_DIR, `${slug}.md`);
  if (fs.existsSync(filePath)) {
    console.log(`[SKIP] ${firmName}`);
    return { slug, status: "skipped", elapsed: 0 };
  }

  console.log(`[START] ${firmName}`);
  const start = Date.now();

  try {
    const prompt = buildResearchPrompt(firmName, shortName, slug);

    // Fire off the request
    const response = await openai.responses.create({
      model: "o3-deep-research",
      input: prompt,
      tools: [{ type: "web_search_preview" }],
      background: true,
    });

    // Poll for completion
    let result = response;
    let polls = 0;
    while (result.status !== "completed" && result.status !== "failed") {
      polls++;
      await new Promise((r) => setTimeout(r, 15000)); // 15s between polls
      result = await openai.responses.retrieve(result.id);
      if (polls % 4 === 0) {
        console.log(`  [${slug}] still ${result.status} (${Math.round((Date.now() - start) / 1000)}s)...`);
      }
    }

    if (result.status === "failed") {
      const elapsed = Math.round((Date.now() - start) / 1000);
      const errMsg = (result as unknown as { error?: { message?: string } }).error?.message || "Unknown error";
      console.log(`  [${slug}] FAILED (${elapsed}s): ${errMsg}`);
      return { slug, status: "error", elapsed, issues: [errMsg] };
    }

    // Extract text
    const textOutput = result.output.find((item: { type: string }) => item.type === "message");
    if (!textOutput || textOutput.type !== "message") {
      throw new Error("No message output");
    }
    const textContent = textOutput.content.find((c: { type: string }) => c.type === "output_text");
    if (!textContent || textContent.type !== "output_text") {
      throw new Error("No text content");
    }

    const content = textContent.text;
    const elapsed = Math.round((Date.now() - start) / 1000);

    // Validate
    const missing = validateReport(content);
    if (missing.length > 0) {
      console.log(`  [${slug}] DONE with warnings (${elapsed}s, ${content.length} chars) - missing: ${missing.join(", ")}`);
    } else {
      console.log(`  [${slug}] DONE (${elapsed}s, ${content.length} chars)`);
    }

    fs.writeFileSync(filePath, content, "utf-8");
    return { slug, status: missing.length > 0 ? "warning" : "success", elapsed, chars: content.length, issues: missing.length > 0 ? missing : undefined };
  } catch (error) {
    const elapsed = Math.round((Date.now() - start) / 1000);
    console.log(`  [${slug}] ERROR (${elapsed}s): ${error}`);
    return { slug, status: "error", elapsed, issues: [String(error)] };
  }
}

async function main() {
  console.log(`=== Parallel Deep Research Generation (concurrency: ${CONCURRENCY}) ===\n`);

  // Filter to firms that need reports
  const needed = FIRMS.filter((f) => !fs.existsSync(path.join(REPORTS_DIR, `${f.slug}.md`)));
  console.log(`${FIRMS.length} total firms, ${FIRMS.length - needed.length} already done, ${needed.length} to generate\n`);

  if (needed.length === 0) {
    console.log("All reports exist. Nothing to do.");
    return;
  }

  // Process in batches of CONCURRENCY
  const results: { slug: string; status: string; elapsed: number; chars?: number; issues?: string[] }[] = [];

  for (let i = 0; i < needed.length; i += CONCURRENCY) {
    const batch = needed.slice(i, i + CONCURRENCY);
    console.log(`\n--- Batch ${Math.floor(i / CONCURRENCY) + 1}: ${batch.map((f) => f.shortName).join(", ")} ---\n`);

    const batchResults = await Promise.all(
      batch.map((firm) => generateOne(firm.name, firm.shortName, firm.slug))
    );
    results.push(...batchResults);
  }

  // Summary
  console.log("\n=== Summary ===");
  const success = results.filter((r) => r.status === "success").length;
  const warnings = results.filter((r) => r.status === "warning").length;
  const errors = results.filter((r) => r.status === "error").length;
  const skipped = results.filter((r) => r.status === "skipped").length;
  console.log(`Success: ${success} | Warnings: ${warnings} | Errors: ${errors} | Skipped: ${skipped}`);

  if (errors > 0) {
    console.log("\nErrors:");
    results.filter((r) => r.status === "error").forEach((r) => {
      console.log(`  ${r.slug}: ${r.issues?.join(", ")}`);
    });
  }
}

main().catch(console.error);

import "dotenv/config";
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { FIRMS } from "../src/lib/firms";
import { buildResearchPrompt } from "./prompts/deep-research";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const REPORTS_DIR = path.join(process.cwd(), "content", "reports");

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

function validateReport(content: string): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  const sectionNames = [
    "Executive Summary",
    "AI Fact Base",
    "Internal AI Usage",
    "Client-Facing AI",
    "Leadership & Org",
    "Partnerships",
    "Positioning",
    "Timeline",
    "Bottom-Line Assessment",
  ];

  REQUIRED_SECTION_PATTERNS.forEach((pattern, i) => {
    if (!pattern.test(content)) {
      missing.push(sectionNames[i]);
    }
  });

  return { valid: missing.length === 0, missing };
}

async function generateReport(
  firmName: string,
  shortName: string,
  slug: string
): Promise<string> {
  const prompt = buildResearchPrompt(firmName, shortName);

  console.log(`  Sending to o3-deep-research (background mode)...`);

  // Use the Responses API with background mode for long-running deep research
  const response = await openai.responses.create({
    model: "o3-deep-research",
    input: prompt,
    tools: [{ type: "web_search_preview" }],
    background: true,
  });

  // Poll for completion
  let result = response;
  let pollCount = 0;
  while (result.status !== "completed" && result.status !== "failed") {
    pollCount++;
    const waitTime = Math.min(30000, 10000 + pollCount * 2000); // escalating wait
    console.log(
      `  Status: ${result.status} (poll #${pollCount}, waiting ${waitTime / 1000}s)...`
    );
    await new Promise((r) => setTimeout(r, waitTime));
    result = await openai.responses.retrieve(result.id);
  }

  if (result.status === "failed") {
    throw new Error(`Deep research failed for ${firmName}: ${JSON.stringify(result)}`);
  }

  // Extract the text content from the response
  const textOutput = result.output.find(
    (item: { type: string }) => item.type === "message"
  );
  if (!textOutput || textOutput.type !== "message") {
    throw new Error(`No message output found for ${firmName}`);
  }

  const textContent = textOutput.content.find(
    (c: { type: string }) => c.type === "output_text"
  );
  if (!textContent || textContent.type !== "output_text") {
    throw new Error(`No text content found for ${firmName}`);
  }

  return textContent.text;
}

async function main() {
  console.log("=== Deep Research Report Generation ===\n");
  console.log(`Total firms: ${FIRMS.length}\n`);

  // Ensure output directory exists
  fs.mkdirSync(REPORTS_DIR, { recursive: true });

  const results: { slug: string; status: string; time?: number; issues?: string[] }[] =
    [];

  for (const firm of FIRMS) {
    const filePath = path.join(REPORTS_DIR, `${firm.slug}.md`);

    // Skip if report already exists
    if (fs.existsSync(filePath)) {
      console.log(`[SKIP] ${firm.name} - report already exists`);
      results.push({ slug: firm.slug, status: "skipped" });
      continue;
    }

    console.log(`\n[START] ${firm.name} (${firm.slug})`);
    const startTime = Date.now();

    try {
      const content = await generateReport(firm.name, firm.shortName, firm.slug);
      const elapsed = Math.round((Date.now() - startTime) / 1000);

      // Validate structure
      const validation = validateReport(content);
      if (!validation.valid) {
        console.log(
          `  [WARN] Missing sections: ${validation.missing.join(", ")}`
        );
      }

      // Write report
      fs.writeFileSync(filePath, content, "utf-8");
      console.log(
        `  [DONE] ${firm.name} - ${elapsed}s - ${content.length} chars`
      );

      results.push({
        slug: firm.slug,
        status: validation.valid ? "success" : "warning",
        time: elapsed,
        issues: validation.valid ? undefined : validation.missing,
      });
    } catch (error) {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      console.error(`  [ERROR] ${firm.name} - ${elapsed}s - ${error}`);
      results.push({
        slug: firm.slug,
        status: "error",
        time: elapsed,
        issues: [String(error)],
      });
    }
  }

  // Summary
  console.log("\n=== Generation Summary ===");
  const success = results.filter((r) => r.status === "success").length;
  const warnings = results.filter((r) => r.status === "warning").length;
  const errors = results.filter((r) => r.status === "error").length;
  const skipped = results.filter((r) => r.status === "skipped").length;
  console.log(`Success: ${success} | Warnings: ${warnings} | Errors: ${errors} | Skipped: ${skipped}`);

  if (warnings > 0 || errors > 0) {
    console.log("\nIssues:");
    results
      .filter((r) => r.issues)
      .forEach((r) => {
        console.log(`  ${r.slug}: ${r.issues!.join(", ")}`);
      });
  }
}

main().catch(console.error);

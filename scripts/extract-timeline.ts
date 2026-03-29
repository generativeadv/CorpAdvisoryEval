import { config } from "dotenv";
config({ path: ".env.local" });

import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import { FIRMS } from "../src/lib/firms";

const envResult = config({ path: ".env.local" });
const apiKey =
  envResult.parsed?.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
if (!apiKey) throw new Error("ANTHROPIC_API_KEY not found");
const anthropic = new Anthropic({ apiKey });

const REPORTS_DIR = path.join(process.cwd(), "content", "reports");
const OUTPUT_PATH = path.join(process.cwd(), "src", "lib", "timeline-data.json");

interface TimelineEvent {
  firm: string;
  firmSlug: string;
  date: string; // ISO-ish: "2023-01", "2023-Q1", "2023-06-15"
  quarter: string; // "2023-Q1" etc
  type: string; // normalized: "Action" | "Thought Leadership" | "Hiring" | "Partnership" | "Acquisition" | "Product Launch"
  description: string;
}

function extractTimelineSection(content: string): string {
  // Try multiple patterns since report formats vary
  const patterns = [
    /(?:#{1,3}\s*Section\s*8[:\s]*[^\n]*\n)([\s\S]*?)(?=#{1,3}\s*(?:Section\s*9|Bottom))/i,
    /(?:#{1,3}\s*Timeline\s+Since[^\n]*\n)([\s\S]*?)(?=#{1,3}\s*(?:Section\s*9|Bottom))/i,
    /(?:#{1,3}\s*(?:Section\s*8|Timeline)[^\n]*\n)([\s\S]*?)(?=#{1,3}\s)/i,
  ];
  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match && match[1].trim().length > 50) return match[1].trim();
  }
  return "";
}

async function parseTimelineWithClaude(
  firmName: string,
  timelineText: string
): Promise<TimelineEvent[]> {
  if (!timelineText || timelineText.length < 50) return [];

  const response = await anthropic.messages.create({
    model: "claude-opus-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `Extract all timeline events from this section of a research report about ${firmName}. The format varies (tables, bullets, numbered lists). For each event, extract:

- date: The date as precisely as possible. Use ISO format: "2023-01-15" for specific dates, "2023-01" for month-level, "2023-Q1" for quarter-level. If it says "Early 2023" use "2023-Q1", "Mid 2024" use "2024-Q2", "Late 2025" use "2025-Q4".
- type: Normalize to one of these categories exactly:
  - "Action" for launches, platform deployments, practice announcements, organizational changes
  - "Thought Leadership" for blog posts, podcasts, speaking events, reports, op-eds, newsletters
  - "Hiring" for job postings, new hires, leadership appointments
  - "Partnership" for alliances, collaborations, vendor relationships
  - "Acquisition" for M&A, investments
- description: One sentence summary of the event (strip source citations/URLs).

Return a JSON array. If no events can be extracted, return [].

Timeline text:
${timelineText}`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") return [];

  try {
    const jsonMatch =
      textBlock.text.match(/```(?:json)?\s*([\s\S]*?)```/) ||
      textBlock.text.match(/\[[\s\S]*\]/);
    const jsonStr = jsonMatch
      ? jsonMatch[1] || jsonMatch[0]
      : textBlock.text;
    return JSON.parse(jsonStr.trim());
  } catch {
    console.error(`  Failed to parse JSON for ${firmName}`);
    return [];
  }
}

function toQuarter(dateStr: string): string {
  if (/Q\d/.test(dateStr)) {
    // Already has quarter
    const match = dateStr.match(/(\d{4})-?Q(\d)/);
    return match ? `${match[1]}-Q${match[2]}` : "2023-Q1";
  }
  const match = dateStr.match(/(\d{4})-?(\d{2})?/);
  if (!match) return "2023-Q1";
  const year = match[1];
  const month = parseInt(match[2] || "1", 10);
  const q = Math.ceil(month / 3);
  return `${year}-Q${q}`;
}

async function main() {
  console.log("=== Timeline Extraction ===\n");

  const allEvents: TimelineEvent[] = [];

  for (const firm of FIRMS) {
    const reportPath = path.join(REPORTS_DIR, `${firm.slug}.md`);
    if (!fs.existsSync(reportPath)) {
      console.log(`[SKIP] ${firm.name} - no report`);
      continue;
    }

    const content = fs.readFileSync(reportPath, "utf-8");
    const timelineSection = extractTimelineSection(content);

    if (!timelineSection) {
      console.log(`[SKIP] ${firm.name} - no timeline section found`);
      continue;
    }

    console.log(
      `[PARSE] ${firm.name} (${timelineSection.length} chars)...`
    );

    const events = await parseTimelineWithClaude(
      firm.name,
      timelineSection.substring(0, 8000) // limit to avoid token issues
    );

    const tagged = events.map((e) => ({
      ...e,
      firm: firm.shortName,
      firmSlug: firm.slug,
      quarter: toQuarter(e.date),
    }));

    allEvents.push(...tagged);
    console.log(`  -> ${tagged.length} events extracted`);

    await new Promise((r) => setTimeout(r, 1000));
  }

  // Sort by date
  allEvents.sort((a, b) => a.date.localeCompare(b.date));

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(allEvents, null, 2));
  console.log(`\nTotal: ${allEvents.length} events written to ${OUTPUT_PATH}`);
}

main().catch(console.error);

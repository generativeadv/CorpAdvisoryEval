import fs from "fs";
import path from "path";

const REPORTS_DIR = path.join(process.cwd(), "content", "reports");

export interface ReportSection {
  title: string;
  content: string;
}

export function getReportContent(slug: string): string | null {
  const filePath = path.join(REPORTS_DIR, `${slug}.md`);
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
}

export function getReportSections(content: string): ReportSection[] {
  const sections: ReportSection[] = [];
  const lines = content.split("\n");
  let currentTitle = "";
  let currentContent: string[] = [];

  for (const line of lines) {
    const sectionMatch = line.match(/^##\s+(?:Section\s+\d+:\s*)?(.+)/);
    if (sectionMatch) {
      if (currentTitle) {
        sections.push({
          title: currentTitle,
          content: currentContent.join("\n").trim(),
        });
      }
      currentTitle = sectionMatch[1].trim();
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }

  if (currentTitle) {
    sections.push({
      title: currentTitle,
      content: currentContent.join("\n").trim(),
    });
  }

  return sections;
}

export function listReportSlugs(): string[] {
  try {
    return fs
      .readdirSync(REPORTS_DIR)
      .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
      .map((f) => f.replace(".md", ""));
  } catch {
    return [];
  }
}

export const REQUIRED_SECTIONS = [
  "Executive Summary",
  "AI Fact Base",
  "Internal AI Usage Analysis",
  "Client-Facing AI Analysis",
  "Leadership and Organizational Structure",
  "Partnerships and Ecosystem",
  "Positioning and Messaging",
  "Timeline Since 2023",
  "Bottom-Line Assessment",
];

export function validateReportStructure(content: string): {
  valid: boolean;
  missingSections: string[];
} {
  const sections = getReportSections(content);
  const foundTitles = sections.map((s) => s.title.toLowerCase());
  const missing = REQUIRED_SECTIONS.filter(
    (req) =>
      !foundTitles.some(
        (found) =>
          found.includes(req.toLowerCase()) ||
          req.toLowerCase().includes(found)
      )
  );
  return { valid: missing.length === 0, missingSections: missing };
}

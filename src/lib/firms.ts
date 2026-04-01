export interface FirmMeta {
  slug: string;
  name: string;
  shortName: string;
  group: 1 | 2 | 3 | 4;
}

export const FIRMS: FirmMeta[] = [
  // Group 1: Corporate Advisory & Strategic Communications
  { slug: "fgs-global", name: "FGS Global", shortName: "FGS", group: 1 },
  { slug: "brunswick", name: "Brunswick Group", shortName: "Brunswick", group: 1 },
  { slug: "fti-strat-comms", name: "FTI Consulting (Strategic Communications)", shortName: "FTI Strat Comms", group: 1 },
  { slug: "fti-total", name: "FTI Consulting (Total Firm)", shortName: "FTI Total", group: 1 },
  { slug: "apco", name: "APCO Worldwide", shortName: "APCO", group: 1 },
  { slug: "teneo", name: "Teneo", shortName: "Teneo", group: 1 },
  { slug: "kekst", name: "Kekst CNC", shortName: "Kekst", group: 1 },
  { slug: "h-advisors", name: "H/Advisors (Global)", shortName: "H/Advisors", group: 1 },
  { slug: "joele-frank", name: "Joele Frank", shortName: "Joele Frank", group: 1 },

  // Group 2: Global PR Networks
  { slug: "edelman", name: "Edelman", shortName: "Edelman", group: 2 },
  { slug: "weber-shandwick", name: "Weber Shandwick", shortName: "Weber Shandwick", group: 2 },
  { slug: "burson", name: "Burson", shortName: "Burson", group: 2 },
  { slug: "fleishmanhillard", name: "FleishmanHillard", shortName: "FleishmanHillard", group: 2 },

  // Group 3: Management Consulting
  { slug: "mckinsey-quantumblack", name: "McKinsey (QuantumBlack)", shortName: "McKinsey/QB", group: 3 },
  { slug: "bcg", name: "Boston Consulting Group", shortName: "BCG", group: 3 },
  { slug: "accenture-song", name: "Accenture Song", shortName: "Accenture Song", group: 3 },

  // Group 4: Emerging & Specialist
  { slug: "penta-group", name: "Penta Group", shortName: "Penta", group: 4 },
  { slug: "orchestra", name: "Orchestra", shortName: "Orchestra", group: 4 },
  { slug: "excellera", name: "Excellera Advisory Group", shortName: "Excellera", group: 4 },
];

export function getFirmBySlug(slug: string): FirmMeta | undefined {
  return FIRMS.find((f) => f.slug === slug);
}

export function getFirmsByGroup(group: 1 | 2 | 3 | 4): FirmMeta[] {
  return FIRMS.filter((f) => f.group === group);
}

export const GROUP_LABELS: Record<1 | 2 | 3 | 4, string> = {
  1: "Corporate Advisory & Strategic Communications",
  2: "Global PR Networks",
  3: "Management Consulting",
  4: "Emerging & Specialist",
};

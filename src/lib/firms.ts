export interface FirmMeta {
  slug: string;
  name: string;
  shortName: string;
  group: 1 | 2 | 3;
}

export const FIRMS: FirmMeta[] = [
  // Group 1
  { slug: "fgs-global", name: "FGS Global", shortName: "FGS", group: 1 },
  { slug: "brunswick", name: "Brunswick Group", shortName: "Brunswick", group: 1 },
  { slug: "fti-strat-comms", name: "FTI Consulting (Strategic Communications)", shortName: "FTI Strat Comms", group: 1 },
  { slug: "fti-total", name: "FTI Consulting (Total Firm)", shortName: "FTI Total", group: 1 },
  { slug: "apco", name: "APCO Worldwide", shortName: "APCO", group: 1 },
  { slug: "teneo", name: "Teneo", shortName: "Teneo", group: 1 },
  { slug: "kekst", name: "Kekst CNC", shortName: "Kekst", group: 1 },
  { slug: "h-advisors", name: "H/Advisors (Global)", shortName: "H/Advisors", group: 1 },
  { slug: "joele-frank", name: "Joele Frank", shortName: "Joele Frank", group: 1 },

  // Group 2
  { slug: "edelman", name: "Edelman", shortName: "Edelman", group: 2 },
  { slug: "weber-shandwick", name: "Weber Shandwick", shortName: "Weber Shandwick", group: 2 },
  { slug: "burson", name: "Burson", shortName: "Burson", group: 2 },
  { slug: "fleishmanhillard", name: "FleishmanHillard", shortName: "FleishmanHillard", group: 2 },
  { slug: "accenture-song", name: "Accenture Song", shortName: "Accenture Song", group: 2 },

  // Group 3
  { slug: "penta-group", name: "Penta Group", shortName: "Penta", group: 3 },
  { slug: "orchestra", name: "Orchestra", shortName: "Orchestra", group: 3 },
  { slug: "excellera", name: "Excellera Advisory Group", shortName: "Excellera", group: 3 },
];

export function getFirmBySlug(slug: string): FirmMeta | undefined {
  return FIRMS.find((f) => f.slug === slug);
}

export function getFirmsByGroup(group: 1 | 2 | 3): FirmMeta[] {
  return FIRMS.filter((f) => f.group === group);
}

export const GROUP_LABELS: Record<1 | 2 | 3, string> = {
  1: "Corporate Advisory & Strategic Communications",
  2: "PR Networks & Management Consulting",
  3: "Emerging & Specialist",
};

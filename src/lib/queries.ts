import { db } from "./db";
import { firms, evaluations } from "./db/schema";
import { eq, and } from "drizzle-orm";
import { FIRMS } from "./firms";
import type {
  FirmWithEvaluation,
  MaturityStage,
  ConfidenceGrade,
  Archetype,
} from "./types";

function isDbConfigured(): boolean {
  return !!process.env.TURSO_DATABASE_URL;
}

function firmsAsFallback(): FirmWithEvaluation[] {
  return FIRMS.map((f, i) => ({
    id: i + 1,
    slug: f.slug,
    name: f.name,
    shortName: f.shortName,
    group: f.group,
    evaluation: null,
  }));
}

export async function getAllFirmsWithEvaluations(): Promise<
  FirmWithEvaluation[]
> {
  if (!isDbConfigured()) return firmsAsFallback();

  const allFirms = await db.select().from(firms);
  if (allFirms.length === 0) return firmsAsFallback();

  const allEvals = await db
    .select()
    .from(evaluations)
    .where(eq(evaluations.isActive, 1));

  return allFirms.map((firm) => {
    const evaluation = allEvals.find((e) => e.firmId === firm.id);
    return {
      id: firm.id,
      slug: firm.slug,
      name: firm.name,
      shortName: firm.shortName,
      group: firm.group as 1 | 2 | 3 | 4,
      evaluation: evaluation
        ? {
            id: evaluation.id,
            firmId: evaluation.firmId,
            maturityStage: evaluation.maturityStage as MaturityStage,
            maturityRationale: evaluation.maturityRationale || "",
            dim1: evaluation.dim1,
            dim2: evaluation.dim2,
            dim3: evaluation.dim3,
            dim4: evaluation.dim4,
            dim5: evaluation.dim5,
            dim6: evaluation.dim6,
            dim7: evaluation.dim7,
            dim8: evaluation.dim8,
            dim9: evaluation.dim9,
            dim10: evaluation.dim10,
            compositeScoreUnweighted: evaluation.compositeScoreUnweighted,
            compositeScoreWeighted: evaluation.compositeScoreWeighted,
            confidenceGrade: evaluation.confidenceGrade as ConfidenceGrade,
            confidenceRationale: evaluation.confidenceRationale || "",
            archetype: evaluation.archetype as Archetype,
            scoredAt: evaluation.scoredAt,
          }
        : null,
    };
  });
}

export async function getFirmBySlug(
  slug: string
): Promise<FirmWithEvaluation | null> {
  if (!isDbConfigured()) {
    const meta = FIRMS.find((f) => f.slug === slug);
    if (!meta) return null;
    return {
      id: FIRMS.indexOf(meta) + 1,
      slug: meta.slug,
      name: meta.name,
      shortName: meta.shortName,
      group: meta.group,
      evaluation: null,
    };
  }

  const firm = await db.select().from(firms).where(eq(firms.slug, slug)).limit(1);
  if (!firm[0]) {
    const meta = FIRMS.find((f) => f.slug === slug);
    if (!meta) return null;
    return {
      id: 0,
      slug: meta.slug,
      name: meta.name,
      shortName: meta.shortName,
      group: meta.group,
      evaluation: null,
    };
  }

  const evaluation = await db
    .select()
    .from(evaluations)
    .where(and(eq(evaluations.firmId, firm[0].id), eq(evaluations.isActive, 1)))
    .limit(1);

  const e = evaluation[0];
  return {
    id: firm[0].id,
    slug: firm[0].slug,
    name: firm[0].name,
    shortName: firm[0].shortName,
    group: firm[0].group as 1 | 2 | 3,
    evaluation: e
      ? {
          id: e.id,
          firmId: e.firmId,
          maturityStage: e.maturityStage as MaturityStage,
          maturityRationale: e.maturityRationale || "",
          dim1: e.dim1,
          dim2: e.dim2,
          dim3: e.dim3,
          dim4: e.dim4,
          dim5: e.dim5,
          dim6: e.dim6,
          dim7: e.dim7,
          dim8: e.dim8,
          dim9: e.dim9,
          dim10: e.dim10,
          compositeScoreUnweighted: e.compositeScoreUnweighted,
          compositeScoreWeighted: e.compositeScoreWeighted,
          confidenceGrade: e.confidenceGrade as ConfidenceGrade,
          confidenceRationale: e.confidenceRationale || "",
          archetype: e.archetype as Archetype,
          scoredAt: e.scoredAt,
        }
      : null,
  };
}

export async function getFirmReportContent(
  slug: string
): Promise<string | null> {
  // Check filesystem first
  const { getReportContent } = await import("./reports");
  const fileContent = getReportContent(slug);
  if (fileContent) return fileContent;

  // Fallback to DB for dynamically added firms
  if (!isDbConfigured()) return null;
  const firm = await db.select().from(firms).where(eq(firms.slug, slug)).limit(1);
  return firm[0]?.reportContent || null;
}

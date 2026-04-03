import { getAllFirmsWithEvaluations } from "@/lib/queries";
import { db } from "@/lib/db";
import { comparisons } from "@/lib/db/schema";
import { FirmPicker } from "./firm-picker";
import Link from "next/link";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function CustomComparePage() {
  const firms = await getAllFirmsWithEvaluations();
  const evaluatedFirms = firms
    .filter((f) => f.evaluation)
    .map((f) => ({
      slug: f.slug,
      name: f.name,
      shortName: f.shortName,
      group: f.group,
    }));

  let pastComparisons: { slug: string; firmNames: string; generatedAt: string | null; status: string }[] = [];
  try {
    pastComparisons = await db
      .select({
        slug: comparisons.slug,
        firmNames: comparisons.firmNames,
        generatedAt: comparisons.generatedAt,
        status: comparisons.status,
      })
      .from(comparisons)
      .orderBy(desc(comparisons.createdAt));
  } catch {
    // DB not configured
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Custom Comparison</h1>
        <p className="text-muted-foreground mt-1">
          Select 3 firms for a dimension-by-dimension AI-generated analysis
          grounded in the underlying research reports
        </p>
      </div>

      <div className="border rounded-xl p-5">
        <FirmPicker firms={evaluatedFirms} />
      </div>

      {pastComparisons.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Past Comparisons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pastComparisons
              .filter((c) => c.status === "complete")
              .map((c) => (
                <Link
                  key={c.slug}
                  href={`/custom-compare/${c.slug}`}
                  className="border rounded-lg p-4 hover:border-primary transition-colors"
                >
                  <p className="font-medium text-sm">{c.firmNames}</p>
                  {c.generatedAt && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(c.generatedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </Link>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

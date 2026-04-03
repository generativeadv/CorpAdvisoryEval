import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { comparisons } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const result = await db
    .select()
    .from(comparisons)
    .where(eq(comparisons.slug, slug))
    .limit(1);

  if (!result[0]) {
    return NextResponse.json({ error: "Comparison not found" }, { status: 404 });
  }

  return NextResponse.json(result[0]);
}

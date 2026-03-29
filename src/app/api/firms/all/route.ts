import { getAllFirmsWithEvaluations } from "@/lib/queries";
import { NextResponse } from "next/server";

export async function GET() {
  const firms = await getAllFirmsWithEvaluations();
  return NextResponse.json(firms);
}

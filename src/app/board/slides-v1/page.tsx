import { getAllFirmsWithEvaluations } from "@/lib/queries";
import { SlideViewer } from "./slide-viewer";

export default async function SlidesPage() {
  const firms = await getAllFirmsWithEvaluations();
  const evaluated = firms.filter((f) => f.evaluation);

  return <SlideViewer firms={evaluated} />;
}

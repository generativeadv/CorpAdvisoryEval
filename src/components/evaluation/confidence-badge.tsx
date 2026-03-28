import { Badge } from "@/components/ui/badge";
import { CONFIDENCE_COLORS, type ConfidenceGrade } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ConfidenceBadge({ grade }: { grade: ConfidenceGrade }) {
  return (
    <Badge variant="outline" className={cn("font-medium", CONFIDENCE_COLORS[grade])}>
      {grade}
    </Badge>
  );
}

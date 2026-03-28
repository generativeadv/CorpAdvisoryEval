import { Badge } from "@/components/ui/badge";
import { MATURITY_LABELS, MATURITY_COLORS, type MaturityStage } from "@/lib/types";
import { cn } from "@/lib/utils";

export function MaturityBadge({ stage }: { stage: MaturityStage }) {
  return (
    <Badge variant="outline" className={cn("font-medium", MATURITY_COLORS[stage])}>
      {stage}. {MATURITY_LABELS[stage]}
    </Badge>
  );
}

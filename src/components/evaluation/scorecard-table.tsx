import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DIMENSION_NAMES, WEIGHTED_DIMENSIONS } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ScorecardTableProps {
  scores: number[];
}

export function ScorecardTable({ scores }: ScorecardTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-8">#</TableHead>
          <TableHead>Dimension</TableHead>
          <TableHead className="w-16 text-center">Score</TableHead>
          <TableHead className="w-16 text-center">Weight</TableHead>
          <TableHead className="w-32">Bar</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {DIMENSION_NAMES.map((name, i) => {
          const isWeighted = (WEIGHTED_DIMENSIONS as readonly number[]).includes(i);
          return (
            <TableRow key={i}>
              <TableCell className="text-muted-foreground">{i + 1}</TableCell>
              <TableCell className="font-medium">{name}</TableCell>
              <TableCell className="text-center">{scores[i]}</TableCell>
              <TableCell className="text-center text-xs text-muted-foreground">
                {isWeighted ? "1.5x" : "1.0x"}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <div
                      key={v}
                      className={cn(
                        "h-4 w-5 rounded-sm",
                        v <= scores[i]
                          ? scores[i] >= 4
                            ? "bg-green-500"
                            : scores[i] >= 3
                              ? "bg-blue-500"
                              : scores[i] >= 2
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          : "bg-muted"
                      )}
                    />
                  ))}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

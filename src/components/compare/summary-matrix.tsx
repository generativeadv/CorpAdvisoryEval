"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MaturityBadge } from "@/components/evaluation/maturity-badge";
import { ConfidenceBadge } from "@/components/evaluation/confidence-badge";
import { Badge } from "@/components/ui/badge";
import {
  ARCHETYPE_LABELS,
  type FirmWithEvaluation,
  type MaturityStage,
  type ConfidenceGrade,
  type Archetype,
} from "@/lib/types";
import { GROUP_LABELS } from "@/lib/firms";
import { ArrowUpDown } from "lucide-react";

type SortField =
  | "name"
  | "group"
  | "maturity"
  | "score"
  | "confidence"
  | "archetype";

export function SummaryMatrix({ firms }: { firms: FirmWithEvaluation[] }) {
  const [sortField, setSortField] = useState<SortField>("score");
  const [sortAsc, setSortAsc] = useState(false);
  const [filterGroup, setFilterGroup] = useState<number | null>(null);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const filtered = filterGroup
    ? firms.filter((f) => f.group === filterGroup)
    : firms;

  const sorted = [...filtered].sort((a, b) => {
    const dir = sortAsc ? 1 : -1;
    switch (sortField) {
      case "name":
        return dir * a.name.localeCompare(b.name);
      case "group":
        return dir * (a.group - b.group);
      case "maturity":
        return (
          dir *
          ((a.evaluation?.maturityStage ?? 0) -
            (b.evaluation?.maturityStage ?? 0))
        );
      case "score":
        return (
          dir *
          ((a.evaluation?.compositeScoreWeighted ?? 0) -
            (b.evaluation?.compositeScoreWeighted ?? 0))
        );
      case "confidence": {
        const gradeOrder = { A: 4, B: 3, C: 2, D: 1 };
        const aGrade =
          gradeOrder[(a.evaluation?.confidenceGrade as ConfidenceGrade) ?? "D"];
        const bGrade =
          gradeOrder[(b.evaluation?.confidenceGrade as ConfidenceGrade) ?? "D"];
        return dir * (aGrade - bGrade);
      }
      default:
        return 0;
    }
  });

  const SortHeader = ({
    field,
    children,
  }: {
    field: SortField;
    children: React.ReactNode;
  }) => (
    <TableHead
      className="cursor-pointer select-none hover:bg-muted/50"
      onClick={() => toggleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown size={14} className="text-muted-foreground" />
      </div>
    </TableHead>
  );

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <Badge
          variant={filterGroup === null ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setFilterGroup(null)}
        >
          All ({firms.length})
        </Badge>
        {([1, 2, 3] as const).map((g) => (
          <Badge
            key={g}
            variant={filterGroup === g ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilterGroup(filterGroup === g ? null : g)}
          >
            Group {g} ({firms.filter((f) => f.group === g).length})
          </Badge>
        ))}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <SortHeader field="name">Firm</SortHeader>
              <SortHeader field="group">Group</SortHeader>
              <SortHeader field="maturity">Maturity</SortHeader>
              <SortHeader field="score">Weighted Score</SortHeader>
              <SortHeader field="confidence">Confidence</SortHeader>
              <TableHead>Archetype</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((firm) => (
              <TableRow key={firm.slug}>
                <TableCell>
                  <Link
                    href={`/firms/${firm.slug}`}
                    className="font-medium hover:underline"
                  >
                    {firm.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <span
                    className="text-xs text-muted-foreground"
                    title={GROUP_LABELS[firm.group]}
                  >
                    {firm.group}
                  </span>
                </TableCell>
                <TableCell>
                  {firm.evaluation ? (
                    <MaturityBadge stage={firm.evaluation.maturityStage} />
                  ) : (
                    <span className="text-muted-foreground text-sm">--</span>
                  )}
                </TableCell>
                <TableCell>
                  {firm.evaluation ? (
                    <span className="font-mono font-medium">
                      {firm.evaluation.compositeScoreWeighted.toFixed(1)}
                    </span>
                  ) : (
                    "--"
                  )}
                </TableCell>
                <TableCell>
                  {firm.evaluation ? (
                    <ConfidenceBadge
                      grade={firm.evaluation.confidenceGrade}
                    />
                  ) : (
                    "--"
                  )}
                </TableCell>
                <TableCell>
                  {firm.evaluation ? (
                    <span className="text-sm">
                      {
                        ARCHETYPE_LABELS[
                          firm.evaluation.archetype as Archetype
                        ]
                      }
                    </span>
                  ) : (
                    "--"
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

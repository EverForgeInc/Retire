"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { EmptyState, Panel } from "@/components/ui/Panel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";

export type IncomeComparisonRow = {
  locationId: string;
  label: string;
  totalMonthlyIncome: number;
  totalMonthlyExpenses: number;
  remainingMonthlyCash: number;
  provenance: {
    confidence: string;
    userOverride: boolean;
  };
};

export function IncomeComparisonTable({ rows }: { rows: IncomeComparisonRow[] }) {
  const [sort, setSort] = useState<"remaining" | "expenses" | "label">("remaining");

  const sorted = useMemo(() => {
    const next = [...rows];
    next.sort((a, b) => {
      if (sort === "label") return a.label.localeCompare(b.label);
      if (sort === "expenses") return b.totalMonthlyExpenses - a.totalMonthlyExpenses;
      return b.remainingMonthlyCash - a.remainingMonthlyCash;
    });
    return next;
  }, [rows, sort]);

  return (
    <Panel
      title="Location cash comparison"
      className="mt-4"
      contentClassName="px-0"
      action={
        <Select value={sort} onValueChange={(value) => value && setSort(value as typeof sort)}>
          <SelectTrigger className="w-44" aria-label="Sort comparisons" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="remaining">Sort by remaining</SelectItem>
            <SelectItem value="expenses">Sort by expenses</SelectItem>
            <SelectItem value="label">Sort by name</SelectItem>
          </SelectContent>
        </Select>
      }
    >
      {sorted.length === 0 ? (
        <div className="px-4">
          <EmptyState title="No location comparisons yet" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-5">Location</TableHead>
              <TableHead className="px-5">Income</TableHead>
              <TableHead className="px-5">Expenses</TableHead>
              <TableHead className="px-5">Remaining</TableHead>
              <TableHead className="px-5">Provenance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((row) => (
              <TableRow key={row.locationId}>
                <TableCell className="px-5 font-medium">{row.label}</TableCell>
                <TableCell className="px-5">{formatCurrency(row.totalMonthlyIncome)}</TableCell>
                <TableCell className="px-5">{formatCurrency(row.totalMonthlyExpenses)}</TableCell>
                <TableCell className="px-5 font-semibold text-emerald-700">
                  {formatCurrency(row.remainingMonthlyCash)}
                </TableCell>
                <TableCell className="px-5">
                  <Badge variant="outline">
                    {row.provenance.confidence}
                    {row.provenance.userOverride ? " · override" : ""}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Panel>
  );
}

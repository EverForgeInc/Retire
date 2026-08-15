"use client";

import { useMemo, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { EmptyState, Panel } from "@/components/ui/Panel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type EvidenceItem = {
  id: string;
  evidenceType: string;
  completeness: string | null;
  recordCategory: string | null;
  externalStorageLabel: string | null;
  confirmationNumber: string | null;
  summary: string | null;
};

export function DocumentsBrowser({ items }: { items: EvidenceItem[] }) {
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((item) => (item.completeness || "unknown") === filter);
  }, [items, filter]);

  return (
    <>
      <Alert className="mb-4">
        <AlertDescription>
          Medical-file uploads are disabled in the MVP. Track request status, completeness, and external
          secure-storage labels instead.
        </AlertDescription>
      </Alert>
      <Panel
        title="Evidence references"
        action={
          <Select value={filter} onValueChange={(value) => setFilter(value ?? "all")}>
            <SelectTrigger className="w-44" aria-label="Filter by completeness" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="requested">Requested</SelectItem>
              <SelectItem value="received">Received</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
              <SelectItem value="unknown">Unknown</SelectItem>
            </SelectContent>
          </Select>
        }
      >
        {filtered.length === 0 ? (
          <EmptyState
            title={items.length === 0 ? "No evidence references yet" : "No matching references"}
            description={
              items.length === 0 ? "Add them from a task detail page." : "Try a different completeness filter."
            }
          />
        ) : (
          <ul className="space-y-3">
            {filtered.map((ref) => (
              <li key={ref.id} className="rounded-xl border border-border/70 px-4 py-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{ref.evidenceType}</p>
                  {ref.completeness ? <Badge variant="outline">{ref.completeness}</Badge> : null}
                </div>
                <p className="mt-1 text-muted-foreground">{ref.recordCategory || "Uncategorized"}</p>
                <p className="mt-1 text-slate-700">
                  {ref.externalStorageLabel || ref.confirmationNumber || ref.summary || "No summary"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}

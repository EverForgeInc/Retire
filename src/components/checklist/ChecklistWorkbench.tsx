"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { StatusChip } from "@/components/ui/StatusChip";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState, Panel } from "@/components/ui/Panel";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SECTION_RULES } from "@/lib/rules/date-engine";
import { cn } from "@/lib/utils";

export type ChecklistTaskItem = {
  id: string;
  title: string;
  sectionId: string | null;
  sectionName: string | null;
  status: string;
  calculatedEnd: string | null;
  ownerLabel: string | null;
};

export function ChecklistWorkbench({
  tasks,
  sections,
  initialView,
  initialSectionId,
  initialStatus,
  currentPhaseId,
}: {
  tasks: ChecklistTaskItem[];
  sections: Array<{ sectionId: string; phase: number; complete: number; total: number }>;
  initialView: "phase" | "all";
  initialSectionId: string;
  initialStatus?: string;
  currentPhaseId: string;
}) {
  const router = useRouter();
  const [view, setView] = useState<"phase" | "all">(initialView);
  const [sectionId, setSectionId] = useState(initialSectionId || currentPhaseId);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatus || "all");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    return tasks.filter((task) => {
      if (view === "phase" && task.sectionId !== sectionId) return false;
      if (statusFilter === "overdue") {
        if (task.status === "complete" || task.status === "not_applicable") return false;
        if (!task.calculatedEnd) return false;
        if (task.calculatedEnd >= new Date().toISOString().slice(0, 10)) return false;
      } else if (statusFilter !== "all" && task.status !== statusFilter) {
        return false;
      }
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        task.title.toLowerCase().includes(q) ||
        (task.sectionName ?? "").toLowerCase().includes(q) ||
        (task.ownerLabel ?? "").toLowerCase().includes(q)
      );
    });
  }, [tasks, view, sectionId, statusFilter, query]);

  const sectionMeta = sections.find((s) => s.sectionId === sectionId);

  async function quickComplete(taskId: string) {
    setPendingId(taskId);
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "complete" }),
    });
    setPendingId(null);
    if (response.ok) {
      startTransition(() => router.refresh());
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          value={view}
          onValueChange={(value) => {
            if (value === "phase" || value === "all") setView(value);
          }}
        >
          <TabsList>
            <TabsTrigger value="phase">By phase</TabsTrigger>
            <TabsTrigger value="all">All tasks</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex flex-1 flex-col gap-2 sm:flex-row lg:max-w-xl">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tasks, owners, or phases"
            aria-label="Search checklist"
          />
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value ?? "all")}>
            <SelectTrigger className="sm:w-48" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="not_started">Not started</SelectItem>
              <SelectItem value="in_progress">In progress</SelectItem>
              <SelectItem value="waiting">Waiting</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="not_applicable">Not applicable</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {view === "phase" ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {SECTION_RULES.map((section, index) => (
            <button
              key={section.sectionId}
              type="button"
              onClick={() => setSectionId(section.sectionId)}
              className={cn(
                "min-w-36 rounded-xl px-3 py-2 text-left text-xs transition",
                section.sectionId === sectionId
                  ? "bg-blue-600 text-white"
                  : "bg-card text-slate-700 ring-1 ring-border hover:bg-muted",
              )}
            >
              <div className="font-semibold">Phase {index + 1}</div>
              <div className="mt-1 line-clamp-2 opacity-80">{section.label}</div>
            </button>
          ))}
        </div>
      ) : null}

      <Panel
        title={view === "phase" ? `Phase ${sectionMeta?.phase ?? ""} progress` : "All tasks"}
        description={
          view === "phase"
            ? `${sectionMeta?.complete ?? 0}/${sectionMeta?.total ?? 0} complete · ${filtered.length} shown`
            : `${filtered.length} of ${tasks.length} tasks shown`
        }
      >
        {filtered.length === 0 ? (
          <EmptyState
            title="No matching tasks"
            description="Try a different phase, status, or search term."
            action={
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setQuery("");
                  setStatusFilter("all");
                  setView("all");
                }}
              >
                Clear filters
              </Button>
            }
          />
        ) : (
          <ul className="space-y-3">
            {filtered.map((task) => (
              <li
                key={task.id}
                className="flex flex-col gap-3 rounded-xl border border-border/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <Link href={`/checklist/${task.id}`} className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-slate-900">{task.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {task.sectionName}
                    {task.calculatedEnd ? ` · Due ${task.calculatedEnd}` : ""}
                    {task.ownerLabel ? ` · ${task.ownerLabel}` : ""}
                  </div>
                </Link>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusChip status={task.status} />
                  {task.status !== "complete" ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={pendingId === task.id || isPending}
                      onClick={() => quickComplete(task.id)}
                    >
                      {pendingId === task.id ? "Saving..." : "Mark complete"}
                    </Button>
                  ) : (
                    <Link
                      href={`/checklist/${task.id}`}
                      className={buttonVariants({ variant: "ghost", size: "sm" })}
                    >
                      Open
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

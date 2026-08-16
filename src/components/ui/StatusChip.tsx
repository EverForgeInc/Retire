import { Badge } from "@/components/ui/badge";
import { statusLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";

const VARIANT_MAP: Record<
  string,
  { label?: string; className: string }
> = {
  complete: { className: "border-emerald-200 bg-emerald-50 text-emerald-800" },
  waiting: { className: "border-slate-200 bg-slate-50 text-slate-700" },
  overdue: { className: "border-red-200 bg-red-50 text-red-700" },
  due_soon: { label: "Due soon", className: "border-orange-200 bg-orange-50 text-orange-800" },
  upcoming: { label: "Upcoming", className: "border-blue-200 bg-blue-50 text-blue-800" },
  in_progress: { label: "In progress", className: "border-blue-200 bg-blue-50 text-blue-800" },
  not_started: { className: "border-slate-200 bg-slate-50 text-slate-700" },
  not_applicable: { className: "border-slate-200 bg-slate-100 text-slate-500" },
};

export function StatusChip({ status, label }: { status: string; label?: string }) {
  const mapped = VARIANT_MAP[status] ?? VARIANT_MAP.not_started;
  return (
    <Badge variant="outline" className={cn("font-semibold", mapped.className)}>
      <span aria-hidden="true">●</span>
      {label ?? mapped.label ?? statusLabel(status)}
    </Badge>
  );
}

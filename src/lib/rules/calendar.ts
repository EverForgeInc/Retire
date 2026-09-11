import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isSaturday,
  isSunday,
  isWithinInterval,
  startOfDay,
  startOfMonth,
} from "date-fns";
import type { TimelineEventInput, TimelineEventType } from "@/lib/rules/leave";

export type CalendarDayKind =
  | TimelineEventType
  | "retirement_ceremony"
  | "ordinary_leave";

export type CalendarDayCell = {
  date: Date;
  dateKey: string;
  inMonth: boolean;
  primary: CalendarDayKind;
  label?: string;
  showStar?: "ceremony" | "retirement";
};

export const DAY_PRECEDENCE: CalendarDayKind[] = [
  "duty",
  "weekend",
  "federal_holiday",
  "ordinary_leave",
  "skillbridge",
  "ptdy",
  "terminal_leave",
  "retirement_ceremony",
  "retirement",
];

export const CALENDAR_LEGEND: Array<{
  kind: CalendarDayKind | "ceremony_marker" | "retirement_marker";
  label: string;
  swatchClass: string;
  star?: boolean;
}> = [
  { kind: "duty", label: "Duty", swatchClass: "bg-slate-900" },
  { kind: "weekend", label: "Weekend", swatchClass: "bg-slate-200" },
  { kind: "federal_holiday", label: "Holiday", swatchClass: "bg-amber-400" },
  { kind: "skillbridge", label: "SkillBridge", swatchClass: "bg-blue-600" },
  { kind: "ptdy", label: "PTDY", swatchClass: "bg-teal-500" },
  { kind: "ordinary_leave", label: "Leave", swatchClass: "bg-emerald-500" },
  { kind: "terminal_leave", label: "Terminal Leave", swatchClass: "bg-orange-500" },
  { kind: "ceremony_marker", label: "Ceremony", swatchClass: "bg-amber-500", star: true },
  { kind: "retirement_marker", label: "Retirement", swatchClass: "bg-emerald-600", star: true },
];

export const DAY_CELL_STYLES: Record<CalendarDayKind, { cell: string; text: string }> = {
  duty: { cell: "bg-slate-900", text: "text-white" },
  weekend: { cell: "bg-slate-200", text: "text-slate-700" },
  federal_holiday: { cell: "bg-amber-400", text: "text-slate-900" },
  ordinary_leave: { cell: "bg-emerald-500", text: "text-white" },
  skillbridge: { cell: "bg-blue-600", text: "text-white" },
  ptdy: { cell: "bg-teal-500", text: "text-white" },
  terminal_leave: { cell: "bg-orange-500", text: "text-white" },
  tdy: { cell: "bg-indigo-500", text: "text-white" },
  outprocessing: { cell: "bg-violet-600", text: "text-white" },
  medical_va: { cell: "bg-cyan-700", text: "text-white" },
  final_out: { cell: "bg-rose-600", text: "text-white" },
  retirement_ceremony: { cell: "bg-orange-500", text: "text-white" },
  retirement: { cell: "bg-emerald-600", text: "text-white" },
};

const US_FIXED_HOLIDAYS: Array<{ month: number; day: number; name: string }> = [
  { month: 1, day: 1, name: "New Year's Day" },
  { month: 6, day: 19, name: "Juneteenth" },
  { month: 7, day: 4, name: "Independence Day" },
  { month: 11, day: 11, name: "Veterans Day" },
  { month: 12, day: 25, name: "Christmas Day" },
];

function nthWeekdayOfMonth(year: number, monthIndex: number, weekday: number, n: number): Date {
  const first = startOfMonth(new Date(year, monthIndex, 1));
  const firstWeekday = getDay(first);
  const offset = (weekday - firstWeekday + 7) % 7;
  return addDays(first, offset + (n - 1) * 7);
}

function lastWeekdayOfMonth(year: number, monthIndex: number, weekday: number): Date {
  const last = endOfMonth(new Date(year, monthIndex, 1));
  const lastWeekday = getDay(last);
  const offset = (lastWeekday - weekday + 7) % 7;
  return addDays(last, -offset);
}

export function federalHolidaysForYear(year: number): Array<{ date: Date; name: string }> {
  const list: Array<{ date: Date; name: string }> = US_FIXED_HOLIDAYS.map((h) => ({
    date: startOfDay(new Date(year, h.month - 1, h.day)),
    name: h.name,
  }));
  list.push({ date: nthWeekdayOfMonth(year, 0, 1, 3), name: "Martin Luther King Jr. Day" });
  list.push({ date: nthWeekdayOfMonth(year, 1, 1, 3), name: "Presidents Day" });
  list.push({ date: lastWeekdayOfMonth(year, 4, 1), name: "Memorial Day" });
  list.push({ date: nthWeekdayOfMonth(year, 8, 1, 1), name: "Labor Day" });
  list.push({ date: nthWeekdayOfMonth(year, 9, 1, 2), name: "Columbus Day" });
  list.push({ date: nthWeekdayOfMonth(year, 10, 4, 4), name: "Thanksgiving Day" });
  return list;
}

function precedenceRank(kind: CalendarDayKind): number {
  const idx = DAY_PRECEDENCE.indexOf(kind);
  return idx >= 0 ? idx : -1;
}

function mapEventType(eventType: string): CalendarDayKind | null {
  if (eventType === "retirement_ceremony" || eventType === "ceremony") return "retirement_ceremony";
  if ((DAY_PRECEDENCE as string[]).includes(eventType)) return eventType as CalendarDayKind;
  return null;
}

export function resolveDayKind(
  date: Date,
  events: TimelineEventInput[],
  holidays: Array<{ date: Date; name: string }>,
): { primary: CalendarDayKind; label?: string; showStar?: "ceremony" | "retirement" } {
  const day = startOfDay(date);
  let primary: CalendarDayKind = isSaturday(day) || isSunday(day) ? "weekend" : "duty";
  let label: string | undefined;
  let showStar: "ceremony" | "retirement" | undefined;

  const holiday = holidays.find((h) => h.date.getTime() === day.getTime());
  if (holiday && precedenceRank("federal_holiday") > precedenceRank(primary)) {
    primary = "federal_holiday";
    label = holiday.name;
  }

  for (const event of events) {
    const kind = mapEventType(event.eventType);
    if (!kind) continue;
    if (!isWithinInterval(day, { start: startOfDay(event.startDate), end: startOfDay(event.endDate) })) continue;

    if (kind === "retirement_ceremony") {
      showStar = "ceremony";
      label = event.title || "Retirement ceremony";
      if (precedenceRank("retirement_ceremony") >= precedenceRank(primary) && (primary === "duty" || primary === "weekend")) {
        primary = "retirement_ceremony";
      }
      continue;
    }

    if (kind === "retirement") {
      showStar = "retirement";
      label = event.title || "Retirement date";
      primary = "retirement";
      continue;
    }

    if (precedenceRank(kind) >= precedenceRank(primary)) {
      primary = kind;
      label = event.title || readableEventType(kind);
    }
  }

  return { primary, label, showStar };
}

export function buildMonthGrid(params: { month: Date; events: TimelineEventInput[] }): CalendarDayCell[] {
  const monthStart = startOfMonth(params.month);
  const monthEnd = endOfMonth(params.month);
  const year = monthStart.getFullYear();
  const holidays = [
    ...federalHolidaysForYear(year),
    ...federalHolidaysForYear(year - 1),
    ...federalHolidaysForYear(year + 1),
  ];
  const gridStart = addDays(monthStart, -getDay(monthStart));
  const gridEnd = addDays(monthEnd, 6 - getDay(monthEnd));
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  return days.map((date) => {
    const inMonth = date.getMonth() === monthStart.getMonth() && date.getFullYear() === monthStart.getFullYear();
    const resolved = resolveDayKind(date, params.events, holidays);
    return {
      date,
      dateKey: format(date, "yyyy-MM-dd"),
      inMonth,
      primary: inMonth ? resolved.primary : "weekend",
      label: inMonth ? resolved.label : undefined,
      showStar: inMonth ? resolved.showStar : undefined,
    };
  });
}

export function eventBadgeVariant(eventType: string): "default" | "secondary" | "outline" | "destructive" {
  switch (eventType) {
    case "terminal_leave":
    case "ordinary_leave":
      return "secondary";
    case "retirement":
      return "default";
    default:
      return "outline";
  }
}

export function readableEventType(eventType: string): string {
  return eventType.replace(/_/g, " ").replace(/\b\w/g, (value) => value.toUpperCase());
}

export function eventDotClass(eventType: string): string {
  switch (eventType) {
    case "skillbridge": return "bg-blue-600";
    case "ptdy": return "bg-teal-500";
    case "terminal_leave": return "bg-orange-500";
    case "ordinary_leave": return "bg-emerald-500";
    case "retirement_ceremony":
    case "ceremony": return "bg-amber-500";
    case "retirement": return "bg-emerald-600";
    case "federal_holiday": return "bg-amber-400";
    default: return "bg-slate-700";
  }
}

import { addDays, addMonths, differenceInCalendarDays, format, parseISO, startOfDay } from "date-fns";

export type DateOnly = string; // YYYY-MM-DD

export interface SectionWindowRule {
  sectionId: string;
  label: string;
  kind: "months_before" | "days_before" | "days_around" | "days_after" | "ongoing";
  startOffsetMonths?: number;
  endOffsetMonths?: number;
  startOffsetDays?: number;
  endOffsetDays?: number;
}

export interface CalculatedWindow {
  sectionId: string;
  label: string;
  start: Date;
  end: Date | null;
}

/** Canonical 14-phase chronological windows from business_rules.md */
export const SECTION_RULES: SectionWindowRule[] = [
  { sectionId: "section_01", label: "18-24 months before retirement", kind: "months_before", startOffsetMonths: 24, endOffsetMonths: 18 },
  { sectionId: "section_02", label: "12-18 months before retirement", kind: "months_before", startOffsetMonths: 18, endOffsetMonths: 12 },
  { sectionId: "section_03", label: "9-12 months before retirement", kind: "months_before", startOffsetMonths: 12, endOffsetMonths: 9 },
  { sectionId: "section_04", label: "270-181 days before retirement", kind: "days_before", startOffsetDays: 270, endOffsetDays: 181 },
  { sectionId: "section_05", label: "180-121 days before retirement", kind: "days_before", startOffsetDays: 180, endOffsetDays: 121 },
  { sectionId: "section_06", label: "120-91 days before retirement", kind: "days_before", startOffsetDays: 120, endOffsetDays: 91 },
  { sectionId: "section_07", label: "90-61 days before retirement", kind: "days_before", startOffsetDays: 90, endOffsetDays: 61 },
  { sectionId: "section_08", label: "60-31 days before retirement", kind: "days_before", startOffsetDays: 60, endOffsetDays: 31 },
  { sectionId: "section_09", label: "30-15 days before retirement", kind: "days_before", startOffsetDays: 30, endOffsetDays: 15 },
  { sectionId: "section_10", label: "Final 14 days through final duty day", kind: "days_before", startOffsetDays: 14, endOffsetDays: 1 },
  { sectionId: "section_11", label: "Retirement date / first days after retirement", kind: "days_around", startOffsetDays: 0, endOffsetDays: 7 },
  { sectionId: "section_12", label: "Days 1-30 after retirement", kind: "days_after", startOffsetDays: 1, endOffsetDays: 30 },
  { sectionId: "section_13", label: "Days 31-90 after retirement", kind: "days_after", startOffsetDays: 31, endOffsetDays: 90 },
  { sectionId: "section_14", label: "Ongoing after retirement", kind: "ongoing", startOffsetDays: 91 },
];

export function toDateOnly(date: Date): DateOnly {
  return format(date, "yyyy-MM-dd");
}

export function parseDateOnly(value: string | Date): Date {
  if (value instanceof Date) return startOfDay(value);
  return startOfDay(parseISO(value));
}

export function addCalendarMonths(anchor: Date, months: number): Date {
  return startOfDay(addMonths(anchor, months));
}

export function daysBefore(anchor: Date, days: number): Date {
  return startOfDay(addDays(anchor, -days));
}

export function daysAfter(anchor: Date, days: number): Date {
  return startOfDay(addDays(anchor, days));
}

export function calculateSectionWindow(
  retirementDate: Date | string,
  rule: SectionWindowRule,
): CalculatedWindow {
  const rd = parseDateOnly(retirementDate);

  switch (rule.kind) {
    case "months_before": {
      const start = addCalendarMonths(rd, -(rule.startOffsetMonths ?? 0));
      const end = addCalendarMonths(rd, -(rule.endOffsetMonths ?? 0));
      return { sectionId: rule.sectionId, label: rule.label, start, end };
    }
    case "days_before": {
      const start = daysBefore(rd, rule.startOffsetDays ?? 0);
      const end = daysBefore(rd, rule.endOffsetDays ?? 0);
      return { sectionId: rule.sectionId, label: rule.label, start, end };
    }
    case "days_around": {
      const start = daysAfter(rd, rule.startOffsetDays ?? 0);
      const end = daysAfter(rd, rule.endOffsetDays ?? 0);
      return { sectionId: rule.sectionId, label: rule.label, start, end };
    }
    case "days_after": {
      const start = daysAfter(rd, rule.startOffsetDays ?? 0);
      const end = daysAfter(rd, rule.endOffsetDays ?? 0);
      return { sectionId: rule.sectionId, label: rule.label, start, end };
    }
    case "ongoing": {
      const start = daysAfter(rd, rule.startOffsetDays ?? 91);
      return { sectionId: rule.sectionId, label: rule.label, start, end: null };
    }
    default: {
      const _exhaustive: never = rule.kind;
      throw new Error(`Unhandled section kind: ${_exhaustive}`);
    }
  }
}

export function calculateAllSectionWindows(retirementDate: Date | string): CalculatedWindow[] {
  return SECTION_RULES.map((rule) => calculateSectionWindow(retirementDate, rule));
}

export function getSectionWindowById(
  retirementDate: Date | string,
  sectionId: string,
): CalculatedWindow {
  const rule = SECTION_RULES.find((r) => r.sectionId === sectionId);
  if (!rule) throw new Error(`Unknown sectionId: ${sectionId}`);
  return calculateSectionWindow(retirementDate, rule);
}

export function daysUntilRetirement(retirementDate: Date | string, today: Date = new Date()): number {
  return differenceInCalendarDays(parseDateOnly(retirementDate), startOfDay(today));
}

export function findActivePhase(
  retirementDate: Date | string,
  today: Date = new Date(),
): CalculatedWindow {
  const windows = calculateAllSectionWindows(retirementDate);
  const current = startOfDay(today);

  const containing = windows.find((w) => {
    if (w.end === null) return current >= w.start;
    return current >= w.start && current <= w.end;
  });
  if (containing) return containing;

  const upcoming = windows.find((w) => current < w.start);
  return upcoming ?? windows[windows.length - 1];
}

export function isDateInWindow(date: Date, start: Date | null, end: Date | null): boolean {
  if (!start) return false;
  const d = startOfDay(date);
  if (end === null) return d >= start;
  return d >= start && d <= end;
}

export function phaseIndex(sectionId: string): number {
  const idx = SECTION_RULES.findIndex((r) => r.sectionId === sectionId);
  return idx >= 0 ? idx + 1 : 0;
}

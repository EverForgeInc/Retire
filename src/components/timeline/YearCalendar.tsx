"use client";

import { eachMonthOfInterval, endOfYear, format, getDate, getDay, startOfDay, startOfYear } from "date-fns";
import { Star } from "lucide-react";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CALENDAR_LEGEND,
  DAY_CELL_STYLES,
  resolveDayKind,
  federalHolidaysForYear,
  type CalendarDayKind,
} from "@/lib/rules/calendar";
import { type TimelineEventInput } from "@/lib/rules/leave";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export type YearCalendarEvent = TimelineEventInput & {
  id?: string;
};

export interface DayTooltip {
  date: Date;
  kind: CalendarDayKind;
  label?: string;
  eventTitle?: string;
  showStar?: "ceremony" | "retirement";
}

interface MonthGridProps {
  month: Date;
  year: number;
  events: YearCalendarEvent[];
  holidays: Array<{ date: Date; name: string }>;
  onDayHover?: (tooltip: DayTooltip | null) => void;
  hoveredDate?: Date | null;
}

function MonthGrid({ month, year, events, holidays, onDayHover, hoveredDate }: MonthGridProps) {
  const lastDay = startOfDay(new Date(year, month.getMonth() + 1, 0));

  // Get all days in the month including padding from previous/next month
  const startDate = startOfDay(new Date(year, month.getMonth(), 1));
  const startDayOfWeek = getDay(startDate);
  const paddingStart = startDayOfWeek;

  const days: Array<{ date: Date; inMonth: boolean }> = [];

  // Add padding days from previous month
  for (let i = paddingStart - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month.getMonth(), -i),
      inMonth: false,
    });
  }

  // Add days of current month
  const daysInMonth = lastDay.getDate();
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      date: new Date(year, month.getMonth(), i),
      inMonth: true,
    });
  }

  // Add padding days to fill grid
  while (days.length < 42) {
    days.push({
      date: new Date(year, month.getMonth() + 1, days.length - daysInMonth - paddingStart + 1),
      inMonth: false,
    });
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-slate-900">{format(new Date(year, month.getMonth()), "MMMM yyyy")}</h3>
      
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day) => (
          <div key={day} className="text-center text-[10px] font-semibold text-muted-foreground py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          const dayResolution = resolveDayKind(day.date, events, holidays);
          const styles = DAY_CELL_STYLES[dayResolution.primary];
          const isHovered = hoveredDate && 
            hoveredDate.toDateString() === day.date.toDateString();

          return (
            <div
              key={`${day.date.toISOString()}-${idx}`}
              className={cn(
                "relative aspect-square flex items-center justify-center text-[9px] font-medium rounded cursor-pointer transition-transform",
                !day.inMonth && "opacity-30",
                styles.cell,
                styles.text,
                isHovered && "ring-2 ring-offset-1 ring-slate-400 scale-110 z-10",
              )}
              onMouseEnter={() => {
                if (onDayHover && day.inMonth) {
                  onDayHover({
                    date: day.date,
                    kind: dayResolution.primary,
                    label: dayResolution.label,
                    showStar: dayResolution.showStar,
                  });
                }
              }}
              onMouseLeave={() => onDayHover?.(null)}
              title={dayResolution.label || format(day.date, "MMM d, yyyy")}
            >
              <span>{getDate(day.date)}</span>
              {dayResolution.showStar && (
                <Star className="absolute top-0.5 right-0.5 size-2 fill-current" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function YearCalendar({
  events,
  year,
}: {
  events: YearCalendarEvent[];
  year: number;
}) {
  const [hoveredTooltip, setHoveredTooltip] = useState<DayTooltip | null>(null);
  const holidays = useMemo(() => federalHolidaysForYear(year), [year]);

  const months = useMemo(() => {
    const start = startOfYear(new Date(year, 0, 1));
    const end = endOfYear(new Date(year, 11, 31));
    return eachMonthOfInterval({ start, end });
  }, [year]);

  return (
    <div className="space-y-6">
      {/* Legend */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Event Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {CALENDAR_LEGEND.map((item) => (
              <div key={item.kind} className="flex items-center gap-2">
                <div className={cn("size-4 rounded", item.swatchClass)}>
                  {item.star && <Star className="size-3 fill-white text-white mx-auto mt-0.5" />}
                </div>
                <span className="text-xs font-medium text-slate-700">{item.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tooltip */}
      {hoveredTooltip && (
        <Card className="shadow-md border-slate-300 bg-slate-50">
          <CardContent className="pt-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900">
                {format(hoveredTooltip.date, "EEEE, MMMM d, yyyy")}
              </p>
              <p className="text-xs text-slate-600">
                <Badge variant="outline" className="mr-2">
                  {hoveredTooltip.kind.replace(/_/g, " ").toUpperCase()}
                </Badge>
                {hoveredTooltip.label && <span>{hoveredTooltip.label}</span>}
              </p>
              {hoveredTooltip.showStar && (
                <p className="text-xs text-amber-700 flex items-center gap-1">
                  <Star className="size-3" /> {hoveredTooltip.showStar === "ceremony" ? "Ceremony" : "Retirement Date"}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Year grid */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">{year} Annual Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {months.map((month) => (
              <MonthGrid
                key={month.toISOString()}
                month={month}
                year={year}
                events={events}
                holidays={holidays}
                onDayHover={setHoveredTooltip}
                hoveredDate={hoveredTooltip?.date}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Legend */}
      <Card className="shadow-sm bg-slate-50">
        <CardHeader>
          <CardTitle className="text-sm">Color Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-xs">
            <p><span className="font-semibold">Duty Days:</span> Regular workdays (dark gray)</p>
            <p><span className="font-semibold">Weekends:</span> Saturday & Sunday (light gray)</p>
            <p><span className="font-semibold">Holidays:</span> Federal holidays (amber)</p>
            <p><span className="font-semibold">Leave:</span> Ordinary chargeable leave (emerald)</p>
            <p><span className="font-semibold">Terminal Leave:</span> Final leave period (orange)</p>
            <p><span className="font-semibold">SkillBridge:</span> Transition employment program (blue)</p>
            <p><span className="font-semibold">PTDY:</span> Personal temporary duty (teal)</p>
            <p><span className="font-semibold">TDY:</span> Temporary duty assignment (indigo)</p>
            <p><span className="font-semibold">Medical/VA:</span> Medical or VA appointments (cyan)</p>
            <p><span className="font-semibold">Star (★):</span> Ceremony or retirement date marker</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

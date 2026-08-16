"use client";

import { addMonths, format, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  CALENDAR_LEGEND,
  DAY_CELL_STYLES,
  buildMonthGrid,
  eventDotClass,
} from "@/lib/rules/calendar";
import { inclusiveDayCount, type TimelineEventInput } from "@/lib/rules/leave";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export type TimelineCalendarEvent = TimelineEventInput & {
  id?: string;
};

export function TimelineKpiCards({
  chargeableLeaveDays,
  projectedBalance,
  overlapCount,
}: {
  chargeableLeaveDays: number;
  projectedBalance: number;
  overlapCount: number;
}) {
  const items = [
    { label: "Chargeable leave days", value: chargeableLeaveDays },
    { label: "Projected leave balance", value: projectedBalance },
    { label: "Overlap conflicts", value: overlapCount },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {items.map((item) => (
        <Card key={item.label} className="shadow-sm">
          <CardHeader className="pb-0">
            <CardTitle className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {item.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight text-slate-900">{item.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function TransitionMonthCalendar({
  events,
  initialMonth,
}: {
  events: TimelineCalendarEvent[];
  initialMonth: Date;
}) {
  const [month, setMonth] = useState(startOfMonthSafe(initialMonth));
  const cells = useMemo(() => buildMonthGrid({ month, events }), [month, events]);

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-3 border-b pb-4">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Previous month"
          onClick={() => setMonth((current) => subMonths(current, 1))}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <CardTitle className="font-[family-name:var(--font-source-serif)] text-xl font-semibold text-slate-900">
          {format(month, "MMMM yyyy")}
        </CardTitle>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Next month"
          onClick={() => setMonth((current) => addMonths(current, 1))}
        >
          <ChevronRight className="size-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="grid grid-cols-7 gap-2">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="px-1 text-center text-[11px] font-semibold tracking-wide text-muted-foreground"
            >
              {day}
            </div>
          ))}
          {cells.map((cell) => {
            const styles = DAY_CELL_STYLES[cell.primary];
            return (
              <div
                key={cell.dateKey}
                className={cn(
                  "relative flex min-h-20 flex-col rounded-xl p-2 text-left transition",
                  cell.inMonth ? styles.cell : "bg-slate-100 opacity-40",
                  cell.inMonth ? styles.text : "text-slate-400",
                )}
                title={cell.label || cell.primary}
              >
                <span className="text-xs font-semibold">{format(cell.date, "d")}</span>
                {cell.inMonth && cell.label ? (
                  <span className="mt-auto line-clamp-2 text-[10px] font-medium leading-tight opacity-95">
                    {cell.label}
                  </span>
                ) : null}
                {cell.inMonth && cell.showStar ? (
                  <Star
                    className={cn(
                      "absolute top-2 right-2 size-3.5 fill-current",
                      cell.showStar === "ceremony" ? "text-amber-200" : "text-emerald-100",
                    )}
                    aria-hidden="true"
                  />
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-3 border-t pt-4">
          {CALENDAR_LEGEND.map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-xs text-slate-600">
              <span
                className={cn(
                  "inline-flex size-3.5 items-center justify-center rounded-sm",
                  item.swatchClass,
                )}
                aria-hidden="true"
              >
                {item.star ? <Star className="size-2.5 fill-white text-white" /> : null}
              </span>
              {item.label}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function TransitionEventsList({ events }: { events: TimelineCalendarEvent[] }) {
  const sorted = [...events].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-slate-900">Transition events</CardTitle>
      </CardHeader>
      <CardContent className="space-y-0 px-0 pb-0">
        {sorted.length === 0 ? (
          <p className="px-4 pb-4 text-sm text-muted-foreground">No transition events yet.</p>
        ) : (
          sorted.map((event, index) => {
            const days = inclusiveDayCount(event.startDate, event.endDate);
            const isCeremony = event.eventType === "retirement_ceremony";
            const isRetirement = event.eventType === "retirement";
            return (
              <div key={event.id ?? `${event.eventType}-${index}`}>
                {index > 0 ? <Separator /> : null}
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <span
                      className={cn(
                        "mt-1.5 inline-flex size-2.5 shrink-0 rounded-full",
                        eventDotClass(event.eventType),
                      )}
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-slate-900">{event.title}</p>
                        {(isCeremony || isRetirement) && (
                          <Star
                            className={cn(
                              "size-3.5",
                              isCeremony ? "fill-amber-500 text-amber-500" : "fill-emerald-600 text-emerald-600",
                            )}
                            aria-hidden="true"
                          />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(event.startDate, "yyyy-MM-dd")}
                        {event.endDate.getTime() !== event.startDate.getTime()
                          ? ` to ${format(event.endDate, "yyyy-MM-dd")}`
                          : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="font-normal">
                      {event.eventType}
                    </Badge>
                    <span className="text-sm text-slate-600">
                      {days} day{days === 1 ? "" : "s"}
                      {event.chargeableLeave ? " chargeable" : ""}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

function startOfMonthSafe(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), 1);
}

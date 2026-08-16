"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { YearCalendar, type YearCalendarEvent } from "@/components/timeline/YearCalendar";

interface AnnualCalendarControlsProps {
  events: YearCalendarEvent[];
  retirementYear: number;
  retirementDate: Date;
}

export function AnnualCalendarControls({
  events,
  retirementYear,
  retirementDate,
}: AnnualCalendarControlsProps) {
  const [displayYear, setDisplayYear] = useState(retirementYear);
  const isRetirementYear = displayYear === retirementYear;
  const minYear = retirementYear - 2;
  const maxYear = retirementYear + 1;

  return (
    <div className="space-y-6">
      {/* Year Navigation */}
      <Card className="shadow-sm bg-gradient-to-r from-slate-50 to-slate-100">
        <CardHeader>
          <CardTitle className="text-base">Year Selection</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setDisplayYear((y) => y - 1)}
            disabled={displayYear === minYear}
            aria-label="Previous year"
          >
            <ChevronLeft className="size-4" />
          </Button>

          <div className="flex-1 text-center">
            <p className="text-2xl font-bold text-slate-900">{displayYear}</p>
            <p className="text-xs text-slate-600 mt-1">
              {isRetirementYear && (
                <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 rounded">
                  Retirement Year: {retirementDate.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              )}
              {displayYear < retirementYear && (
                <span className="text-slate-500">
                  {retirementYear - displayYear} year{retirementYear - displayYear !== 1 ? "s" : ""} before retirement
                </span>
              )}
              {displayYear > retirementYear && (
                <span className="text-slate-500">
                  {displayYear - retirementYear} year{displayYear - retirementYear !== 1 ? "s" : ""} after retirement
                </span>
              )}
            </p>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setDisplayYear((y) => y + 1)}
            disabled={displayYear === maxYear}
            aria-label="Next year"
          >
            <ChevronRight className="size-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Year Calendar */}
      <YearCalendar events={events} year={displayYear} />
    </div>
  );
}

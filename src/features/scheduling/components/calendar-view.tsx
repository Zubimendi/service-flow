"use client";

import { useMemo, useState } from "react";
import {
  addDays,
  startOfWeek,
  endOfWeek,
  format,
  isSameDay,
  parseISO,
} from "date-fns";
import { useAppointmentsRange } from "@/hooks/use-appointments";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn, formatTime } from "@/lib/utils";

const STAFF_COLORS = [
  "bg-indigo-100 border-indigo-300 text-indigo-800 dark:bg-indigo-950 dark:border-indigo-700 dark:text-indigo-200",
  "bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-700 dark:text-emerald-200",
  "bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-950 dark:border-amber-700 dark:text-amber-200",
  "bg-sky-100 border-sky-300 text-sky-800 dark:bg-sky-950 dark:border-sky-700 dark:text-sky-200",
];

interface CalendarViewProps {
  slug: string;
}

export function CalendarView({ slug }: CalendarViewProps) {
  const [view, setView] = useState<"week" | "day">("week");
  const [currentDate, setCurrentDate] = useState(new Date());

  const rangeStart = view === "week"
    ? startOfWeek(currentDate, { weekStartsOn: 0 })
    : currentDate;
  const rangeEnd = view === "week"
    ? endOfWeek(currentDate, { weekStartsOn: 0 })
    : currentDate;

  const { data, isLoading } = useAppointmentsRange(
    slug,
    rangeStart.toISOString(),
    addDays(rangeEnd, 1).toISOString()
  );

  const staffColorMap = useMemo(() => {
    const map = new Map<string, number>();
    data?.appointments.forEach((apt) => {
      if (!map.has(apt.staffId)) {
        map.set(apt.staffId, map.size % STAFF_COLORS.length);
      }
    });
    return map;
  }, [data?.appointments]);

  const days = view === "week"
    ? Array.from({ length: 7 }, (_, i) => addDays(rangeStart, i))
    : [currentDate];

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  const appointments = data?.appointments ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-h1">Calendar</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(addDays(currentDate, view === "week" ? -7 : -1))}
          >
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(addDays(currentDate, view === "week" ? 7 : 1))}
          >
            Next
          </Button>
          <div className="ml-4 flex rounded-lg border border-border">
            <Button
              variant={view === "week" ? "default" : "ghost"}
              size="sm"
              className="rounded-r-none"
              onClick={() => setView("week")}
            >
              Week
            </Button>
            <Button
              variant={view === "day" ? "default" : "ghost"}
              size="sm"
              className="rounded-l-none"
              onClick={() => setView("day")}
            >
              Day
            </Button>
          </div>
        </div>
      </div>

      <p className="text-caption">
        {format(rangeStart, "MMM d")} — {format(rangeEnd, "MMM d, yyyy")}
      </p>

      <div className={cn("grid gap-4", view === "week" ? "grid-cols-7" : "grid-cols-1")}>
        {days.map((day) => {
          const dayApts = appointments.filter((apt) =>
            isSameDay(parseISO(apt.startTime), day)
          );

          return (
            <div
              key={day.toISOString()}
              className={cn(
                "min-h-[200px] rounded-xl border border-border bg-card p-3",
                isSameDay(day, new Date()) && "ring-2 ring-primary/20"
              )}
            >
              <p className="mb-3 text-sm font-medium">
                {format(day, "EEE d")}
              </p>
              <div className="space-y-2">
                {dayApts.map((apt) => {
                  const colorIdx = staffColorMap.get(apt.staffId) ?? 0;
                  return (
                    <div
                      key={apt.id}
                      className={cn(
                        "rounded-lg border p-2 text-xs cursor-pointer transition-shadow hover:shadow-sm",
                        STAFF_COLORS[colorIdx]
                      )}
                      title={`${apt.client.name} — ${apt.service.name}`}
                    >
                      <p className="font-medium">{formatTime(apt.startTime)}</p>
                      <p className="truncate">{apt.client.name}</p>
                      <Badge variant="secondary" className="mt-1 text-[10px]">
                        {apt.staff.name}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

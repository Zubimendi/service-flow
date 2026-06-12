import {
  addMinutes,
  format,
  parse,
  isBefore,
  isAfter,
  getDay,
} from "date-fns";
import { BusinessHours } from "@/types/tenant";
import { TimeSlot } from "@/types/appointment";

interface AvailabilityRecord {
  userId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  exceptions: unknown;
  user: { id: string; name: string };
}

interface AppointmentRecord {
  staffId: string;
  startTime: Date;
  endTime: Date;
  status: string;
}

const DAY_KEYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

function parseTimeOnDate(date: Date, time: string): Date {
  return parse(time, "HH:mm", date);
}

function hasTimeOff(exceptions: unknown, date: Date): boolean {
  if (!exceptions || !Array.isArray(exceptions)) return false;
  const dateStr = format(date, "yyyy-MM-dd");
  return exceptions.some(
    (ex: { date?: string }) => ex.date === dateStr
  );
}

export function computeAvailableSlots(params: {
  date: Date;
  serviceDurationMinutes: number;
  assignedStaffIds: string[];
  availabilities: AvailabilityRecord[];
  appointments: AppointmentRecord[];
  businessHours: BusinessHours;
  slotIntervalMinutes?: number;
}): TimeSlot[] {
  const {
    date,
    serviceDurationMinutes,
    assignedStaffIds,
    availabilities,
    appointments,
    businessHours,
    slotIntervalMinutes = 30,
  } = params;

  const dayKey = DAY_KEYS[getDay(date)];
  const dayHours = businessHours[dayKey];
  if (!dayHours || dayHours.closed) return [];

  const slots: TimeSlot[] = [];
  const now = new Date();

  for (const staffId of assignedStaffIds) {
    const staffAvail = availabilities.filter((a) => a.userId === staffId);
    const dayAvail = staffAvail.filter((a) => a.dayOfWeek === getDay(date));

    for (const avail of dayAvail) {
      if (hasTimeOff(avail.exceptions, date)) continue;

      const workStart = parseTimeOnDate(date, avail.startTime);
      const workEnd = parseTimeOnDate(date, avail.endTime);
      const bizStart = parseTimeOnDate(date, dayHours.open);
      const bizEnd = parseTimeOnDate(date, dayHours.close);

      const effectiveStart = isAfter(workStart, bizStart) ? workStart : bizStart;
      const effectiveEnd = isBefore(workEnd, bizEnd) ? workEnd : bizEnd;

      let cursor = effectiveStart;
      while (addMinutes(cursor, serviceDurationMinutes) <= effectiveEnd) {
        const slotEnd = addMinutes(cursor, serviceDurationMinutes);

        const overlaps = appointments.some(
          (apt) =>
            apt.staffId === staffId &&
            !["CANCELLED", "NO_SHOW"].includes(apt.status) &&
            cursor < apt.endTime &&
            slotEnd > apt.startTime
        );

        if (!overlaps && !isBefore(slotEnd, now)) {
          slots.push({
            start: cursor.toISOString(),
            end: slotEnd.toISOString(),
            staffId,
            staffName: avail.user.name,
          });
        }

        cursor = addMinutes(cursor, slotIntervalMinutes);
      }
    }
  }

  return slots.sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );
}

export function getDefaultBusinessHours(): BusinessHours {
  return {
    monday: { open: "09:00", close: "18:00" },
    tuesday: { open: "09:00", close: "18:00" },
    wednesday: { open: "09:00", close: "18:00" },
    thursday: { open: "09:00", close: "18:00" },
    friday: { open: "09:00", close: "18:00" },
    saturday: { open: "10:00", close: "16:00" },
    sunday: { open: "00:00", close: "00:00", closed: true },
  };
}

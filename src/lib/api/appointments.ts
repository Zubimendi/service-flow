import { api } from "./client";
import { AppointmentWithRelations, TodayStats, TimeSlot } from "@/types/appointment";
import { AppointmentStatus } from "@prisma/client";

export const appointmentsApi = {
  getToday: (slug: string) =>
    api.get<{ appointments: AppointmentWithRelations[]; stats: TodayStats }>(
      `/api/tenants/${slug}/appointments/today`
    ),

  getRange: (slug: string, start: string, end: string) =>
    api.get<{ appointments: AppointmentWithRelations[] }>(
      `/api/tenants/${slug}/appointments?start=${start}&end=${end}`
    ),

  updateStatus: (slug: string, id: string, status: AppointmentStatus) =>
    api.patch<AppointmentWithRelations>(
      `/api/tenants/${slug}/appointments/${id}`,
      { status }
    ),

  getSlots: (slug: string, serviceId: string, date: string) =>
    api.get<{ slots: TimeSlot[] }>(
      `/api/public/${slug}/slots?serviceId=${serviceId}&date=${date}`
    ),

  createBooking: (slug: string, data: unknown) =>
    api.post<{ checkoutUrl?: string; appointmentId: string }>(
      `/api/public/${slug}/book`,
      data
    ),
};

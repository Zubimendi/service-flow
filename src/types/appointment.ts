import { AppointmentStatus, PaymentStatus } from "@prisma/client";

export interface AppointmentWithRelations {
  id: string;
  tenantId: string;
  serviceId: string;
  staffId: string;
  clientId: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  notes: string | null;
  service: {
    id: string;
    name: string;
    durationMinutes: number;
    price: number;
  };
  staff: {
    id: string;
    name: string;
  };
  client: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
}

export interface TodayStats {
  bookingsCount: number;
  expectedRevenue: number;
  occupancyRate: number;
}

export interface TimeSlot {
  start: string;
  end: string;
  staffId: string;
  staffName: string;
}

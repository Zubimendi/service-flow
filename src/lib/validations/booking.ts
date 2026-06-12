import { z } from "zod";

export const bookingContactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

export const createBookingSchema = z.object({
  serviceId: z.string().min(1),
  staffId: z.string().min(1),
  startTime: z.string().datetime(),
  client: bookingContactSchema,
});

export type BookingContactInput = z.infer<typeof bookingContactSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;

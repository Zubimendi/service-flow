import { z } from "zod";

export const availabilitySchema = z.object({
  userId: z.string().min(1),
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
});

export type AvailabilityInput = z.infer<typeof availabilitySchema>;

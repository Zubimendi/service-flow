import { z } from "zod";

export const serviceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  durationMinutes: z.number().min(15).max(480),
  price: z.number().min(0),
  assignedStaffIds: z.array(z.string()).min(1, "Assign at least one staff member"),
  isActive: z.boolean().optional(),
});

export type ServiceInput = z.infer<typeof serviceSchema>;

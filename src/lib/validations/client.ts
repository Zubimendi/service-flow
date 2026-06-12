import { z } from "zod";

export const clientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

export type ClientInput = z.infer<typeof clientSchema>;

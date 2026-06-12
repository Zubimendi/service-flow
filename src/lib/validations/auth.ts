import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  businessName: z.string().min(2, "Business name is required"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  timezone: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;

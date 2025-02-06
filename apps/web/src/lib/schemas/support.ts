import { z } from "zod";

export const supportFormSchema = z.object({
  severity: z.enum(["low", "medium", "high"], {
    required_error: "Please select a severity level",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
});

export const supportRequestSchema = supportFormSchema.extend({
  name: z.string(),
  email: z.string().email(),
  projectId: z.string(),
  organizationId: z.string(),
});

export type SupportFormData = z.infer<typeof supportFormSchema>;
export type SupportRequest = z.infer<typeof supportRequestSchema>;

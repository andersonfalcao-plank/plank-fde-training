import { z } from "zod";

export const RequestPrioritySchema = z.enum(["low", "medium", "high"]);
export type RequestPriority = z.infer<typeof RequestPrioritySchema>;

// A Request has a title, details, a team and a priority.
// The schema trims the text fields. details and priority have defaults.
export const RequestSchema = z.object({
  title: z.string().trim().min(1),
  details: z.string().trim().default(""),
  team: z.string().trim().min(1),
  priority: RequestPrioritySchema.default("medium"),
});

// The input can leave out details and priority.
export type RequestInput = z.input<typeof RequestSchema>;
export type Request = z.output<typeof RequestSchema>;

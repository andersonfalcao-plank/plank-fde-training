import { z } from "zod";

import {
  REQUEST_PRIORITIES,
  REQUEST_STATUSES,
  REQUEST_TEAMS,
  type RequestPriority,
  type RequestStatus,
  TITLE_MAX_LENGTH,
} from "@/features/requests/constants";

// Client code imports these values from constants.ts, not from this file.
export {
  REQUEST_PRIORITIES,
  REQUEST_STATUSES,
  REQUEST_TEAMS,
  type RequestPriority,
  type RequestStatus,
  TITLE_MAX_LENGTH,
};

export const RequestPrioritySchema = z.enum(REQUEST_PRIORITIES, {
  error: "Select a priority.",
});

export const RequestStatusSchema = z.enum(REQUEST_STATUSES);

// A Request has a title, details, a team, a priority and a status.
// The schema trims the text fields. Title, details and team are required.
// Priority is "medium" and status is "open" when they are not given.
export const RequestSchema = z.object({
  title: z
    .string({ error: "Enter a title." })
    .trim()
    .min(1, "Enter a title.")
    .max(
      TITLE_MAX_LENGTH,
      `Use ${TITLE_MAX_LENGTH} characters or fewer for the title.`,
    ),
  details: z
    .string({ error: "Enter the details." })
    .trim()
    .min(1, "Enter the details."),
  team: z.string({ error: "Select a team." }).trim().min(1, "Select a team."),
  priority: RequestPrioritySchema.default("medium"),
  status: RequestStatusSchema.default("open"),
});

// The input can leave out priority and status.
export type RequestInput = z.input<typeof RequestSchema>;
export type Request = z.output<typeof RequestSchema>;

// Plain values for the requests feature. This file must not import zod:
// Client Components import it, and zod must stay out of the client bundle.
// schemas.ts builds the Zod schemas from these values.

export const TITLE_MAX_LENGTH = 300;

// After a new Request is saved, the form goes to /requests?created=<token>.
// The Requests page then shows a success message one time for each token.
export const CREATED_PARAM = "created";

// The teams that the new request form shows. The schema accepts any team name.
export const REQUEST_TEAMS = ["Operations", "Finance", "Support"] as const;

export const REQUEST_PRIORITIES = ["low", "medium", "high"] as const;
export type RequestPriority = (typeof REQUEST_PRIORITIES)[number];

export const PRIORITY_LABELS: Record<RequestPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

// A new Request is "open". The form does not set the status.
export const REQUEST_STATUSES = ["open", "in_progress", "done"] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const STATUS_LABELS: Record<RequestStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  done: "Done",
};

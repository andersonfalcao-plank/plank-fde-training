// Plain values for the requests feature. This file must not import zod:
// Client Components import it, and zod must stay out of the client bundle.
// schemas.ts builds the Zod schemas from these values.

export const TITLE_MAX_LENGTH = 300;

// The teams that the new request form shows. The schema accepts any team name.
export const REQUEST_TEAMS = ["Operations", "Finance", "Support"] as const;

export const REQUEST_PRIORITIES = ["low", "medium", "high"] as const;
export type RequestPriority = (typeof REQUEST_PRIORITIES)[number];

import "server-only";

import {
  type CreateRequestInput,
  CreateRequestSchema,
  type Request,
} from "@/features/requests/schemas";

// The Requests are in a list in memory. The list is on globalThis, so all
// modules share one list, also after a dev server reload. The list is lost
// when the server restarts.
const globalForRequests = globalThis as typeof globalThis & {
  workbotRequests?: Request[];
};

function requests(): Request[] {
  globalForRequests.workbotRequests ??= [];
  return globalForRequests.workbotRequests;
}

// Saves a new Request with the status "open".
// Throws a ZodError when the input is not valid.
export function createRequest(input: CreateRequestInput): Request {
  const request: Request = {
    ...CreateRequestSchema.parse(input),
    status: "open",
  };
  requests().push(request);
  return request;
}

// Returns the Requests in the order that they were created.
export function listRequests(): Request[] {
  return [...requests()];
}

// Removes all Requests. For tests only.
export function clearRequests(): void {
  requests().length = 0;
}

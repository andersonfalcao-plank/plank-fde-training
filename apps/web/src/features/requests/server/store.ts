import "server-only";

import {
  type Request,
  type RequestInput,
  RequestSchema,
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

// Throws a ZodError when the input is not valid.
export function createRequest(input: RequestInput): Request {
  const request = RequestSchema.parse(input);
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

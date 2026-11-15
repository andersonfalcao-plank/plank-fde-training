import "server-only";

import {
  type RequestInput,
  RequestSchema,
  type SavedRequest,
} from "@/features/requests/schemas";

// The Requests that the API saves. This list is not the list in store.ts:
// the pages use that list until the frontend changes to the API.
// The list is on globalThis, so it stays after a dev server reload.
// The list is lost when the server restarts.
const globalForApiRequests = globalThis as typeof globalThis & {
  workbotApiRequests?: SavedRequest[];
};

function savedRequests(): SavedRequest[] {
  globalForApiRequests.workbotApiRequests ??= [];
  return globalForApiRequests.workbotApiRequests;
}

// Gives the Request an id and a creation time, and saves it.
// Throws a ZodError when the input is not valid.
export async function saveRequest(input: RequestInput): Promise<SavedRequest> {
  const request: SavedRequest = {
    ...RequestSchema.parse(input),
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  savedRequests().push(request);
  return request;
}

// Returns the saved Requests, newest first. Requests with the same creation
// time are in the reverse order that they were saved.
export async function listSavedRequests(): Promise<SavedRequest[]> {
  return [...savedRequests()]
    .reverse()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// Removes all saved Requests. For tests only.
export function clearSavedRequests(): void {
  savedRequests().length = 0;
}

import "server-only";

import {
  type CreateRequestInput,
  CreateRequestSchema,
  type SavedRequest,
} from "@/features/requests/schemas";

// The Requests that the API saves, newest first. This list is not the list in store.ts:
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

// Gives the Request an id, a creation time and the status "open", and saves it.
// Puts it before the first Request that is not newer, so the list stays newest
// first and a read does not sort it. Usually that is the start of the list.
// Throws a ZodError when the input is not valid.
export async function saveRequest(
  input: CreateRequestInput,
): Promise<SavedRequest> {
  const request: SavedRequest = {
    ...CreateRequestSchema.parse(input),
    status: "open",
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  const list = savedRequests();
  const index = list.findIndex((saved) => saved.createdAt <= request.createdAt);
  list.splice(index === -1 ? list.length : index, 0, request);
  return request;
}

// Returns a copy of the saved Requests, newest first. Requests with the same
// creation time are in the reverse order that they were saved.
export async function listSavedRequests(): Promise<SavedRequest[]> {
  return [...savedRequests()];
}

// Removes all saved Requests. For tests only.
export function clearSavedRequests(): void {
  savedRequests().length = 0;
}

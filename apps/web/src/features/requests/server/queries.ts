import "server-only";

import type { SavedRequest } from "@/features/requests/schemas";
import { listSavedRequests } from "@/features/requests/server/api-store";

// Returns the saved Requests, newest first. The Requests page reads them on the
// server and gives them to the client query as its initial data.
export async function getRequests(): Promise<SavedRequest[]> {
  return listSavedRequests();
}

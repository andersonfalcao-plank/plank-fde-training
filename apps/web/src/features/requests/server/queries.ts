import "server-only";

import type { Request } from "@/features/requests/schemas";
import { listRequests } from "@/features/requests/server/store";

// Returns all Requests, in the order that they were created.
export async function getRequests(): Promise<Request[]> {
  return listRequests();
}

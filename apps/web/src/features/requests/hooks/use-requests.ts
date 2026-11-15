"use client";

import { useQuery } from "@tanstack/react-query";

import {
  RequestListResponseSchema,
  type SavedRequest,
} from "@/features/requests/schemas";

export const REQUESTS_QUERY_KEY = ["requests"] as const;

// The server renders the page with the list. Do not fetch it again at once
// when the page hydrates. A new Request marks the list as stale.
const INITIAL_DATA_STALE_TIME_MS = 30_000;

// Throws when the API returns an error or a body that does not match the
// schema. useQuery then shows the error state.
async function fetchRequests(): Promise<SavedRequest[]> {
  const response = await fetch("/api/requests");
  if (!response.ok) {
    throw new Error(`GET /api/requests returned ${response.status}.`);
  }
  return RequestListResponseSchema.parse(await response.json()).data;
}

// The saved Requests, newest first, from GET /api/requests.
// initialData is the list that the server read for this page, if any.
export function useRequests(initialData?: SavedRequest[]) {
  return useQuery({
    queryKey: REQUESTS_QUERY_KEY,
    queryFn: fetchRequests,
    initialData,
    staleTime: initialData ? INITIAL_DATA_STALE_TIME_MS : 0,
  });
}

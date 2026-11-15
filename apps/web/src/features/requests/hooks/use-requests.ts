"use client";

import { useQuery } from "@tanstack/react-query";

import {
  RequestListResponseSchema,
  type SavedRequest,
} from "@/features/requests/schemas";

export const REQUESTS_QUERY_KEY = ["requests"] as const;

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
export function useRequests() {
  return useQuery({ queryKey: REQUESTS_QUERY_KEY, queryFn: fetchRequests });
}

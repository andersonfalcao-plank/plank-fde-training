"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { CREATED_PARAM } from "@/features/requests/constants";
import { REQUESTS_QUERY_KEY } from "@/features/requests/hooks/use-requests";
import { createRequestAction } from "@/features/requests/server/actions";

// Saves a Request through the createRequestAction server action.
// On success, it marks the Request list as stale and goes to the Requests
// page. It does not wait for the refetch: the page loads the list when it shows.
// The id of the new Request is the token for the success message.
export function useCreateRequest() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: createRequestAction,
    onSuccess: (result) => {
      if (!result.ok) return;
      void queryClient.invalidateQueries({ queryKey: REQUESTS_QUERY_KEY });
      router.push(`/requests?${CREATED_PARAM}=${result.data.id}`);
    },
  });
}

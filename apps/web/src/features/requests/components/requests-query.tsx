"use client";

import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { TRY_AGAIN_MESSAGE } from "@/features/requests/constants";
import { useRequests } from "@/features/requests/hooks/use-requests";
import type { SavedRequest } from "@/features/requests/schemas";

type RequestsQueryProps = {
  // The list that the server read for this page. Without it, the client loads
  // the list and shows the spinner.
  initialRequests?: SavedRequest[];
  // Renders the page content from the loaded list.
  children: (requests: SavedRequest[]) => ReactNode;
};

// Loads the Requests with useRequests(), and shows the spinner, the error or
// the content. The Requests page and the Admin Overview page use it.
export function RequestsQuery({
  initialRequests,
  children,
}: RequestsQueryProps) {
  const { data, isPending, isError, isFetching, refetch } =
    useRequests(initialRequests);

  if (isPending) {
    return (
      <div className="flex justify-center py-10">
        <Spinner className="size-6" aria-label="Loading the requests" />
      </div>
    );
  }

  // Show the error only when there is no list. When a background refetch
  // fails, the list that loaded before stays on the page.
  if (isError && !data) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p role="alert">{TRY_AGAIN_MESSAGE}</p>
        <Button
          variant="outline"
          disabled={isFetching}
          onClick={() => void refetch()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return children(data);
}

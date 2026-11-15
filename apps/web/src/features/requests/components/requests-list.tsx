"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { TRY_AGAIN_MESSAGE } from "@/features/requests/constants";
import { useRequests } from "@/features/requests/hooks/use-requests";
import type { SavedRequest } from "@/features/requests/schemas";

import { RequestsView } from "./requests-view";

type RequestsListProps = {
  // The list that the server read for this page. Without it, the client loads
  // the list and shows the spinner.
  initialRequests?: SavedRequest[];
  // The token from the created search param.
  createdToken?: string;
};

// Loads the Requests from the API, and shows the spinner, the error or the list.
export function RequestsList({
  initialRequests,
  createdToken,
}: RequestsListProps) {
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

  return <RequestsView requests={data} createdToken={createdToken} />;
}

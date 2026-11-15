"use client";

import type { SavedRequest } from "@/features/requests/schemas";

import { RequestsQuery } from "./requests-query";
import { RequestsView } from "./requests-view";

type RequestsListProps = {
  // The list that the server read for this page. Without it, the client loads
  // the list and shows the spinner.
  initialRequests?: SavedRequest[];
  // The token from the created search param.
  createdToken?: string;
};

// The Requests page content: the spinner, the error or the list.
export function RequestsList({
  initialRequests,
  createdToken,
}: RequestsListProps) {
  return (
    <RequestsQuery initialRequests={initialRequests}>
      {(requests) => (
        <RequestsView requests={requests} createdToken={createdToken} />
      )}
    </RequestsQuery>
  );
}

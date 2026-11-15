"use client";

import Link from "next/link";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  REQUEST_STATUSES,
  type RequestStatus,
  STATUS_LABELS,
} from "@/features/requests/constants";
import type { SavedRequest } from "@/features/requests/schemas";

import { RequestTable } from "./request-table";
import { RequestsQuery } from "./requests-query";

// The table shows this many of the newest Requests.
export const LATEST_REQUESTS_COUNT = 4;

type RequestsOverviewProps = {
  // The list that the server read for this page. Without it, the client loads
  // the list and shows the spinner.
  initialRequests?: SavedRequest[];
};

function countByStatus(requests: SavedRequest[]) {
  const counts = Object.fromEntries(
    REQUEST_STATUSES.map((status) => [status, 0]),
  ) as Record<RequestStatus, number>;
  for (const request of requests) counts[request.status] += 1;
  return counts;
}

// The Admin Overview content: a card with the number of Requests for each
// status, then the newest Requests. The cards and the table use the same list.
export function RequestsOverview({ initialRequests }: RequestsOverviewProps) {
  return (
    <RequestsQuery initialRequests={initialRequests}>
      {(requests) => {
        const counts = countByStatus(requests);
        // The API returns the Requests newest first, so the first ones are the latest.
        const latest = requests.slice(0, LATEST_REQUESTS_COUNT);

        return (
          <div className="flex flex-col gap-8">
            <ul
              aria-label="Requests by status"
              className="grid grid-cols-3 gap-3"
            >
              {REQUEST_STATUSES.map((status) => (
                <li key={status}>
                  <Card aria-labelledby={`status-${status}`}>
                    <CardHeader>
                      <CardTitle
                        id={`status-${status}`}
                        className="text-sm font-medium text-muted-foreground"
                      >
                        {STATUS_LABELS[status]}
                      </CardTitle>
                      <p className="text-3xl font-semibold tabular-nums">
                        {counts[status]}
                      </p>
                    </CardHeader>
                  </Card>
                </li>
              ))}
            </ul>

            <section
              aria-labelledby="latest-requests"
              className="flex flex-col gap-4"
            >
              <div className="flex items-center justify-between gap-4">
                <h2
                  id="latest-requests"
                  className="text-xl font-semibold tracking-tight"
                >
                  Latest requests
                </h2>
                <Link
                  href="/requests"
                  className="text-sm font-medium underline underline-offset-4"
                >
                  All requests
                </Link>
              </div>
              {latest.length > 0 ? (
                <RequestTable requests={latest} />
              ) : (
                <div className="flex flex-col items-start gap-2">
                  <p className="font-medium">All things are done</p>
                  <Link
                    href="/requests/new"
                    className="text-sm font-medium underline underline-offset-4"
                  >
                    New request
                  </Link>
                </div>
              )}
            </section>
          </div>
        );
      }}
    </RequestsQuery>
  );
}

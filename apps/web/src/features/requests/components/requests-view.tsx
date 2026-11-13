import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { Request } from "@/features/requests/schemas";

import { RequestTable } from "./request-table";

type RequestsViewProps = {
  requests: Request[];
  // True after the new request form saved a Request and came to this page.
  created?: boolean;
};

function CreatedMessage() {
  return (
    <p
      role="status"
      className="rounded-lg border px-4 py-3 text-sm font-medium"
    >
      Your request was created.
    </p>
  );
}

// Shows the Requests in a table, or the empty state when there are none.
export function RequestsView({ requests, created = false }: RequestsViewProps) {
  if (requests.length === 0) {
    // The list can be empty after a submit, for example when another server
    // instance saved the Request. Show the success message also then.
    return (
      <div className="flex flex-col gap-6">
        {created && <CreatedMessage />}
        <div className="flex flex-col items-start gap-4">
          <h1 className="text-3xl font-semibold tracking-tight">
            All things are done
          </h1>
          <Link
            href="/requests/new"
            className="text-sm font-medium underline underline-offset-4"
          >
            New request
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">Requests</h1>
        <Button asChild>
          <Link href="/requests/new">New request</Link>
        </Button>
      </div>
      {created && <CreatedMessage />}
      <RequestTable requests={requests} />
    </div>
  );
}

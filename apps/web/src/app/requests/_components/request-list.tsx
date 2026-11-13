import { connection } from "next/server";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getRequests } from "@/features/requests/server/queries";

type RequestListProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function RequestList({ searchParams }: RequestListProps) {
  // The Requests are in memory and change at request time.
  await connection();
  const { created } = await searchParams;
  const requests = await getRequests();

  return (
    <div className="flex flex-col gap-4">
      {created === "1" && (
        <p
          role="status"
          className="rounded-lg border px-4 py-3 text-sm font-medium"
        >
          Your request was created.
        </p>
      )}
      {requests.length === 0 ? (
        <p className="text-muted-foreground">There are no requests.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {requests.map((request, index) => (
            <li key={index}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {request.title}
                    <Badge variant="secondary">{request.priority}</Badge>
                  </CardTitle>
                  <CardDescription>
                    {request.team} · {request.details}
                  </CardDescription>
                </CardHeader>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import { connection } from "next/server";

import { CREATED_PARAM, RequestsView } from "@/features/requests";
import { getRequests } from "@/features/requests/server/queries";

type RequestsContentProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function RequestsContent({ searchParams }: RequestsContentProps) {
  // The Requests are in memory and change at request time.
  await connection();
  const params = await searchParams;
  const requests = await getRequests();

  return (
    <RequestsView requests={requests} created={params[CREATED_PARAM] === "1"} />
  );
}

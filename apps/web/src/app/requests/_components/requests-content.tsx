import { connection } from "next/server";

import { RequestsView } from "@/features/requests";
import { getRequests } from "@/features/requests/server/queries";

export async function RequestsContent() {
  // The Requests are in memory and change at request time.
  await connection();
  const requests = await getRequests();

  return <RequestsView requests={requests} />;
}

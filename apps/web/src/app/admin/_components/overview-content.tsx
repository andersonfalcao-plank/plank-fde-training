import { connection } from "next/server";

import { RequestsOverview } from "@/features/requests";
import { getRequests } from "@/features/requests/server/queries";

// Reads the Requests on the server, so the first HTML has the counts and the
// table. The client query takes the list as its initial data.
export async function OverviewContent() {
  // The Requests are in memory and change after the build.
  await connection();
  const requests = await getRequests();

  return <RequestsOverview initialRequests={requests} />;
}

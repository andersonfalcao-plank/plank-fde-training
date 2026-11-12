import { connection } from "next/server";

import { config } from "@/lib/config";

export async function GET() {
  // Run at request time. A response from the build does not show that the server is up.
  await connection();

  return Response.json({ status: "ok", commit: config.commit });
}

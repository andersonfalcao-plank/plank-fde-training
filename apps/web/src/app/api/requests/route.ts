import { connection } from "next/server";

import {
  listSavedRequests,
  saveRequest,
} from "@/features/requests/server/api-store";
import { handle, parseBodyFields } from "@/lib/api";

import {
  type GetRequestsResponse,
  PostRequestsBodySchema,
  type PostRequestsResponse,
} from "./types";

export async function GET() {
  return handle(async () => {
    // Run at request time. The Requests are in memory and change after the build.
    await connection();
    const data = await listSavedRequests();

    return Response.json({ data } satisfies GetRequestsResponse);
  });
}

export async function POST(request: Request) {
  return handle(async () => {
    const body = await parseBodyFields(request, PostRequestsBodySchema);
    const saved = await saveRequest(body);

    return Response.json(saved satisfies PostRequestsResponse, {
      status: 201,
      // GET /api/requests/<id> is not in this phase. A follow-up adds it.
      headers: { Location: `/api/requests/${saved.id}` },
    });
  });
}

import { CREATED_PARAM, RequestsList } from "@/features/requests";

type RequestsContentProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// Reads the created token on the server. The client loads the Requests.
export async function RequestsContent({ searchParams }: RequestsContentProps) {
  const params = await searchParams;
  const created = params[CREATED_PARAM];
  const createdToken = Array.isArray(created) ? created[0] : created;

  return <RequestsList createdToken={createdToken || undefined} />;
}

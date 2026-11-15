import { CREATED_PARAM, RequestsList } from "@/features/requests";
import { getRequests } from "@/features/requests/server/queries";

type RequestsContentProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// Reads the Requests and the created token on the server, so the first HTML
// has the table. The client query takes the list as its initial data.
export async function RequestsContent({ searchParams }: RequestsContentProps) {
  const params = await searchParams;
  const requests = await getRequests();
  const created = params[CREATED_PARAM];
  const createdToken = Array.isArray(created) ? created[0] : created;

  return (
    <RequestsList
      initialRequests={requests}
      createdToken={createdToken || undefined}
    />
  );
}

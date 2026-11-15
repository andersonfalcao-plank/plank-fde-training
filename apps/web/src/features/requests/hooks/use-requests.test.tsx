// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { REQUESTS_QUERY_KEY, useRequests } from "./use-requests";

const fetchMock = vi.fn<typeof fetch>();

const saved = {
  title: "Laptop for the new hire",
  details: "Ana starts on Monday.",
  team: "Operations",
  priority: "high",
  status: "open",
  id: "4de9754f-db84-44e2-8577-a99067a54be9",
  createdAt: "2026-11-15T20:26:16.822Z",
};

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, ...renderHook(() => useRequests(), { wrapper }) };
}

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe("useRequests", () => {
  it('AND-32 AC2: calls GET /api/requests with the query key ["requests"]', async () => {
    fetchMock.mockResolvedValue(Response.json({ data: [saved] }));

    const { result, queryClient } = setup();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetchMock).toHaveBeenCalledWith("/api/requests");
    expect(REQUESTS_QUERY_KEY).toEqual(["requests"]);
    expect(queryClient.getQueryData(["requests"])).toEqual([saved]);
  });

  it("AND-32 AC3: parses the response with the shared response schema", async () => {
    fetchMock.mockResolvedValue(Response.json({ data: [saved] }));

    const { result } = setup();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([saved]);
  });

  it("AND-32 AC3: makes an invalid response an error", async () => {
    fetchMock.mockResolvedValue(
      Response.json({ data: [{ ...saved, status: "closed" }] }),
    );

    const { result } = setup();

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it("AND-32 AC5: makes an error status an error", async () => {
    fetchMock.mockResolvedValue(
      Response.json(
        { error: { message: "Internal server error" } },
        {
          status: 500,
        },
      ),
    );

    const { result } = setup();

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

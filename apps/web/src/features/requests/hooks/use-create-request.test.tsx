// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createRequestAction } from "@/features/requests/server/actions";

import { useCreateRequest } from "./use-create-request";

const push = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("@/features/requests/server/actions", () => ({
  createRequestAction: vi.fn(),
}));

const values = {
  title: "Laptop",
  details: "For Ana",
  team: "Support",
  priority: "medium",
};

const saved = {
  ...values,
  priority: "medium" as const,
  status: "open" as const,
  id: "4de9754f-db84-44e2-8577-a99067a54be9",
  createdAt: "2026-11-15T20:26:16.822Z",
};

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  const invalidate = vi.spyOn(queryClient, "invalidateQueries");
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { invalidate, ...renderHook(() => useCreateRequest(), { wrapper }) };
}

beforeEach(() => {
  vi.mocked(createRequestAction).mockReset();
  push.mockReset();
});

afterEach(() => {
  cleanup();
});

describe("useCreateRequest", () => {
  it("AND-32 AC7: uses useMutation, and its mutationFn calls createRequestAction", async () => {
    vi.mocked(createRequestAction).mockResolvedValue({ ok: true, data: saved });
    const { result } = setup();

    await act(() => result.current.mutateAsync(values));

    expect(createRequestAction).toHaveBeenCalledTimes(1);
    expect(vi.mocked(createRequestAction).mock.calls[0]![0]).toEqual(values);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('AND-32 AC10: on success refreshes ["requests"] and goes to /requests with the created token', async () => {
    vi.mocked(createRequestAction).mockResolvedValue({ ok: true, data: saved });
    const { result, invalidate } = setup();

    await act(() => result.current.mutateAsync(values));

    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["requests"] });
    expect(push).toHaveBeenCalledWith(`/requests?created=${saved.id}`);
    expect(invalidate.mock.invocationCallOrder[0]!).toBeLessThan(
      push.mock.invocationCallOrder[0]!,
    );
  });

  it("AND-32 AC10: stays on the form when the result is not ok", async () => {
    vi.mocked(createRequestAction).mockResolvedValue({
      ok: false,
      error: "Try again.",
    });
    const { result, invalidate } = setup();

    await act(() => result.current.mutateAsync(values));

    expect(invalidate).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });

  it("AND-32 AC12: is an error when the server action call fails", async () => {
    vi.mocked(createRequestAction).mockRejectedValue(new TypeError("offline"));
    const { result } = setup();

    act(() => result.current.mutate(values));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(push).not.toHaveBeenCalled();
  });
});

// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RequestsList } from "./requests-list";

const fetchMock = vi.fn<typeof fetch>();

function saved(title: string, status: string, createdAt: string) {
  return {
    title,
    details: "Details.",
    team: "Operations",
    priority: "medium",
    status,
    id: crypto.randomUUID(),
    createdAt,
  };
}

function renderList(createdToken?: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <RequestsList createdToken={createdToken} />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe("RequestsList", () => {
  it("AND-32 AC4: shows a spinner while the list loads", () => {
    fetchMock.mockReturnValue(new Promise(() => {}));

    renderList();

    expect(
      screen.getByRole("status", { name: "Loading the requests" }),
    ).toBeDefined();
    expect(screen.queryByRole("table")).toBeNull();
  });

  it('AND-32 AC5: shows "Try again." and a button that runs the query again', async () => {
    fetchMock.mockResolvedValueOnce(
      Response.json({ error: { message: "down" } }, { status: 500 }),
    );
    fetchMock.mockResolvedValueOnce(Response.json({ data: [] }));

    renderList();

    expect((await screen.findByRole("alert")).textContent).toBe("Try again.");
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    expect(
      await screen.findByRole("heading", { name: "All things are done" }),
    ).toBeDefined();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("AND-32 AC6: shows the table in the API order (newest first), with the status badges", async () => {
    fetchMock.mockResolvedValue(
      Response.json({
        data: [
          saved("Newest", "done", "2026-11-15T12:00:00.000Z"),
          saved("Middle", "in_progress", "2026-11-15T11:00:00.000Z"),
          saved("Oldest", "open", "2026-11-15T10:00:00.000Z"),
        ],
      }),
    );

    renderList();

    const table = await screen.findByRole("table");
    const rows = within(table).getAllByRole("row").slice(1);
    expect(
      rows.map((row) => within(row).getAllByRole("cell")[0]!.textContent),
    ).toEqual(["Newest", "Middle", "Oldest"]);
    expect(
      rows.map((row) => within(row).getAllByRole("cell")[3]!.textContent),
    ).toEqual(["Done", "In progress", "Open"]);
    expect(screen.getByRole("link", { name: "New request" })).toBeDefined();
  });

  it("AND-32 AC6: shows the empty state when there are no Requests", async () => {
    fetchMock.mockResolvedValue(Response.json({ data: [] }));

    renderList();

    expect(
      await screen.findByRole("heading", { name: "All things are done" }),
    ).toBeDefined();
  });

  it("AND-32 AC10: shows the success message for the created token", async () => {
    fetchMock.mockResolvedValue(
      Response.json({
        data: [saved("Newest", "open", "2026-11-15T12:00:00.000Z")],
      }),
    );

    renderList("token-and-32");

    expect(
      (await screen.findByText("Your request was created.")).getAttribute(
        "role",
      ),
    ).toBe("status");
  });
});

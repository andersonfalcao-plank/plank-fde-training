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

import type {
  RequestPriority,
  RequestStatus,
} from "@/features/requests/constants";
import type { SavedRequest } from "@/features/requests/schemas";

import { RequestsOverview } from "./requests-overview";

const fetchMock = vi.fn<typeof fetch>();

let minute = 0;
function saved(
  title: string,
  status: RequestStatus,
  priority: RequestPriority = "medium",
): SavedRequest {
  minute += 1;
  return {
    title,
    details: "Details.",
    team: "Operations",
    priority,
    status,
    id: crypto.randomUUID(),
    createdAt: `2026-11-15T10:${String(60 - minute).padStart(2, "0")}:00.000Z`,
  };
}

// Newest first, as GET /api/requests returns them.
const sixRequests = [
  saved("Sixth", "open", "high"),
  saved("Fifth", "in_progress"),
  saved("Fourth", "done", "low"),
  saved("Third", "open"),
  saved("Second", "open"),
  saved("First", "done"),
];

function renderOverview(initialRequests?: SavedRequest[]) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <RequestsOverview initialRequests={initialRequests} />
    </QueryClientProvider>,
  );
}

function card(label: string) {
  const title = within(
    screen.getByRole("list", { name: "Requests by status" }),
  ).getByText(label);
  const item = title.closest("li")!;
  return { title, count: item.querySelector("p")!.textContent };
}

function tableTitles() {
  return within(screen.getByRole("table"))
    .getAllByRole("row")
    .slice(1)
    .map((row) => within(row).getAllByRole("cell")[0]!.textContent);
}

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe("RequestsOverview", () => {
  it("AND-34 AC2: shows one row of 3 cards, Open, In progress and Done, with the count of each status", () => {
    renderOverview(sixRequests);

    const cards = within(
      screen.getByRole("list", { name: "Requests by status" }),
    ).getAllByRole("listitem");
    expect(cards.map((item) => item.textContent)).toEqual([
      "Open3",
      "In progress1",
      "Done2",
    ]);
    expect(
      screen
        .getByRole("list", { name: "Requests by status" })
        .className.split(" "),
    ).toContain("grid-cols-3");
  });

  it('AND-34 AC3: shows the "Latest requests" title on the left and an "All requests" link to /requests on the right, below the cards', () => {
    renderOverview(sixRequests);

    const section = screen.getByRole("region", { name: "Latest requests" });
    const heading = within(section).getByRole("heading", {
      name: "Latest requests",
    });
    const link = within(section).getByRole("link", { name: "All requests" });
    expect(link.getAttribute("href")).toBe("/requests");
    expect(
      heading.compareDocumentPosition(link) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(heading.parentElement!.className).toContain("justify-between");
    expect(
      screen
        .getByRole("list", { name: "Requests by status" })
        .compareDocumentPosition(section) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("AND-34 AC4: shows the table with the Request, Team, Priority and Status columns, and the same badges", () => {
    renderOverview(sixRequests);

    const table = screen.getByRole("table");
    expect(
      within(table)
        .getAllByRole("columnheader")
        .map((cell) => cell.textContent),
    ).toEqual(["Request", "Team", "Priority", "Status"]);
    const first = within(table).getAllByRole("row")[1]!;
    expect(
      within(first)
        .getAllByRole("cell")
        .map((cell) => cell.textContent),
    ).toEqual(["Sixth", "Operations", "High", "Open"]);
    expect(within(first).getAllByRole("cell")[0]!.className).toContain(
      "truncate",
    );
  });

  it("AND-34 AC5: shows only the 4 newest Requests, in the API order", () => {
    renderOverview(sixRequests);

    expect(tableTitles()).toEqual(["Sixth", "Fifth", "Fourth", "Third"]);
  });

  it("AND-34 AC5: shows all the Requests when there are fewer than 4", () => {
    renderOverview(sixRequests.slice(4));

    expect(tableTitles()).toEqual(["Second", "First"]);
  });

  it("AND-34 AC6: counts all the Requests, also the ones that are not in the table", () => {
    renderOverview(sixRequests);

    // "First" (done) is not in the table, but the Done card counts it.
    expect(tableTitles()).not.toContain("First");
    expect(card("Done").count).toBe("2");
  });

  it("AND-34 AC6: the cards and the table use the useRequests() data from GET /api/requests", async () => {
    fetchMock.mockResolvedValue(
      Response.json({ data: [saved("From the API", "in_progress")] }),
    );

    renderOverview();

    expect(await screen.findByText("From the API")).toBeDefined();
    expect(fetchMock).toHaveBeenCalledWith("/api/requests");
    expect(card("In progress").count).toBe("1");
    expect(card("Open").count).toBe("0");
  });

  it("AND-34 AC7: shows a spinner while the data loads", () => {
    fetchMock.mockReturnValue(new Promise(() => {}));

    renderOverview();

    expect(
      screen.getByRole("status", { name: "Loading the requests" }),
    ).toBeDefined();
    expect(screen.queryByRole("table")).toBeNull();
  });

  it('AND-34 AC7: shows "Try again." and a button that loads the data again', async () => {
    fetchMock.mockResolvedValueOnce(
      Response.json({ error: { message: "down" } }, { status: 500 }),
    );
    fetchMock.mockResolvedValueOnce(
      Response.json({ data: [saved("After retry", "open")] }),
    );

    renderOverview();

    expect((await screen.findByRole("alert")).textContent).toBe("Try again.");
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    expect(await screen.findByText("After retry")).toBeDefined();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('AND-34 AC8: shows 0 on each card, and "All things are done" with a New request link, when there are no Requests', () => {
    renderOverview([]);

    expect(
      ["Open", "In progress", "Done"].map((label) => card(label).count),
    ).toEqual(["0", "0", "0"]);
    expect(screen.queryByRole("table")).toBeNull();
    const section = screen.getByRole("region", { name: "Latest requests" });
    expect(within(section).getByText("All things are done")).toBeDefined();
    expect(
      within(section)
        .getByRole("link", { name: "New request" })
        .getAttribute("href"),
    ).toBe("/requests/new");
  });
});

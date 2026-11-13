// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { Request } from "@/features/requests/schemas";

import { RequestTable } from "./request-table";

afterEach(() => {
  cleanup();
});

const requests: Request[] = [
  {
    title: "Laptop for the new hire",
    details: "Ana starts on Monday.",
    team: "Operations",
    priority: "high",
    status: "open",
  },
  {
    title: "Expense rules",
    details: "For travel.",
    team: "Finance",
    priority: "medium",
    status: "in_progress",
  },
  {
    title: "Reply to the customer",
    details: "About the invoice.",
    team: "Support",
    priority: "low",
    status: "done",
  },
];

function row(title: string) {
  return screen.getByRole("row", { name: new RegExp(title) });
}

function badge(cell: HTMLElement) {
  return cell.querySelector('[data-slot="badge"]') as HTMLElement;
}

describe("RequestTable", () => {
  it("AC5: is a table with the Request, Team, Priority and Status columns", () => {
    render(<RequestTable requests={requests} />);

    expect(screen.getByRole("table")).toBeDefined();
    expect(
      screen.getAllByRole("columnheader").map((header) => header.textContent),
    ).toEqual(["Request", "Team", "Priority", "Status"]);
  });

  it("AC1: shows one row for each Request with its values", () => {
    render(<RequestTable requests={requests} />);

    expect(screen.getAllByRole("row")).toHaveLength(1 + requests.length);
    expect(
      within(row("Laptop for the new hire"))
        .getAllByRole("cell")
        .map((cell) => cell.textContent),
    ).toEqual(["Laptop for the new hire", "Operations", "High", "Open"]);
  });

  it("AC3: shows a high priority in the danger (destructive) badge", () => {
    render(<RequestTable requests={requests} />);

    const priority = within(row("Laptop for the new hire")).getAllByRole(
      "cell",
    )[2]!;
    expect(badge(priority).dataset.variant).toBe("destructive");
    expect(badge(priority).textContent).toBe("High");
  });

  it("AC3: shows medium in the secondary badge and low in the outline badge", () => {
    render(<RequestTable requests={requests} />);

    const medium = within(row("Expense rules")).getAllByRole("cell")[2]!;
    const low = within(row("Reply to the customer")).getAllByRole("cell")[2]!;
    expect(badge(medium).dataset.variant).toBe("secondary");
    expect(badge(low).dataset.variant).toBe("outline");
  });

  it("AC4: shows each status in the primary (default) badge", () => {
    render(<RequestTable requests={requests} />);

    const statuses = requests.map(
      (request) => within(row(request.title)).getAllByRole("cell")[3]!,
    );
    expect(statuses.map((cell) => badge(cell).dataset.variant)).toEqual([
      "default",
      "default",
      "default",
    ]);
    expect(statuses.map((cell) => cell.textContent)).toEqual([
      "Open",
      "In progress",
      "Done",
    ]);
  });

  it("cuts a long title with … and keeps the full title in the title attribute", () => {
    const title = "A very long title ".repeat(20).trim();
    render(<RequestTable requests={[{ ...requests[0]!, title }]} />);

    const cell = screen.getByText(title);
    expect(cell.className).toContain("truncate");
    expect(cell.getAttribute("title")).toBe(title);
    expect(screen.getByRole("table").className).toContain("table-fixed");
  });
});

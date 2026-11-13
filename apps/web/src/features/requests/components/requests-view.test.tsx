// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { Request } from "@/features/requests/schemas";

import { RequestsView } from "./requests-view";

afterEach(() => {
  cleanup();
});

const request: Request = {
  title: "Laptop for the new hire",
  details: "Ana starts on Monday.",
  team: "Operations",
  priority: "high",
  status: "open",
};

function follows(first: Element, second: Element) {
  return Boolean(
    first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING,
  );
}

describe("RequestsView", () => {
  it('AC6: shows the title "All things are done" when there are no Requests', () => {
    render(<RequestsView requests={[]} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "All things are done" }),
    ).toBeDefined();
    expect(screen.queryByRole("table")).toBeNull();
  });

  it("AC6: shows a New request link below the empty title", () => {
    render(<RequestsView requests={[]} />);

    const heading = screen.getByRole("heading", { level: 1 });
    const link = screen.getByRole("link", { name: "New request" });
    expect(follows(heading, link)).toBe(true);
    expect(link.dataset.slot).toBeUndefined();
  });

  it('AC7: shows the title "Requests" and the table when there are Requests', () => {
    render(<RequestsView requests={[request]} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Requests" }),
    ).toBeDefined();
    expect(screen.getByRole("table")).toBeDefined();
    expect(screen.queryByText("All things are done")).toBeNull();
  });

  it("AC7: shows a primary New request button on the right side of the title", () => {
    render(<RequestsView requests={[request]} />);

    const heading = screen.getByRole("heading", { level: 1 });
    const button = screen.getByRole("link", { name: "New request" });
    expect(button.dataset.slot).toBe("button");
    expect(button.dataset.variant).toBe("default");
    expect(button.parentElement).toBe(heading.parentElement);
    expect(heading.parentElement!.className).toContain("justify-between");
    expect(follows(heading, button)).toBe(true);
  });

  it("AC2: the New request link and button go to /requests/new", () => {
    render(<RequestsView requests={[]} />);
    expect(
      screen.getByRole("link", { name: "New request" }).getAttribute("href"),
    ).toBe("/requests/new");
    cleanup();

    render(<RequestsView requests={[request]} />);
    expect(
      screen.getByRole("link", { name: "New request" }).getAttribute("href"),
    ).toBe("/requests/new");
  });

  it('AC9: shows "Your request was created." after the form redirects here', () => {
    render(<RequestsView requests={[request]} created />);

    expect(screen.getByRole("status").textContent).toBe(
      "Your request was created.",
    );
    expect(
      follows(
        screen.getByRole("heading", { level: 1 }),
        screen.getByRole("status"),
      ),
    ).toBe(true);
    expect(follows(screen.getByRole("status"), screen.getByRole("table"))).toBe(
      true,
    );
  });

  it("AC9: shows no success message when the user opens the page", () => {
    render(<RequestsView requests={[request]} />);

    expect(screen.queryByRole("status")).toBeNull();
  });
});

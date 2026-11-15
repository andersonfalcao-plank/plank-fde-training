// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AdminSidebar } from "./admin-sidebar";

vi.mock("next/navigation", () => ({ usePathname: vi.fn() }));

afterEach(() => {
  cleanup();
});

function current() {
  return screen
    .getAllByRole("link")
    .filter((link) => link.getAttribute("aria-current") === "page")
    .map((link) => link.textContent);
}

describe("AdminSidebar", () => {
  it('AC2: shows a paragraph "ADMIN" and the Overview and Settings links', () => {
    vi.mocked(usePathname).mockReturnValue("/admin");
    render(<AdminSidebar />);

    const nav = screen.getByRole("navigation", { name: "Admin" });
    const label = within(nav).getByText("ADMIN");
    expect(label.tagName).toBe("P");
    const links = within(nav).getAllByRole("link");
    expect(
      links.map((link) => [link.textContent, link.getAttribute("href")]),
    ).toEqual([
      ["Overview", "/admin"],
      ["Settings", "/admin/settings"],
    ]);
  });

  it("AC6: marks only Overview as the current page on /admin", () => {
    vi.mocked(usePathname).mockReturnValue("/admin");
    render(<AdminSidebar />);

    expect(current()).toEqual(["Overview"]);
    expect(screen.getByRole("link", { name: "Overview" }).className).toContain(
      "text-foreground",
    );
  });

  it("AC6: marks only Settings as the current page on /admin/settings", () => {
    vi.mocked(usePathname).mockReturnValue("/admin/settings");
    render(<AdminSidebar />);

    expect(current()).toEqual(["Settings"]);
    expect(screen.getByRole("link", { name: "Overview" }).className).toContain(
      "text-muted-foreground",
    );
  });

  it("AC7: is a row of links on mobile and a column from md up", () => {
    vi.mocked(usePathname).mockReturnValue("/admin");
    render(<AdminSidebar />);

    const nav = screen.getByRole("navigation", { name: "Admin" });
    const list = within(nav).getByRole("list");
    for (const element of [nav, list]) {
      expect(element.className.split(" ")).toEqual(
        expect.arrayContaining(["flex", "flex-row", "md:flex-col"]),
      );
    }
  });
});

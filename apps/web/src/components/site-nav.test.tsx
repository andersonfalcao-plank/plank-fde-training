// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SiteNav } from "./site-nav";

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

describe("SiteNav", () => {
  it("AND-33 AC5: has the Requests link and the Admin link, and no Home or Settings link", () => {
    vi.mocked(usePathname).mockReturnValue("/");
    render(<SiteNav />);

    const links = screen.getAllByRole("link");
    expect(
      links.map((link) => [link.textContent, link.getAttribute("href")]),
    ).toEqual([
      ["Requests", "/requests"],
      ["Admin", "/admin"],
    ]);
  });

  it("AND-27: marks Requests as the current page on /requests and /requests/new", () => {
    for (const pathname of ["/requests", "/requests/new"]) {
      vi.mocked(usePathname).mockReturnValue(pathname);
      render(<SiteNav />);

      expect(current()).toEqual(["Requests"]);
      cleanup();
    }
  });

  it("AND-33 AC6: marks Admin as the current page (black) on every /admin page", () => {
    for (const pathname of ["/admin", "/admin/settings"]) {
      vi.mocked(usePathname).mockReturnValue(pathname);
      render(<SiteNav />);

      expect(current()).toEqual(["Admin"]);
      const admin = screen.getByRole("link", { name: "Admin" });
      expect(admin.className).toContain("text-foreground");
      expect(admin.className).not.toContain("text-muted-foreground");
      cleanup();
    }
  });

  it("AND-33 AC6: marks no link on the home page", () => {
    vi.mocked(usePathname).mockReturnValue("/");
    render(<SiteNav />);

    expect(current()).toEqual([]);
  });

  it("AND-33 AC6: does not mark Admin on a page that only starts with /admin", () => {
    vi.mocked(usePathname).mockReturnValue("/administrator");
    render(<SiteNav />);

    expect(current()).toEqual([]);
  });
});

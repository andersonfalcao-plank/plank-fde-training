// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SiteNav } from "./site-nav";

vi.mock("next/navigation", () => ({ usePathname: vi.fn() }));

afterEach(() => {
  cleanup();
});

describe("SiteNav", () => {
  it("AND-27: has a Requests link to /requests between Home and Settings", () => {
    vi.mocked(usePathname).mockReturnValue("/");
    render(<SiteNav />);

    const links = screen.getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual([
      "Home",
      "Requests",
      "Settings",
    ]);
    expect(
      screen.getByRole("link", { name: "Requests" }).getAttribute("href"),
    ).toBe("/requests");
  });

  it("AND-27: marks Requests as the current page on /requests and /requests/new", () => {
    for (const pathname of ["/requests", "/requests/new"]) {
      vi.mocked(usePathname).mockReturnValue(pathname);
      render(<SiteNav />);

      expect(
        screen
          .getByRole("link", { name: "Requests" })
          .getAttribute("aria-current"),
      ).toBe("page");
      expect(
        screen.getByRole("link", { name: "Home" }).getAttribute("aria-current"),
      ).toBeNull();
      cleanup();
    }
  });
});

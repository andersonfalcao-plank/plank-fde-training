// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SiteHeader } from "./site-header";

vi.mock("next/navigation", () => ({ usePathname: vi.fn() }));

afterEach(() => {
  cleanup();
});

describe("SiteHeader", () => {
  it("AND-33 AC5: keeps the WorkBot title, then the Requests and Admin links", () => {
    vi.mocked(usePathname).mockReturnValue("/admin/settings");
    render(<SiteHeader />);

    const header = screen.getByRole("banner");
    const links = within(header).getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual([
      "WorkBot",
      "Requests",
      "Admin",
    ]);
    expect(links[0]!.getAttribute("href")).toBe("/");
  });
});

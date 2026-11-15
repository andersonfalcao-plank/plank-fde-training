// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { usePathname } from "next/navigation";
import { afterEach, describe, expect, it, vi } from "vitest";

import AdminLayout from "./layout";
import AdminOverviewPage from "./page";

vi.mock("next/navigation", () => ({ usePathname: vi.fn() }));

afterEach(() => {
  cleanup();
});

describe("AdminLayout", () => {
  it("AC1: shows the sidebar and the page content", () => {
    vi.mocked(usePathname).mockReturnValue("/admin/settings");
    render(
      <AdminLayout params={Promise.resolve({})}>
        <p>Page content</p>
      </AdminLayout>,
    );

    const sidebar = screen.getByRole("navigation", { name: "Admin" });
    const content = screen.getByText("Page content");
    expect(
      sidebar.compareDocumentPosition(content) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("AC1: is the layout of the app/admin folder, so all /admin pages use it", () => {
    // Vitest runs in apps/web.
    const admin = resolve("src/app/admin");
    expect(existsSync(resolve(admin, "layout.tsx"))).toBe(true);
    expect(readdirSync(admin)).toEqual(
      expect.arrayContaining(["layout.tsx", "page.tsx", "settings"]),
    );
  });
});

describe("AdminOverviewPage", () => {
  it('AC1: /admin shows the title "Overview"', () => {
    render(<AdminOverviewPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Overview" }),
    ).toBeDefined();
  });
});

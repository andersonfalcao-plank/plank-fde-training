// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SiteTitle } from "./site-title";

vi.mock("next/navigation", () => ({ usePathname: vi.fn() }));

afterEach(() => {
  cleanup();
});

describe("SiteTitle", () => {
  it("renders the title as text on the home page", () => {
    vi.mocked(usePathname).mockReturnValue("/");
    render(<SiteTitle />);

    expect(screen.getByText("WorkBot").tagName).toBe("SPAN");
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("renders the title as a link to the home page on other pages", () => {
    vi.mocked(usePathname).mockReturnValue("/settings");
    render(<SiteTitle />);

    expect(
      screen.getByRole("link", { name: "WorkBot" }).getAttribute("href"),
    ).toBe("/");
  });
});

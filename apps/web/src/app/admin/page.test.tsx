// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import AdminOverviewPage from "./page";

// OverviewContent is an async Server Component. Vitest cannot render it.
vi.mock("./_components/overview-content", () => ({
  OverviewContent: () => <p>Overview content</p>,
}));

afterEach(() => {
  cleanup();
});

describe("AdminOverviewPage", () => {
  it('AND-34 AC1: has the title "Overview", then the overview content', () => {
    render(<AdminOverviewPage />);

    const title = screen.getByRole("heading", { level: 1, name: "Overview" });
    const content = screen.getByText("Overview content");
    expect(
      title.compareDocumentPosition(content) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});

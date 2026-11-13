// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import NewRequestPage from "./page";

vi.mock("@/features/requests/server/actions", () => ({
  createRequestAction: vi.fn(),
}));

afterEach(() => {
  cleanup();
});

describe("NewRequestPage", () => {
  it("shows the description paragraph below the title", () => {
    render(<NewRequestPage />);

    const title = screen.getByRole("heading", {
      level: 1,
      name: "New request",
    });
    const description = screen.getByText(
      "Describe what you need and which team should pick it up.",
    );

    expect(description.tagName).toBe("P");
    expect(
      title.compareDocumentPosition(description) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("shows the description before the form", () => {
    render(<NewRequestPage />);

    const description = screen.getByText(
      "Describe what you need and which team should pick it up.",
    );

    expect(
      description.compareDocumentPosition(screen.getByLabelText("Title")) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});

// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import NewRequestPage from "./page";

vi.mock("@/features/requests/server/actions", () => ({
  createRequestAction: vi.fn(),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

// The root layout gives each page a QueryClient. The form needs it.
function wrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={new QueryClient()}>
      {children}
    </QueryClientProvider>
  );
}

afterEach(() => {
  cleanup();
});

describe("NewRequestPage", () => {
  it("shows the description paragraph below the title", () => {
    render(<NewRequestPage />, { wrapper });

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
    render(<NewRequestPage />, { wrapper });

    const description = screen.getByText(
      "Describe what you need and which team should pick it up.",
    );

    expect(
      description.compareDocumentPosition(screen.getByLabelText("Title")) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});

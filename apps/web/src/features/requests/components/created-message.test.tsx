// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import { Activity, StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CreatedMessage } from "./created-message";

// Waits for the timer that the cleanup starts.
async function flushTimers() {
  await act(() => new Promise((resolve) => setTimeout(resolve, 10)));
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

beforeEach(() => {
  window.history.replaceState(null, "", "/");
});

function openPage(url: string) {
  window.history.replaceState(null, "", url);
}

describe("CreatedMessage", () => {
  it('AC1: shows "Your request was created."', () => {
    openPage("/requests?created=token-a");
    render(<CreatedMessage token="token-a" />);

    expect(screen.getByRole("status").textContent).toBe(
      "Your request was created.",
    );
  });

  it("AC2/AC3: removes the created param from the URL, so a reload shows no message", () => {
    openPage("/requests?created=token-b#top");
    const replaceState = vi.spyOn(window.history, "replaceState");

    render(<CreatedMessage token="token-b" />);

    expect(replaceState).toHaveBeenCalledWith(null, "", "/requests#top");
    expect(window.location.pathname + window.location.search).toBe("/requests");
  });

  it("AC2: keeps the other search params", () => {
    openPage("/requests?team=Finance&created=token-c");

    render(<CreatedMessage token="token-c" />);

    expect(window.location.search).toBe("?team=Finance");
  });

  it("AC4: shows no message when the page shows again with the same token (Back button)", () => {
    openPage("/requests?created=token-d");
    render(<CreatedMessage token="token-d" />);
    expect(screen.queryByRole("status")).not.toBeNull();
    cleanup();

    // The router shows the cached page again, with the same token.
    render(<CreatedMessage token="token-d" />);

    expect(screen.queryByRole("status")).toBeNull();
  });

  it("AC4: shows no message when Next.js hides the page and shows it again (Activity, Back button)", async () => {
    openPage("/requests?created=token-h");
    const view = (mode: "visible" | "hidden") => (
      <Activity mode={mode}>
        <CreatedMessage token="token-h" />
      </Activity>
    );
    const { rerender } = render(view("visible"));
    expect(screen.queryByRole("status")).not.toBeNull();

    // The user goes to another page: Next.js hides the Requests page.
    rerender(view("hidden"));
    await flushTimers();
    // The user clicks Back: Next.js shows the same page again, with its state.
    rerender(view("visible"));
    await flushTimers();

    expect(screen.queryByRole("status")).toBeNull();
  });

  it("AC1: keeps the message in Strict Mode (development)", async () => {
    openPage("/requests?created=token-i");
    render(
      <StrictMode>
        <CreatedMessage token="token-i" />
      </StrictMode>,
    );

    await flushTimers();

    expect(screen.getByRole("status").textContent).toBe(
      "Your request was created.",
    );
  });

  it("AC1: shows the message again for a new token (a second new Request)", () => {
    openPage("/requests?created=token-e");
    render(<CreatedMessage token="token-e" />);
    cleanup();

    openPage("/requests?created=token-f");
    render(<CreatedMessage token="token-f" />);

    expect(screen.getByRole("status").textContent).toBe(
      "Your request was created.",
    );
  });

  it("does not change the URL when it has no created param", () => {
    openPage("/requests");
    const replaceState = vi.spyOn(window.history, "replaceState");

    render(<CreatedMessage token="token-g" />);

    expect(replaceState).not.toHaveBeenCalled();
  });
});

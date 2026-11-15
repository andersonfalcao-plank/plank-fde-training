// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { Activity } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  type CreateRequestResult,
  createRequestAction,
} from "@/features/requests/server/actions";

import { CreateRequestForm } from "./create-request-form";

const push = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("@/features/requests/server/actions", () => ({
  createRequestAction: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.mocked(createRequestAction).mockReset();
  push.mockReset();
});

function renderForm() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <CreateRequestForm />
    </QueryClientProvider>,
  );
}

function submit() {
  fireEvent.click(screen.getByRole("button", { name: /Submit request/ }));
}

function fillIn() {
  fireEvent.change(screen.getByLabelText("Title"), {
    target: { value: "Laptop" },
  });
  fireEvent.change(screen.getByLabelText("Details"), {
    target: { value: "For Ana" },
  });
  fireEvent.change(screen.getByLabelText("Team"), {
    target: { value: "Finance" },
  });
  fireEvent.change(screen.getByLabelText("Priority"), {
    target: { value: "high" },
  });
}

function expectInputKept() {
  expect((screen.getByLabelText("Title") as HTMLInputElement).value).toBe(
    "Laptop",
  );
  expect((screen.getByLabelText("Details") as HTMLTextAreaElement).value).toBe(
    "For Ana",
  );
  expect((screen.getByLabelText("Team") as HTMLSelectElement).value).toBe(
    "Finance",
  );
  expect((screen.getByLabelText("Priority") as HTMLSelectElement).value).toBe(
    "high",
  );
}

describe("CreateRequestForm", () => {
  it("shows the fields in order: title, details, team, priority, then the submit button", () => {
    renderForm();

    const fields = [
      screen.getByLabelText("Title"),
      screen.getByLabelText("Details"),
      screen.getByLabelText("Team"),
      screen.getByLabelText("Priority"),
      screen.getByRole("button", { name: /Submit request/ }),
    ];
    for (let i = 1; i < fields.length; i++) {
      expect(
        fields[i - 1]!.compareDocumentPosition(fields[i]!) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    }
  });

  it("AC5: selects medium as the priority", () => {
    renderForm();

    expect((screen.getByLabelText("Priority") as HTMLSelectElement).value).toBe(
      "medium",
    );
  });

  it("AC6: shows the teams and the priorities from the hooks", () => {
    renderForm();

    const teams = Array.from(
      (screen.getByLabelText("Team") as HTMLSelectElement).options,
    ).map((option) => option.textContent);
    const priorities = Array.from(
      (screen.getByLabelText("Priority") as HTMLSelectElement).options,
    ).map((option) => option.textContent);

    expect(teams).toEqual([
      "Select a team",
      "Operations",
      "Finance",
      "Support",
    ]);
    expect(priorities).toEqual(["Low", "Medium", "High"]);
  });

  it("AC3: limits the title to 300 characters", () => {
    renderForm();

    expect(screen.getByLabelText("Title").getAttribute("maxlength")).toBe(
      "300",
    );
  });

  it("AND-32 AC7: sends the form values to the mutation, which calls the server action", async () => {
    vi.mocked(createRequestAction).mockResolvedValue({
      ok: false,
      error: "Try again.",
    });
    renderForm();
    fillIn();

    submit();

    await waitFor(() => expect(createRequestAction).toHaveBeenCalledTimes(1));
    expect(vi.mocked(createRequestAction).mock.calls[0]![0]).toEqual({
      title: "Laptop",
      details: "For Ana",
      team: "Finance",
      priority: "high",
    });
  });

  it("AND-32 AC10: goes to /requests with the created token after a success", async () => {
    vi.mocked(createRequestAction).mockResolvedValue({
      ok: true,
      data: {
        title: "Laptop",
        details: "For Ana",
        team: "Finance",
        priority: "high",
        status: "open",
        id: "4de9754f-db84-44e2-8577-a99067a54be9",
        createdAt: "2026-11-15T20:26:16.822Z",
      },
    });
    renderForm();
    fillIn();

    submit();

    await waitFor(() =>
      expect(push).toHaveBeenCalledWith(
        "/requests?created=4de9754f-db84-44e2-8577-a99067a54be9",
      ),
    );
  });

  it("AND-32 AC11: puts the 422 field errors on the matching fields", async () => {
    vi.mocked(createRequestAction).mockResolvedValue({
      ok: false,
      fieldErrors: {
        title: "Enter a title.",
        details: "Enter the details.",
        team: "Select a team.",
      },
      error: "Invalid input",
    });
    renderForm();

    submit();

    await waitFor(() => {
      expect(screen.getByLabelText("Title").getAttribute("aria-invalid")).toBe(
        "true",
      );
    });
    expect(screen.getByLabelText("Details").getAttribute("aria-invalid")).toBe(
      "true",
    );
    expect(screen.getByLabelText("Team").getAttribute("aria-invalid")).toBe(
      "true",
    );
    expect(
      screen.getByLabelText("Priority").getAttribute("aria-invalid"),
    ).toBeNull();
    expect(screen.getByText("Enter a title.")).toBeDefined();
    expect(screen.getByText("Enter the details.")).toBeDefined();
    expect(screen.getByText("Select a team.")).toBeDefined();
    expect(
      screen.getByLabelText("Title").getAttribute("aria-describedby"),
    ).toBe("title-error");
    // The field errors explain the problem, so there is no message above the button.
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("AND-32 AC11: shows error.message above the submit button for a 422 with no field errors", async () => {
    vi.mocked(createRequestAction).mockResolvedValue({
      ok: false,
      fieldErrors: {},
      error: "Invalid input",
    });
    renderForm();

    submit();

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toBe("Invalid input");
    expect(
      alert.compareDocumentPosition(
        screen.getByRole("button", { name: /Submit request/ }),
      ) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it.each<[string, () => void]>([
    [
      "a 400 or a 500",
      () =>
        vi.mocked(createRequestAction).mockResolvedValue({
          ok: false,
          error: "Try again.",
        }),
    ],
    [
      "a network error",
      () =>
        vi
          .mocked(createRequestAction)
          .mockRejectedValue(new TypeError("Failed to fetch")),
    ],
  ])(
    'AND-32 AC12: shows "Try again." and keeps the input after %s',
    async (_name, mockResult) => {
      mockResult();
      renderForm();
      fillIn();

      submit();

      expect((await screen.findByRole("alert")).textContent).toBe("Try again.");
      expectInputKept();
      expect(push).not.toHaveBeenCalled();
    },
  );

  it("AND-32 AC13: disables the submit button and shows a spinner while the mutation is pending", async () => {
    let finish: (result: CreateRequestResult) => void = () => {};
    vi.mocked(createRequestAction).mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    renderForm();
    const button = screen.getByRole("button", { name: /Submit request/ });
    expect(button.hasAttribute("disabled")).toBe(false);
    expect(screen.queryByRole("status")).toBeNull();

    submit();

    await waitFor(() => expect(button.hasAttribute("disabled")).toBe(true));
    expect(
      screen.getByRole("status", { name: "Saving the request" }),
    ).toBeDefined();

    finish({ ok: false, error: "Try again." });

    await waitFor(() => expect(button.hasAttribute("disabled")).toBe(false));
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("AND-32 AC10: shows an empty form with a working button when the user comes back after a success", async () => {
    vi.mocked(createRequestAction).mockResolvedValue({
      ok: true,
      data: {
        title: "Laptop",
        details: "For Ana",
        team: "Finance",
        priority: "high",
        status: "open",
        id: "4de9754f-db84-44e2-8577-a99067a54be9",
        createdAt: "2026-11-15T20:26:16.822Z",
      },
    });
    const queryClient = new QueryClient();
    const page = (mode: "visible" | "hidden") => (
      <QueryClientProvider client={queryClient}>
        <Activity mode={mode}>
          <CreateRequestForm />
        </Activity>
      </QueryClientProvider>
    );
    const { rerender } = render(page("visible"));
    fillIn();
    submit();
    await waitFor(() => expect(push).toHaveBeenCalled());
    const button = screen.getByRole("button", { name: /Submit request/ });

    // The user is on /requests: Next.js hides the form page.
    rerender(page("hidden"));
    // The user clicks "New request": Next.js shows the same form page again.
    rerender(page("visible"));

    await waitFor(() => expect(button.hasAttribute("disabled")).toBe(false));
    expect(screen.queryByRole("status")).toBeNull();
    expect((screen.getByLabelText("Title") as HTMLInputElement).value).toBe("");
    expect(
      (screen.getByLabelText("Details") as HTMLTextAreaElement).value,
    ).toBe("");
    expect((screen.getByLabelText("Team") as HTMLSelectElement).value).toBe("");
    expect((screen.getByLabelText("Priority") as HTMLSelectElement).value).toBe(
      "medium",
    );
  });

  it("AND-32 AC10: shows an empty form also when the page hides before the success arrives", async () => {
    let finish: (result: CreateRequestResult) => void = () => {};
    vi.mocked(createRequestAction).mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    const queryClient = new QueryClient();
    const page = (mode: "visible" | "hidden") => (
      <QueryClientProvider client={queryClient}>
        <Activity mode={mode}>
          <CreateRequestForm />
        </Activity>
      </QueryClientProvider>
    );
    const { rerender } = render(page("visible"));
    fillIn();
    submit();
    const button = screen.getByRole("button", { name: /Submit request/ });
    await waitFor(() => expect(button.hasAttribute("disabled")).toBe(true));

    // The navigation hides the page first. Then the success state arrives.
    rerender(page("hidden"));
    finish({
      ok: true,
      data: {
        title: "Laptop",
        details: "For Ana",
        team: "Finance",
        priority: "high",
        status: "open",
        id: "4de9754f-db84-44e2-8577-a99067a54be9",
        createdAt: "2026-11-15T20:26:16.822Z",
      },
    });
    await waitFor(() => expect(push).toHaveBeenCalled());
    // The user clicks "New request": Next.js shows the same form page again.
    rerender(page("visible"));

    await waitFor(() => expect(button.hasAttribute("disabled")).toBe(false));
    expect((screen.getByLabelText("Title") as HTMLInputElement).value).toBe("");
    expect((screen.getByLabelText("Team") as HTMLSelectElement).value).toBe("");
    expect((screen.getByLabelText("Priority") as HTMLSelectElement).value).toBe(
      "medium",
    );
  });
});

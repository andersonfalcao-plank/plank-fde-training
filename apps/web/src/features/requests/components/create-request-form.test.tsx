// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createRequestAction } from "@/features/requests/server/actions";

import { CreateRequestForm } from "./create-request-form";

vi.mock("@/features/requests/server/actions", () => ({
  createRequestAction: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.mocked(createRequestAction).mockReset();
});

function submit() {
  fireEvent.click(screen.getByRole("button", { name: "Submit request" }));
}

describe("CreateRequestForm", () => {
  it("shows the fields in order: title, details, team, priority, then the submit button", () => {
    render(<CreateRequestForm />);

    const fields = [
      screen.getByLabelText("Title"),
      screen.getByLabelText("Details"),
      screen.getByLabelText("Team"),
      screen.getByLabelText("Priority"),
      screen.getByRole("button", { name: "Submit request" }),
    ];
    for (let i = 1; i < fields.length; i++) {
      expect(
        fields[i - 1]!.compareDocumentPosition(fields[i]!) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    }
  });

  it("AC5: selects medium as the priority", () => {
    render(<CreateRequestForm />);

    expect((screen.getByLabelText("Priority") as HTMLSelectElement).value).toBe(
      "medium",
    );
  });

  it("AC6: shows the teams and the priorities from the hooks", () => {
    render(<CreateRequestForm />);

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
    render(<CreateRequestForm />);

    expect(screen.getByLabelText("Title").getAttribute("maxlength")).toBe(
      "300",
    );
  });

  it("AC1: marks the required fields when the action returns errors", async () => {
    vi.mocked(createRequestAction).mockResolvedValue({
      fieldErrors: {
        title: "Enter a title.",
        details: "Enter the details.",
        team: "Select a team.",
      },
      values: { title: "", details: "", team: "", priority: "medium" },
    });
    render(<CreateRequestForm />);

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
  });

  it("AC1: keeps the values that the user typed after an error", async () => {
    vi.mocked(createRequestAction).mockResolvedValue({
      fieldErrors: { details: "Enter the details." },
      values: {
        title: "Laptop",
        details: "",
        team: "Finance",
        priority: "high",
      },
    });
    render(<CreateRequestForm />);

    submit();

    await waitFor(() => {
      expect(screen.getByText("Enter the details.")).toBeDefined();
    });
    expect((screen.getByLabelText("Title") as HTMLInputElement).value).toBe(
      "Laptop",
    );
    expect((screen.getByLabelText("Team") as HTMLSelectElement).value).toBe(
      "Finance",
    );
    expect((screen.getByLabelText("Priority") as HTMLSelectElement).value).toBe(
      "high",
    );
  });

  it("AC2: sends the form data to the server action", async () => {
    vi.mocked(createRequestAction).mockResolvedValue({
      fieldErrors: {},
      values: {},
    });
    render(<CreateRequestForm />);
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Laptop" },
    });
    fireEvent.change(screen.getByLabelText("Details"), {
      target: { value: "For Ana" },
    });
    fireEvent.change(screen.getByLabelText("Team"), {
      target: { value: "Support" },
    });

    submit();

    await waitFor(() => {
      expect(createRequestAction).toHaveBeenCalledTimes(1);
    });
    const formData = vi.mocked(createRequestAction).mock.calls[0]![1];
    expect(Object.fromEntries(formData)).toEqual({
      title: "Laptop",
      details: "For Ana",
      team: "Support",
      priority: "medium",
    });
  });
});

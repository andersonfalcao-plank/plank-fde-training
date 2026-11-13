import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  type CreateRequestState,
  createRequestAction,
} from "@/features/requests/server/actions";
import { clearRequests, listRequests } from "@/features/requests/server/store";

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

const { redirect } = await import("next/navigation");

const initialState: CreateRequestState = { fieldErrors: {}, values: {} };

function formData(fields: Record<string, string>) {
  const data = new FormData();
  for (const [name, value] of Object.entries(fields)) data.set(name, value);
  return data;
}

const valid = {
  title: "Laptop for the new hire",
  details: "Ana starts on Monday.",
  team: "Operations",
  priority: "high",
};

beforeEach(() => {
  clearRequests();
  vi.mocked(redirect).mockClear();
});

describe("createRequestAction", () => {
  it("AC1/AC4: returns an error for each empty required field and saves nothing", async () => {
    const state = await createRequestAction(
      initialState,
      formData({ title: " ", details: "", team: "", priority: "medium" }),
    );

    expect(state.fieldErrors).toEqual({
      title: "Enter a title.",
      details: "Enter the details.",
      team: "Select a team.",
      priority: undefined,
    });
    expect(listRequests()).toEqual([]);
    expect(redirect).not.toHaveBeenCalled();
  });

  it("AC1/AC4: returns the field messages when the browser does not send the fields", async () => {
    // A select with the disabled "Select a team" option sends no team.
    const state = await createRequestAction(initialState, formData({}));

    expect(state.fieldErrors).toEqual({
      title: "Enter a title.",
      details: "Enter the details.",
      team: "Select a team.",
      priority: undefined,
    });
  });

  it("AC1: returns the values that the user sent, so the form keeps them", async () => {
    const state = await createRequestAction(
      initialState,
      formData({ ...valid, details: "" }),
    );

    expect(state.values).toEqual({ ...valid, details: "" });
  });

  it("AC3: returns an error for a title of more than 300 characters", async () => {
    const state = await createRequestAction(
      initialState,
      formData({ ...valid, title: "a".repeat(301) }),
    );

    expect(state.fieldErrors.title).toBe(
      "Use 300 characters or fewer for the title.",
    );
    expect(listRequests()).toEqual([]);
  });

  it("AC2: saves a valid Request and redirects to the list", async () => {
    await createRequestAction(initialState, formData(valid));

    expect(listRequests()).toEqual([valid]);
    expect(redirect).toHaveBeenCalledWith("/requests?created=1");
  });

  it('AC5: uses "medium" when the form sends no priority', async () => {
    const { title, details, team } = valid;
    await createRequestAction(initialState, formData({ title, details, team }));

    expect(listRequests()[0]?.priority).toBe("medium");
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createRequestAction } from "@/features/requests/server/actions";
import {
  clearSavedRequests,
  listSavedRequests,
  saveRequest,
} from "@/features/requests/server/api-store";

// The real in-memory store runs. The mock only makes a save fail in one test.
vi.mock("@/features/requests/server/api-store", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("@/features/requests/server/api-store")
    >();
  return { ...actual, saveRequest: vi.fn(actual.saveRequest) };
});

const values = {
  title: "Laptop for the new hire",
  details: "Ana starts on Monday.",
  team: "Operations",
  priority: "high",
};

beforeEach(() => {
  clearSavedRequests();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("createRequestAction", () => {
  it("AND-32 AC8: saves the Request in the API store and returns { ok: true, data }", async () => {
    const result = await createRequestAction(values);

    expect(result.ok).toBe(true);
    const saved = await listSavedRequests();
    expect(saved).toHaveLength(1);
    expect(result).toEqual({ ok: true, data: saved[0] });
    expect(saved[0]).toMatchObject({ ...values, status: "open" });
  });

  it("AND-32 AC8: keeps only the known fields, and uses medium for an empty priority", async () => {
    const result = await createRequestAction({
      ...values,
      priority: "",
      // @ts-expect-error: the client can send other fields. They are not saved.
      status: "done",
    });

    expect(result.ok).toBe(true);
    expect((await listSavedRequests())[0]).toMatchObject({
      priority: "medium",
      status: "open",
    });
  });

  it("AND-32 AC8/AC11: returns { ok: false, fieldErrors, error } for values that are not valid, and saves nothing", async () => {
    const result = await createRequestAction({
      title: " ",
      details: "",
      team: "",
      priority: "urgent",
    });

    expect(result).toEqual({
      ok: false,
      fieldErrors: {
        title: "Enter a title.",
        details: "Enter the details.",
        team: "Select a team.",
        priority: "Select a priority.",
      },
      error: "Invalid input",
    });
    expect(await listSavedRequests()).toEqual([]);
  });

  it("AND-32 AC11: returns the field messages when the values are missing", async () => {
    const result = await createRequestAction({});

    expect(result).toEqual({
      ok: false,
      fieldErrors: {
        title: "Enter a title.",
        details: "Enter the details.",
        team: "Select a team.",
      },
      error: "Invalid input",
    });
  });

  it('AND-32 AC12: returns { ok: false, error: "Try again." } when the store fails', async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(saveRequest).mockRejectedValueOnce(new Error("down"));

    expect(await createRequestAction(values)).toEqual({
      ok: false,
      error: "Try again.",
    });
  });
});

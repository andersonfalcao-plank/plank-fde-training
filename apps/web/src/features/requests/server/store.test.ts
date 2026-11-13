import { beforeEach, describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";

import {
  clearRequests,
  createRequest,
  listRequests,
} from "@/features/requests/server/store";

const details = "See the attached quote.";

beforeEach(() => {
  clearRequests();
});

describe("createRequest", () => {
  it("AND-24 AC4: trims the title, details and team", () => {
    const request = createRequest({
      title: "  Laptop for the new hire  ",
      details: "\n Ana starts on Monday. \n",
      team: "  Operations ",
      priority: "high",
    });

    expect(request).toEqual({
      title: "Laptop for the new hire",
      details: "Ana starts on Monday.",
      team: "Operations",
      priority: "high",
    });
  });

  it('AND-24 AC4: uses "medium" for priority when it is not given', () => {
    const request = createRequest({
      title: "Expense rules",
      details,
      team: "Finance",
    });

    expect(request.priority).toBe("medium");
  });

  it("AND-24 AC4: rejects an empty title or a title with only spaces", () => {
    expect(() =>
      createRequest({ title: "", details, team: "Finance" }),
    ).toThrow(ZodError);
    expect(() =>
      createRequest({ title: "   ", details, team: "Finance" }),
    ).toThrow(ZodError);
    expect(listRequests()).toEqual([]);
  });

  it("AND-25 AC4: rejects empty details or details with only spaces", () => {
    expect(() =>
      createRequest({ title: "Expense rules", details: "", team: "Finance" }),
    ).toThrow(ZodError);
    expect(() =>
      createRequest({ title: "Expense rules", details: " ", team: "Finance" }),
    ).toThrow(ZodError);
    expect(listRequests()).toEqual([]);
  });

  it("AND-24 AC4: rejects an empty team or a team with only spaces", () => {
    expect(() =>
      createRequest({ title: "Expense rules", details, team: "" }),
    ).toThrow(ZodError);
    expect(() =>
      createRequest({ title: "Expense rules", details, team: "  " }),
    ).toThrow(ZodError);
    expect(listRequests()).toEqual([]);
  });

  it("AND-24 AC4: rejects a priority that is not low, medium or high", () => {
    expect(() =>
      createRequest({
        title: "Expense rules",
        details,
        team: "Finance",
        // @ts-expect-error: the test sends a value that the type does not allow.
        priority: "urgent",
      }),
    ).toThrow(ZodError);
    expect(listRequests()).toEqual([]);
  });
});

describe("listRequests", () => {
  it("AND-24 AC4: returns an empty list when there are no Requests", () => {
    expect(listRequests()).toEqual([]);
  });

  it("AND-24 AC4: returns the Requests in the order that they were created", () => {
    createRequest({ title: "First", details, team: "Support" });
    createRequest({ title: "Second", details, team: "Finance" });

    expect(listRequests().map((request) => request.title)).toEqual([
      "First",
      "Second",
    ]);
  });

  it("AND-24 AC4: returns a copy, so a change to the result does not change the list", () => {
    createRequest({ title: "First", details, team: "Support" });

    listRequests().pop();

    expect(listRequests()).toHaveLength(1);
  });
});

describe("the in-memory list", () => {
  it("AND-24 AC3: keeps the Requests on globalThis", () => {
    const request = createRequest({ title: "First", details, team: "Support" });

    expect(
      (globalThis as { workbotRequests?: unknown[] }).workbotRequests,
    ).toEqual([request]);
  });

  it("AND-24 AC3: is shared when the module loads again", async () => {
    createRequest({ title: "First", details, team: "Support" });

    vi.resetModules();
    const reloaded = await import("@/features/requests/server/store");

    expect(reloaded.listRequests().map((request) => request.title)).toEqual([
      "First",
    ]);
  });
});

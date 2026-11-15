import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";

import { SavedRequestSchema } from "@/features/requests/schemas";
import {
  clearSavedRequests,
  listSavedRequests,
  saveRequest,
} from "@/features/requests/server/api-store";
import { listRequests } from "@/features/requests/server/store";

const input = {
  title: "Laptop for the new hire",
  details: "Ana starts on Monday.",
  team: "Operations",
};

beforeEach(() => {
  clearSavedRequests();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("saveRequest", () => {
  it("AC1: gives the Request an id, a creation time and the default values", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-15T10:00:00.000Z"));

    const request = await saveRequest(input);

    expect(SavedRequestSchema.parse(request)).toEqual({
      ...input,
      id: request.id,
      createdAt: "2026-11-15T10:00:00.000Z",
      priority: "medium",
      status: "open",
    });
  });

  it("AC1: gives each Request a different id", async () => {
    const first = await saveRequest(input);
    const second = await saveRequest(input);

    expect(first.id).not.toBe(second.id);
  });

  it("rejects an input that is not valid and saves nothing", async () => {
    await expect(saveRequest({ ...input, title: " " })).rejects.toThrow(
      ZodError,
    );
    expect(await listSavedRequests()).toEqual([]);
  });

  it("does not change the list that the pages use", async () => {
    const before = listRequests();

    await saveRequest(input);

    expect(listRequests()).toEqual(before);
  });
});

describe("listSavedRequests", () => {
  it("AC4: returns the Requests newest first", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-15T10:00:00.000Z"));
    await saveRequest({ ...input, title: "Old" });
    vi.setSystemTime(new Date("2026-11-15T12:00:00.000Z"));
    await saveRequest({ ...input, title: "New" });
    vi.setSystemTime(new Date("2026-11-15T11:00:00.000Z"));
    await saveRequest({ ...input, title: "Middle" });

    const titles = (await listSavedRequests()).map((request) => request.title);

    expect(titles).toEqual(["New", "Middle", "Old"]);
  });

  it("AC4: puts the last saved Request first when the creation times are the same", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-15T10:00:00.000Z"));
    await saveRequest({ ...input, title: "First" });
    await saveRequest({ ...input, title: "Second" });

    const titles = (await listSavedRequests()).map((request) => request.title);

    expect(titles).toEqual(["Second", "First"]);
  });

  it("returns a copy, so a change to the result does not change the list", async () => {
    await saveRequest(input);

    (await listSavedRequests()).pop();

    expect(await listSavedRequests()).toHaveLength(1);
  });
});

describe("AND-31: the list stays newest first", () => {
  it("AND-31 AC3: a read does not sort the list", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-15T10:00:00.000Z"));
    await saveRequest({ ...input, title: "Old" });
    vi.setSystemTime(new Date("2026-11-15T11:00:00.000Z"));
    await saveRequest({ ...input, title: "New" });
    const sort = vi.spyOn(Array.prototype, "sort");
    let titles: string[];
    try {
      titles = (await listSavedRequests()).map((request) => request.title);
      expect(sort).not.toHaveBeenCalled();
    } finally {
      sort.mockRestore();
    }

    expect(titles).toEqual(["New", "Old"]);
  });

  it("AND-31 AC3: keeps the stored list newest first, also when a save has an older time", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    for (const [time, title] of [
      ["2026-11-15T10:00:00.000Z", "10:00"],
      ["2026-11-15T12:00:00.000Z", "12:00"],
      ["2026-11-15T09:00:00.000Z", "09:00"],
      ["2026-11-15T11:00:00.000Z", "11:00"],
    ]) {
      vi.setSystemTime(new Date(time!));
      await saveRequest({ ...input, title: title! });
    }

    const stored = (globalThis as { workbotApiRequests?: { title: string }[] })
      .workbotApiRequests;

    expect(stored?.map((request) => request.title)).toEqual([
      "12:00",
      "11:00",
      "10:00",
      "09:00",
    ]);
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  clearSavedRequests,
  saveRequest,
} from "@/features/requests/server/api-store";
import { getRequests } from "@/features/requests/server/queries";

const input = { details: "Details.", team: "Finance" };

beforeEach(() => {
  clearSavedRequests();
});

describe("getRequests", () => {
  it("AND-32 AC6: returns the saved Requests from the API store, newest first", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-15T10:00:00.000Z"));
    await saveRequest({ ...input, title: "Old" });
    vi.setSystemTime(new Date("2026-11-15T11:00:00.000Z"));
    await saveRequest({ ...input, title: "New" });
    vi.useRealTimers();

    expect((await getRequests()).map((request) => request.title)).toEqual([
      "New",
      "Old",
    ]);
  });

  it("AND-32 AC6: returns an empty list when there are no Requests", async () => {
    expect(await getRequests()).toEqual([]);
  });
});

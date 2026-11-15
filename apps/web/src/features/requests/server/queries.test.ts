import { beforeEach, describe, expect, it } from "vitest";

import { getRequests } from "@/features/requests/server/queries";
import { clearRequests, createRequest } from "@/features/requests/server/store";

beforeEach(() => {
  clearRequests();
});

describe("getRequests", () => {
  it("AC1: returns the saved Requests, with the status open", async () => {
    createRequest({
      title: "Laptop for the new hire",
      details: "Ana starts on Monday.",
      team: "Operations",
      priority: "high",
    });

    expect(await getRequests()).toEqual([
      {
        title: "Laptop for the new hire",
        details: "Ana starts on Monday.",
        team: "Operations",
        priority: "high",
        status: "open",
      },
    ]);
  });

  it("AC6: returns an empty list when there are no Requests", async () => {
    expect(await getRequests()).toEqual([]);
  });
});

describe("AND-30: the status in the Request list", () => {
  it("AND-30 AC5: the list sent to the client has the status of each Request", async () => {
    createRequest({ title: "First", details: "One.", team: "Support" });
    createRequest({ title: "Second", details: "Two.", team: "Finance" });

    expect((await getRequests()).map((request) => request.status)).toEqual([
      "open",
      "open",
    ]);
  });
});

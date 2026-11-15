import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  clearSavedRequests,
  listSavedRequests,
  saveRequest,
} from "@/features/requests/server/api-store";
import { ErrorResponseSchema, FieldErrorResponseSchema } from "@/lib/api";

import { GET, POST } from "./route";
import {
  GetRequestsResponseSchema,
  type PostRequestsBody,
  PostRequestsResponseSchema,
} from "./types";

// connection() needs a Next.js request scope. The tests call GET outside of one.
vi.mock("next/server", () => ({ connection: async () => {} }));

// The real in-memory store runs. The mocks only make a call fail in the 500 tests.
vi.mock("@/features/requests/server/api-store", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("@/features/requests/server/api-store")
    >();
  return {
    ...actual,
    listSavedRequests: vi.fn(actual.listSavedRequests),
    saveRequest: vi.fn(actual.saveRequest),
  };
});

const validBody: PostRequestsBody = {
  title: "Laptop for the new hire",
  details: "Ana starts on Monday.",
  team: "Operations",
  priority: "high",
};

function postRequest(body: string) {
  return new Request("http://localhost/api/requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
}

async function post(body: unknown) {
  return POST(postRequest(JSON.stringify(body)));
}

async function getAll() {
  const response = await GET();
  return GetRequestsResponseSchema.parse(await response.json()).data;
}

beforeEach(() => {
  // No state is shared between tests.
  clearSavedRequests();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("POST /api/requests", () => {
  it("AC1/AC6: saves the Request and returns 201 with the id, createdAt, status and the input fields", async () => {
    const response = await post(validBody);

    expect(response.status).toBe(201);
    const saved = PostRequestsResponseSchema.parse(await response.json());
    expect(saved).toEqual({
      ...validBody,
      id: saved.id,
      createdAt: saved.createdAt,
      status: "open",
    });
  });

  it("AC1: returns the Location of the new Request", async () => {
    const response = await post(validBody);
    const saved = PostRequestsResponseSchema.parse(await response.json());

    expect(response.headers.get("Location")).toBe(`/api/requests/${saved.id}`);
  });

  it('AC1: uses "medium" for priority when it is not given', async () => {
    const { title, details, team } = validBody;

    const response = await post({ title, details, team });

    expect(
      PostRequestsResponseSchema.parse(await response.json()).priority,
    ).toBe("medium");
  });

  it("AC2: returns 422 with the field errors when the body is not valid", async () => {
    const response = await post({ title: " ", team: "Operations" });

    expect(response.status).toBe(422);
    const body = FieldErrorResponseSchema.parse(await response.json());
    expect(body.error.message).toBe("Invalid input");
    expect(body.fieldErrors).toEqual({
      title: ["Enter a title."],
      details: ["Enter the details."],
    });
    expect(await listSavedRequests()).toEqual([]);
  });

  it("AC2: returns 422 for a priority that is not low, medium or high", async () => {
    const response = await post({ ...validBody, priority: "urgent" });

    expect(response.status).toBe(422);
    const body = FieldErrorResponseSchema.parse(await response.json());
    expect(Object.keys(body.fieldErrors)).toEqual(["priority"]);
  });

  it("AC3: returns 400 when the body is not valid JSON", async () => {
    const response = await POST(postRequest('{"title":'));

    expect(response.status).toBe(400);
    ErrorResponseSchema.parse(await response.json());
    expect(await listSavedRequests()).toEqual([]);
  });

  it("returns 500 when the store fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(saveRequest).mockRejectedValueOnce(new Error("down"));

    const response = await post(validBody);

    expect(response.status).toBe(500);
    ErrorResponseSchema.parse(await response.json());
  });
});

describe("GET /api/requests", () => {
  it("AC4: returns 200 with an empty list when there are no Requests", async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    expect(GetRequestsResponseSchema.parse(await response.json())).toEqual({
      data: [],
    });
  });

  it("AC4: returns the Requests newest first", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-15T10:00:00.000Z"));
    await post({ ...validBody, title: "Old" });
    vi.setSystemTime(new Date("2026-11-15T11:00:00.000Z"));
    await post({ ...validBody, title: "New" });

    const titles = (await getAll()).map((request) => request.title);

    expect(titles).toEqual(["New", "Old"]);
  });

  it("AC5/AC6: returns a Request that POST created, with its status", async () => {
    const created = PostRequestsResponseSchema.parse(
      await (await post(validBody)).json(),
    );

    expect(await getAll()).toEqual([created]);
  });

  it("returns 500 when the store fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(listSavedRequests).mockRejectedValueOnce(new Error("down"));

    const response = await GET();

    expect(response.status).toBe(500);
    ErrorResponseSchema.parse(await response.json());
  });
});

describe("AND-31: POST with a body that is not an object", () => {
  it("AND-31 AC1: returns 422 with the cause and saves nothing", async () => {
    const response = await post([]);

    expect(response.status).toBe(422);
    const body = FieldErrorResponseSchema.parse(await response.json());
    expect(body.formErrors[0]).toMatch(/expected object/);
    expect(await listSavedRequests()).toEqual([]);
  });
});

describe("AND-30: the status in the API", () => {
  it('AND-30 AC3/AC4: POST saves the status open when the body has status "done"', async () => {
    const response = await post({ ...validBody, status: "done" });

    expect(response.status).toBe(201);
    expect(PostRequestsResponseSchema.parse(await response.json()).status).toBe(
      "open",
    );
  });

  it("AND-30 AC5: GET sends the status of each Request", async () => {
    await post(validBody);
    await post({ ...validBody, title: "Second" });

    expect((await getAll()).map((request) => request.status)).toEqual([
      "open",
      "open",
    ]);
  });
});

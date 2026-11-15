import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createRequestAction } from "@/features/requests/server/actions";

vi.mock("@/lib/config", () => ({
  config: { apiBaseUrl: "https://api.example.test" },
}));

const fetchMock = vi.fn<typeof fetch>();

const values = {
  title: "Laptop for the new hire",
  details: "Ana starts on Monday.",
  team: "Operations",
  priority: "high",
};

const saved = {
  ...values,
  status: "open",
  id: "4de9754f-db84-44e2-8577-a99067a54be9",
  createdAt: "2026-11-15T20:26:16.822Z",
};

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("createRequestAction", () => {
  it("AND-32 AC8: sends POST ${API_BASE_URL}/api/requests with the values as JSON", async () => {
    fetchMock.mockResolvedValue(Response.json(saved, { status: 201 }));

    await createRequestAction(values);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("https://api.example.test/api/requests");
    expect(init?.method).toBe("POST");
    expect(new Headers(init?.headers).get("Content-Type")).toBe(
      "application/json",
    );
    expect(JSON.parse(String(init?.body))).toEqual(values);
  });

  it("AND-32 AC8: sends only the known fields, and leaves out an empty priority", async () => {
    fetchMock.mockResolvedValue(Response.json(saved, { status: 201 }));

    await createRequestAction({
      ...values,
      priority: "",
      // @ts-expect-error: the client can send other fields. They are not sent on.
      status: "done",
    });

    const [, init] = fetchMock.mock.calls[0]!;
    expect(JSON.parse(String(init?.body))).toEqual({
      title: values.title,
      details: values.details,
      team: values.team,
    });
  });

  it("AND-32 AC8: returns { ok: true, data } for a 201", async () => {
    fetchMock.mockResolvedValue(Response.json(saved, { status: 201 }));

    expect(await createRequestAction(values)).toEqual({
      ok: true,
      data: saved,
    });
  });

  it("AND-32 AC8/AC11: returns { ok: false, fieldErrors, error } for a 422", async () => {
    fetchMock.mockResolvedValue(
      Response.json(
        {
          error: { message: "Invalid input" },
          fieldErrors: {
            title: ["Enter a title.", "Second message"],
            team: ["Select a team."],
            other: ["Not a form field"],
          },
          formErrors: [],
        },
        { status: 422 },
      ),
    );

    expect(await createRequestAction(values)).toEqual({
      ok: false,
      fieldErrors: { title: "Enter a title.", team: "Select a team." },
      error: "Invalid input",
    });
  });

  it("AND-32 AC11: returns the API message and no field errors for a 422 with no field errors", async () => {
    fetchMock.mockResolvedValue(
      Response.json(
        {
          error: { message: "Invalid input" },
          fieldErrors: {},
          formErrors: ["Invalid input: expected object, received array"],
        },
        { status: 422 },
      ),
    );

    expect(await createRequestAction(values)).toEqual({
      ok: false,
      fieldErrors: {},
      error: "Invalid input",
    });
  });

  it.each([400, 500])(
    'AND-32 AC8/AC12: returns { ok: false, error: "Try again." } for a %i',
    async (status) => {
      fetchMock.mockResolvedValue(
        Response.json({ error: { message: "Bad" } }, { status }),
      );

      expect(await createRequestAction(values)).toEqual({
        ok: false,
        error: "Try again.",
      });
    },
  );

  it('AND-32 AC12: returns "Try again." for a network error', async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));

    expect(await createRequestAction(values)).toEqual({
      ok: false,
      error: "Try again.",
    });
  });

  it("AND-32 AC8: returns a success with no data when the 201 body does not match the schema, so the user does not send it again", async () => {
    fetchMock.mockResolvedValue(
      Response.json({ title: "No id" }, { status: 201 }),
    );

    expect(await createRequestAction(values)).toEqual({
      ok: true,
      data: null,
    });
  });
});

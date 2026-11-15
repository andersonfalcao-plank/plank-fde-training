import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import {
  ConflictError,
  ErrorResponseSchema,
  FieldErrorResponseSchema,
  handle,
  NotFoundError,
  parseBody,
  parseBodyFields,
  parseSearchParams,
} from "./api";

const Schema = z.object({ name: z.string().min(1) });

afterEach(() => {
  vi.restoreAllMocks();
});

async function readError(response: Response) {
  return ErrorResponseSchema.parse(await response.json());
}

describe("handle", () => {
  it("returns the response of the handler when it does not throw", async () => {
    const response = await handle(async () => Response.json({ ok: true }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
  });

  it("AC2: returns 400 with the issues when the body does not match the schema", async () => {
    const request = new Request("http://localhost/api/test", {
      method: "POST",
      body: JSON.stringify({ name: "" }),
    });

    const response = await handle(async () =>
      Response.json(await parseBody(request, Schema)),
    );

    expect(response.status).toBe(400);
    const body = await readError(response);
    expect(body.error.message).toBe("Invalid input");
    expect(body.error.issues?.[0]?.path).toBe("name");
  });

  it("AC2: returns 400 when the body is not valid JSON", async () => {
    const request = new Request("http://localhost/api/test", {
      method: "POST",
      body: "{",
    });

    const response = await handle(async () =>
      Response.json(await parseBody(request, Schema)),
    );

    expect(response.status).toBe(400);
  });

  it("AC2: returns 400 when the search params do not match the schema", async () => {
    const request = new Request("http://localhost/api/test?name=");

    const response = await handle(async () =>
      Response.json(parseSearchParams(request, Schema)),
    );

    expect(response.status).toBe(400);
  });

  it("AC3: returns 404 for a NotFoundError", async () => {
    const response = await handle(async () => {
      throw new NotFoundError("Item not found");
    });

    expect(response.status).toBe(404);
    expect((await readError(response)).error.message).toBe("Item not found");
  });

  it("AC4: returns 409 for a ConflictError", async () => {
    const response = await handle(async () => {
      throw new ConflictError();
    });

    expect(response.status).toBe(409);
  });

  it("AC5: returns 500 and hides the message of an unknown error", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await handle(async () => {
      throw new Error("secret detail");
    });

    expect(response.status).toBe(500);
    expect((await readError(response)).error.message).toBe(
      "Internal server error",
    );
  });
});

describe("parseBodyFields", () => {
  function post(body: string) {
    return new Request("http://localhost/api/test", { method: "POST", body });
  }

  it("returns the parsed body when it matches the schema", async () => {
    const response = await handle(async () =>
      Response.json(await parseBodyFields(post('{"name":"Ana"}'), Schema)),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ name: "Ana" });
  });

  it("returns 422 with the field errors when the body does not match the schema", async () => {
    const response = await handle(async () =>
      Response.json(await parseBodyFields(post('{"name":""}'), Schema)),
    );

    expect(response.status).toBe(422);
    const body = FieldErrorResponseSchema.parse(await response.json());
    expect(body.error.message).toBe("Invalid input");
    expect(Object.keys(body.fieldErrors)).toEqual(["name"]);
  });

  it("returns 400 when the body is not valid JSON", async () => {
    const response = await handle(async () =>
      Response.json(await parseBodyFields(post("{"), Schema)),
    );

    expect(response.status).toBe(400);
    expect((await readError(response)).error.message).toBe("Invalid input");
  });
});

describe("AND-31: the 422 body", () => {
  function post(body: string) {
    return new Request("http://localhost/api/test", { method: "POST", body });
  }

  it.each(["null", "[]", "5", '"x"'])(
    "AND-31 AC1: returns 422 with the cause when the body %s is not an object",
    async (body) => {
      const response = await handle(async () =>
        Response.json(await parseBodyFields(post(body), Schema)),
      );

      expect(response.status).toBe(422);
      const parsed = FieldErrorResponseSchema.parse(await response.json());
      expect(parsed.fieldErrors).toEqual({});
      expect(parsed.formErrors).toHaveLength(1);
      expect(parsed.formErrors[0]).toMatch(/expected object/);
    },
  );

  it("AND-31 AC2: keeps error.message and fieldErrors, with no form errors for a field error", async () => {
    const response = await handle(async () =>
      Response.json(await parseBodyFields(post('{"name":""}'), Schema)),
    );

    expect(FieldErrorResponseSchema.parse(await response.json())).toEqual({
      error: { message: "Invalid input" },
      fieldErrors: { name: [expect.any(String)] },
      formErrors: [],
    });
  });

  it("AND-31 AC2: parseBody keeps the 400 format of the other routes", async () => {
    const response = await handle(async () =>
      Response.json(await parseBody(post("[]"), Schema)),
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).not.toHaveProperty("formErrors");
    expect(ErrorResponseSchema.parse(body).error.issues).toBeDefined();
  });
});

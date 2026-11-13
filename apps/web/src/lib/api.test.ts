import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import {
  ConflictError,
  ErrorResponseSchema,
  handle,
  NotFoundError,
  parseBody,
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

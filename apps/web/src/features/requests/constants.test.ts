import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  REQUEST_PRIORITIES,
  REQUEST_TEAMS,
  TITLE_MAX_LENGTH,
} from "./constants";
import { RequestPrioritySchema } from "./schemas";

describe("constants", () => {
  it("has the title limit, the teams and the priorities", () => {
    expect(TITLE_MAX_LENGTH).toBe(300);
    expect(REQUEST_TEAMS).toEqual(["Operations", "Finance", "Support"]);
    expect(REQUEST_PRIORITIES).toEqual(["low", "medium", "high"]);
  });

  it("gives the same priorities as the schema", () => {
    expect(RequestPrioritySchema.options).toEqual([...REQUEST_PRIORITIES]);
  });

  it("does not import zod, so Client Components do not bundle it", () => {
    const source = readFileSync(
      new URL("./constants.ts", import.meta.url),
      "utf8",
    );

    expect(source).not.toMatch(/from\s+["']zod["']/);
  });
});

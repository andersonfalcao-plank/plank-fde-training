import { describe, expect, expectTypeOf, it } from "vitest";

import {
  type Request,
  type RequestInput,
  RequestPrioritySchema,
  RequestSchema,
  TITLE_MAX_LENGTH,
} from "@/features/requests";

const valid = {
  title: "Laptop for the new hire",
  details: "Ana starts on Monday.",
  team: "Operations",
  priority: "high",
};

function fieldErrors(input: unknown) {
  const result = RequestSchema.safeParse(input);
  if (result.success) return {};
  return Object.fromEntries(
    result.error.issues.map((issue) => [issue.path[0], issue.message]),
  );
}

describe("RequestSchema", () => {
  it("AND-24 AC1: has the title, details, team and priority fields", () => {
    expect(Object.keys(RequestSchema.shape).sort()).toEqual([
      "details",
      "priority",
      "team",
      "title",
    ]);
    expect(RequestSchema.parse(valid)).toEqual(valid);
  });

  it("AND-24 AC1: accepts only low, medium and high as priority", () => {
    expect(RequestPrioritySchema.options).toEqual(["low", "medium", "high"]);
  });

  it("AND-24 AC2: exports the inferred Request and RequestInput types", () => {
    expectTypeOf<Request>().toEqualTypeOf<{
      title: string;
      details: string;
      team: string;
      priority: "low" | "medium" | "high";
    }>();
    expectTypeOf<RequestInput>().toEqualTypeOf<{
      title: string;
      details: string;
      team: string;
      priority?: "low" | "medium" | "high" | undefined;
    }>();
  });

  it("AND-25 AC3: accepts a title of 300 characters and rejects 301", () => {
    expect(TITLE_MAX_LENGTH).toBe(300);
    expect(
      RequestSchema.safeParse({ ...valid, title: "a".repeat(300) }).success,
    ).toBe(true);
    expect(fieldErrors({ ...valid, title: "a".repeat(301) })).toEqual({
      title: "Use 300 characters or fewer for the title.",
    });
  });

  it("AND-25 AC4: requires the title, details and team", () => {
    expect(fieldErrors({ title: " ", details: "", team: "" })).toEqual({
      title: "Enter a title.",
      details: "Enter the details.",
      team: "Select a team.",
    });
    expect(fieldErrors({})).toEqual({
      title: "Enter a title.",
      details: "Enter the details.",
      team: "Select a team.",
    });
  });

  it('AND-25 AC5: uses "medium" when the priority is not given', () => {
    const withoutPriority = {
      title: valid.title,
      details: valid.details,
      team: valid.team,
    };
    expect(RequestSchema.parse(withoutPriority).priority).toBe("medium");
  });
});

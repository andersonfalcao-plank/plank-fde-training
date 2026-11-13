import { describe, expect, expectTypeOf, it } from "vitest";

import {
  type Request,
  type RequestInput,
  RequestPrioritySchema,
  RequestSchema,
} from "@/features/requests";

const valid = {
  title: "Laptop for the new hire",
  details: "Ana starts on Monday.",
  team: "Operations",
  priority: "high",
};

describe("RequestSchema", () => {
  it("AC1: has the title, details, team and priority fields", () => {
    expect(Object.keys(RequestSchema.shape).sort()).toEqual([
      "details",
      "priority",
      "team",
      "title",
    ]);
    expect(RequestSchema.parse(valid)).toEqual(valid);
  });

  it("AC1: accepts only low, medium and high as priority", () => {
    expect(RequestPrioritySchema.options).toEqual(["low", "medium", "high"]);
  });

  it("AC2: exports the inferred Request and RequestInput types", () => {
    expectTypeOf<Request>().toEqualTypeOf<{
      title: string;
      details: string;
      team: string;
      priority: "low" | "medium" | "high";
    }>();
    expectTypeOf<RequestInput>().toEqualTypeOf<{
      title: string;
      details?: string | undefined;
      team: string;
      priority?: "low" | "medium" | "high" | undefined;
    }>();
  });
});

// @vitest-environment jsdom
import { cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { usePriorities } from "./use-priorities";
import { useTeams } from "./use-teams";

afterEach(() => {
  cleanup();
});

describe("useTeams", () => {
  it("AC6: returns the Operations, Finance and Support teams", () => {
    const { result } = renderHook(() => useTeams());

    expect(result.current).toEqual([
      { value: "Operations", label: "Operations" },
      { value: "Finance", label: "Finance" },
      { value: "Support", label: "Support" },
    ]);
  });
});

describe("usePriorities", () => {
  it("AC6: returns the low, medium and high priorities", () => {
    const { result } = renderHook(() => usePriorities());

    expect(result.current).toEqual([
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
    ]);
  });
});

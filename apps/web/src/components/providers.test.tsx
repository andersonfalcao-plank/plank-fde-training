// @vitest-environment jsdom
import { useQueryClient } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { Providers, queryClientOptions } from "./providers";

afterEach(() => {
  cleanup();
});

function UsesQueryClient() {
  const queryClient = useQueryClient();
  return <p>{queryClient ? "Has a QueryClient" : "No QueryClient"}</p>;
}

describe("Providers", () => {
  it("AND-32 AC1: gives the children a QueryClient", () => {
    render(
      <Providers>
        <UsesQueryClient />
      </Providers>,
    );

    expect(screen.getByText("Has a QueryClient")).toBeDefined();
  });

  it("AND-32 AC1: is a client component that the root layout uses", () => {
    // Vitest runs in apps/web.
    const providers = readFileSync(
      resolve("src/components/providers.tsx"),
      "utf8",
    );
    const layout = readFileSync(resolve("src/app/layout.tsx"), "utf8");

    expect(providers.startsWith('"use client";')).toBe(true);
    expect(layout).toMatch(/<Providers>/);
  });

  it("AND-32 AC5: retries a failed query one time, so the error shows soon", () => {
    expect(queryClientOptions.defaultOptions.queries.retry).toBe(1);
  });
});

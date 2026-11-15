// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

import nextConfig from "../../../../next.config";

import SettingsPage from "./page";

// DeploymentCard is an async Server Component. Vitest cannot render it.
vi.mock("./_components/deployment-card", () => ({
  DeploymentCard: () => <p>Deployment card</p>,
}));

afterEach(() => {
  cleanup();
});

describe("SettingsPage", () => {
  it("AC3: is at /admin/settings, with the Settings title and the deployment card", () => {
    render(<SettingsPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Settings" }),
    ).toBeDefined();
    expect(screen.getByText("Deployment card")).toBeDefined();
  });

  it("AC3: has only one copy: the old app/settings route is gone", () => {
    // Vitest runs in apps/web.
    expect(existsSync(resolve("src/app/admin/settings/page.tsx"))).toBe(true);
    expect(existsSync(resolve("src/app/settings"))).toBe(false);
  });
});

describe("the /settings redirect", () => {
  it("AC4: sends /settings to /admin/settings with a permanent redirect", async () => {
    const redirects = await nextConfig.redirects?.();

    expect(redirects).toContainEqual({
      source: "/settings",
      destination: "/admin/settings",
      permanent: true,
    });
  });
});

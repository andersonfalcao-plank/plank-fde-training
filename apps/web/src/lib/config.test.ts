import { readFileSync } from "node:fs";

import { afterEach, describe, expect, it, vi } from "vitest";

async function loadConfig() {
  vi.resetModules();
  return (await import("@/lib/config")).config;
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("config.apiBaseUrl", () => {
  it("AND-32 AC14: uses API_BASE_URL when it is set, with no / at the end", async () => {
    vi.stubEnv("API_BASE_URL", "http://localhost:3001/");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "example.vercel.app");

    expect((await loadConfig()).apiBaseUrl).toBe("http://localhost:3001");
  });

  it("AND-32 AC14: uses the production domain on Vercel when API_BASE_URL is not set", async () => {
    vi.stubEnv("API_BASE_URL", "");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "example.vercel.app");

    expect((await loadConfig()).apiBaseUrl).toBe("https://example.vercel.app");
  });

  it("AND-32 AC14: uses the local dev server when no variable is set", async () => {
    vi.stubEnv("API_BASE_URL", "");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "");

    expect((await loadConfig()).apiBaseUrl).toBe("http://localhost:3000");
  });

  it("AND-32 AC14: rejects an API_BASE_URL that is not an http or https URL", async () => {
    vi.stubEnv("API_BASE_URL", "localhost:3000");
    await expect(loadConfig()).rejects.toThrow(/API_BASE_URL/);

    vi.stubEnv("API_BASE_URL", "ftp://example.test");
    await expect(loadConfig()).rejects.toThrow(/http:\/\/ or https:\/\//);
  });
});

describe(".env.example", () => {
  it("AND-32 AC14: documents API_BASE_URL as an optional variable", () => {
    const example = readFileSync(
      new URL("../../.env.example", import.meta.url),
      "utf8",
    );

    expect(example).toMatch(/^# API_BASE_URL=/m);
    expect(example).toMatch(/POST \$\{API_BASE_URL\}\/api\/requests/);
  });
});

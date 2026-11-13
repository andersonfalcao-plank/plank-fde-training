import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    alias: {
      "@/": new URL("./src/", import.meta.url).pathname,
      // Next.js resolves "server-only" in its build. Tests run outside of it,
      // so they use the empty version of the package that Next.js ships.
      "server-only": new URL(
        "./node_modules/next/dist/compiled/server-only/empty.js",
        import.meta.url,
      ).pathname,
    },
  },
});

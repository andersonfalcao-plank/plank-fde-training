import "server-only";

import { env } from "@/lib/env";

// The fallbacks apply on a local machine, where Vercel sets no variables.
export const config = {
  environment: env.VERCEL_ENV ?? "development",
  commit: env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local",
  // A server-side fetch needs a full URL. Use API_BASE_URL when it is set.
  // Then use the production domain on Vercel, then the local dev server.
  apiBaseUrl:
    env.API_BASE_URL ??
    (env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"),
};

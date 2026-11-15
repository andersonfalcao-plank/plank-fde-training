import "server-only";

import { env } from "@/lib/env";

// The fallbacks apply on a local machine, where Vercel sets no variables.
export const config = {
  environment: env.VERCEL_ENV ?? "development",
  commit: env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local",
};

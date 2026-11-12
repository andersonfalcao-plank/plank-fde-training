import "server-only";

const vercelEnvs = ["production", "preview", "development"] as const;

type VercelEnv = (typeof vercelEnvs)[number];

function isVercelEnv(value: string): value is VercelEnv {
  return (vercelEnvs as readonly string[]).includes(value);
}

function readVercelEnv(): VercelEnv | undefined {
  const value = process.env.VERCEL_ENV;
  if (!value) return undefined;
  if (!isVercelEnv(value)) {
    throw new Error(
      `VERCEL_ENV must be one of ${vercelEnvs.join(", ")}. It is "${value}".`,
    );
  }
  return value;
}

// Vercel sets these system variables on each deployment.
// They are not set on a local machine.
export const env = {
  VERCEL_ENV: readVercelEnv(),
  VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA || undefined,
};

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

// Returns the variable when it is a valid http or https URL, with no "/" at the end.
function readUrl(name: string): string | undefined {
  const value = process.env[name];
  if (!value) return undefined;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(
      `${name} must be a URL, for example http://localhost:3000.`,
    );
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(`${name} must start with http:// or https://.`);
  }
  return value.replace(/\/+$/, "");
}

export const env = {
  // Vercel sets these system variables on each deployment.
  // They are not set on a local machine.
  VERCEL_ENV: readVercelEnv(),
  VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA || undefined,
  // The production domain of the project, with no protocol.
  VERCEL_PROJECT_PRODUCTION_URL:
    process.env.VERCEL_PROJECT_PRODUCTION_URL || undefined,
  // Optional. The base URL of the Requests API. See .env.example.
  API_BASE_URL: readUrl("API_BASE_URL"),
};

// Check that each required variable in .env.example is set.
// A required variable is a line "NAME=..." that is not a comment.
// A commented line "# NAME=..." is optional. The script does not check it.
// The script never prints a value. It prints only the names and where each one is set.
//
// Usage: node check-env.mjs [app directory]. The default is the current directory.
// Exit code: 0 when all required variables are set, 1 when one or more are missing, 2 on an error.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const appDir = process.argv[2] ?? process.cwd();
const examplePath = join(appDir, ".env.example");

if (!existsSync(examplePath)) {
  console.error(`ERROR: ${examplePath} does not exist.`);
  process.exit(2);
}

const required = [];
const optional = [];
for (const line of readFileSync(examplePath, "utf8").split("\n")) {
  const active = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/);
  if (active) {
    required.push(active[1]);
    continue;
  }
  const commented = line.match(/^\s*#\s*([A-Z_][A-Z0-9_]*)\s*=/);
  if (commented) optional.push(commented[1]);
}

// The env files that Next.js loads for a production build, in priority order.
const envFiles = [
  ".env.production.local",
  ".env.local",
  ".env.production",
  ".env",
];

function readEnvFile(path) {
  const values = new Map();
  if (!existsSync(path)) return values;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const match = line.match(
      /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/,
    );
    if (!match) continue;
    const value = match[2].trim().replace(/^(['"])(.*)\1$/, "$2");
    values.set(match[1], value);
  }
  return values;
}

const fileValues = envFiles.map((file) => ({
  file,
  values: readEnvFile(join(appDir, file)),
}));

function localSource(name) {
  if (process.env[name]) return "shell";
  for (const { file, values } of fileValues) {
    if (values.get(name)) return file;
  }
  return undefined;
}

// Read only the names of the Vercel production variables. Do not use --json: it prints the values.
function vercelProductionKeys() {
  if (!existsSync(join(appDir, ".vercel", "project.json"))) {
    return { status: "not linked", keys: new Set() };
  }
  try {
    const output = execFileSync(
      "vercel",
      ["env", "ls", "--environment", "production", "--format", "json"],
      {
        cwd: appDir,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
        timeout: 60_000,
      },
    );
    const keys = new Set(JSON.parse(output).envs.map((entry) => entry.key));
    return { status: "checked", keys };
  } catch {
    return { status: "not available", keys: new Set() };
  }
}

const vercel =
  required.length > 0
    ? vercelProductionKeys()
    : { status: "not needed", keys: new Set() };

console.log(`Required variables in .env.example: ${required.length}`);
console.log(
  `Optional (commented) variables, not checked: ${optional.join(", ") || "none"}`,
);
console.log(`Vercel production check: ${vercel.status}`);

let missing = 0;
for (const name of required) {
  const local = localSource(name) ?? "no";
  const inVercel =
    vercel.status === "checked"
      ? vercel.keys.has(name)
        ? "yes"
        : "no"
      : vercel.status;
  const ok = local !== "no" || inVercel === "yes";
  if (!ok) missing += 1;
  console.log(
    `${ok ? "PASS" : "FAIL"} ${name} local=${local} vercel=${inVercel}`,
  );
}

console.log(
  missing === 0 ? "RESULT: PASS" : `RESULT: FAIL (${missing} missing)`,
);
process.exit(missing === 0 ? 0 : 1);

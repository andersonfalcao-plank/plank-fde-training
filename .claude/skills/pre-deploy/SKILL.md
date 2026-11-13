---
name: pre-deploy
description: Run the pre-deploy checks for apps/web (typecheck, tests, console.log search, required environment variables) and report a pass or fail table with a verdict. Only the user can start it with /pre-deploy.
disable-model-invocation: true
---

# /pre-deploy

Run four checks on `apps/web` before a deploy. Then report a pass or fail table and a verdict.

Only the user starts this skill. `disable-model-invocation: true` in the frontmatter stops Claude from starting it.

## Rules

1. Run the commands in `apps/web`. The repository has only `package-lock.json`, so use npm.
2. Run the four checks in this order: typecheck, tests, `console.log` search, environment variables.
3. Run all four checks, also when a check fails. The user must see all the results in one report.
4. Do not fix a problem. Do not change a file. This skill only reports.
5. Do not print the value of an environment variable. Print only its name.

## 1. Typecheck

Run `npm run typecheck`.

- This script runs `next typegen` and then `tsc --noEmit`. `next typegen` makes the route types, for example `RouteContext`. Without them, `tsc --noEmit` fails on a clean clone.
- PASS: the exit code is 0.
- FAIL: the exit code is not 0. Count the `error TS` lines. Keep the first 5 errors for the report.

## 2. Test suite

Run `npm test`. This script runs `vitest run` one time.

- PASS: the exit code is 0.
- FAIL: the exit code is not 0. Keep the names of the failed tests for the report.
- Keep the counts from the summary lines `Test Files` and `Tests`.

## 3. `console.log` search

Search the source code for `console.log`:

```sh
grep -rnE "console\.log\b" src --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --exclude="*.test.ts" --exclude="*.test.tsx"
```

- The search covers `src/`, without the test files. The test files do not go to production.
- `console.error`, `console.warn` and `console.info` are correct. Do not report them.
- PASS: `grep` finds no line (exit code 1).
- FAIL: `grep` finds one or more lines (exit code 0). Keep each `file:line` for the report.
- If `grep` gives exit code 2, the search did not run. Report FAIL with the error.

## 4. Required environment variables

Run the script in this skill folder:

```sh
node ../../.claude/skills/pre-deploy/check-env.mjs
```

The script reads `.env.example`:

- A line `NAME=...` that is not a comment is a required variable.
- A commented line `# NAME=...` is optional. Vercel sets the system variables, for example `VERCEL_ENV`, so `.env.example` keeps them as comments. The script does not check optional variables.

The script finds where each required variable is set:

- `local`: the shell, or a Next.js env file (`.env.production.local`, `.env.local`, `.env.production`, `.env`). An empty value is not set.
- `vercel`: the Production environment of the linked Vercel project. The script reads only the names, with `vercel env ls --environment production --format json`.

A required variable passes when it is set in one or both places.

- PASS: the script prints `RESULT: PASS` (exit code 0). This includes 0 required variables. Tell the user the number.
- FAIL: the script prints `RESULT: FAIL` (exit code 1). Keep the names of the missing variables.
- If the script gives exit code 2, report FAIL with the error.
- If the Vercel check shows `not available`, tell the user. The Vercel CLI is not logged in, or the network is down.

## 5. Report

Give the report in this format. Use the real results. Do not add other sections.

```md
## Pre-deploy report

| #   | Check                          | Result | Details                              |
| --- | ------------------------------ | ------ | ------------------------------------ |
| 1   | Typecheck (`tsc --noEmit`)     | PASS   | No type errors                       |
| 2   | Test suite                     | PASS   | 3 files, 12 tests passed             |
| 3   | `console.log` statements       | FAIL   | 2 found: `src/a.ts:4`, `src/b.tsx:9` |
| 4   | Required environment variables | PASS   | 0 required in `.env.example`         |

**Verdict: NOT READY TO DEPLOY.** 1 of 4 checks failed.

### Problems

- `console.log` in `src/a.ts:4` and `src/b.tsx:9`. Remove them or use `console.error`.
```

1. Write one row for each check, in the order of the checks.
2. Write `PASS` or `FAIL` in the Result column. Write no other value.
3. Write the verdict on one line:
   - All four checks pass: `**Verdict: READY TO DEPLOY.** All 4 checks passed.`
   - One or more checks fail: `**Verdict: NOT READY TO DEPLOY.** <n> of 4 checks failed.`
4. If a check fails, add the "Problems" section. Write one item for each failed check. Give the errors that you kept and the step that fixes the problem.
5. If all checks pass, do not add the "Problems" section.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# plank-fde-training

A Next.js 16 app. It uses the App Router, React 19, TypeScript (strict), Tailwind CSS v4 and shadcn/ui. pnpm manages the packages.

This file has the project rules for all AI coding agents and for humans. Each change must obey these rules. Rules for one agent only are in that agent's file, for example `CLAUDE.md`.

## Stack

- Framework: Next.js 16 (App Router), React 19, TypeScript (strict).
- Styling: Tailwind CSS v4 and shadcn/ui.
- Validation: Zod.
- Client server-state: TanStack Query, only when necessary.
- Tests: Vitest and React Testing Library (unit and component), Playwright (end-to-end).

## Commands

| Command              | What it does                                     |
| -------------------- | ------------------------------------------------ |
| `pnpm install`       | Install the packages                             |
| `pnpm dev`           | Start the dev server                             |
| `pnpm build`         | Make a production build                          |
| `pnpm start`         | Serve the production build                       |
| `pnpm lint`          | Run ESLint. Fail on an error or a warning        |
| `pnpm format`        | Format all files with Prettier                   |
| `pnpm format:check`  | Fail if a file is not formatted with Prettier    |
| `pnpm ui:add <name>` | Add a shadcn component, then format all files    |
| `pnpm typecheck`     | Generate Next.js types, then run `tsc --noEmit`  |
| `pnpm test`          | Run Vitest one time (`pnpm test:watch` to watch) |
| `pnpm test:e2e`      | Run the Playwright end-to-end tests              |
| `pnpm check`         | Run lint, format:check, typecheck, test, build   |

- Run `pnpm check` before each commit and before you say that a task is complete.
- CI runs Lint, Typecheck, Test and Build on each pull request to `main` and on each push to `main`.
- Lint and Test must pass before a PR can merge.

## Writing rules

- Write specs, code comments, commit messages and PR descriptions in ASD-STE100 style.
- Use max 20 words in each instruction sentence. Use the active voice.
- Use the names from `docs/glossary.md`. Use one name for one thing.

## Where files go

| Folder                    | Contents                                                                                                                                                            |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/`                | Routes only: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `route.ts`. Put route-private components in `_components/` in the route folder. |
| `src/features/<feature>/` | Feature code: `components/`, `server/queries.ts`, `server/actions.ts`, `schemas.ts`, and `index.ts` (the public API of the feature).                                |
| `src/components/ui/`      | shadcn primitives. The shadcn CLI makes them. Change them only when necessary.                                                                                      |
| `src/components/`         | Shared app components that use the primitives.                                                                                                                      |
| `src/lib/`                | Shared non-UI code: utilities, `env.ts`, the database client, server helpers. No feature logic.                                                                     |
| `public/`                 | Static assets that the server sends as they are.                                                                                                                    |

1. Import with the `@/` alias, for example `@/components/ui/button`. Do not use long relative paths.
2. A feature must not import from another feature.
3. `src/components/` and `src/lib/` must not import from `src/features/`.

## Server Components and Client Components

A Server Component renders on the server. It sends no JavaScript to the browser. Each component is a Server Component unless it has `"use client"`.

1. Add `"use client"` only when the component needs state, effects, event handlers or browser APIs.
2. Put `"use client"` on the smallest leaf component that needs it. Keep pages and layouts as Server Components.
3. Pass only serializable props from a Server Component to a Client Component.
4. Do not import server code into a Client Component. Start each server-only file with `import "server-only"`.

## Data

1. Read data in Server Components through `src/features/<feature>/server/queries.ts`.
2. Change data with Server Actions in `src/features/<feature>/server/actions.ts`.
3. Do not call `fetch` or the database directly in a component. Do not fetch data in a client effect.
4. Validate all input with a Zod schema on the server. Use the same schema on the client.
5. Data is dynamic by default. Add caching only when the ticket asks for it. Write the reason in a comment.

## State

1. Keep shareable UI state in the URL (search params), for example filters, tabs and pages.
2. Use React state for local UI state.

## Environment variables

`src/lib/env.ts` is the only file that reads `process.env`. It validates each variable when a file first imports it. It exports a typed `env` object.

1. Do not read `process.env` in other files. Import `env` from `@/lib/env`.
2. `env.ts` is server-only. If a Client Component imports it, the build fails. Read the value in a Server Component and pass it as a prop.
3. When you add a variable, add it to `env.ts` and to `.env.example`.

## Styling and components

1. Use Tailwind classes that map to the design tokens (the shadcn theme variables).
2. Do not use raw colors, raw spacing or inline styles.
3. Use an existing component from `src/components/ui/` or `src/components/` before you make a new one.
4. To add a shadcn component, run `pnpm ui:add <name>`. It formats the new files. Commit them formatted.
5. The shadcn command can add packages. Ask first, unless the ticket names the component.

## Route states

1. Use `loading.tsx`, `error.tsx` and `not-found.tsx` for route states.
2. Use `<Suspense>` for slow parts of a page.
3. Build each state that has a frame in the Figma design.

## Tests

1. Put each test next to the code that it tests, as `*.test.ts` or `*.test.tsx`.
2. To run one file: `pnpm test src/components/navbar.test.tsx`. To run one test: `pnpm test -t "links Home"`.
3. Write one or more tests for each acceptance criterion. Put the AC number in the test name, for example `AC3: ...`.
4. Do not change an existing test to make it pass. If a test fails, stop and report the cause.

## Dependencies

Do not add a dependency. Stop and ask.

## Workflow

1. Write `Fixes <LINEAR-ID>` in the PR description.
2. Change only the files in the scope of the ticket.

## When to stop

Stop and write a comment on the Linear ticket when:

- The ticket is not clear.
- The task needs a pattern that is not in this file or in `docs/adr/`.
- The task needs a new dependency.
- A Figma value has no design token.

Do not guess.

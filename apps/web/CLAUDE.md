@AGENTS.md

# Rules for Claude Code

`AGENTS.md` has the project rules for all agents. The import line above loads it. Obey all of its rules.
This file has only the rules that are specific to Claude Code. Do not copy rules from `AGENTS.md` into this file.

## Linear

1. Read the ticket with the Linear tools before you start.
2. Read the ticket comments too. The ticket description does not include them.
3. When a rule in "When to stop" applies, write the comment on the ticket with the Linear tools. Then stop.

## Figma

1. Get the design context with the Figma tools. Use the frame link in the Linear ticket.
2. Use the components that Code Connect maps. Do not make a new component if a mapped one exists.
3. If a Figma value has no design token, stop. Obey "When to stop" in `AGENTS.md`.

## Skills

1. To make a React component, run `/component <name>`. The skill is in `.claude/skills/component/` at the repository root.
2. The skill writes the component, a render test and the barrel export. It obeys the rules in `AGENTS.md`.
3. To make an API route handler, run `/api-route <name> [methods]`. The skill is in `.claude/skills/api-route/`.
4. The skill writes `types.ts`, `route.ts` and `route.test.ts` in `src/app/api/<name>/`. The shared error handling is in `src/lib/api.ts`.
5. `/pre-deploy` runs the typecheck, the tests, a `console.log` search and the required variable check. It reports a pass or fail table and a verdict. Only the user can start it. Do not run it on your own.

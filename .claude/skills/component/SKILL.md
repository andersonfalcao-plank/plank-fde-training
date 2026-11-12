---
name: component
description: Create a React component in apps/web with a colocated render test, in the project's component conventions. Use when the user runs /component <name> or asks for a new React component.
argument-hint: <name> [where it goes, for example "feature billing" or "route settings"]
---

# /component

Create the React component `$ARGUMENTS` in `apps/web`, with a test file that renders it.

## 1. Read the rules first

1. Read `apps/web/AGENTS.md`. `apps/web/CLAUDE.md` imports it. Obey all of its rules.
2. If a rule in `AGENTS.md` and a step in this skill are different, obey `AGENTS.md`. Tell the user about the difference. One exception: `AGENTS.md` names pnpm, but the repository has only `package-lock.json`. Use npm (see step 7).
3. Read one or two existing components near the target folder. Copy their style: imports, naming, class names and comment density.
4. If the component uses a Next.js API (for example `next/link`, `next/navigation` or `next/image`), read its guide in `apps/web/node_modules/next/dist/docs/` first.

## 2. Get the name and the location

1. The first word of the arguments is the component name. If there is no name, ask for one. Then stop.
2. Make two forms of the name:
   - File name: kebab-case, for example `status-badge`.
   - Component name: PascalCase, for example `StatusBadge`.
3. Find the folder. Use the rest of the arguments or the request. Use the "Where files go" table in `AGENTS.md`:

   | The component is used by       | Folder                                     |
   | ------------------------------ | ------------------------------------------ |
   | One route only                 | `src/app/<route>/_components/`             |
   | One feature only               | `src/features/<feature>/components/`       |
   | Many routes or features        | `src/components/` (the default)            |

4. Do not put the component in `src/components/ui/`. The shadcn CLI makes the files in that folder.
5. If the location is not clear, ask the user. Do not guess.
6. If a file with the same name is in the folder, stop and tell the user. Do not overwrite it.

## 3. Find the barrel and the file layout

A barrel file is an `index.ts` that re-exports modules.

1. Find the barrel:
   - In a feature, the barrel is always `src/features/<feature>/index.ts`. It is the public API of the feature. If the file is not there, make it.
   - In other folders, look for the nearest `index.ts`. Start at the target folder. Go up one folder at a time. Stop after `src/`. If you find none, there is no barrel. Do not make a new barrel in `src/components/` or in `src/app/`.
2. Find the file layout of the target folder:
   - Flat files (the default, for example `src/components/site-header.tsx`): put the files in the target folder.
   - One folder for each component (siblings are folders with an `index.ts`): make the folder `<file-name>/`. Put the files in it. Add `<file-name>/index.ts` with `export { <ComponentName> } from "./<file-name>";`.

## 4. Write the component

File: `<file-name>.tsx`.

1. Use a named export: `export function <ComponentName>(...)`. Do not use a default export. Next.js needs default exports only in route files.
2. Make a Server Component. Add `"use client"` on line 1 only when the component needs state, effects, event handlers or browser APIs (for example `usePathname`). A Client Component needs more tests (see step 5).
3. If the component has props, declare `type <ComponentName>Props = { ... };` above the function. A Server Component can pass only serializable props to a Client Component. A function prop (for example `onChange`) is correct only when Client Components pass it. If the request needs a function prop, keep it optional, and tell the user that a Server Component page cannot pass it.
4. Do not make the component `async`. Vitest cannot render an `async` component. If the component needs data, the page reads it through `src/features/<feature>/server/queries.ts` and passes it as props. Do not make `queries.ts` for a component that gets all its data from props.
5. Use the components in `src/components/ui/` and `src/components/` before you write new markup.
6. Use Tailwind classes that map to the design tokens. Do not use raw colors, raw spacing or inline styles.
7. Import with the `@/` alias. A feature must not import from another feature.

## 5. Write the render test

File: `<file-name>.test.tsx`, in the same folder as `<file-name>.tsx`. In the folder layout of step 3.2, it goes in `<file-name>/` too. Do not put tests in a `__tests__/` folder.

1. Use Vitest and React Testing Library. `vitest.config.mts` sets only the `@/` alias. Each test file must set the rest itself:
   - Line 1 is `// @vitest-environment jsdom`. Without it, `render` fails with `document is not defined`.
   - Call `cleanup()` in `afterEach`. Vitest globals are off, so Testing Library does not clean up the DOM itself.
   - Import `afterEach`, `describe`, `expect`, `it` (and `vi` if you mock) from `vitest`.
2. Write one or more tests that render the component and find its main element. Use `screen.getByRole` first. Use `getByText` only if the element has no role. Many shadcn parts have no role: `Badge` is a `<span>`, and `Card`, `CardTitle` and `CardDescription` are `<div>`s. A `getBy*` query fails the test when the element is not there.
3. If the component has `"use client"`, also test its events and its state:
   - For each event handler (`onClick`, `onChange`, `onSubmit` and the others), fire the event with `fireEvent` from `@testing-library/react`. Then check the result.
   - For each state change, check the new output that the user sees: text, attributes such as `aria-pressed` or `aria-expanded`, or elements that show or hide. Do not read the state directly.
   - If the component calls a callback prop, pass `vi.fn()` and check the call and its arguments.
   - Do not add `@testing-library/user-event`. It is not installed, and `AGENTS.md` does not allow a new dependency.
4. Give the test a name that tells what it checks, for example `renders the title` or `shows the menu when you click the button`. When the work has a ticket with acceptance criteria, put the AC number in the name, for example `AC2: ...`.
5. If the component uses `next/navigation`, mock it with `vi.mock("next/navigation", ...)`. For an example, see `src/components/site-title.test.tsx`.
6. Do not use `toBeInTheDocument()`. The project does not have `@testing-library/jest-dom`.

Template:

```tsx
// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { <ComponentName> } from "./<file-name>";

afterEach(() => {
  cleanup();
});

describe("<ComponentName>", () => {
  it("renders <the main element>", () => {
    render(<<ComponentName> /* required props */ />);

    expect(screen.getByRole("<role>", { name: "<name>" })).toBeDefined();
    // If the element has no role: expect(screen.getByText("<text>")).toBeDefined();
  });
});
```

Add these tests for a Client Component. Change them to fit its events and its state:

```tsx
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// ...

  it("<changes what> when you <do the event>", () => {
    render(<<ComponentName> />);

    fireEvent.click(screen.getByRole("button", { name: "<name>" }));

    expect(
      screen.getByRole("button", { name: "<new name>" }).getAttribute("aria-pressed"),
    ).toBe("true");
  });

  it("calls <onChange> with <value> when you <do the event>", () => {
    const onChange = vi.fn();
    render(<<ComponentName> onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "<name>" }));

    expect(onChange).toHaveBeenCalledWith(<value>);
  });
```

## 6. Export from the barrel

1. If step 3 found a barrel, add one line to it: `export { <ComponentName> } from "<relative path without extension>";`.
2. Keep the export lines in alphabetical order by path.
3. If there is no barrel, do not export from a barrel. Other files import the component from its file, for example `@/components/<file-name>`.

## 7. Check the work

Run these commands in `apps/web`. Use the package manager of the lockfile. The repository has only `package-lock.json`, so use npm, not the pnpm commands in `AGENTS.md`.

1. `npx prettier --write <the new and changed files>`
2. `npm test -- <path to the test file>`. The test must pass.
3. `npm run lint`
4. `npm run typecheck`

If a command fails, fix the cause. Do not change an existing test to make it pass.

Before a commit, `AGENTS.md` asks for all the checks. Also run `npm run format:check`, `npm test` and `npm run build`.

## 8. Report

Tell the user:

- The files that you made or changed.
- The barrel that exports the component, or that there is no barrel.
- For a Client Component: the events and the state changes that the tests cover.
- The result of each command in step 7.

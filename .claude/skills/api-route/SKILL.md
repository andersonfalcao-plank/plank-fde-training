---
name: api-route
description: Create a Next.js route handler in apps/web/src/app/api/<name>/ with Zod validation, typed request and response, shared error handling and a test for each method. Use when the user runs /api-route <name> [methods] or asks for a new API route.
argument-hint: <name> [methods, for example GET POST]
---

# /api-route

Create the route handler `$ARGUMENTS` in `apps/web`. The handler validates its input with Zod and returns the correct HTTP status code for each error.

## 1. Read the rules first

1. Read `apps/web/AGENTS.md`. `apps/web/CLAUDE.md` imports it. Obey all of its rules.
2. If a rule in `AGENTS.md` and a step in this skill are different, obey `AGENTS.md`. Tell the user about the difference. These differences are known. Do not stop for them:
   - `AGENTS.md` names pnpm, but the repository has only `package-lock.json`. Use npm (see step 8).
   - `AGENTS.md` asks for `import "server-only"`, but the `server-only` package is not installed. Do not add it.
   - `docs/glossary.md` does not exist. Use the names that the user or the ticket gives.
   - `AGENTS.md` changes data with Server Actions. A route handler changes data too. Both call the same data functions in `src/features/<feature>/server/`.
   - `AGENTS.md` names `pnpm check`, but `package.json` has no `check` script. Run each check (see step 8).
3. Read the route handler guides in `apps/web/node_modules/next/dist/docs/`:
   - `01-app/01-getting-started/15-route-handlers.md`
   - `01-app/03-api-reference/03-file-conventions/route.md`
4. Read `apps/web/src/lib/api.ts`. It has the shared error handling. Do not copy its code into the route.

## 2. Get the name and the methods

1. The first word of the arguments is the route path. If there is no path, ask for one. Then stop.
2. The path is the folder below `src/app/api/`. Use kebab-case, for example `work-orders`. A dynamic segment uses brackets, for example `work-orders/[id]`.
3. The other words are the HTTP methods. Write them in upper case. Use only `GET`, `POST`, `PUT`, `PATCH` and `DELETE`.
4. If there are no methods, use `GET`.
5. Make `<Name>` for the schema and type names:
   - Use the last static segment in PascalCase. `work-orders` gives `WorkOrders`.
   - If the path ends with a dynamic segment, use the singular form. `work-orders/[id]` gives `WorkOrder`.
6. If `src/app/api/<path>/route.ts` exists, stop and tell the user. Do not overwrite it.
7. If the request does not tell what each method does, ask the user. Ask for the input, the output and the data source. Do not guess.

## 3. The files

Make these three files in `apps/web/src/app/api/<path>/`. Do not make other files in this folder.

| File            | Contents                                                   |
| --------------- | ---------------------------------------------------------- |
| `types.ts`      | The Zod schemas and the types of each request and response |
| `route.ts`      | One exported function for each method                      |
| `route.test.ts` | The tests. One `describe` block for each method            |

The data and the shared shapes stay out of the route folder:

- The shape of the resource, for example `WorkOrderSchema`, goes in `src/features/<feature>/schemas.ts`. Two routes and the data functions can then use the same schema. Make the file if it does not exist.
- An input shape that two routes use, for example the body of `POST` and `PUT`, also goes in `schemas.ts`.
- The data functions go in `src/features/<feature>/server/`. If they exist, import them. Use the module that has them (`<module>` in the templates).
- If no data source exists, ask the user what to use and the module name. Do not make a database or a store without approval.
- Declare the input types of the data functions in the feature, for example `ListTicketsFilter`. A feature must not import from `src/app/`.
- Import from the files of the feature directly. The route is not a feature, so it does not need `index.ts`.
- A data function returns `undefined` when the resource is not there. The route throws `NotFoundError`.
- A data function throws `ConflictError` from `@/lib/api` when the change conflicts with the data, for example a duplicate key.

## 4. Write `types.ts`

1. Write a schema for each input that a method reads. Write no schema for an input that the method does not read.
   - `<Method><Name>QuerySchema` for the search params.
   - `<Method><Name>BodySchema` for the JSON body (`POST`, `PUT`, `PATCH`).
   - `<Name>ParamsSchema` for the dynamic segments. All methods of the route use this one schema. Use the segment name as the key: `[ticketId]` gives `{ ticketId }`. The templates use `[id]`.
2. For each method that returns a body, write `<Method><Name>ResponseSchema`. A method that returns `204` has no response schema. Write a comment that tells this.
3. Export a type for each schema with `z.infer`. Give it the schema name without `Schema`, for example `PostWorkOrdersBody`.
4. Search params are always strings. Use `z.coerce.number()` for a number. Use `z.stringbool()` for a boolean. Do not use `z.coerce.boolean()`: it changes `"false"` to `true`.
5. Make each schema from the resource schema in `src/features/<feature>/schemas.ts`. Use `.omit()`, `.pick()`, `.partial()` and `.extend()`. Do not repeat its fields. Write a field that is not in the resource, for example `limit`, in the route schema.
6. Give each params schema a format rule, for example `z.string().min(1)` or `z.uuid()`. The 400 test needs it.

Template for `work-orders` (`<Name>` is `WorkOrders`):

```ts
import { z } from "zod";

import { <Resource>Schema } from "@/features/<feature>/schemas";

export const Get<Name>QuerySchema = z.object({
  status: <Resource>Schema.shape.status.optional(),
});
export type Get<Name>Query = z.infer<typeof Get<Name>QuerySchema>;

export const Get<Name>ResponseSchema = z.object({
  items: z.array(<Resource>Schema),
});
export type Get<Name>Response = z.infer<typeof Get<Name>ResponseSchema>;

export const Post<Name>BodySchema = <Resource>Schema.omit({ id: true });
export type Post<Name>Body = z.infer<typeof Post<Name>BodySchema>;

export const Post<Name>ResponseSchema = <Resource>Schema;
export type Post<Name>Response = z.infer<typeof Post<Name>ResponseSchema>;
```

Template for `work-orders/[id]` (`<Name>` is `WorkOrder`):

```ts
import { z } from "zod";

import { <Resource>Schema } from "@/features/<feature>/schemas";

export const <Name>ParamsSchema = z.object({ id: z.string().min(1) });
export type <Name>Params = z.infer<typeof <Name>ParamsSchema>;

export const Get<Name>ResponseSchema = <Resource>Schema;
export type Get<Name>Response = z.infer<typeof Get<Name>ResponseSchema>;

export const Put<Name>BodySchema = <Resource>Schema.omit({ id: true });
export type Put<Name>Body = z.infer<typeof Put<Name>BodySchema>;

export const Put<Name>ResponseSchema = <Resource>Schema;
export type Put<Name>Response = z.infer<typeof Put<Name>ResponseSchema>;

// DELETE returns 204 with no body, so it has no response schema.
```

## 5. Write `route.ts`

1. Export one `async function` for each method. Name it with the method, for example `export async function GET(...)`.
2. Put the body of each function in `handle(async () => { ... })` from `@/lib/api`. `handle` changes a thrown error to a JSON response:

   | Thrown error                                                            | Status |
   | ----------------------------------------------------------------------- | ------ |
   | `ValidationError` (from `parseBody`, `parseSearchParams`, `parseInput`) | 400    |
   | `NotFoundError`                                                         | 404    |
   | `ConflictError`                                                         | 409    |
   | Any other error                                                         | 500    |

3. Validate each input with the helpers from `@/lib/api`. Do not call `schema.parse` or `request.json()` directly:
   - The body: `await parseBody(request, <Schema>)`.
   - The search params: `parseSearchParams(request, <Schema>)`.
   - The dynamic segments: `parseInput(<Name>ParamsSchema, await ctx.params)`.
4. Throw `new NotFoundError("<Resource> not found")` when the data function returns `undefined`.
5. Do not catch errors in the route. Do not write `try` or `catch`. `handle` does it.
6. Do not return an error response directly. Throw the error.
7. Type each success body with `satisfies <Method><Name>Response`. Use `{ status: 201 }` for a `POST` that makes a resource. Use `new Response(null, { status: 204 })` for a `DELETE` with no body.
8. Type the context of a dynamic route with `RouteContext<"/api/<path>">`. Use the full path with the brackets, for example `RouteContext<"/api/work-orders/[id]">`. `next typegen` makes this global type.
9. Import only the names that the file uses. ESLint fails on an unused import.
10. A `GET` that reads `request.url`, the search params or `ctx.params` runs at request time. A `GET` that reads no request data is prerendered at build time. If it must run at request time, call `await connection()` from `next/server` first. Write the reason in a comment.

Template for `work-orders`:

```ts
import {
  create<Resource>,
  list<Resource>s,
} from "@/features/<feature>/server/<module>";
import { handle, parseBody, parseSearchParams } from "@/lib/api";

import {
  Get<Name>QuerySchema,
  type Get<Name>Response,
  Post<Name>BodySchema,
  type Post<Name>Response,
} from "./types";

export async function GET(request: Request) {
  return handle(async () => {
    const query = parseSearchParams(request, Get<Name>QuerySchema);
    const items = await list<Resource>s(query);

    return Response.json({ items } satisfies Get<Name>Response);
  });
}

export async function POST(request: Request) {
  return handle(async () => {
    const body = await parseBody(request, Post<Name>BodySchema);
    // create<Resource> throws ConflictError when the item exists.
    const item = await create<Resource>(body);

    return Response.json(item satisfies Post<Name>Response, { status: 201 });
  });
}
```

Template for `work-orders/[id]`:

```ts
import {
  get<Resource>,
  remove<Resource>,
  update<Resource>,
} from "@/features/<feature>/server/<module>";
import { handle, NotFoundError, parseBody, parseInput } from "@/lib/api";

import {
  type Get<Name>Response,
  <Name>ParamsSchema,
  Put<Name>BodySchema,
  type Put<Name>Response,
} from "./types";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/<path>">,
) {
  return handle(async () => {
    const { id } = parseInput(<Name>ParamsSchema, await ctx.params);
    const item = await get<Resource>(id);
    if (!item) throw new NotFoundError("<Resource> not found");

    return Response.json(item satisfies Get<Name>Response);
  });
}

export async function PUT(
  request: Request,
  ctx: RouteContext<"/api/<path>">,
) {
  return handle(async () => {
    const { id } = parseInput(<Name>ParamsSchema, await ctx.params);
    const body = await parseBody(request, Put<Name>BodySchema);
    // update<Resource> returns undefined when the item is not there.
    // It throws ConflictError when the change conflicts with another item.
    const item = await update<Resource>(id, body);
    if (!item) throw new NotFoundError("<Resource> not found");

    return Response.json(item satisfies Put<Name>Response);
  });
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/<path>">,
) {
  return handle(async () => {
    const { id } = parseInput(<Name>ParamsSchema, await ctx.params);
    const removed = await remove<Resource>(id);
    if (!removed) throw new NotFoundError("<Resource> not found");

    return new Response(null, { status: 204 });
  });
}
```

## 6. Write `route.test.ts`

1. The test runs in the Node environment. Do not add the jsdom docblock.
2. Import `afterEach`, `beforeEach`, `describe`, `expect`, `it` and `vi` from `vitest`. Import only the names that the file uses.
3. Call the exported function directly with a `new Request("http://localhost/api/<path>...")`. For a dynamic route, pass `{ params: Promise.resolve({ <segment>: "1" }) }` as the context.
4. Mock the module of the data functions with `vi.mock("@/features/<feature>/server/<module>", ...)`. Import the mocked functions and use `vi.mocked()` on them. Do not call a real database.
5. Call `vi.resetAllMocks()` in `beforeEach`. Then each test starts with empty mocks.
6. Type the test data with the resource type: `const item: <Resource> = { ... }`. Without the type, an enum field becomes `string`, and typecheck fails.
7. Write one `describe` block for each method. In each block, write at least one test for the success case. Check the status and parse the body with the response schema.
8. If the method reads an input (params, search params or body), write at least one test with invalid input. Check that the status is 400. For params, use a value that the format rule rejects, for example `""`.
9. Write a test for each other status that the method can return: 404, 409 and 500.
10. For the 500 test, make the mock reject with `new Error()`. Silence the log with `vi.spyOn(console, "error").mockImplementation(() => {})`. Call `vi.restoreAllMocks()` in `afterEach`.
11. Check error bodies with `ErrorResponseSchema` from `@/lib/api`.
12. When the work has a ticket with acceptance criteria, put the AC number in the test name, for example `AC2: ...`.

Template for `work-orders`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  create<Resource>,
  list<Resource>s,
} from "@/features/<feature>/server/<module>";
import type { <Resource> } from "@/features/<feature>/schemas";
import { ConflictError, ErrorResponseSchema } from "@/lib/api";

import { GET, POST } from "./route";
import { Get<Name>ResponseSchema, Post<Name>ResponseSchema } from "./types";

vi.mock("@/features/<feature>/server/<module>", () => ({
  list<Resource>s: vi.fn(),
  create<Resource>: vi.fn(),
}));

const item: <Resource> = { id: "1" /* the other fields */ };
const validBody = { /* the fields of item without id */ };

function postRequest(body: unknown) {
  return new Request("http://localhost/api/<path>", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.resetAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("GET /api/<path>", () => {
  it("returns the items", async () => {
    vi.mocked(list<Resource>s).mockResolvedValue([item]);

    const response = await GET(new Request("http://localhost/api/<path>"));

    expect(response.status).toBe(200);
    expect(Get<Name>ResponseSchema.parse(await response.json()).items).toHaveLength(1);
  });

  it("returns 400 when the query is not valid", async () => {
    const response = await GET(new Request("http://localhost/api/<path>?status=unknown"));

    expect(response.status).toBe(400);
    expect(ErrorResponseSchema.parse(await response.json()).error.issues).toBeDefined();
  });

  it("returns 500 when the data function fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(list<Resource>s).mockRejectedValue(new Error("down"));

    const response = await GET(new Request("http://localhost/api/<path>"));

    expect(response.status).toBe(500);
  });
});

describe("POST /api/<path>", () => {
  it("makes the item and returns 201", async () => {
    vi.mocked(create<Resource>).mockResolvedValue(item);

    const response = await POST(postRequest(validBody));

    expect(response.status).toBe(201);
    expect(Post<Name>ResponseSchema.parse(await response.json())).toEqual(item);
  });

  it("returns 400 when the body is not valid", async () => {
    const response = await POST(postRequest({}));

    expect(response.status).toBe(400);
    expect(create<Resource>).not.toHaveBeenCalled();
  });

  it("returns 409 when the item exists", async () => {
    vi.mocked(create<Resource>).mockRejectedValue(new ConflictError("<Resource> exists"));

    const response = await POST(postRequest(validBody));

    expect(response.status).toBe(409);
  });

  it("returns 500 when the data function fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(create<Resource>).mockRejectedValue(new Error("down"));

    const response = await POST(postRequest(validBody));

    expect(response.status).toBe(500);
  });
});
```

Template for `work-orders/[id]`. It shows `GET`. Write `PUT` and `DELETE` in the same way, with the tests of steps 7 to 10:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { <Resource> } from "@/features/<feature>/schemas";
import { get<Resource> } from "@/features/<feature>/server/<module>";
import { ErrorResponseSchema } from "@/lib/api";

import { GET } from "./route";
import { Get<Name>ResponseSchema } from "./types";

vi.mock("@/features/<feature>/server/<module>", () => ({
  get<Resource>: vi.fn(),
}));

const item: <Resource> = { id: "1" /* the other fields */ };
const url = "http://localhost/api/<static part of path>/1";

function context(id = "1") {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  vi.resetAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("GET /api/<path>", () => {
  it("returns the item", async () => {
    vi.mocked(get<Resource>).mockResolvedValue(item);

    const response = await GET(new Request(url), context());

    expect(response.status).toBe(200);
    expect(Get<Name>ResponseSchema.parse(await response.json())).toEqual(item);
  });

  it("returns 400 when the id is not valid", async () => {
    const response = await GET(new Request(url), context(""));

    expect(response.status).toBe(400);
    expect(get<Resource>).not.toHaveBeenCalled();
  });

  it("returns 404 when the item is not there", async () => {
    vi.mocked(get<Resource>).mockResolvedValue(undefined);

    const response = await GET(new Request(url), context("2"));

    expect(response.status).toBe(404);
    expect(ErrorResponseSchema.parse(await response.json()).error.message).toBe(
      "<Resource> not found",
    );
  });
});
```

## 7. Do not change these

- Do not change `src/lib/api.ts` for one route. If a route needs a new error type, ask the user first.
- Do not add a dependency. Zod, Vitest and Next.js are installed.

## 8. Check the work

Run these commands in `apps/web`. The repository has only `package-lock.json`, so use npm, not the pnpm commands in `AGENTS.md`. Put quotes around each path. A path with `[id]` fails in zsh without quotes.

1. `npx prettier --write "<each new file>"`
2. `npm test -- "src/app/api/<path>/route.test.ts"`. The tests must pass.
3. `npm run lint`
4. `npm run typecheck`
5. `npm run format:check`
6. `npm test`. This also runs the tests of the data functions.
7. `npm run build`

If a command fails, fix the cause. Do not change an existing test to make it pass.

`AGENTS.md` asks for all the checks before a commit and before you say that the task is complete. Run all seven commands before step 9.

## 9. Report

Tell the user:

- The files that you made.
- For each method: the input it validates and the status codes it can return.
- The tests for each method.
- The result of each command in step 8.

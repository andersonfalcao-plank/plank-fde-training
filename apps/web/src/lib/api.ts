import { z } from "zod";

// Shared error handling for the route handlers in src/app/api/.
// A handler throws one of these errors. handle() changes it to a JSON response with the correct status.

export const ErrorResponseSchema = z.object({
  error: z.object({
    message: z.string(),
    issues: z
      .array(z.object({ path: z.string(), message: z.string() }))
      .optional(),
  }),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

type Issue = NonNullable<ErrorResponse["error"]["issues"]>[number];

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export class ValidationError extends HttpError {
  constructor(readonly issues: Issue[]) {
    super(400, "Invalid input");
    this.name = "ValidationError";
  }
}

export class NotFoundError extends HttpError {
  constructor(message = "Resource not found") {
    super(404, message);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends HttpError {
  constructor(message = "Data conflict") {
    super(409, message);
    this.name = "ConflictError";
  }
}

export function parseInput<T extends z.ZodType>(
  schema: T,
  input: unknown,
): z.output<T> {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new ValidationError(
      result.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    );
  }
  return result.data;
}

export async function parseBody<T extends z.ZodType>(
  request: Request,
  schema: T,
): Promise<z.output<T>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new ValidationError([
      { path: "", message: "The body is not valid JSON" },
    ]);
  }
  return parseInput(schema, body);
}

export function parseSearchParams<T extends z.ZodType>(
  request: Request,
  schema: T,
): z.output<T> {
  return parseInput(
    schema,
    Object.fromEntries(new URL(request.url).searchParams),
  );
}

export function errorResponse(error: unknown): Response {
  if (error instanceof ValidationError) {
    return Response.json(
      {
        error: { message: error.message, issues: error.issues },
      } satisfies ErrorResponse,
      { status: error.status },
    );
  }
  if (error instanceof HttpError) {
    return Response.json(
      { error: { message: error.message } } satisfies ErrorResponse,
      {
        status: error.status,
      },
    );
  }
  // Do not send the details of an unknown error to the client. Write them to the server log.
  console.error(error);
  return Response.json(
    { error: { message: "Internal server error" } } satisfies ErrorResponse,
    {
      status: 500,
    },
  );
}

export async function handle(
  handler: () => Promise<Response>,
): Promise<Response> {
  try {
    return await handler();
  } catch (error) {
    return errorResponse(error);
  }
}

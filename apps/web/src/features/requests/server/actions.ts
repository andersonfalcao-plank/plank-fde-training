"use server";

import { TRY_AGAIN_MESSAGE } from "@/features/requests/constants";
import {
  type SavedRequest,
  SavedRequestSchema,
} from "@/features/requests/schemas";
import { FieldErrorResponseSchema } from "@/lib/api";
import { config } from "@/lib/config";

const CREATE_REQUEST_FIELDS = ["title", "details", "team", "priority"] as const;

export type CreateRequestField = (typeof CREATE_REQUEST_FIELDS)[number];

// The values that the form sends. The API validates them.
export type CreateRequestValues = Partial<Record<CreateRequestField, string>>;

export type CreateRequestResult =
  | { ok: true; data: SavedRequest }
  // A 422: the message for each field that is not valid, and the API message.
  | {
      ok: false;
      fieldErrors: Partial<Record<CreateRequestField, string>>;
      error: string;
    }
  // A 400, a 500, a network error or a response that is not valid.
  | { ok: false; error: string };

// Sends only the known fields, as strings. The client data is not trusted.
// An empty priority is left out, so the API uses "medium".
function toBody(values: CreateRequestValues) {
  const body: CreateRequestValues = {};
  for (const field of CREATE_REQUEST_FIELDS) {
    const value = values?.[field];
    if (typeof value === "string") body[field] = value;
  }
  if (!body.priority) delete body.priority;
  return body;
}

// Sends the Request to POST /api/requests and returns the result.
// It does not throw: the client shows each result in the form.
export async function createRequestAction(
  values: CreateRequestValues,
): Promise<CreateRequestResult> {
  let response: Response;
  try {
    response = await fetch(`${config.apiBaseUrl}/api/requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toBody(values)),
    });
  } catch (error) {
    console.error(error);
    return { ok: false, error: TRY_AGAIN_MESSAGE };
  }

  const body: unknown = await response.json().catch(() => undefined);

  if (response.status === 201) {
    const saved = SavedRequestSchema.safeParse(body);
    if (saved.success) return { ok: true, data: saved.data };
  }

  if (response.status === 422) {
    const invalid = FieldErrorResponseSchema.safeParse(body);
    if (invalid.success) {
      const fieldErrors: Partial<Record<CreateRequestField, string>> = {};
      for (const field of CREATE_REQUEST_FIELDS) {
        const message = invalid.data.fieldErrors[field]?.[0];
        if (message) fieldErrors[field] = message;
      }
      return { ok: false, fieldErrors, error: invalid.data.error.message };
    }
  }

  console.error(`POST /api/requests returned ${response.status}.`);
  return { ok: false, error: TRY_AGAIN_MESSAGE };
}

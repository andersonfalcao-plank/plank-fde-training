"use server";

import { z } from "zod";

import { TRY_AGAIN_MESSAGE } from "@/features/requests/constants";
import {
  CreateRequestSchema,
  type SavedRequest,
} from "@/features/requests/schemas";
import { saveRequest } from "@/features/requests/server/api-store";

const CREATE_REQUEST_FIELDS = ["title", "details", "team", "priority"] as const;

export type CreateRequestField = (typeof CREATE_REQUEST_FIELDS)[number];

// The values that the form sends. The server action validates them.
export type CreateRequestValues = Partial<Record<CreateRequestField, string>>;

export type CreateRequestResult =
  | { ok: true; data: SavedRequest }
  // The values are not valid: the message for each field, and a general message.
  | {
      ok: false;
      fieldErrors: Partial<Record<CreateRequestField, string>>;
      error: string;
    }
  // The store failed.
  | { ok: false; error: string };

// Keeps only the known fields, as strings. The client data is not trusted.
// An empty priority is left out, so the schema uses "medium".
function toInput(values: CreateRequestValues) {
  const input: CreateRequestValues = {};
  for (const field of CREATE_REQUEST_FIELDS) {
    const value = values?.[field];
    if (typeof value === "string") input[field] = value;
  }
  if (!input.priority) delete input.priority;
  return input;
}

// Validates the values with the create input schema and saves the Request in
// the same store as POST /api/requests. It calls the store directly, not the
// API over HTTP: an HTTP call needs a full URL, and on a protected Vercel
// preview it gets the login page.
// It does not throw: the client shows each result in the form.
export async function createRequestAction(
  values: CreateRequestValues,
): Promise<CreateRequestResult> {
  const parsed = CreateRequestSchema.safeParse(toInput(values));
  if (!parsed.success) {
    const { fieldErrors: messages } = z.flattenError(parsed.error);
    const fieldErrors: Partial<Record<CreateRequestField, string>> = {};
    for (const field of CREATE_REQUEST_FIELDS) {
      const message = messages[field]?.[0];
      if (message) fieldErrors[field] = message;
    }
    return { ok: false, fieldErrors, error: "Invalid input" };
  }

  try {
    return { ok: true, data: await saveRequest(parsed.data) };
  } catch (error) {
    console.error(error);
    return { ok: false, error: TRY_AGAIN_MESSAGE };
  }
}

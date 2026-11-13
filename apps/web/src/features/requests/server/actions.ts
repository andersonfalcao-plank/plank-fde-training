"use server";

import { z } from "zod";

import { RequestSchema } from "@/features/requests/schemas";
import { createRequest } from "@/features/requests/server/store";

export type CreateRequestField = "title" | "details" | "team" | "priority";

export type CreateRequestState = {
  // True after the action saved a Request. The form then shows a success
  // message and starts empty.
  success: boolean;
  // The message for each field that is not valid.
  fieldErrors: Partial<Record<CreateRequestField, string>>;
  // The values that the user sent. The form shows them again after an error.
  values: Partial<Record<CreateRequestField, string>>;
};

// A field that the browser does not send (for example a select with no
// option selected) reads as "".
function readText(formData: FormData, name: CreateRequestField) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

// Validates the form. Returns the field errors and the sent values, or saves
// the Request and returns success with empty values.
export async function createRequestAction(
  _previousState: CreateRequestState,
  formData: FormData,
): Promise<CreateRequestState> {
  const values = {
    title: readText(formData, "title"),
    details: readText(formData, "details"),
    team: readText(formData, "team"),
    priority: readText(formData, "priority") || undefined,
  };

  const result = RequestSchema.safeParse(values);
  if (!result.success) {
    const { fieldErrors } = z.flattenError(result.error);
    return {
      success: false,
      fieldErrors: {
        title: fieldErrors.title?.[0],
        details: fieldErrors.details?.[0],
        team: fieldErrors.team?.[0],
        priority: fieldErrors.priority?.[0],
      },
      values,
    };
  }

  createRequest(result.data);
  return { success: true, fieldErrors: {}, values: {} };
}

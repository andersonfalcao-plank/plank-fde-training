import { z } from "zod";

import {
  CreateRequestSchema,
  RequestListResponseSchema,
  SavedRequestSchema,
} from "@/features/requests/schemas";

// The client parses the same response, so the schema is in the feature.
export const GetRequestsResponseSchema = RequestListResponseSchema;
export type GetRequestsResponse = z.infer<typeof GetRequestsResponseSchema>;

// The body uses the create input schema of the form, with no other rules.
// It has no status. The server sets it.
export const PostRequestsBodySchema = CreateRequestSchema;
export type PostRequestsBody = z.input<typeof PostRequestsBodySchema>;

export const PostRequestsResponseSchema = SavedRequestSchema;
export type PostRequestsResponse = z.infer<typeof PostRequestsResponseSchema>;

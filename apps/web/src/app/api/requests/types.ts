import { z } from "zod";

import { RequestSchema, SavedRequestSchema } from "@/features/requests/schemas";

export const GetRequestsResponseSchema = z.object({
  data: z.array(SavedRequestSchema),
});
export type GetRequestsResponse = z.infer<typeof GetRequestsResponseSchema>;

// The body uses the input schema of the form, with no other rules.
export const PostRequestsBodySchema = RequestSchema;
export type PostRequestsBody = z.input<typeof PostRequestsBodySchema>;

export const PostRequestsResponseSchema = SavedRequestSchema;
export type PostRequestsResponse = z.infer<typeof PostRequestsResponseSchema>;

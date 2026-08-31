import { z } from "zod";

export const healthResponseSchema = z.object({
  status: z.literal("ok"),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;

export const internalErrorResponseSchema = z.object({
  error: z.object({
    code: z.literal("INTERNAL_ERROR"),
    message: z.literal("An unexpected error occurred. Try again later."),
  }),
});

export const internalErrorResponse = {
  error: {
    code: "INTERNAL_ERROR",
    message: "An unexpected error occurred. Try again later.",
  },
} as const;

export type InternalErrorResponse = z.infer<typeof internalErrorResponseSchema>;

import { z } from "zod";

export const demoCommandSchema = z.strictObject({});

export const demoStatusSchema = z.discriminatedUnion("isDemo", [
  z.strictObject({ isDemo: z.literal(false) }),
  z.strictObject({
    isDemo: z.literal(true),
    state: z.enum(["active", "expired"]),
    expiresAt: z.iso.datetime(),
    hardExpiresAt: z.iso.datetime(),
    extendUntil: z.iso.datetime(),
    serverTime: z.iso.datetime(),
    canExtend: z.boolean(),
    extensionTicket: z.string().min(32).max(128).optional(),
  }),
]);

export type DemoStatus = z.infer<typeof demoStatusSchema>;

import { z } from "zod";

const databaseUrlSchema = z
  .string()
  .min(1)
  .refine((value) => {
    try {
      const protocol = new URL(value).protocol;
      return protocol === "postgres:" || protocol === "postgresql:";
    } catch {
      return false;
    }
  });

const trustedOriginsSchema = z
  .string()
  .transform((value) => value.split(",").map((origin) => origin.trim()))
  .pipe(z.array(z.url()).min(1));

const runtimeEnvironmentSchema = z.object({
  DATABASE_URL: databaseUrlSchema,
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),
  TRUSTED_ORIGINS: trustedOriginsSchema,
  HOST: z.string().min(1).default("0.0.0.0"),
  PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
});

export type RuntimeConfig = {
  databaseUrl: string;
  authSecret: string;
  authUrl: string;
  trustedOrigins: string[];
  host: string;
  port: number;
};

export const loadRuntimeConfig = (
  environment: Record<string, string | undefined>,
): RuntimeConfig => {
  const result = runtimeEnvironmentSchema.safeParse(environment);

  if (!result.success) {
    const invalidVariables = [
      ...new Set(
        result.error.issues
          .map((issue) => issue.path[0])
          .filter((name): name is string => typeof name === "string"),
      ),
    ].sort();

    throw new Error(
      `Invalid runtime configuration: ${invalidVariables.join(", ")}.`,
    );
  }

  return {
    databaseUrl: result.data.DATABASE_URL,
    authSecret: result.data.BETTER_AUTH_SECRET,
    authUrl: result.data.BETTER_AUTH_URL,
    trustedOrigins: result.data.TRUSTED_ORIGINS,
    host: result.data.HOST,
    port: result.data.PORT,
  };
};

import "server-only";
import { betterAuth, type BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import type { StewardDatabase } from "./database";
import { authSchema } from "./schema";

type AuthConfig = {
  baseUrl: string;
  secret: string;
  trustedOrigins: string[];
};

export const createAuth = (database: StewardDatabase, config: AuthConfig) => {
  const options = {
    baseURL: config.baseUrl,
    secret: config.secret,
    trustedOrigins: config.trustedOrigins,
    database: drizzleAdapter(database, {
      provider: "pg",
      schema: authSchema,
    }),
    emailAndPassword: { enabled: true },
  } satisfies BetterAuthOptions;

  return betterAuth(options);
};

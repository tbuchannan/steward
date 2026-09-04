import { betterAuth, type BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import type { StewardDatabase } from "./database.js";
import { authSchema } from "./schema.js";

export type AuthService = {
  handler: (request: Request) => Promise<Response>;
};

type AuthConfig = {
  baseUrl: string;
  secret: string;
  trustedOrigins: string[];
};

export const createAuth = (
  database: StewardDatabase,
  config: AuthConfig,
): AuthService => {
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

  const auth = betterAuth(options);
  return { handler: auth.handler };
};

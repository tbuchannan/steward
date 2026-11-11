import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

const auditTimestamp = (name: string) =>
  timestamp(name, { withTimezone: true }).notNull().defaultNow();

export const authUsers = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: auditTimestamp("created_at"),
  updatedAt: auditTimestamp("updated_at"),
});

export const authSessions = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: auditTimestamp("created_at"),
    updatedAt: auditTimestamp("updated_at"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_user_id_idx").on(table.userId)],
);

export const authAccounts = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: auditTimestamp("created_at"),
    updatedAt: auditTimestamp("updated_at"),
  },
  (table) => [index("account_user_id_idx").on(table.userId)],
);

export const authVerifications = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: auditTimestamp("created_at"),
    updatedAt: auditTimestamp("updated_at"),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const authSchema = {
  user: authUsers,
  session: authSessions,
  account: authAccounts,
  verification: authVerifications,
};

export const demoIdentities = pgTable(
  "demo_identity_metadata",
  {
    userId: text("user_id")
      .primaryKey()
      .references(() => authUsers.id, { onDelete: "restrict" }),
    createdAt: auditTimestamp("created_at"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (table) => [index("demo_expiration_idx").on(table.expiresAt)],
);

// A tab must retain its session-bound ticket in memory to extend after expiry.
export const demoSessionGrants = pgTable(
  "demo_session_grant",
  {
    sessionId: text("session_id")
      .primaryKey()
      .references(() => authSessions.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => demoIdentities.userId, { onDelete: "cascade" }),
  },
  (table) => [index("demo_grant_user_idx").on(table.userId)],
);

export const demoCreationLimits = pgTable(
  "demo_creation_limit",
  {
    key: text("key").primaryKey(),
    attempts: integer("attempts").notNull(),
    resetAt: timestamp("reset_at", { withTimezone: true }).notNull(),
  },
  (table) => [index("demo_limit_reset_idx").on(table.resetAt)],
);

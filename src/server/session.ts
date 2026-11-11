import "server-only";
import { headers } from "next/headers";

import { getRuntime } from "./runtime";

export const getSession = async () =>
  getRuntime().auth.api.getSession({
    headers: await headers(),
    // Only the browser-facing auth route can send a renewed session cookie.
    query: { disableRefresh: true },
  });

// Ordinary application operations must enforce both provider and demo expiry.
// Lifecycle status/extension routes intentionally use the raw provider session.
export const getProtectedSession = async () => {
  const session = await getSession();
  if (!session) return null;
  const status = await getRuntime().demo.status(session);
  return status.isDemo && status.state === "expired" ? null : session;
};

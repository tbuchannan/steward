import "server-only";
import { headers } from "next/headers";

import { getRuntime } from "@/server/runtime";

export const getSession = async () =>
  getRuntime().auth.api.getSession({
    headers: await headers(),
    // Only the browser-facing auth route can send a renewed session cookie.
    query: { disableRefresh: true },
  });

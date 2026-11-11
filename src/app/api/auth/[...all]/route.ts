import { toNextJsHandler } from "better-auth/next-js";

import { getRuntime } from "../../../../server/runtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const { GET, POST } = toNextJsHandler(async (request: Request) => {
  const response = await getRuntime().auth.handler(request);
  response.headers.set("cache-control", "no-store");
  return response;
});

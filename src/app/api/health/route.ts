import {
  healthResponseSchema,
  internalErrorResponse,
  internalErrorResponseSchema,
} from "../../../lib/contracts/index";

import { checkDatabase } from "../../../server/database";
import { getRuntime } from "../../../server/runtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const headers = { "cache-control": "no-store" };
  try {
    await checkDatabase(getRuntime().pool);
    return Response.json(healthResponseSchema.parse({ status: "ok" }), {
      headers,
    });
  } catch {
    console.error("Readiness check failed.");
    return Response.json(
      internalErrorResponseSchema.parse(internalErrorResponse),
      {
        status: 500,
        headers,
      },
    );
  }
}

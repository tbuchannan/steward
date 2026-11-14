import { demoRequest } from "../../../../server/demo/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const POST = (request: Request) => demoRequest(request, "extend");

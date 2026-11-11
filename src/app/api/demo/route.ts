import { demoRequest } from "../../../server/demo/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const GET = (request: Request) => demoRequest(request, "status");
export const POST = (request: Request) => demoRequest(request, "create");

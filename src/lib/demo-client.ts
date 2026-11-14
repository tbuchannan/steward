import { demoStatusSchema } from "./contracts/demo";

export class DemoRequestError extends Error {
  constructor(public readonly code: string) {
    super(code);
  }
}

export const requestDemo = async (
  action: "status" | "create" | "activity" | "extend",
  ticket?: string,
) => {
  const url =
    action === "status" || action === "create"
      ? "/api/demo"
      : `/api/demo/${action}`;
  const response = await fetch(url, {
    method: action === "status" ? "GET" : "POST",
    cache: "no-store",
    headers: {
      ...(action !== "status" ? { "content-type": "application/json" } : {}),
      ...(ticket ? { "x-demo-extension": ticket } : {}),
    },
    ...(action !== "status" ? { body: "{}" } : {}),
  });
  const body: unknown = await response.json();
  if (!response.ok) {
    const code =
      typeof body === "object" &&
      body !== null &&
      "error" in body &&
      typeof body.error === "object" &&
      body.error !== null &&
      "code" in body.error &&
      typeof body.error.code === "string"
        ? body.error.code
        : "INTERNAL_ERROR";
    throw new DemoRequestError(code);
  }
  return demoStatusSchema.parse(body);
};

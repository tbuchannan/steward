import "server-only";

export class DemoError extends Error {
  constructor(
    public readonly code:
      | "DEMO_EXPIRED"
      | "RESOURCE_NOT_FOUND"
      | "AUTHENTICATION_REQUIRED"
      | "RATE_LIMITED"
      | "VALIDATION_ERROR",
    public readonly retryAfter?: number,
  ) {
    super(code);
  }
}

import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getSession: vi.fn() }));
vi.mock("next/headers", () => ({
  headers: async () =>
    new Headers({ cookie: "better-auth.session_token=opaque" }),
}));
vi.mock("../src/server/runtime.js", () => ({
  getRuntime: () => ({ auth: { api: { getSession: mocks.getSession } } }),
}));
import AccountsRoute from "../src/app/accounts/page.js";

describe("server-protected accounts page", () => {
  beforeEach(() => {
    mocks.getSession.mockReset();
  });
  it("redirects an invalid or expired session before rendering protected UI", async () => {
    mocks.getSession.mockResolvedValue(null);
    await expect(AccountsRoute()).rejects.toThrow("NEXT_REDIRECT");
  });
  it("renders only after the server validates the incoming cookie", async () => {
    mocks.getSession.mockImplementation(
      async ({
        headers,
        query,
      }: {
        headers: Headers;
        query?: { disableRefresh?: boolean };
      }) => {
        expect(headers.get("cookie")).toBe("better-auth.session_token=opaque");
        expect(query?.disableRefresh).toBe(true);
        return {
          user: { id: "user-1", name: "Taylor", email: "taylor@example.com" },
        };
      },
    );
    expect(await AccountsRoute()).toBeTruthy();
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getSession: vi.fn(), status: vi.fn() }));
vi.mock("next/headers", () => ({
  headers: async () =>
    new Headers({ cookie: "better-auth.session_token=opaque" }),
}));
vi.mock("../src/server/runtime.js", () => ({
  getRuntime: () => ({
    auth: { api: { getSession: mocks.getSession } },
    demo: { status: mocks.status },
  }),
}));
import AccountsRoute from "../src/app/accounts/page.js";
import { getProtectedSession } from "../src/server/session.js";

describe("server-protected accounts page", () => {
  beforeEach(() => {
    mocks.getSession.mockReset();
    mocks.status.mockResolvedValue({ isDemo: false });
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

  it("renders only a lifecycle shell for an expired demo", async () => {
    mocks.getSession.mockResolvedValue({
      user: { id: "demo" },
      session: { id: "session" },
    });
    mocks.status.mockResolvedValue({
      isDemo: true,
      state: "expired",
      canExtend: false,
    });
    const page = await AccountsRoute();
    expect(page.props.children).toBeNull();
    expect(await getProtectedSession()).toBeNull();
  });
});

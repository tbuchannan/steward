import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Page from "./page";

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  refresh: vi.fn(),
  signInEmail: vi.fn(),
  signUpEmail: vi.fn(),
  session: { data: null as null | { user: { name: string } } },
}));

vi.mock("../lib/auth-client", () => ({
  authClient: {
    signIn: { email: mocks.signInEmail },
    signUp: { email: mocks.signUpEmail },
    useSession: () => mocks.session,
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace, refresh: mocks.refresh }),
}));

const renderLanding = async (mode?: string) => {
  render(await Page({ searchParams: Promise.resolve({ mode }) }));
};

const fillCredentials = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText("Email address"), "taylor@example.com");
  await user.type(
    screen.getByLabelText("Password", { exact: true }),
    "password123",
  );
};

describe("landing page authentication", () => {
  afterEach(() => vi.unstubAllGlobals());
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.session.data = null;
    mocks.signInEmail.mockResolvedValue({ data: {}, error: null });
    mocks.signUpEmail.mockResolvedValue({ data: {}, error: null });
  });

  it("logs in from the landing page using only the sign-in endpoint", async () => {
    const user = userEvent.setup();
    await renderLanding();
    await fillCredentials(user);
    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(mocks.signInEmail).toHaveBeenCalledWith({
      email: "taylor@example.com",
      password: "password123",
    });
    expect(mocks.signUpEmail).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(mocks.replace).toHaveBeenCalledWith("/accounts"),
    );
    expect(mocks.refresh).toHaveBeenCalled();
  });

  it("switches to registration on the same page and sends only registration fields", async () => {
    const user = userEvent.setup();
    await renderLanding();
    await user.click(screen.getByRole("tab", { name: "Create account" }));
    await user.type(screen.getByLabelText("Full name"), " Taylor ");
    await fillCredentials(user);
    await user.type(screen.getByLabelText("Confirm password"), "password123");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(mocks.signUpEmail).toHaveBeenCalledWith({
      name: "Taylor",
      email: "taylor@example.com",
      password: "password123",
    });
    expect(mocks.signInEmail).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(mocks.replace).toHaveBeenCalledWith("/accounts"),
    );
  });

  it("opens registration through the landing page mode parameter", async () => {
    await renderLanding("signup");
    expect(screen.getByRole("tab", { name: "Create account" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByLabelText("Full name")).toBeEnabled();
  });

  it("rejects mismatched passwords before calling registration", async () => {
    const user = userEvent.setup();
    await renderLanding("signup");
    await user.type(screen.getByLabelText("Full name"), "Taylor");
    await fillCredentials(user);
    await user.type(screen.getByLabelText("Confirm password"), "different123");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Passwords must match.",
    );
    expect(mocks.signUpEmail).not.toHaveBeenCalled();
  });

  it("does not submit an empty form", async () => {
    const user = userEvent.setup();
    await renderLanding();
    await user.click(screen.getByRole("button", { name: "Log in" }));
    expect(mocks.signInEmail).not.toHaveBeenCalled();
    expect(mocks.signUpEmail).not.toHaveBeenCalled();
  });

  it("shows a safe login error and clears it when switching modes", async () => {
    mocks.signInEmail.mockResolvedValue({
      error: { message: "Internal provider detail" },
    });
    const user = userEvent.setup();
    await renderLanding();
    await fillCredentials(user);
    await user.click(screen.getByRole("button", { name: "Log in" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The email address or password is incorrect.",
    );
    expect(mocks.replace).not.toHaveBeenCalled();
    await user.click(screen.getByRole("tab", { name: "Create account" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("recovers from network failures so the user can retry", async () => {
    mocks.signInEmail.mockRejectedValue(new Error("Network unavailable"));
    const user = userEvent.setup();
    await renderLanding();
    await fillCredentials(user);
    await user.click(screen.getByRole("button", { name: "Log in" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to connect. Please try again.",
    );
    expect(screen.getByRole("button", { name: "Log in" })).toBeEnabled();
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("prevents repeat submissions and mode changes while a request is pending", async () => {
    let finish!: (result: { error: null }) => void;
    mocks.signInEmail.mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const user = userEvent.setup();
    await renderLanding();
    await fillCredentials(user);
    await user.click(screen.getByRole("button", { name: "Log in" }));
    expect(screen.getByRole("button", { name: "Signing in…" })).toBeDisabled();
    expect(screen.getByRole("tab", { name: "Create account" })).toBeDisabled();
    expect(mocks.signInEmail).toHaveBeenCalledTimes(1);
    finish({ error: null });
    await waitFor(() =>
      expect(mocks.replace).toHaveBeenCalledWith("/accounts"),
    );
  });

  it("takes an existing session to accounts", async () => {
    mocks.session.data = { user: { name: "Taylor" } };
    await renderLanding();
    await waitFor(() =>
      expect(mocks.replace).toHaveBeenCalledWith("/accounts"),
    );
  });

  it("enters the demo without requiring credentials", async () => {
    const fetch = vi.fn().mockResolvedValue(Response.json({ isDemo: false }));
    vi.stubGlobal("fetch", fetch);
    const user = userEvent.setup();
    await renderLanding();
    await user.click(
      screen.getByRole("button", { name: "Try the demo account" }),
    );
    await waitFor(() =>
      expect(mocks.replace).toHaveBeenCalledWith("/accounts"),
    );
    expect(fetch).toHaveBeenCalledWith(
      "/api/demo",
      expect.objectContaining({ method: "POST", body: "{}" }),
    );
    expect(mocks.signUpEmail).not.toHaveBeenCalled();
  });

  it("allows retry after demo creation is rate limited", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          Response.json({ error: { code: "RATE_LIMITED" } }, { status: 429 }),
        ),
    );
    const user = userEvent.setup();
    await renderLanding();
    await user.click(
      screen.getByRole("button", { name: "Try the demo account" }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Too many demo requests",
    );
    expect(
      screen.getByRole("button", { name: "Try the demo account" }),
    ).toBeEnabled();
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("shows the expiry message without bouncing the expired provider session back to accounts", async () => {
    mocks.session.data = { user: { name: "Demo visitor" } };
    render(await Page({ searchParams: Promise.resolve({ demo: "expired" }) }));
    expect(screen.getByRole("status")).toHaveTextContent("Your demo expired");
    expect(mocks.replace).not.toHaveBeenCalled();
  });
});

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import SignInScreen from "./sign-in-screen.js";

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  refresh: vi.fn(),
  signInEmail: vi.fn(),
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    signIn: { email: mocks.signInEmail },
    useSession: () => ({ data: null, isPending: false }),
  },
}));

const renderSignIn = async () => {
  render(<SignInScreen />);
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace, refresh: mocks.refresh }),
}));

describe("sign in", () => {
  beforeEach(() => {
    mocks.replace.mockReset();
    mocks.refresh.mockReset();
    mocks.signInEmail.mockReset();
    mocks.signInEmail.mockResolvedValue({ data: {}, error: null });
  });

  it("opens the protected application after valid credentials", async () => {
    const user = userEvent.setup();
    await renderSignIn();

    await user.type(
      screen.getByLabelText("Email address"),
      "taylor@example.com",
    );
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(mocks.signInEmail).toHaveBeenCalledWith({
      email: "taylor@example.com",
      password: "password123",
    });
    await waitFor(() =>
      expect(mocks.replace).toHaveBeenCalledWith("/accounts"),
    );
  });

  it("shows a safe error when credentials are rejected", async () => {
    mocks.signInEmail.mockResolvedValue({
      data: null,
      error: { message: "Internal provider detail" },
    });
    const user = userEvent.setup();
    await renderSignIn();

    await user.type(
      screen.getByLabelText("Email address"),
      "taylor@example.com",
    );
    await user.type(screen.getByLabelText("Password"), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(
      await screen.findByText("The email address or password is incorrect."),
    ).toHaveAttribute("role", "alert");
  });
});

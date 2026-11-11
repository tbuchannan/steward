import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import RegisterScreen from "./register-screen.js";

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  refresh: vi.fn(),
  signUpEmail: vi.fn(),
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: { signUp: { email: mocks.signUpEmail } },
}));

const renderRegistration = async () => {
  render(<RegisterScreen />);
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace, refresh: mocks.refresh }),
}));

describe("registration", () => {
  beforeEach(() => {
    mocks.replace.mockReset();
    mocks.refresh.mockReset();
    mocks.signUpEmail.mockReset();
    mocks.signUpEmail.mockResolvedValue({ data: {}, error: null });
  });

  it("keeps password confirmation out of the Better Auth request", async () => {
    const user = userEvent.setup();
    await renderRegistration();

    await user.type(screen.getByLabelText("Name"), "Taylor");
    await user.type(
      screen.getByLabelText("Email address"),
      "taylor@example.com",
    );
    await user.type(
      screen.getByLabelText("Password", { exact: true }),
      "password123",
    );
    await user.type(screen.getByLabelText("Confirm password"), "password123");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(mocks.signUpEmail).toHaveBeenCalledWith({
      name: "Taylor",
      email: "taylor@example.com",
      password: "password123",
    });
    await waitFor(() =>
      expect(mocks.replace).toHaveBeenCalledWith("/accounts"),
    );
  });

  it("does not submit passwords that do not match", async () => {
    const user = userEvent.setup();
    await renderRegistration();

    await user.type(screen.getByLabelText("Name"), "Taylor");
    await user.type(
      screen.getByLabelText("Email address"),
      "taylor@example.com",
    );
    await user.type(
      screen.getByLabelText("Password", { exact: true }),
      "password123",
    );
    await user.type(screen.getByLabelText("Confirm password"), "different123");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(
      await screen.findByText("Passwords must match."),
    ).toBeInTheDocument();
    expect(mocks.signUpEmail).not.toHaveBeenCalled();
  });
});

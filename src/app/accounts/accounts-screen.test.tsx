import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AccountsScreen from "./accounts-screen.js";

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  refresh: vi.fn(),
  session: {
    data: null as null | { user: { name: string; email: string } },
    isPending: false,
  },
  signOut: vi.fn(),
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    signOut: mocks.signOut,
    useSession: () => mocks.session,
  },
}));

const renderAccounts = async () => {
  render(<AccountsScreen />);
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace, refresh: mocks.refresh }),
}));

describe("protected accounts route", () => {
  beforeEach(() => {
    mocks.replace.mockReset();
    mocks.refresh.mockReset();
    mocks.session.data = null;
    mocks.session.isPending = false;
    mocks.signOut.mockReset();
    mocks.signOut.mockResolvedValue({ data: {}, error: null });
  });

  it("redirects an unauthenticated visitor to login", async () => {
    await renderAccounts();
    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/login"));
  });

  it("renders the session identity and signs out", async () => {
    mocks.session.data = {
      user: { name: "Taylor", email: "taylor@example.com" },
    };
    const user = userEvent.setup();
    await renderAccounts();

    expect(screen.getByText("Taylor")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Sign out" }));

    expect(mocks.signOut).toHaveBeenCalledOnce();
    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/login"));
  });
});

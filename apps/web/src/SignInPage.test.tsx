import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import SignInPage from "./SignInPage.tsx";

const mocks = vi.hoisted(() => ({ signInEmail: vi.fn() }));

vi.mock("./auth-client.ts", () => ({
  authClient: {
    signIn: { email: mocks.signInEmail },
    useSession: () => ({ data: null, isPending: false }),
  },
}));

const renderSignIn = async () => {
  const rootRoute = createRootRoute({ component: () => <Outlet /> });
  const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/login",
    component: SignInPage,
  });
  const accountsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/accounts",
    component: () => <p>Protected accounts</p>,
  });
  const router = createRouter({
    history: createMemoryHistory({ initialEntries: ["/login"] }),
    routeTree: rootRoute.addChildren([loginRoute, accountsRoute]),
  });
  await router.load();
  render(<RouterProvider router={router} />);
};

describe("sign in", () => {
  beforeEach(() => {
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
    expect(await screen.findByText("Protected accounts")).toBeInTheDocument();
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

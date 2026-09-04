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

import RegisterPage from "./RegisterPage.tsx";

const mocks = vi.hoisted(() => ({ signUpEmail: vi.fn() }));

vi.mock("./auth-client.ts", () => ({
  authClient: { signUp: { email: mocks.signUpEmail } },
}));

const renderRegistration = async () => {
  const rootRoute = createRootRoute({ component: () => <Outlet /> });
  const registerRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/register",
    component: RegisterPage,
  });
  const accountsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/accounts",
    component: () => <p>Accounts</p>,
  });
  const router = createRouter({
    history: createMemoryHistory({ initialEntries: ["/register"] }),
    routeTree: rootRoute.addChildren([registerRoute, accountsRoute]),
  });
  await router.load();
  render(<RouterProvider router={router} />);
};

describe("registration", () => {
  beforeEach(() => {
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
    expect(await screen.findByText("Accounts")).toBeInTheDocument();
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

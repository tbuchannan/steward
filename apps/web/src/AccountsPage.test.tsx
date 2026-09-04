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

import AccountsPage from "./AccountsPage.tsx";

const mocks = vi.hoisted(() => ({
  session: {
    data: null as null | { user: { name: string; email: string } },
    isPending: false,
  },
  signOut: vi.fn(),
}));

vi.mock("./auth-client.ts", () => ({
  authClient: {
    signOut: mocks.signOut,
    useSession: () => mocks.session,
  },
}));

const renderAccounts = async () => {
  const rootRoute = createRootRoute({ component: () => <Outlet /> });
  const accountsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/accounts",
    component: AccountsPage,
  });
  const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/login",
    component: () => <h1>Login destination</h1>,
  });
  const router = createRouter({
    history: createMemoryHistory({ initialEntries: ["/accounts"] }),
    routeTree: rootRoute.addChildren([accountsRoute, loginRoute]),
  });
  await router.load();
  render(<RouterProvider router={router} />);
};

describe("protected accounts route", () => {
  beforeEach(() => {
    mocks.session.data = null;
    mocks.session.isPending = false;
    mocks.signOut.mockReset();
    mocks.signOut.mockResolvedValue({ data: {}, error: null });
  });

  it("redirects an unauthenticated visitor to login", async () => {
    await renderAccounts();
    expect(await screen.findByText("Login destination")).toBeInTheDocument();
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
    expect(await screen.findByText("Login destination")).toBeInTheDocument();
  });
});

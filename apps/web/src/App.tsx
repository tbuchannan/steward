import {
  createRootRoute,
  createRoute,
  createRouter,
  Link,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { healthResponseSchema } from "@steward/contracts";

import RegisterPage from "./RegisterPage.tsx";

type DeploymentStatus = "checking" | "connected" | "unavailable";

const HomePage = () => {
  const [deploymentStatus, setDeploymentStatus] =
    useState<DeploymentStatus>("checking");

  useEffect(() => {
    const controller = new AbortController();

    const checkDeployment = async () => {
      try {
        const response = await fetch("/api/health", {
          headers: { accept: "application/json" },
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("The Steward API is unavailable.");
        const result = healthResponseSchema.safeParse(await response.json());
        setDeploymentStatus(result.success ? "connected" : "unavailable");
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setDeploymentStatus("unavailable");
        }
      }
    };

    void checkDeployment();
    return () => controller.abort();
  }, []);

  return (
    <main className="home-layout">
      <p className="eyebrow">Personal finance, clearly understood</p>
      <h1>Steward</h1>
      <p className="introduction">
        A personal finance app that helps you manage accounts, track activity,
        build budgets, and understand your spending.
      </p>
      <div className="home-actions">
        <Link className="primary-link" to="/register">
          Create account
        </Link>
        <Link className="secondary-link" to="/login">
          Sign in
        </Link>
      </div>
      <p
        aria-live="polite"
        className={`deployment-status deployment-status--${deploymentStatus}`}
        role="status"
      >
        <span aria-hidden="true" className="deployment-status__indicator" />
        Deployment status: {deploymentStatus}
      </p>
    </main>
  );
};

const PlaceholderPage = ({ registered = false }: { registered?: boolean }) => (
  <main className="auth-layout">
    <section className="auth-card">
      <Link className="wordmark" to="/">
        Steward
      </Link>
      <p className="eyebrow">
        {registered ? "Account created" : "Coming next"}
      </p>
      <h1>{registered ? "Welcome to Steward." : "Sign in"}</h1>
      <p className="auth-introduction">
        {registered
          ? "Your registration and session were created successfully."
          : "Sign-in arrives in the next pairing checkpoint."}
      </p>
      {!registered && <Link to="/register">Create an account</Link>}
    </section>
  </main>
);

const rootRoute = createRootRoute({ component: () => <Outlet /> });
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});
const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: RegisterPage,
});
const registeredRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/registered",
  component: () => <PlaceholderPage registered />,
});
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: PlaceholderPage,
});

const router = createRouter({
  routeTree: rootRoute.addChildren([
    indexRoute,
    registerRoute,
    registeredRoute,
    loginRoute,
  ]),
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const App = () => <RouterProvider router={router} />;

export default App;

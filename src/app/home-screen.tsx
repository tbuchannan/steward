"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { healthResponseSchema } from "@/lib/contracts";

type DeploymentStatus = "checking" | "connected" | "unavailable";

const HomeScreen = () => {
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
        <Link className="primary-link" href="/register">
          Create account
        </Link>
        <Link className="secondary-link" href="/login">
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

export default HomeScreen;

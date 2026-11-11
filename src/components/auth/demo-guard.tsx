"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { DemoStatus } from "../../lib/contracts/demo";
import { DemoRequestError, requestDemo } from "../../lib/demo-client";
import { authClient } from "../../lib/auth-client";
import { Button } from "../ui/button";

export const DemoGuard = ({
  initialStatus,
  children,
}: {
  initialStatus: DemoStatus;
  children?: ReactNode;
}) => {
  const router = useRouter();
  const [snapshot, setSnapshot] = useState({
    status: initialStatus,
    receivedAt: Date.now(),
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [, setExpiryTick] = useState(0);
  const ticket = useRef<string | undefined>(
    initialStatus.isDemo ? initialStatus.extensionTicket : undefined,
  );
  const lastActivity = useRef(0);
  const activityInFlight = useRef(false);
  const { status, receivedAt } = snapshot;

  const accept = useCallback((next: DemoStatus) => {
    if (next.isDemo && next.extensionTicket)
      ticket.current = next.extensionTicket;
    setSnapshot((current) => {
      if (next.isDemo && current.status.isDemo) {
        const order =
          Date.parse(next.serverTime) - Date.parse(current.status.serverTime);
        if (
          order < 0 ||
          (order === 0 &&
            Date.parse(next.expiresAt) < Date.parse(current.status.expiresAt))
        )
          return current;
      }
      return { status: next, receivedAt: Date.now() };
    });
    setError("");
  }, []);

  const readStatus = useCallback(async () => {
    try {
      const next = await requestDemo("status", ticket.current);
      accept(next);
      return next;
    } catch (error) {
      if (
        error instanceof DemoRequestError &&
        error.code === "AUTHENTICATION_REQUIRED"
      )
        router.replace("/?demo=expired");
      setError("Unable to check your demo. Please try again.");
      return null;
    }
  }, [accept, router]);

  const recordActivity = useCallback(async () => {
    if (activityInFlight.current) return;
    activityInFlight.current = true;
    try {
      accept(await requestDemo("activity"));
      lastActivity.current = Date.now();
    } catch {
      await readStatus();
    } finally {
      activityInFlight.current = false;
    }
  }, [accept, readStatus]);

  const isDemo = initialStatus.isDemo;
  useEffect(() => {
    if (!isDemo || initialStatus.state !== "active") return;
    let cancelled = false;
    void (async () => {
      const next = await readStatus();
      if (!cancelled && next?.isDemo && next.state === "active")
        await recordActivity();
    })();
    return () => {
      cancelled = true;
    };
  }, [isDemo, initialStatus, readStatus, recordActivity]);

  useEffect(() => {
    if (!status.isDemo) return;
    if (status.state === "expired" && !status.canExtend) {
      router.replace("/?demo=expired");
      return;
    }
    const deadline =
      status.state === "active" ? status.expiresAt : status.extendUntil;
    const remaining = Math.max(
      0,
      Date.parse(deadline) -
        Date.parse(status.serverTime) -
        (Date.now() - receivedAt),
    );
    const expiryTimer = window.setTimeout(() => {
      // Hide protected content even if the status request is slow or offline.
      setExpiryTick((value) => value + 1);
      void readStatus();
    }, remaining);
    const poll = window.setInterval(() => {
      void readStatus();
    }, 60_000);
    return () => {
      window.clearTimeout(expiryTimer);
      window.clearInterval(poll);
    };
  }, [status, receivedAt, readStatus, router]);

  useEffect(() => {
    if (!status.isDemo || status.state !== "active") return;
    const activity = (event: Event) => {
      if (
        event.isTrusted &&
        document.visibilityState === "visible" &&
        Date.now() - lastActivity.current >= 30_000
      )
        void recordActivity();
    };
    document.addEventListener("pointerdown", activity);
    document.addEventListener("keydown", activity);
    document.addEventListener("wheel", activity, { passive: true });
    document.addEventListener("touchmove", activity, { passive: true });
    return () => {
      document.removeEventListener("pointerdown", activity);
      document.removeEventListener("keydown", activity);
      document.removeEventListener("wheel", activity);
      document.removeEventListener("touchmove", activity);
    };
  }, [status, recordActivity]);

  if (!status.isDemo) return children;

  const localExpired =
    Date.now() - receivedAt >=
    Date.parse(status.expiresAt) - Date.parse(status.serverTime);
  if (status.state === "expired" || localExpired) {
    const extend = async () => {
      if (busy) return;
      setBusy(true);
      try {
        accept(await requestDemo("extend", ticket.current));
        router.refresh();
      } catch {
        await readStatus();
        setError("Unable to extend your demo. Please try again.");
      } finally {
        setBusy(false);
      }
    };
    const signOut = async () => {
      setBusy(true);
      try {
        const result = await authClient.signOut();
        if (result.error) throw new Error("Sign-out failed");
        router.replace("/");
        router.refresh();
      } catch {
        setError("Sign out failed. Please try again.");
      } finally {
        setBusy(false);
      }
    };
    return (
      <main className="grid min-h-svh place-items-center bg-background p-6">
        <section
          className="grid w-full max-w-md gap-5 rounded-2xl border bg-card p-8"
          aria-labelledby="demo-expired-title"
        >
          <span className="text-sm font-semibold text-primary">Demo</span>
          <h1 id="demo-expired-title" className="text-2xl font-semibold">
            Your demo has expired
          </h1>
          <p className="text-muted-foreground">
            {status.canExtend
              ? "Keep your demo and continue for up to 24 more hours, within its seven-day lifetime."
              : "Start a new demo to continue."}
          </p>
          {status.canExtend && (
            <Button disabled={busy} onClick={extend}>
              Extend demo for 24 hours
            </Button>
          )}
          {error && <p role="alert">{error}</p>}
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => {
              void readStatus();
            }}
          >
            Check again
          </Button>
          <Button variant="ghost" disabled={busy} onClick={signOut}>
            Sign out
          </Button>
        </section>
      </main>
    );
  }

  return (
    <>
      <div
        className="flex items-center justify-between gap-4 border-b bg-accent px-6 py-3 text-sm"
        role="status"
      >
        <span className="font-semibold">Demo</span>
        <span>This temporary demo has no sample data yet.</span>
      </div>
      {error && (
        <p role="alert" className="px-6 py-2">
          {error}
        </p>
      )}
      {children}
    </>
  );
};

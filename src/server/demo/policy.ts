import "server-only";
import type { DemoStatus } from "../../lib/contracts/demo";

const HOUR = 60 * 60 * 1000;
export const DEMO_IDLE_MS = 24 * HOUR;
export const DEMO_MAX_MS = 7 * DEMO_IDLE_MS;
export const DEMO_GRACE_MS = HOUR;

export type DemoLifetime = { createdAt: Date; expiresAt: Date };

export const demoState = (
  demo: DemoLifetime,
  now: Date,
  eligible: boolean,
): Extract<DemoStatus, { isDemo: true }> => {
  const hardEnd = demo.createdAt.getTime() + DEMO_MAX_MS;
  const idleEnd = Math.min(demo.expiresAt.getTime(), hardEnd);
  const extendEnd = Math.min(idleEnd + DEMO_GRACE_MS, hardEnd);
  const active = now.getTime() < idleEnd;
  return {
    isDemo: true,
    state: active ? "active" : "expired",
    expiresAt: new Date(idleEnd).toISOString(),
    hardExpiresAt: new Date(hardEnd).toISOString(),
    extendUntil: new Date(extendEnd).toISOString(),
    serverTime: now.toISOString(),
    canExtend: !active && eligible && now.getTime() < extendEnd,
  };
};

export const renewDemo = (
  demo: DemoLifetime,
  now: Date,
  extension: boolean,
) => {
  const state = demoState(demo, now, extension);
  if (state.state !== "active" && !state.canExtend) return null;
  return new Date(
    Math.min(
      Math.max(demo.expiresAt.getTime(), now.getTime() + DEMO_IDLE_MS),
      demo.createdAt.getTime() + DEMO_MAX_MS,
    ),
  );
};

export const cleanupDue = (
  demo: DemoLifetime,
  now: Date,
  hasGrant: boolean,
) => {
  const state = demoState(demo, now, hasGrant);
  return state.state === "expired" && !state.canExtend;
};

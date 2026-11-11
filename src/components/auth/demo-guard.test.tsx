import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DemoGuard } from "./demo-guard";
import type { DemoStatus } from "../../lib/contracts/demo";

const mocks = vi.hoisted(() => ({ replace: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => mocks }));
const active: DemoStatus = {
  isDemo: true,
  state: "active",
  expiresAt: "2026-11-12T00:00:00.000Z",
  hardExpiresAt: "2026-11-18T00:00:00.000Z",
  extendUntil: "2026-11-12T01:00:00.000Z",
  serverTime: "2026-11-11T00:00:00.000Z",
  canExtend: false,
};
const expired: DemoStatus = {
  ...active,
  state: "expired",
  serverTime: "2026-11-12T00:30:00.000Z",
  canExtend: true,
};

describe("demo access UI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("shows regular application content without demo requests", () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    render(
      <DemoGuard initialStatus={{ isDemo: false }}>
        <p>Protected content</p>
      </DemoGuard>,
    );
    expect(screen.getByText("Protected content")).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("blocks expired content and extends only on an explicit click", async () => {
    const fetch = vi.fn().mockResolvedValue(Response.json({ ...expired }));
    vi.stubGlobal("fetch", fetch);
    render(
      <DemoGuard initialStatus={expired}>
        <p>Protected content</p>
      </DemoGuard>,
    );
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Extend demo for 24 hours" }),
    ).toBeInTheDocument();
    const user = userEvent.setup();
    fetch.mockResolvedValueOnce(
      Response.json({
        ...active,
        expiresAt: "2026-11-13T00:30:00.000Z",
        extendUntil: "2026-11-13T01:30:00.000Z",
        serverTime: "2026-11-12T00:30:00.000Z",
      }),
    );
    await user.click(
      screen.getByRole("button", { name: "Extend demo for 24 hours" }),
    );
    await waitFor(() =>
      expect(screen.getByText("Protected content")).toBeInTheDocument(),
    );
  });

  it("returns hard-expired visitors to login without protected content", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(Response.json({ ...expired, canExtend: false })),
    );
    render(
      <DemoGuard initialStatus={{ ...expired, canExtend: false }}>
        <p>Protected content</p>
      </DemoGuard>,
    );
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
    await waitFor(() =>
      expect(mocks.replace).toHaveBeenCalledWith("/?demo=expired"),
    );
  });

  it("polls status without treating background checks as activity", async () => {
    vi.useFakeTimers();
    const fetch = vi
      .fn()
      .mockImplementation(async () =>
        Response.json({ ...active, extensionTicket: "a".repeat(64) }),
      );
    vi.stubGlobal("fetch", fetch);
    render(
      <DemoGuard initialStatus={active}>
        <p>Protected content</p>
      </DemoGuard>,
    );
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    const activityCount = () =>
      fetch.mock.calls.filter(([url]) => url === "/api/demo/activity").length;
    expect(activityCount()).toBe(1);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(120_000);
    });
    expect(activityCount()).toBe(1);
    expect(screen.getByText("Demo")).toBeInTheDocument();
  });

  it("ignores a delayed expired status after a successful explicit extension", async () => {
    let release!: (response: Response) => void;
    const fetch = vi.fn().mockImplementation((url: string) => {
      if (url === "/api/demo/extend")
        return Promise.resolve(
          Response.json({
            ...active,
            expiresAt: "2026-11-13T00:30:00.000Z",
            extendUntil: "2026-11-13T01:30:00.000Z",
            serverTime: "2026-11-12T00:30:00.000Z",
          }),
        );
      return new Promise<Response>((resolve) => {
        release = resolve;
      });
    });
    vi.stubGlobal("fetch", fetch);
    render(
      <DemoGuard initialStatus={expired}>
        <p>Protected content</p>
      </DemoGuard>,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Check again" }));
    await user.click(
      screen.getByRole("button", { name: "Extend demo for 24 hours" }),
    );
    expect(await screen.findByText("Protected content")).toBeInTheDocument();
    await act(async () => {
      release(
        Response.json({
          ...expired,
          canExtend: false,
          serverTime: "2026-11-12T00:29:59.000Z",
        }),
      );
    });
    expect(screen.getByText("Protected content")).toBeInTheDocument();
    expect(mocks.replace).not.toHaveBeenCalled();
  });
});

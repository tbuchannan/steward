import { describe, expect, it } from "vitest";
import { demoState, renewDemo, cleanupDue } from "../src/server/demo/policy.js";
import {
  demoStatusSchema,
  demoCommandSchema,
} from "../src/lib/contracts/demo.js";

const demo = {
  createdAt: new Date("2026-11-01T00:00:00Z"),
  expiresAt: new Date("2026-11-02T00:00:00Z"),
};

describe("temporary demo lifecycle", () => {
  it("renews deliberate activity for 24 hours", () => {
    expect(renewDemo(demo, new Date("2026-11-01T12:00:00Z"), false)).toEqual(
      new Date("2026-11-02T12:00:00Z"),
    );
    expect(demo.expiresAt.toISOString()).toBe("2026-11-02T00:00:00.000Z");
  });
  it("denies activity at the exact idle deadline", () => {
    expect(renewDemo(demo, new Date("2026-11-02T00:00:00Z"), false)).toBeNull();
  });
  it("requires an eligible open session for extension", () => {
    expect(
      demoState(demo, new Date("2026-11-02T00:30:00Z"), false).canExtend,
    ).toBe(false);
    expect(
      demoState(demo, new Date("2026-11-02T00:30:00Z"), true).canExtend,
    ).toBe(true);
    expect(renewDemo(demo, new Date("2026-11-02T00:30:00Z"), true)).toEqual(
      new Date("2026-11-03T00:30:00Z"),
    );
  });
  it("ends the extension window at exactly one hour", () => {
    expect(renewDemo(demo, new Date("2026-11-02T01:00:00Z"), true)).toBeNull();
  });
  it("caps activity and extension at seven days from creation", () => {
    const late = { ...demo, expiresAt: new Date("2026-11-07T12:00:00Z") };
    expect(renewDemo(late, new Date("2026-11-07T11:00:00Z"), false)).toEqual(
      new Date("2026-11-08T00:00:00Z"),
    );
    expect(renewDemo(late, new Date("2026-11-07T12:30:00Z"), true)).toEqual(
      new Date("2026-11-08T00:00:00Z"),
    );
    const capped = { ...demo, expiresAt: new Date("2026-11-08T00:00:00Z") };
    expect(
      demoState(capped, new Date("2026-11-08T00:00:00Z"), true).canExtend,
    ).toBe(false);
    expect(
      renewDemo(capped, new Date("2026-11-08T00:00:00Z"), true),
    ).toBeNull();
  });
  it("protects grace eligibility from cleanup but never retains past the cap", () => {
    expect(cleanupDue(demo, new Date("2026-11-02T00:30:00Z"), true)).toBe(
      false,
    );
    expect(cleanupDue(demo, new Date("2026-11-02T00:30:00Z"), false)).toBe(
      true,
    );
    expect(cleanupDue(demo, new Date("2026-11-02T01:00:00Z"), true)).toBe(true);
    const capped = { ...demo, expiresAt: new Date("2026-11-08T00:00:00Z") };
    expect(cleanupDue(capped, new Date("2026-11-08T00:00:00Z"), true)).toBe(
      true,
    );
  });
});

describe("demo public contracts", () => {
  it("accepts regular and demo status without exposing ownership", () => {
    expect(demoStatusSchema.parse({ isDemo: false })).toEqual({
      isDemo: false,
    });
    const status = demoState(demo, new Date("2026-11-01T12:00:00Z"), false);
    expect(demoStatusSchema.parse(status)).toEqual(status);
    expect(
      demoStatusSchema.safeParse({ ...status, userId: "private" }).success,
    ).toBe(false);
    expect(
      demoStatusSchema.safeParse({ ...status, token: "provider-token" })
        .success,
    ).toBe(false);
  });
  it("rejects invalid deadlines, missing state and client ownership selectors", () => {
    expect(demoStatusSchema.safeParse({ isDemo: true }).success).toBe(false);
    expect(
      demoStatusSchema.safeParse({
        ...demoState(demo, demo.createdAt, false),
        expiresAt: "today",
      }).success,
    ).toBe(false);
    expect(demoCommandSchema.parse({})).toEqual({});
    expect(
      demoCommandSchema.safeParse({ userId: "someone-else" }).success,
    ).toBe(false);
  });
});

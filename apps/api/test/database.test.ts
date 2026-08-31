import { describe, expect, it, vi } from "vitest";

import { checkDatabase, type DatabasePool } from "../src/database.js";

describe("checkDatabase", () => {
  it("executes a minimal PostgreSQL readiness query", async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{ ready: 1 }] });
    const pool = { query } as unknown as DatabasePool;

    await checkDatabase(pool);

    expect(query).toHaveBeenCalledWith("select 1");
  });
});

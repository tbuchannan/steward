import type { PGlite } from "@electric-sql/pglite";
import type { Pool } from "pg";

// Exercise the actual PostgreSQL engine through the same SQL/Drizzle path as
// node-postgres. PGlite has one connection, so serialize transaction leases.
export const pglitePool = (database: PGlite): Pool => {
  let tail = Promise.resolve();
  const query = async (
    input:
      | string
      | {
          text: string;
          rowMode?: "array";
          types?: {
            getTypeParser: (oid: number) => (value: string) => unknown;
          };
        },
    values?: unknown[],
  ) => {
    const config = typeof input === "string" ? { text: input } : input;
    const result = await database.query(config.text, values, {
      rowMode: config.rowMode,
      ...(config.types
        ? {
            parsers: Object.fromEntries(
              [1082, 1114, 1184, 1186, 1231, 1016, 1009, 2951].map((oid) => [
                oid,
                config.types!.getTypeParser(oid),
              ]),
            ),
          }
        : {}),
    });
    return { ...result, rowCount: result.affectedRows ?? result.rows.length };
  };
  return {
    query,
    connect: async () => {
      const previous = tail;
      let release!: () => void;
      tail = new Promise<void>((resolve) => {
        release = resolve;
      });
      await previous;
      return { query, release };
    },
    end: async () => {},
  } as unknown as Pool;
};

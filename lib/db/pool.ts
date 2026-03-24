import { Pool } from "pg";

// Re-use the pool across hot-reloads (Next.js dev) by caching on globalThis.
declare global {
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined;
}

function createPool() {
  if (process.env.DATABASE_URL) {
    return new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
  }

  return new Pool({
    host: process.env.PGHOST ?? "localhost",
    port: Number(process.env.PGPORT ?? 5432),
    database: process.env.PGDATABASE ?? "snapchef",
    user: process.env.PGUSER ?? "postgres",
    password: process.env.PGPASSWORD ?? "postgres",
  });
}

const pool: Pool = globalThis._pgPool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  globalThis._pgPool = pool;
}

export default pool;

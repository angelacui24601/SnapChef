const { Pool } = require("pg");

const connectionConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      // Neon (and other hosted DBs) always require SSL
      ssl: { rejectUnauthorized: false },
    }
  : {
      host: process.env.PGHOST || "localhost",
      port: Number(process.env.PGPORT || 5432),
      database: process.env.PGDATABASE || "snapchef",
      user: process.env.PGUSER || "postgres",
      password: process.env.PGPASSWORD || "postgres",
    };

const pool = new Pool(connectionConfig);

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL client error", error);
});

module.exports = pool;
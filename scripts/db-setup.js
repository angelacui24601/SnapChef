#!/usr/bin/env node
/**
 * scripts/db-setup.js — Create all SnapChef tables in PostgreSQL.
 *
 * Usage (fresh install):
 *   node scripts/db-setup.js
 *
 * For existing databases that already have tables, run the targeted migration
 * instead:
 *   psql "$DATABASE_URL" -f db/migrations/001_add_users_table.sql
 *
 * Requires DATABASE_URL to be set (reads .env.local automatically).
 */

const fs = require("fs");
const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") });

const { Pool } = require("pg");

const connectionConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    }
  : {
      host: process.env.PGHOST || "localhost",
      port: Number(process.env.PGPORT || 5432),
      database: process.env.PGDATABASE || "snapchef",
      user: process.env.PGUSER || "postgres",
      password: process.env.PGPASSWORD || "postgres",
    };

async function setup() {
  const pool = new Pool(connectionConfig);
  const schemaPath = path.resolve(__dirname, "../db/schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf8");

  console.log("Connecting to PostgreSQL...");
  const client = await pool.connect();

  try {
    console.log("Dropping old tables if they exist...");
    await client.query(`
      DROP TABLE IF EXISTS favorites CASCADE;
      DROP TABLE IF EXISTS user_preferences CASCADE;
      DROP TABLE IF EXISTS recipes CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);
    console.log("Running db/schema.sql...");
    await client.query(sql);
    console.log("✓ Database schema applied successfully.");
  } catch (error) {
    console.error("✗ Failed to apply schema:", error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

setup();

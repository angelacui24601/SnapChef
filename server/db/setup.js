#!/usr/bin/env node
/**
 * db/setup.js — Run this once to create all SnapChef tables in PostgreSQL.
 *
 * Usage:
 *   DATABASE_URL=postgres://... node db/setup.js
 *
 *   OR set DATABASE_URL in .env.local and run:
 *   node -r dotenv/config db/setup.js
 */

const fs = require("fs");
const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") });

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

async function setup() {
  const pool = new Pool(connectionConfig);

  const schemaPath = path.resolve(__dirname, "schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf8");

  console.log("Connecting to PostgreSQL...");

  const client = await pool.connect();

  try {
    // Drop old schema (safe during development — clears any stale tables)
    console.log("Dropping old tables if they exist...");
    await client.query(`
      DROP TABLE IF EXISTS favorites CASCADE;
      DROP TABLE IF EXISTS user_preferences CASCADE;
      DROP TABLE IF EXISTS recipes CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);
    console.log("Running schema.sql...");
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

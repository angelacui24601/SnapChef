-- Migration 001: introduce users table and add FK constraints
-- Run this once against an existing database.
-- setup.js (DROP + recreate) already handles fresh installs.

CREATE TABLE IF NOT EXISTS users (
  clerk_id   TEXT PRIMARY KEY,
  email      TEXT,
  first_name TEXT,
  last_name  TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Back-fill: any clerk_id already in user_preferences / favorites must exist
-- in users first (FK will be enforced below). Insert a stub row for each.
INSERT INTO users (clerk_id)
SELECT DISTINCT clerk_id FROM user_preferences
ON CONFLICT (clerk_id) DO NOTHING;

INSERT INTO users (clerk_id)
SELECT DISTINCT clerk_id FROM favorites
ON CONFLICT (clerk_id) DO NOTHING;

-- Add FK from user_preferences → users (idempotent via DO block)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_preferences_clerk_id_fkey'
      AND conrelid = 'user_preferences'::regclass
  ) THEN
    ALTER TABLE user_preferences
      ADD CONSTRAINT user_preferences_clerk_id_fkey
      FOREIGN KEY (clerk_id) REFERENCES users(clerk_id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add FK from favorites → users (idempotent via DO block)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'favorites_clerk_id_fkey'
      AND conrelid = 'favorites'::regclass
  ) THEN
    ALTER TABLE favorites
      ADD CONSTRAINT favorites_clerk_id_fkey
      FOREIGN KEY (clerk_id) REFERENCES users(clerk_id) ON DELETE CASCADE;
  END IF;
END $$;

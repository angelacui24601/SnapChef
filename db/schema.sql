CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Synced from Clerk via the /api/webhooks/clerk endpoint.
-- clerk_id is Clerk's opaque user ID (e.g. "user_2abc…").
CREATE TABLE IF NOT EXISTS users (
  clerk_id   TEXT PRIMARY KEY,
  email      TEXT,
  first_name TEXT,
  last_name  TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Recipes are content — stored once and referenced by favorites.
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  cook_time INT,
  ingredients TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  steps TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[]
);

-- clerk_id is a foreign key into users so deleting a user cascades.
CREATE TABLE IF NOT EXISTS user_preferences (
  clerk_id TEXT PRIMARY KEY REFERENCES users(clerk_id) ON DELETE CASCADE,
  age INT,
  sex TEXT,
  goal TEXT,
  custom_goal TEXT,
  allergies TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  medical TEXT,
  religious TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  kitchen_tools TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  kitchen_image TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS favorites (
  clerk_id TEXT NOT NULL REFERENCES users(clerk_id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (clerk_id, recipe_id)
);

CREATE INDEX IF NOT EXISTS favorites_clerk_id_created_at_idx
  ON favorites (clerk_id, created_at DESC);

CREATE INDEX IF NOT EXISTS recipes_title_idx
  ON recipes (title);
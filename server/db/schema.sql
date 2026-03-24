CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Recipes are content — stored once and referenced by favorites.
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  cook_time INT,
  ingredients TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  steps TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[]
);

-- Keyed directly by Clerk's user ID — no separate users table needed.
-- Clerk owns auth; we only store what Clerk doesn't.
CREATE TABLE IF NOT EXISTS user_preferences (
  clerk_id TEXT PRIMARY KEY,
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
  clerk_id TEXT NOT NULL,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (clerk_id, recipe_id)
);

CREATE INDEX IF NOT EXISTS favorites_clerk_id_created_at_idx
  ON favorites (clerk_id, created_at DESC);

CREATE INDEX IF NOT EXISTS recipes_title_idx
  ON recipes (title);
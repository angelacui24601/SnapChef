CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
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

CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  cook_time INT,
  ingredients TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  steps TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[]
);

CREATE TABLE IF NOT EXISTS favorites (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, recipe_id)
);

CREATE INDEX IF NOT EXISTS favorites_user_id_created_at_idx
  ON favorites (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS recipes_title_idx
  ON recipes (title);
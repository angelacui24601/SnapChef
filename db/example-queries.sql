-- Sync a Clerk user into PostgreSQL.
INSERT INTO users (clerk_id, email)
VALUES ('user_2abc123', 'chef@example.com')
ON CONFLICT (clerk_id) DO UPDATE SET email = EXCLUDED.email;

-- Save or update a user's preferences.
INSERT INTO user_preferences (
  user_id,
  age,
  sex,
  goal,
  custom_goal,
  allergies,
  medical,
  religious,
  kitchen_tools,
  kitchen_image,
  updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  24,
  'female',
  'muscle_gain',
  NULL,
  ARRAY['peanuts', 'shellfish'],
  'low sodium',
  'halal',
  ARRAY['oven', 'air fryer'],
  'https://cdn.example.com/kitchen.jpg',
  NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
  age = EXCLUDED.age,
  sex = EXCLUDED.sex,
  goal = EXCLUDED.goal,
  custom_goal = EXCLUDED.custom_goal,
  allergies = EXCLUDED.allergies,
  medical = EXCLUDED.medical,
  religious = EXCLUDED.religious,
  kitchen_tools = EXCLUDED.kitchen_tools,
  kitchen_image = EXCLUDED.kitchen_image,
  updated_at = NOW();

-- Add a recipe to a user's favorites.
INSERT INTO favorites (user_id, recipe_id)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000101'
)
ON CONFLICT (user_id, recipe_id) DO NOTHING;

-- Fetch all favorites for a user with recipe details.
SELECT
  f.user_id,
  f.recipe_id,
  f.created_at,
  r.title,
  r.cook_time,
  r.ingredients,
  r.steps
FROM favorites AS f
JOIN recipes AS r ON r.id = f.recipe_id
WHERE f.user_id = '00000000-0000-0000-0000-000000000001'
ORDER BY f.created_at DESC;
const pool = require("../db/pool");

function normalizeTextArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
    .filter(Boolean);
}

async function savePreferences(req, res) {
  // userId is injected by requireSession middleware from the signed cookie
  const userId = req.userId;
  const {
    age = null,
    sex = null,
    goal = null,
    customGoal = null,
    allergies = [],
    medical = null,
    religious = [],
    kitchenTools = [],
    kitchenImage = null,
  } = req.body;

  try {
    const preferenceResult = await pool.query(
      `
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
        VALUES ($1::uuid, $2, $3, $4, $5, $6::text[], $7, $8::text[], $9::text[], $10, NOW())
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
          updated_at = NOW()
        RETURNING *
      `,
      [
        userId,
        age,
        sex,
        goal,
        customGoal,
        normalizeTextArray(allergies),
        medical,
        normalizeTextArray(religious),
        normalizeTextArray(kitchenTools),
        kitchenImage,
      ],
    );

    return res.status(200).json({
      message: "Preferences saved successfully",
      userId,
      preferences: preferenceResult.rows[0],
    });
  } catch (error) {
    console.error("Failed to save preferences", error);
    return res.status(500).json({ error: "Failed to save preferences" });
  }
}

async function getPreferences(req, res) {
  // userId is injected by requireSession middleware from the signed cookie
  const userId = req.userId;

  try {
    const result = await pool.query(
      `
        SELECT
          u.id AS user_id,
          u.clerk_id,
          u.email,
          u.created_at,
          p.age,
          p.sex,
          p.goal,
          p.custom_goal,
          p.allergies,
          p.medical,
          p.religious,
          p.kitchen_tools,
          p.kitchen_image,
          p.updated_at
        FROM users AS u
        LEFT JOIN user_preferences AS p ON p.user_id = u.id
        WHERE u.id = $1::uuid
      `,
      [userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User preferences not found" });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Failed to get preferences", error);
    return res.status(500).json({ error: "Failed to get preferences" });
  }
}

module.exports = {
  savePreferences,
  getPreferences,
};
const pool = require("../db/pool");

function normalizeTextArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
    .filter(Boolean);
}

async function addFavorite(req, res) {
  // userId is injected by requireSession middleware from the signed cookie
  const userId = req.userId;
  const { recipeId = null, recipe } = req.body;

  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  if (!recipeId && !recipe) {
    return res.status(400).json({ error: "recipeId or recipe payload is required" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    let resolvedRecipeId = recipeId;

    if (!resolvedRecipeId) {
      const { id = null, title, cookTime = null, ingredients = [], steps = [] } = recipe;

      if (!title || typeof title !== "string") {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: "recipe.title is required when recipeId is not provided" });
      }

      const recipeResult = await client.query(
        `
          INSERT INTO recipes (id, title, cook_time, ingredients, steps)
          VALUES (COALESCE($1::uuid, gen_random_uuid()), $2, $3, $4::text[], $5::text[])
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            cook_time = EXCLUDED.cook_time,
            ingredients = EXCLUDED.ingredients,
            steps = EXCLUDED.steps
          RETURNING id, title, cook_time, ingredients, steps
        `,
        [id, title.trim(), cookTime, normalizeTextArray(ingredients), normalizeTextArray(steps)],
      );

      resolvedRecipeId = recipeResult.rows[0].id;
    }

    const favoriteResult = await client.query(
      `
        INSERT INTO favorites (user_id, recipe_id)
        VALUES ($1::uuid, $2::uuid)
        ON CONFLICT (user_id, recipe_id) DO UPDATE SET created_at = NOW()
        RETURNING user_id, recipe_id, created_at
      `,
      [userId, resolvedRecipeId],
    );

    const joinedResult = await client.query(
      `
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
        WHERE f.user_id = $1::uuid AND f.recipe_id = $2::uuid
      `,
      [userId, resolvedRecipeId],
    );

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Favorite saved successfully",
      favorite: favoriteResult.rows[0],
      recipe: joinedResult.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Failed to add favorite", error);
    return res.status(500).json({ error: "Failed to add favorite" });
  } finally {
    client.release();
  }
}

async function removeFavorite(req, res) {
  // userId is injected by requireSession middleware from the signed cookie
  const userId = req.userId;
  const { recipeId } = req.body;

  if (!userId || !recipeId) {
    return res.status(400).json({ error: "recipeId is required" });
  }

  try {
    const result = await pool.query(
      `
        DELETE FROM favorites
        WHERE user_id = $1::uuid AND recipe_id = $2::uuid
        RETURNING user_id, recipe_id
      `,
      [userId, recipeId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Favorite not found" });
    }

    return res.status(200).json({
      message: "Favorite removed successfully",
      favorite: result.rows[0],
    });
  } catch (error) {
    console.error("Failed to remove favorite", error);
    return res.status(500).json({ error: "Failed to remove favorite" });
  }
}

async function getFavorites(req, res) {
  // userId is injected by requireSession middleware from the signed cookie
  const userId = req.userId;

  try {
    const result = await pool.query(
      `
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
        WHERE f.user_id = $1::uuid
        ORDER BY f.created_at DESC
      `,
      [userId],
    );

    return res.status(200).json({ favorites: result.rows });
  } catch (error) {
    console.error("Failed to get favorites", error);
    return res.status(500).json({ error: "Failed to get favorites" });
  }
}

module.exports = {
  addFavorite,
  removeFavorite,
  getFavorites,
};
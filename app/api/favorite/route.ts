import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import pool from "../../../lib/db/pool";

function normalizeTextArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return (value as unknown[])
    .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
    .filter(Boolean);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { recipeId = null, recipe } = body as { recipeId?: string | null; recipe?: Record<string, unknown> };

  if (!recipeId && !recipe) {
    return NextResponse.json({ error: "recipeId or recipe payload is required" }, { status: 400 });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    let resolvedRecipeId = recipeId;

    if (!resolvedRecipeId) {
      const { id = null, title, cookTime = null, ingredients = [], steps = [] } = recipe!;

      if (!title || typeof title !== "string") {
        await client.query("ROLLBACK");
        return NextResponse.json({ error: "recipe.title is required when recipeId is not provided" }, { status: 400 });
      }

      const recipeResult = await client.query(
        `INSERT INTO recipes (id, title, cook_time, ingredients, steps)
         VALUES (COALESCE($1::uuid, gen_random_uuid()), $2, $3, $4::text[], $5::text[])
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title, cook_time = EXCLUDED.cook_time,
           ingredients = EXCLUDED.ingredients, steps = EXCLUDED.steps
         RETURNING id, title, cook_time, ingredients, steps`,
        [id, title.trim(), cookTime, normalizeTextArray(ingredients), normalizeTextArray(steps)],
      );

      resolvedRecipeId = recipeResult.rows[0].id as string;
    }

    await client.query(
      `INSERT INTO favorites (clerk_id, recipe_id)
       VALUES ($1, $2::uuid)
       ON CONFLICT (clerk_id, recipe_id) DO UPDATE SET created_at = NOW()`,
      [userId, resolvedRecipeId],
    );

    const joined = await client.query(
      `SELECT f.clerk_id, f.recipe_id, f.created_at, r.title, r.cook_time, r.ingredients, r.steps
       FROM favorites AS f
       JOIN recipes AS r ON r.id = f.recipe_id
       WHERE f.clerk_id = $1 AND f.recipe_id = $2::uuid`,
      [userId, resolvedRecipeId],
    );

    await client.query("COMMIT");

    return NextResponse.json({ recipe: joined.rows[0] }, { status: 201 });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Failed to add favorite", error);
    return NextResponse.json({ error: "Failed to add favorite" }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let recipeId: string | undefined;
  try {
    const body = await req.json();
    recipeId = body.recipeId;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!recipeId) {
    return NextResponse.json({ error: "recipeId is required" }, { status: 400 });
  }

  try {
    const result = await pool.query(
      "DELETE FROM favorites WHERE clerk_id = $1 AND recipe_id = $2::uuid RETURNING recipe_id",
      [userId, recipeId],
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Favorite not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Favorite removed successfully", favorite: result.rows[0] });
  } catch (error) {
    console.error("Failed to remove favorite", error);
    return NextResponse.json({ error: "Failed to remove favorite" }, { status: 500 });
  }
}

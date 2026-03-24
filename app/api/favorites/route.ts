import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import pool from "../../../lib/db/pool";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const result = await pool.query(
      `SELECT f.clerk_id, f.recipe_id, f.created_at,
              r.title, r.cook_time, r.ingredients, r.steps
       FROM favorites AS f
       JOIN recipes AS r ON r.id = f.recipe_id
       WHERE f.clerk_id = $1
       ORDER BY f.created_at DESC`,
      [userId],
    );

    return NextResponse.json({ favorites: result.rows });
  } catch (error) {
    console.error("Failed to get favorites", error);
    return NextResponse.json({ error: "Failed to get favorites" }, { status: 500 });
  }
}

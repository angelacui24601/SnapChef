import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import pool from "../../../lib/db/pool";

function normalizeTextArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return (value as unknown[])
    .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
    .filter(Boolean);
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM user_preferences WHERE clerk_id = $1",
      [userId],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(null, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Failed to get preferences", error);
    return NextResponse.json({ error: "Failed to get preferences" }, { status: 500 });
  }
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
  } = body as Record<string, unknown>;

  try {
    const result = await pool.query(
      `INSERT INTO user_preferences (
         clerk_id, age, sex, goal, custom_goal,
         allergies, medical, religious, kitchen_tools, kitchen_image, updated_at
       )
       VALUES ($1, $2, $3, $4, $5, $6::text[], $7, $8::text[], $9::text[], $10, NOW())
       ON CONFLICT (clerk_id) DO UPDATE SET
         age = EXCLUDED.age, sex = EXCLUDED.sex, goal = EXCLUDED.goal,
         custom_goal = EXCLUDED.custom_goal, allergies = EXCLUDED.allergies,
         medical = EXCLUDED.medical, religious = EXCLUDED.religious,
         kitchen_tools = EXCLUDED.kitchen_tools, kitchen_image = EXCLUDED.kitchen_image,
         updated_at = NOW()
       RETURNING *`,
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

    return NextResponse.json({ preferences: result.rows[0] });
  } catch (error) {
    console.error("Failed to save preferences", error);
    return NextResponse.json({ error: "Failed to save preferences" }, { status: 500 });
  }
}

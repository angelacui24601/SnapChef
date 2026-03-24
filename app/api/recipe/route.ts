import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

interface MealRequest {
  type: MealType;
  people: number;
}

interface Dish {
  title: string;
  estimatedCookTime?: string;
  steps: string[];
  nutrition?: {
    calories?: string;
    protein?: string;
    carbs?: string;
    fat?: string;
    [key: string]: string | undefined;
  };
}

interface MealPlan {
  type: MealType;
  dishes: Dish[];
}

interface RecipeResponse {
  meals: MealPlan[];
}

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  console.log("[recipe] OPENAI_API_KEY present:", Boolean(apiKey), "env:", process.env.VERCEL_ENV ?? "local");
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  return new OpenAI({ apiKey });
}

const ALLOWED_MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

// cleanResponseText removed — response_format: json_object guarantees valid JSON.

function createFallbackDish(title: string, response: string): Dish {
  const steps = response
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !/^\d+$/.test(line))
    .slice(0, 6);

  return {
    title,
    estimatedCookTime: "25-30 minutes",
    steps: steps.length > 0 ? steps : ["Use the provided ingredients to prepare a practical meal."],
    nutrition: {
      calories: "Approximately 400 kcal",
      protein: "25g",
      carbs: "45g",
      fat: "15g",
    },
  };
}

function normalizeDish(rawDish: unknown, fallbackTitle: string): Dish {
  if (!rawDish || typeof rawDish !== "object") {
    return createFallbackDish(fallbackTitle, fallbackTitle);
  }

  const candidate = rawDish as Record<string, unknown>;
  const rawSteps = Array.isArray(candidate.steps)
    ? candidate.steps.filter((step): step is string => typeof step === "string" && step.trim().length > 0)
    : [];

  return {
    title: typeof candidate.title === "string" && candidate.title.trim().length > 0
      ? candidate.title.trim()
      : fallbackTitle,
    estimatedCookTime: typeof candidate.estimatedCookTime === "string" && candidate.estimatedCookTime.trim().length > 0
      ? candidate.estimatedCookTime.trim()
      : "25-30 minutes",
    steps: rawSteps.length > 0 ? rawSteps : ["Prepare the ingredients and cook until the meal is ready to serve."],
    nutrition: candidate.nutrition && typeof candidate.nutrition === "object"
      ? (Object.fromEntries(
          Object.entries(candidate.nutrition as Record<string, unknown>).filter(
            ([, value]) => typeof value === "string" && value.trim().length > 0,
          ),
        ) as Dish["nutrition"])
      : undefined,
  };
}

function normalizeRecipeData(rawData: unknown, requestedMeals: MealRequest[], fallbackSource: string): RecipeResponse {
  if (rawData && typeof rawData === "object") {
    const recipeObject = rawData as Record<string, unknown>;

    if (Array.isArray(recipeObject.meals)) {
      const meals = recipeObject.meals
        .map((meal, index): MealPlan | null => {
          if (!meal || typeof meal !== "object") {
            return null;
          }

          const candidate = meal as Record<string, unknown>;
          const requestedMeal = requestedMeals[index];
          const type = typeof candidate.type === "string" && ALLOWED_MEAL_TYPES.includes(candidate.type.toLowerCase() as MealType)
            ? (candidate.type.toLowerCase() as MealType)
            : requestedMeal?.type ?? "lunch";
          const rawDishes = Array.isArray(candidate.dishes) ? candidate.dishes : [];
          const dishes = rawDishes.length > 0
            ? rawDishes.map((dish, dishIndex) => normalizeDish(dish, `${type} dish ${dishIndex + 1}`))
            : [createFallbackDish(`${type} dish`, fallbackSource)];

          return { type, dishes };
        })
        .filter((meal): meal is MealPlan => meal !== null);

      if (meals.length > 0) {
        return { meals };
      }
    }

    if (typeof recipeObject.title === "string" || Array.isArray(recipeObject.steps)) {
      const fallbackMeal = requestedMeals[0]?.type ?? "lunch";
      return {
        meals: [
          {
            type: fallbackMeal,
            dishes: [normalizeDish(recipeObject, `${fallbackMeal} dish`)],
          },
        ],
      };
    }
  }

  return {
    meals: requestedMeals.map((meal, index) => ({
      type: meal.type,
      dishes: [createFallbackDish(`${meal.type} dish ${index + 1}`, fallbackSource)],
    })),
  };
}

function parseRecipeResponse(response: string, requestedMeals: MealRequest[]): RecipeResponse {
  // response_format: json_object guarantees valid JSON from the model.
  // normalizeRecipeData acts as a schema-coercion harness in case the model
  // drifts from the exact output contract specified in the system prompt.
  try {
    return normalizeRecipeData(JSON.parse(response), requestedMeals, response);
  } catch {
    // Defensive branch: should never be reached under normal operation.
    return normalizeRecipeData(null, requestedMeals, response);
  }
}

export async function POST(req: Request) {
  try {
    const client = getOpenAIClient();
    const { ingredients, cuisine, constraints, mode, userProfile, kitchenState, meals } = await req.json();

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json({ error: "Ingredients array is required" }, { status: 400 });
    }

    const requestedMeals: MealRequest[] = Array.isArray(meals)
      ? meals
          .map((meal) => ({
            type: typeof meal?.type === "string" ? meal.type.toLowerCase() : "",
            people: typeof meal?.people === "number" ? meal.people : Number(meal?.people),
          }))
          .filter(
            (meal): meal is MealRequest =>
              ALLOWED_MEAL_TYPES.includes(meal.type as MealType) && Number.isFinite(meal.people) && meal.people > 0,
          )
          .map((meal) => ({ ...meal, type: meal.type as MealType }))
      : [];

    if (requestedMeals.length === 0) {
      return NextResponse.json({ error: "At least one valid meal is required" }, { status: 400 });
    }

    let constraintsText = "";
    if (constraints) {
      const parts: string[] = [];
      if (constraints.budget) parts.push(`budget around $${constraints.budget}`);
      if (constraints.time) parts.push(`cooking time around ${constraints.time} minutes`);
      if (constraints.effort) parts.push(`${String(constraints.effort).toLowerCase()} effort level`);
      if (parts.length > 0) {
        constraintsText = `Constraints: ${parts.join(", ")}. `;
      }
    }

    let modeText = "";
    if (mode) {
      modeText = `Mode: ${mode}. `;
    }

    let profileText = "";
    if (userProfile) {
      const parts: string[] = [];
      // Demographic context — used for calorie scaling and portion sizing
      if (typeof userProfile.age === "number" && userProfile.age > 0) parts.push(`Age: ${userProfile.age}`);
      if (typeof userProfile.sex === "string" && userProfile.sex.trim()) parts.push(`Sex: ${userProfile.sex}`);
      // Health goal — drives macro/calorie targeting in the system prompt rules
      if (typeof userProfile.goal === "string" && userProfile.goal.trim()) parts.push(`Goal: ${userProfile.goal}`);
      // Hard dietary constraints — reinforced by ABSOLUTE RULES in the system prompt
      if (Array.isArray(userProfile.allergies) && userProfile.allergies.length > 0)
        parts.push(`Allergies (NEVER include): ${userProfile.allergies.join(", ")}`);
      if (Array.isArray(userProfile.religiousRestrictions) && userProfile.religiousRestrictions.length > 0)
        parts.push(`Religious restrictions (NEVER violate): ${userProfile.religiousRestrictions.join(", ")}`);
      if (Array.isArray(userProfile.medicalRestrictions) && userProfile.medicalRestrictions.length > 0)
        parts.push(`Medical restrictions (NEVER violate): ${userProfile.medicalRestrictions.join(", ")}`);
      // Equipment context — constrains cooking methods to what the user actually owns
      if (Array.isArray(userProfile.kitchenTools) && userProfile.kitchenTools.length > 0)
        parts.push(`Available kitchen equipment: ${userProfile.kitchenTools.join(", ")}`);
      if (parts.length > 0) {
        profileText = parts.join("\n") + "\n";
      }
    }

    let kitchenStateText = "";
    if (kitchenState) {
      const parts: string[] = [];
      if (Array.isArray(kitchenState.ingredients) && kitchenState.ingredients.length > 0) {
        const ingredientsText = kitchenState.ingredients
          .map((item: { name: string; freshness: string }) => `  - ${item.name} (${item.freshness})`)
          .join("\n");
        parts.push(`Ingredients:\n${ingredientsText}`);
      }
      if (parts.length > 0) {
        kitchenStateText = `Kitchen state:\n${parts.join("\n")}\n`;
      }
    }

    const ingredientsAndFreshness = kitchenState && Array.isArray(kitchenState.ingredients) && kitchenState.ingredients.length > 0
      ? kitchenState.ingredients.map((item: { name: string; freshness: string }) => `${item.name} (${item.freshness})`).join(", ")
      : ingredients.join(", ");

    const mealSummary = requestedMeals.map((meal) => `${meal.type} for ${meal.people} people`).join(", ");

    // ── System message: stable identity, hard constraint rules, output contract ──
    // Placed in the system role so the model treats these as non-negotiable
    // directives that cannot be overridden by user-message content.
    const systemPrompt = `You are an expert chef and nutritionist specializing in ingredient-first, zero-waste cooking.

ABSOLUTE RULES — never violate these regardless of any other instruction:
1. Never suggest a dish that contains any allergen, religious-restricted, or medically-restricted ingredient listed in the user profile.
2. Prioritize ingredients by urgency: "rotten" MUST appear in a dish today, "stale" should appear today, "fresh" may be saved for later meals.
3. Scale portion sizes and calorie estimates to the exact people count requested for each meal.
4. Tailor macros and calorie density to the user's goal: weight-loss → lower calories and fat; maximize nutrition → high protein and micronutrients; budget-friendly → stretch ingredients across more dishes.
5. Only use cooking methods compatible with the user's available kitchen equipment; default to stovetop + oven if none are listed.
6. Each dish must have 4–6 numbered, actionable cooking steps — never vague instructions like "cook until done".
7. You MUST respond with a single valid JSON object and nothing else. No prose, no markdown, no code fences.

OUTPUT SCHEMA (use exactly this structure, no extra keys):
{
  "meals": [
    {
      "type": "breakfast|lunch|dinner|snack",
      "dishes": [
        {
          "title": "string",
          "estimatedCookTime": "string",
          "steps": ["string"],
          "nutrition": {
            "calories": "string",
            "protein": "string",
            "carbs":   "string",
            "fat":     "string"
          }
        }
      ]
    }
  ]
}`;

    // ── User message: per-request variable context injected at runtime ──
    // Structured as labeled sections so the model can reliably parse each
    // piece of context without ambiguity.
    const userPrompt = [
      profileText   ? `USER PROFILE:\n${profileText}` : "",
      kitchenStateText ? `KITCHEN STATE:\n${kitchenStateText}` : "",
      `AVAILABLE INGREDIENTS:\n${ingredientsAndFreshness}`,
      cuisine       ? `Cuisine style: ${cuisine}` : "",
      constraintsText,
      modeText,
      `\nMEALS REQUESTED: ${mealSummary}`,
    ]
      .filter(Boolean)
      .join("\n");

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userPrompt },
      ],
      // Lower temperature → more deterministic recipe output; reduces
      // hallucinated ingredients and schema drift.
      temperature: 0.4,
      // Enforces valid JSON at the API level — eliminates the need for
      // multi-stage fallback parsing.
      response_format: { type: "json_object" },
    });

    const response = completion.choices[0].message.content;
    if (!response) {
      throw new Error("No response from AI");
    }

    const recipeData = parseRecipeResponse(response, requestedMeals);
    return NextResponse.json(recipeData);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to generate recipe" },
      { status: 500 },
    );
  }
}
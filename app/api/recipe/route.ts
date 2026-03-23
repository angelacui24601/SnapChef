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

function cleanResponseText(response: string): string {
  return response
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .replace(/^\d+\n/gm, "")
    .trim();
}

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
  try {
    return normalizeRecipeData(JSON.parse(response), requestedMeals, response);
  } catch {
    const cleanedResponse = cleanResponseText(response);

    try {
      return normalizeRecipeData(JSON.parse(cleanedResponse), requestedMeals, cleanedResponse);
    } catch {
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return normalizeRecipeData(JSON.parse(jsonMatch[0]), requestedMeals, cleanedResponse);
        } catch {
          return normalizeRecipeData(null, requestedMeals, cleanedResponse);
        }
      }

      return normalizeRecipeData(null, requestedMeals, cleanedResponse);
    }
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
      if (typeof userProfile.age === "number") parts.push(`Age: ${userProfile.age}`);
      if (Array.isArray(userProfile.allergies) && userProfile.allergies.length > 0) parts.push(`Allergies: ${userProfile.allergies.join(", ")}`);
      if (Array.isArray(userProfile.religiousRestrictions) && userProfile.religiousRestrictions.length > 0) parts.push(`Religious restrictions: ${userProfile.religiousRestrictions.join(", ")}`);
      if (Array.isArray(userProfile.medicalRestrictions) && userProfile.medicalRestrictions.length > 0) parts.push(`Medical restrictions: ${userProfile.medicalRestrictions.join(", ")}`);
      if (parts.length > 0) {
        profileText = `User profile:\n- ${parts.join("\n- ")}\n`;
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

    const prompt = `
You are a professional chef. Split the available ingredients across the requested meals.

${profileText}${kitchenStateText}Available ingredients:
${ingredientsAndFreshness}
${cuisine ? `Cuisine style: ${cuisine}\n` : ""}${constraintsText}${modeText}

Meals to prepare: ${mealSummary}

Recipe requirements:
- Prioritize ingredients that expire sooner.
- Avoid restricted ingredients from the user profile.
- Match dish quantity and portion sizes to the people count for each meal.
- If one dish is not enough for a meal, return multiple dishes for that meal.
- Keep dishes practical and feasible with the available ingredients.
- Keep each dish to 4-6 clear cooking steps.

Respond with JSON only in this exact format:
{
  "meals": [
    {
      "type": "breakfast",
      "dishes": [
        {
          "title": "Dish Name",
          "estimatedCookTime": "25 minutes",
          "steps": ["Step 1", "Step 2", "Step 3"],
          "nutrition": {
            "calories": "XXX kcal",
            "protein": "XXg",
            "carbs": "XXg",
            "fat": "XXg"
          }
        }
      ]
    }
  ]
}

Only use these meal types: breakfast, lunch, dinner, snack.
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
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
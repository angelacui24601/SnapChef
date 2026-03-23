import type { Dish } from "./apiService";

export interface FavoriteRecipe {
  id: string;
  sourceKey: string;
  recipeId: string;
  title: string;
  cookTime?: number | null;
  estimatedCookTime?: string;
  ingredients?: string[];
  steps: string[];
  savedAt: string;
}

export function buildRecipeSourceKey(dish: Pick<Dish, "title" | "steps" | "estimatedCookTime">) {
  return JSON.stringify({
    title: dish.title,
    estimatedCookTime: dish.estimatedCookTime ?? "",
    steps: dish.steps,
  });
}
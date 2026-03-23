import type { Dish, MealType } from "./apiService";

export interface FavoriteRecipe {
  id: string;
  sourceKey: string;
  mealType: MealType;
  title: string;
  estimatedCookTime?: string;
  steps: string[];
  nutrition?: Dish["nutrition"];
  savedAt: string;
}

const FAVORITES_PREFIX = "snapchef:favorites:";
const FAVORITES_UPDATED_EVENT = "snapchef:favorites-updated";

function getFavoritesKey(userId: string) {
  return `${FAVORITES_PREFIX}${userId}`;
}

export function buildRecipeSourceKey(mealType: MealType, dish: Pick<Dish, "title" | "steps" | "estimatedCookTime">) {
  return JSON.stringify({
    mealType,
    title: dish.title,
    estimatedCookTime: dish.estimatedCookTime ?? "",
    steps: dish.steps,
  });
}

export function readFavoriteRecipes(userId?: string | null): FavoriteRecipe[] {
  if (typeof window === "undefined" || !userId) {
    return [];
  }

  const raw = localStorage.getItem(getFavoritesKey(userId));
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeFavoriteRecipes(userId: string, favorites: FavoriteRecipe[]) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(getFavoritesKey(userId), JSON.stringify(favorites));
  window.dispatchEvent(new CustomEvent(FAVORITES_UPDATED_EVENT));
}

export function toggleFavoriteRecipe(userId: string, recipe: Omit<FavoriteRecipe, "savedAt">) {
  const favorites = readFavoriteRecipes(userId);
  const existing = favorites.findIndex((favorite) => favorite.sourceKey === recipe.sourceKey);

  if (existing >= 0) {
    const next = favorites.filter((favorite) => favorite.sourceKey !== recipe.sourceKey);
    writeFavoriteRecipes(userId, next);
    return false;
  }

  writeFavoriteRecipes(userId, [{ ...recipe, savedAt: new Date().toISOString() }, ...favorites]);
  return true;
}

export function getFavoritesUpdatedEventName() {
  return FAVORITES_UPDATED_EVENT;
}
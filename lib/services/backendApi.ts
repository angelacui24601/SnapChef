import type { Dish } from "./apiService";
import { buildRecipeSourceKey } from "./favorites";

// Requests go directly to Next.js API routes (/api/*).
// Same-origin means the browser automatically sends the sc_session cookie.
const BACKEND_API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL ?? "/api";

interface BackendApiError {
  error?: string;
  message?: string;
}

export interface UserPreferencesRecord {
  age: number;
  sex: string;
  goal: string;
  customGoal: string;
  allergies: string[];
  medical: string;
  religious: string[];
  kitchenTools: string[];
  kitchenImage: string | null;
  updatedAt?: string;
}

export interface FavoriteRecipeRecord {
  id: string;
  recipeId: string;
  title: string;
  cookTime: number | null;
  estimatedCookTime?: string;
  ingredients: string[];
  steps: string[];
  savedAt: string;
  sourceKey: string;
}

interface RawPreferenceResponse {
  age: number | null;
  sex: string | null;
  goal: string | null;
  custom_goal: string | null;
  allergies: string[] | null;
  medical: string | null;
  religious: string[] | null;
  kitchen_tools: string[] | null;
  kitchen_image: string | null;
  updated_at?: string;
}

interface RawFavoriteResponse {
  recipe_id: string;
  title: string;
  cook_time: number | null;
  ingredients: string[] | null;
  steps: string[] | null;
  created_at: string;
}

export interface FavoriteRecipePayload {
  recipeId?: string;
  title: string;
  estimatedCookTime?: string;
  ingredients?: string[];
  steps: string[];
}

function normalizeTextArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0);
}

function formatCookTime(minutes: number | null | undefined) {
  if (!minutes || Number.isNaN(minutes)) {
    return undefined;
  }

  return `${minutes} minutes`;
}

function parseCookTimeToMinutes(value?: string | null) {
  if (!value) {
    return null;
  }

  const matches = value.match(/\d+/g);
  if (!matches || matches.length === 0) {
    return null;
  }

  const minutes = Number(matches[0]);
  return Number.isFinite(minutes) ? minutes : null;
}

function mapPreferenceResponse(raw: RawPreferenceResponse): UserPreferencesRecord {
  return {
    age: raw.age ?? 0,
    sex: raw.sex ?? "",
    goal: raw.goal ?? "",
    customGoal: raw.custom_goal ?? "",
    allergies: normalizeTextArray(raw.allergies),
    medical: raw.medical ?? "",
    religious: normalizeTextArray(raw.religious),
    kitchenTools: normalizeTextArray(raw.kitchen_tools),
    kitchenImage: raw.kitchen_image ?? null,
    updatedAt: raw.updated_at,
  };
}

function mapFavoriteResponse(raw: RawFavoriteResponse): FavoriteRecipeRecord {
  const estimatedCookTime = formatCookTime(raw.cook_time);
  const steps = normalizeTextArray(raw.steps);

  return {
    id: raw.recipe_id,
    recipeId: raw.recipe_id,
    title: raw.title,
    cookTime: raw.cook_time,
    estimatedCookTime,
    ingredients: normalizeTextArray(raw.ingredients),
    steps,
    savedAt: raw.created_at,
    sourceKey: buildRecipeSourceKey({
      title: raw.title,
      estimatedCookTime,
      steps,
    }),
  };
}

async function backendRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${BACKEND_API_BASE_URL}${endpoint}`, {
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let errorBody: BackendApiError | null = null;

    try {
      errorBody = await response.json();
    } catch {
      errorBody = null;
    }

    throw new Error(errorBody?.error || errorBody?.message || `Backend error: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchPreferences() {
  try {
    const response = await backendRequest<RawPreferenceResponse>(`/preferences`);
    return mapPreferenceResponse(response);
  } catch (error) {
    if (error instanceof Error && /404/.test(error.message)) {
      return null;
    }

    throw error;
  }
}

export async function savePreferences(preferences: UserPreferencesRecord) {
  const response = await backendRequest<{ preferences: RawPreferenceResponse }>("/preferences", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      age: preferences.age || null,
      sex: preferences.sex || null,
      goal: preferences.goal || null,
      customGoal: preferences.customGoal || null,
      allergies: preferences.allergies,
      medical: preferences.medical || null,
      religious: preferences.religious,
      kitchenTools: preferences.kitchenTools,
      kitchenImage: preferences.kitchenImage,
    }),
  });

  return mapPreferenceResponse(response.preferences);
}

export async function fetchFavorites() {
  const response = await backendRequest<{ favorites: RawFavoriteResponse[] }>(`/favorites`);
  return response.favorites.map(mapFavoriteResponse);
}

export async function saveFavorite(recipe: FavoriteRecipePayload) {
  const response = await backendRequest<{ recipe: RawFavoriteResponse }>("/favorite", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      recipeId: recipe.recipeId,
      recipe: {
        id: recipe.recipeId,
        title: recipe.title,
        cookTime: parseCookTimeToMinutes(recipe.estimatedCookTime),
        ingredients: recipe.ingredients ?? [],
        steps: recipe.steps,
      },
    }),
  });

  return mapFavoriteResponse(response.recipe);
}

export async function deleteFavorite(recipeId: string) {
  await backendRequest("/favorite", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ recipeId }),
  });
}

export function createFavoritePayloadFromDish(dish: Pick<Dish, "title" | "estimatedCookTime" | "steps">): FavoriteRecipePayload {
  return {
    title: dish.title,
    estimatedCookTime: dish.estimatedCookTime,
    steps: dish.steps,
    ingredients: [],
  };
}
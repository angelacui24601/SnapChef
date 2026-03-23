// API Service Layer for SnapChef AI
// Handles all backend API communications with proper error handling

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface DetectIngredientsRequest {
  image: File;
}

export interface DetectIngredientsResponse {
  ingredients: string[];
}

export interface UserProfile {
  age?: number;
  allergies?: string[];
  religiousRestrictions?: string[];
  medicalRestrictions?: string[];
}

export interface KitchenStateIngredient {
  name: string;
  freshness: string;
}

export interface KitchenState {
  ingredients?: KitchenStateIngredient[];
}

export interface MealPlanInput {
  type: MealType;
  people: number;
}

export interface GenerateRecipeRequest {
  ingredients: string[];
  cuisine?: string;
  constraints: {
    budget?: number;
    time?: number;
    effort?: string;
  };
  mode?: string;
  userProfile?: UserProfile;
  kitchenState?: KitchenState;
  meals: MealPlanInput[];
}

export interface NutritionInfo {
  calories?: string;
  protein?: string;
  carbs?: string;
  fat?: string;
  [key: string]: string | undefined;
}

export interface Dish {
  title: string;
  estimatedCookTime?: string;
  steps: string[];
  nutrition?: NutritionInfo;
}

export interface MealPlan {
  type: MealType;
  dishes: Dish[];
}

export interface GenerateRecipeResponse {
  meals: MealPlan[];
}

export interface ApiError {
  error: string;
  message?: string;
}

const API_BASE_URL = "/api";

function handleApiError(response: Response, errorData?: ApiError): never {
  const error: ApiError = errorData || { error: "Unknown error" };
  const message = error.message || error.error || `API error: ${response.status} ${response.statusText}`;
  throw new Error(message);
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        Accept: "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      let errorData: ApiError | undefined;
      try {
        errorData = await response.json();
      } catch {
        // Ignore malformed error payloads.
      }
      handleApiError(response, errorData);
    }

    return response.json() as Promise<T>;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error occurred");
  }
}

export async function detectIngredients(imageFile: File): Promise<DetectIngredientsResponse> {
  if (!imageFile) {
    throw new Error("No image file provided");
  }

  if (!imageFile.type.startsWith("image/")) {
    throw new Error("Invalid file type. Please upload an image.");
  }

  const maxSize = 10 * 1024 * 1024;
  if (imageFile.size > maxSize) {
    throw new Error("File size too large. Please upload an image smaller than 10MB.");
  }

  const formData = new FormData();
  formData.append("image", imageFile);

  return apiRequest<DetectIngredientsResponse>("/detect-ingredients", {
    method: "POST",
    body: formData,
  });
}

export async function generateRecipe(data: GenerateRecipeRequest): Promise<GenerateRecipeResponse> {
  if (!data.ingredients || data.ingredients.length === 0) {
    throw new Error("At least one ingredient is required");
  }

  const validIngredients = data.ingredients.filter((ingredient) => ingredient.trim().length > 0);
  if (validIngredients.length === 0) {
    throw new Error("Please provide valid ingredient names");
  }

  const validMeals = data.meals
    .map((meal) => ({
      type: meal.type,
      people: Number(meal.people),
    }))
    .filter((meal) => meal.people > 0);

  if (validMeals.length === 0) {
    throw new Error("Please add at least one meal with a valid people count");
  }

  const cleanData: GenerateRecipeRequest = {
    ingredients: validIngredients,
    cuisine: data.cuisine?.trim() || undefined,
    constraints: {
      budget: data.constraints?.budget && data.constraints.budget > 0 ? data.constraints.budget : undefined,
      time: data.constraints?.time && data.constraints.time > 0 ? data.constraints.time : undefined,
      effort: data.constraints?.effort?.trim() || undefined,
    },
    mode: data.mode?.trim() || undefined,
    userProfile: data.userProfile,
    kitchenState: data.kitchenState,
    meals: validMeals,
  };

  return apiRequest<GenerateRecipeResponse>("/recipe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cleanData),
  });
}

export function isApiError(error: unknown): error is Error {
  return error instanceof Error;
}

export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }
  return "An unexpected error occurred";
}
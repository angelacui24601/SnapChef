import { detectIngredients as detectIngredientsApi } from "./apiService";

export interface IngredientDetectionResult {
  ingredients: string[];
}

export async function detectIngredientsFromImage(imageInput: File | Blob | string): Promise<IngredientDetectionResult> {
  try {
    let imageFile: File;

    if (typeof imageInput === "string") {
      throw new Error("String image input is not supported in this wrapper; pass a File/Blob instead or wire URL handling in caller.");
    }

    if (imageInput instanceof File) {
      imageFile = imageInput;
    } else if (imageInput instanceof Blob) {
      const blob = imageInput;
      // convert blob to File with basic metadata
      imageFile = new File([blob], "uploaded-image", { type: blob.type || "image/jpeg" });
    } else {
      throw new Error("Unsupported image input type");
    }

    // Reuse existing API service to keep single endpoint and format
    const { ingredients } = await detectIngredientsApi(imageFile);

    if (!Array.isArray(ingredients)) {
      throw new Error("Ingredient detection response malformed");
    }

    const cleaned = ingredients
      .map((item) => String(item).trim())
      .filter((item) => item.length > 0);

    return { ingredients: cleaned };
  } catch (error) {
    // Wrap errors for caller-friendly handling
    if (error instanceof Error) {
      throw new Error(`Ingredient detection failed: ${error.message}`);
    }
    throw new Error("Ingredient detection failed: unknown error");
  }
}

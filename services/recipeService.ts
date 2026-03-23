export async function generateRecipe(data: {
  ingredients: string;
  people: number;
  goal: string;
  timeLimit: string;
  difficulty: string;
  dietary: string;
  equipment: string;
  expiringIngredients: string;
  image?: File;
}) {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (value instanceof File) {
        formData.append(key, value);
      } else {
        formData.append(key, value.toString());
      }
    }
  });

  const response = await fetch("/api/recipe", {
    method: "POST",
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || `API error: ${response.status} ${response.statusText}`);
  }

  return result;
}
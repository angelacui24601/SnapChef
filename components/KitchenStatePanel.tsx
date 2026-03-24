"use client";

import { useRef, useState } from "react";
import { detectIngredients, getErrorMessage, type MealPlanInput, type MealType } from "../lib/services/apiService";

interface Ingredient {
  name: string;
  priority: string;
}

interface KitchenStatePanelProps {
  ingredients: Ingredient[];
  setIngredients: (ingredients: Ingredient[]) => void;
  meals: MealPlanInput[];
  setMeals: (meals: MealPlanInput[]) => void;
  onGenerateRecipe: () => void;
  loading: boolean;
  error: string;
  setError: (error: string) => void;
}

const mealTypes: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

export default function KitchenStatePanel({
  ingredients,
  setIngredients,
  meals,
  setMeals,
  onGenerateRecipe,
  loading,
  setError,
}: KitchenStatePanelProps) {
  const [newIngredient, setNewIngredient] = useState("");
  const [expirationPriority, setExpirationPriority] = useState("fresh");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addIngredient = () => {
    const trimmedIngredient = newIngredient.trim();
    if (!trimmedIngredient) {
      return;
    }

    setIngredients([
      ...ingredients,
      {
        name: trimmedIngredient,
        priority: expirationPriority,
      },
    ]);
    setNewIngredient("");
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, ingredientIndex) => ingredientIndex !== index));
  };

  const addMeal = () => {
    setMeals([...meals, { type: "lunch", people: 1 }]);
  };

  const updateMeal = (index: number, field: keyof MealPlanInput, value: MealType | number) => {
    setMeals(
      meals.map((meal, mealIndex) =>
        mealIndex === index
          ? {
              ...meal,
              [field]: value,
            }
          : meal,
      ),
    );
  };

  const removeMeal = (index: number) => {
    setMeals(meals.filter((_, mealIndex) => mealIndex !== index));
  };

  const getChipStyle = (priority: string) => {
    const baseClasses = "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105";
    switch (priority) {
      case "soon":
        return `${baseClasses} bg-red-100 text-red-800 border border-red-200`;
      case "medium":
        return `${baseClasses} bg-orange-100 text-orange-800 border border-orange-200`;
      case "fresh":
      default:
        return `${baseClasses} bg-green-100 text-green-800 border border-green-200`;
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    const files = event.dataTransfer.files;
    if (files && files[0]) {
      void handleFile(files[0]);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      void handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      setUploadedImage(loadEvent.target?.result as string);
    };
    reader.readAsDataURL(file);

    await handleDetectIngredients(file);
  };

  const handleDetectIngredients = async (file: File) => {
    setIsDetecting(true);
    setError("");

    try {
      const response = await detectIngredients(file);
      if (Array.isArray(response.ingredients)) {
        // Surface a model-generated warning when the photo has no edible food
        // (e.g. a photo of kitchen tools, a random object, or a non-food scene).
        if (response.warning) {
          setError(response.warning);
          return;
        }

        const nextIngredients = [...ingredients];
        response.ingredients.forEach((ingredientName) => {
          const cleanName = ingredientName.trim();
          if (!cleanName) {
            return;
          }

          const exists = nextIngredients.some(
            (ingredient) => ingredient.name.toLowerCase() === cleanName.toLowerCase(),
          );

          if (!exists) {
            nextIngredients.push({ name: cleanName, priority: "fresh" });
          }
        });

        if (nextIngredients.length > ingredients.length) {
          setIngredients(nextIngredients);
        }
      } else {
        setError("Failed to parse detected ingredients. Please try again.");
      }
    } catch (detectError) {
      setError(getErrorMessage(detectError));
    } finally {
      setIsDetecting(false);
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <div
        style={{
          background: "var(--sc-card, #ffffff)",
          borderRadius: "24px",
          padding: "32px",
          boxShadow: "var(--sc-card-shadow, 0 2px 16px rgba(90, 60, 10, 0.07))",
          border: "1px solid var(--sc-card-border, #ede9e1)",
          animation: "fadeInUp 0.8s ease-out 0.2s both",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              background: "rgba(34, 197, 94, 0.1)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3C8 6 5 10 5 14a7 7 0 0 0 14 0C19 10 16 6 12 3z" />
              <line x1="12" y1="21" x2="12" y2="5" />
            </svg>
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1f2937", margin: 0 }}>Ingredients</h2>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${isDragOver ? "#22c55e" : "#d1d5db"}`,
              borderRadius: "16px",
              padding: "32px",
              textAlign: "center",
              transition: "all 0.3s ease",
              backgroundColor: isDragOver ? "rgba(34, 197, 94, 0.05)" : "transparent",
              cursor: "pointer",
            }}
          >
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} style={{ display: "none" }} />

            {!uploadedImage ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    background: "#f3f4f6",
                    borderRadius: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p style={{ fontSize: "1.1rem", fontWeight: 600, color: "#374151", margin: "0 0 4px 0" }}>Upload Ingredient Photo</p>
                  <p style={{ color: "#6b7280", margin: 0 }}>Drag and drop an image or click to browse</p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    background: "#22c55e",
                    color: "white",
                    fontWeight: 600,
                    padding: "12px 24px",
                    border: "none",
                    borderRadius: "12px",
                    cursor: "pointer",
                  }}
                >
                  Choose Image
                </button>
              </div>
            ) : isDetecting ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                <img
                  src={uploadedImage}
                  alt="Uploaded ingredients"
                  style={{
                    maxHeight: "192px",
                    margin: "0 auto",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    opacity: 0.5,
                  }}
                />
                <span style={{ color: "#22c55e", fontWeight: 600 }}>Detecting ingredients...</span>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                <img
                  src={uploadedImage}
                  alt="Uploaded ingredients"
                  style={{
                    maxHeight: "192px",
                    margin: "0 auto",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{ background: "#6b7280", color: "white", fontWeight: 600, padding: "8px 16px", border: "none", borderRadius: "12px", cursor: "pointer" }}
                  >
                    Change Image
                  </button>
                  <button
                    onClick={removeImage}
                    style={{ background: "#dc2626", color: "white", fontWeight: 600, padding: "8px 16px", border: "none", borderRadius: "12px", cursor: "pointer" }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <label style={{ fontSize: "0.9rem", fontWeight: 600, color: "#374151" }}>Or add ingredients manually</label>
          <div style={{ display: "flex", gap: "12px" }}>
            <input
              type="text"
              placeholder="Enter ingredient (e.g., chicken breast)"
              value={newIngredient}
              onChange={(event) => setNewIngredient(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addIngredient();
                }
              }}
              style={{
                flex: 1,
                padding: "12px 16px",
                border: "2px solid #e5e7eb",
                borderRadius: "12px",
                fontSize: "1rem",
                outline: "none",
              }}
            />
            <select
              value={expirationPriority}
              onChange={(event) => setExpirationPriority(event.target.value)}
              style={{
                padding: "12px 16px",
                border: "2px solid #e5e7eb",
                borderRadius: "12px",
                fontSize: "1rem",
                background: "white",
                outline: "none",
              }}
            >
              <option value="fresh">Fresh</option>
              <option value="medium">Medium</option>
              <option value="soon">Expiring Soon</option>
            </select>
            <button
              onClick={addIngredient}
              disabled={!newIngredient.trim()}
              style={{
                background: !newIngredient.trim() ? "#d1d5db" : "#22c55e",
                color: "white",
                fontWeight: 600,
                padding: "12px 24px",
                border: "none",
                borderRadius: "12px",
                cursor: !newIngredient.trim() ? "not-allowed" : "pointer",
              }}
            >
              Add
            </button>
          </div>
        </div>

        {ingredients.length > 0 && (
          <div style={{ marginTop: "24px" }}>
            <h3 style={{ fontSize: "0.9rem", fontWeight: 600, color: "#374151", marginBottom: "12px" }}>Your Ingredients:</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {ingredients.map((ingredient, index) => (
                <div key={index} className={getChipStyle(ingredient.priority)} style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 12px", borderRadius: "12px", fontSize: "0.9rem", fontWeight: 500 }}>
                  <span>{ingredient.name}</span>
                  <button
                    onClick={() => removeIngredient(index)}
                    style={{ width: "16px", height: "16px", borderRadius: "50%", background: "rgba(255, 255, 255, 0.5)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          background: "var(--sc-card, #ffffff)",
          borderRadius: "24px",
          padding: "32px",
          boxShadow: "var(--sc-card-shadow, 0 2px 16px rgba(90, 60, 10, 0.07))",
          border: "1px solid var(--sc-card-border, #ede9e1)",
          animation: "fadeInUp 0.8s ease-out 0.4s both",
        }}
      >
        <div style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
            <div style={{ width: "40px", height: "40px", background: "rgba(249, 115, 22, 0.1)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 6h16" />
                <path d="M4 6c0 7 3 11 8 11s8-4 8-11" />
                <path d="M8 19h8" />
                <path d="M12 19v2" />
              </svg>
            </div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1f2937", margin: 0 }}>Meals to Prepare</h2>
          </div>
          <p style={{ margin: "0 0 0 52px", color: "#6b7280", fontSize: "0.95rem" }}>Choose breakfast, lunch, dinner, or snack for each meal and how many people it should feed.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {meals.map((meal, index) => (
            <div key={index} style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
              <select
                value={meal.type}
                onChange={(event) => updateMeal(index, "type", event.target.value as MealType)}
                style={{ padding: "10px 12px", borderRadius: "10px", border: "1px solid #e5e7eb", fontSize: "1rem", background: "white" }}
              >
                {mealTypes.map((mealType) => (
                  <option key={mealType} value={mealType}>
                    {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                value={meal.people}
                onChange={(event) => updateMeal(index, "people", Math.max(1, Number(event.target.value)))}
                style={{ width: "96px", padding: "10px 12px", borderRadius: "10px", border: "1px solid #e5e7eb", fontSize: "1rem" }}
              />
              <span style={{ color: "#6b7280" }}>people</span>
              <button
                onClick={() => removeMeal(index)}
                disabled={meals.length === 1}
                style={{
                  background: meals.length === 1 ? "#d1d5db" : "#dc2626",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  cursor: meals.length === 1 ? "not-allowed" : "pointer",
                }}
              >
                Remove
              </button>
            </div>
          ))}

          <button
            onClick={addMeal}
            style={{ alignSelf: "flex-start", background: "#22c55e", color: "white", border: "none", borderRadius: "10px", padding: "10px 18px", fontWeight: 600, cursor: "pointer" }}
          >
            Add Meal
          </button>
        </div>
      </div>

      <div
        style={{
          background: "white",
          borderRadius: "24px",
          padding: "32px",
          boxShadow: "0 4px 24px rgba(0, 0, 0, 0.06)",
          border: "1px solid rgba(255, 255, 255, 0.8)",
          animation: "fadeInUp 0.8s ease-out 0.6s both",
        }}
      >
        <button
          onClick={onGenerateRecipe}
          disabled={loading || ingredients.length === 0}
          style={{
            width: "100%",
            background: loading || ingredients.length === 0 ? "#9ca3af" : "linear-gradient(135deg, #22c55e, #16a34a)",
            color: "white",
            fontSize: "1.1rem",
            fontWeight: 600,
            padding: "16px 24px",
            border: "none",
            borderRadius: "16px",
            cursor: loading || ingredients.length === 0 ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          {loading ? "Generating Meal Plan..." : "Generate Recipe"}
        </button>

        {ingredients.length === 0 && (
          <p style={{ fontSize: "0.9rem", color: "#6b7280", textAlign: "center", marginTop: "12px" }}>
            Add some ingredients to get started
          </p>
        )}
      </div>
    </div>
  );
}
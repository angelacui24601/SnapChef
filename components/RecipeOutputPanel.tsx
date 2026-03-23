"use client";

import { useEffect, useState } from "react";
import type { Dish, GenerateRecipeResponse, MealType } from "../services/apiService";
import {
  buildRecipeSourceKey,
  getFavoritesUpdatedEventName,
  readFavoriteRecipes,
  toggleFavoriteRecipe,
} from "../services/favorites";

interface RecipeOutputPanelProps {
  result: GenerateRecipeResponse | null;
  loading: boolean;
  userId: string | null;
  isGuest: boolean;
  requireAuth: (action: () => void) => void;
}

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function RecipeOutputPanel({ result, loading, userId, isGuest, requireAuth }: RecipeOutputPanelProps) {
  const [selectedTabs, setSelectedTabs] = useState<number[]>([]);
  const [favoriteSourceKeys, setFavoriteSourceKeys] = useState<string[]>([]);
  const [guestFavoriteSourceKeys, setGuestFavoriteSourceKeys] = useState<string[]>([]);

  useEffect(() => {
    setSelectedTabs(result?.meals.map(() => 0) ?? []);
  }, [result]);

  useEffect(() => {
    if (!userId) {
      setFavoriteSourceKeys([]);
      return;
    }

    const syncFavorites = () => {
      setFavoriteSourceKeys(readFavoriteRecipes(userId).map((favorite) => favorite.sourceKey));
    };

    syncFavorites();
    window.addEventListener("storage", syncFavorites);
    window.addEventListener(getFavoritesUpdatedEventName(), syncFavorites);

    return () => {
      window.removeEventListener("storage", syncFavorites);
      window.removeEventListener(getFavoritesUpdatedEventName(), syncFavorites);
    };
  }, [userId]);

  const handleTabChange = (mealIndex: number, dishIndex: number) => {
    setSelectedTabs((current) => {
      const next = [...current];
      next[mealIndex] = dishIndex;
      return next;
    });
  };

  const handleFavoriteToggle = (mealType: MealType, dish: Dish) => {
    const sourceKey = buildRecipeSourceKey(mealType, dish);
    requireAuth(() => {
      if (userId) {
        const nextIsFavorite = toggleFavoriteRecipe(userId, {
          id: sourceKey,
          sourceKey,
          mealType,
          title: dish.title,
          estimatedCookTime: dish.estimatedCookTime,
          steps: dish.steps,
          nutrition: dish.nutrition,
        });

        setFavoriteSourceKeys((current) =>
          nextIsFavorite
            ? [sourceKey, ...current.filter((value) => value !== sourceKey)]
            : current.filter((value) => value !== sourceKey),
        );
        return;
      }

      setGuestFavoriteSourceKeys((current) =>
        current.includes(sourceKey)
          ? current.filter((value) => value !== sourceKey)
          : [sourceKey, ...current.filter((value) => value !== sourceKey)],
      );
    });
  };

  if (loading) {
    return (
      <div style={{ background: "white", borderRadius: "24px", padding: "48px", boxShadow: "0 4px 24px rgba(0, 0, 0, 0.06)", border: "1px solid rgba(255, 255, 255, 0.8)", textAlign: "center" }}>
        <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1f2937", margin: "0 0 16px 0" }}>Crafting Your Meal Plan</h3>
        <p style={{ color: "#6b7280", margin: 0, fontSize: "1rem" }}>AI is splitting your ingredients across the requested meals.</p>
      </div>
    );
  }

  if (!result || result.meals.length === 0) {
    return (
      <div style={{ background: "white", borderRadius: "24px", padding: "48px", boxShadow: "0 4px 24px rgba(0, 0, 0, 0.06)", border: "1px solid rgba(255, 255, 255, 0.8)", textAlign: "center" }}>
        <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1f2937", margin: "0 0 16px 0" }}>Your Recipes Will Appear Here</h3>
        <p style={{ color: "#6b7280", margin: "0 auto", fontSize: "1rem", maxWidth: "420px" }}>
          Add ingredients, define one or more meals, and generate recipes for breakfast, lunch, dinner, or snack.
        </p>
      </div>
    );
  }

  return (
    <div style={{ background: "white", borderRadius: "24px", padding: "32px", boxShadow: "0 4px 24px rgba(0, 0, 0, 0.06)", border: "1px solid rgba(255, 255, 255, 0.8)" }}>
      {result.meals.map((meal, mealIndex) => {
        const activeDishIndex = selectedTabs[mealIndex] ?? 0;
        const activeDish = meal.dishes[activeDishIndex];
        const activeDishKey = buildRecipeSourceKey(meal.type, activeDish);
        const isFavorite = userId
          ? favoriteSourceKeys.includes(activeDishKey)
          : guestFavoriteSourceKeys.includes(activeDishKey);

        return (
          <div key={`${meal.type}-${mealIndex}`} style={{ marginBottom: mealIndex === result.meals.length - 1 ? 0 : "40px" }}>
            <div style={{ marginBottom: "16px" }}>
              <h2 style={{ fontSize: "1.75rem", fontWeight: "bold", color: "#1f2937", margin: "0 0 8px 0" }}>{titleCase(meal.type)}</h2>
              <div style={{ width: "60px", height: "4px", background: "linear-gradient(135deg, #22c55e, #16a34a)", borderRadius: "2px" }} />
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
              {meal.dishes.map((dish, dishIndex) => {
                const isActive = dishIndex === activeDishIndex;
                return (
                  <button
                    key={`${dish.title}-${dishIndex}`}
                    onClick={() => handleTabChange(mealIndex, dishIndex)}
                    style={{
                      padding: "10px 16px",
                      borderRadius: "12px",
                      border: isActive ? "1px solid #16a34a" : "1px solid #d1d5db",
                      background: isActive ? "linear-gradient(135deg, #22c55e, #16a34a)" : "#f8fafc",
                      color: isActive ? "white" : "#374151",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {dish.title}
                  </button>
                );
              })}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "16px",
                marginBottom: "24px",
                padding: "18px 20px",
                background: "#f8fafc",
                borderRadius: "16px",
                border: "1px solid #e2e8f0",
              }}
            >
              <div>
                <h3 style={{ fontSize: "1.35rem", fontWeight: "bold", color: "#1f2937", margin: "0 0 6px 0" }}>{activeDish.title}</h3>
                <p style={{ margin: 0, fontSize: "0.92rem", color: "#6b7280" }}>
                  Estimated cook time: {activeDish.estimatedCookTime ?? "25-30 minutes"}
                </p>
              </div>
              <button
                onClick={() => handleFavoriteToggle(meal.type, activeDish)}
                aria-label={isFavorite ? "Remove from favorites" : "Save to favorites"}
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  border: isFavorite ? "1px solid #fecaca" : "1px solid #e5e7eb",
                  background: isFavorite ? "#fff1f2" : "white",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
                title={userId
                  ? (isFavorite ? "Remove from favorites" : "Save to favorites")
                  : isGuest
                    ? (isFavorite ? "Remove guest favorite" : "Save for this guest session")
                    : "Sign in or continue as guest to save favorites"}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill={isFavorite ? "#ef4444" : "none"} stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 21s-6.7-4.35-9.33-8.02C.9 10.52 1.5 6.8 4.58 5.02c2.27-1.3 4.94-.64 6.42 1.05 1.48-1.69 4.15-2.35 6.42-1.05 3.08 1.78 3.68 5.5 1.91 7.96C18.7 16.65 12 21 12 21z" />
                </svg>
              </button>
            </div>

            {!userId && (
              <p style={{ margin: "-10px 0 18px 0", fontSize: "0.82rem", color: "#6b7280" }}>
                {isGuest ? "Guest favorites last for this session only." : "Sign in to sync favorites across devices, or continue as guest for a temporary list."}
              </p>
            )}

            <div style={{ marginBottom: "24px" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#1f2937", margin: "0 0 16px 0" }}>Instructions</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {activeDish.steps.map((step, stepIndex) => (
                  <div key={stepIndex} style={{ display: "flex", gap: "16px", padding: "16px", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                    <div style={{ width: "32px", height: "32px", background: "linear-gradient(135deg, #22c55e, #16a34a)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "0.9rem", fontWeight: "bold", color: "white" }}>
                      {stepIndex + 1}
                    </div>
                    <div style={{ flex: 1, fontSize: "1rem", color: "#374151", lineHeight: "1.6" }}>{step}</div>
                  </div>
                ))}
              </div>
            </div>

            {activeDish.nutrition && Object.keys(activeDish.nutrition).length > 0 && (
              <div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#1f2937", margin: "0 0 16px 0" }}>Nutrition</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "12px" }}>
                  {Object.entries(activeDish.nutrition).map(([key, value]) =>
                    value ? (
                      <div key={key} style={{ padding: "12px 16px", background: "#fef3c7", borderRadius: "12px", textAlign: "center", border: "1px solid #fde68a" }}>
                        <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#92400e", textTransform: "capitalize", marginBottom: "4px" }}>{key}</div>
                        <div style={{ fontSize: "1rem", fontWeight: "bold", color: "#92400e" }}>{value}</div>
                      </div>
                    ) : null,
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
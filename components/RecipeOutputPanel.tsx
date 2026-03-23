"use client";

import { useEffect, useState } from "react";
import type { GenerateRecipeResponse } from "../services/apiService";

interface RecipeOutputPanelProps {
  result: GenerateRecipeResponse | null;
  loading: boolean;
}

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function RecipeOutputPanel({ result, loading }: RecipeOutputPanelProps) {
  const [selectedTabs, setSelectedTabs] = useState<number[]>([]);

  useEffect(() => {
    setSelectedTabs(result?.meals.map(() => 0) ?? []);
  }, [result]);

  const handleTabChange = (mealIndex: number, dishIndex: number) => {
    setSelectedTabs((current) => {
      const next = [...current];
      next[mealIndex] = dishIndex;
      return next;
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
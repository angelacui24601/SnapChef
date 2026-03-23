"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import KitchenStatePanel from "../components/KitchenStatePanel";
import RecipeOutputPanel from "../components/RecipeOutputPanel";
import UserProfileSidebar from "../components/UserProfileSidebar";
import {
  generateRecipe,
  getErrorMessage,
  type GenerateRecipeResponse,
  type MealPlanInput,
} from "../services/apiService";

interface Ingredient {
  name: string;
  priority: string;
}

export default function HomePage() {
  const router = useRouter();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [meals, setMeals] = useState<MealPlanInput[]>([{ type: "lunch", people: 1 }]);
  const [result, setResult] = useState<GenerateRecipeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("userProfile");
    if (!saved) {
      router.push("/onboarding");
      return;
    }

    try {
      const profile = JSON.parse(saved);
      if (
        !profile.age &&
        (!profile.allergies || profile.allergies.length === 0) &&
        (!profile.religiousRestrictions || profile.religiousRestrictions.length === 0) &&
        (!profile.medicalRestrictions || profile.medicalRestrictions.length === 0)
      ) {
        router.push("/onboarding");
      }
    } catch (loadError) {
      console.warn("Failed to parse existing profile", loadError);
      router.push("/onboarding");
    }
  }, [router]);

  useEffect(() => {
    const saved = localStorage.getItem("kitchenState");
    if (!saved) {
      return;
    }

    try {
      const kitchenState = JSON.parse(saved);
      setIngredients(Array.isArray(kitchenState.ingredients) ? kitchenState.ingredients : []);
      setMeals(Array.isArray(kitchenState.meals) && kitchenState.meals.length > 0 ? kitchenState.meals : [{ type: "lunch", people: 1 }]);
    } catch (loadError) {
      console.warn("Failed to parse kitchenState from localStorage", loadError);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "kitchenState",
      JSON.stringify({
        ingredients,
        meals,
      }),
    );
  }, [ingredients, meals]);

  const handleSubmit = async () => {
    if (ingredients.length === 0) {
      setError("Please add some ingredients first");
      return;
    }

    if (meals.length === 0) {
      setError("Please specify at least one meal");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const savedProfile = localStorage.getItem("userProfile");
      let userProfile = {};
      if (savedProfile) {
        try {
          userProfile = JSON.parse(savedProfile);
        } catch (loadError) {
          console.warn("Failed to parse userProfile", loadError);
        }
      }

      const data = await generateRecipe({
        ingredients: ingredients.map((ingredient) => ingredient.name),
        constraints: {
          budget: 25,
          time: 30,
          effort: "Medium",
        },
        mode: undefined,
        userProfile,
        kitchenState: {
          ingredients: ingredients.map((ingredient) => ({
            name: ingredient.name,
            freshness: ingredient.priority,
          })),
        },
        meals,
      });

      setResult(data);
    } catch (submitError) {
      console.error("Recipe generation failed:", submitError);
      setError(getErrorMessage(submitError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "10%",
          width: "200px",
          height: "200px",
          background: "rgba(34, 197, 94, 0.05)",
          borderRadius: "50%",
          filter: "blur(40px)",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "20%",
          right: "15%",
          width: "150px",
          height: "150px",
          background: "rgba(249, 115, 22, 0.05)",
          borderRadius: "50%",
          filter: "blur(30px)",
          zIndex: 0,
        }}
      />

      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "40px 20px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "40px", animation: "fadeInUp 0.6s ease-out" }}>
          <div
            style={{
              width: "80px",
              height: "80px",
              background: "white",
              borderRadius: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              boxShadow: "0 8px 32px rgba(34, 197, 94, 0.2)",
              overflow: "hidden",
            }}
          >
            <Image
              src="/snapchef-logo.png"
              alt="SnapChef logo"
              width={80}
              height={80}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              priority
            />
          </div>
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: "bold",
              color: "#1f2937",
              marginBottom: "8px",
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            SnapChef AI
          </h1>
          <p style={{ fontSize: "1.1rem", color: "#6b7280", marginBottom: 0 }}>
            Transform your ingredients into meal plans with AI-powered recipe generation
          </p>
        </div>

        {error && (
          <div
            style={{
              marginBottom: "32px",
              padding: "16px 20px",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              borderRadius: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div>
                <h3 style={{ fontWeight: 600, color: "#dc2626", margin: "0 0 4px 0" }}>Error</h3>
                <p style={{ color: "#dc2626", margin: 0, fontSize: "0.9rem" }}>{error}</p>
              </div>
              <button
                onClick={() => setError("")}
                style={{ marginLeft: "auto", color: "#dc2626", background: "none", border: "none", cursor: "pointer", padding: "4px" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: "32px", alignItems: "flex-start" }}>
          <div style={{ flex: "1 1 70%", minWidth: 0 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
              <KitchenStatePanel
                ingredients={ingredients}
                setIngredients={setIngredients}
                meals={meals}
                setMeals={setMeals}
                onGenerateRecipe={handleSubmit}
                loading={loading}
                error={error}
                setError={setError}
              />
              <RecipeOutputPanel result={result} loading={loading} />
            </div>
          </div>

          <div style={{ flex: "0 0 300px" }}>
            <UserProfileSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
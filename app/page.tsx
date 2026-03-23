"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserButton, useAuth, useUser } from "@clerk/nextjs";
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
  const { isLoaded: authLoaded, isSignedIn, userId } = useAuth();
  const { user } = useUser();
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
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* Sticky top navbar */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "white",
          borderBottom: "1px solid #e5e7eb",
          padding: "0 24px",
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            height: "60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Image
              src="/snapchef-logo.png"
              alt="SnapChef logo"
              width={40}
              height={40}
              style={{ borderRadius: "10px", objectFit: "cover" }}
              priority
            />
            <span style={{ fontSize: "1.2rem", fontWeight: 700, color: "#1f2937" }}>SnapChef</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {authLoaded && isSignedIn ? (
              <>
                <button
                  onClick={() => router.push("/profile")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    background: "#f8fafc",
                    border: "1px solid #e5e7eb",
                    borderRadius: "999px",
                    padding: "6px 12px 6px 8px",
                    cursor: "pointer",
                  }}
                >
                  {user?.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.imageUrl}
                      alt="Profile"
                      width={30}
                      height={30}
                      style={{ borderRadius: "50%", flexShrink: 0 }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #22c55e, #16a34a)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                      }}
                    >
                      {(user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? "?")[0].toUpperCase()}
                    </div>
                  )}
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1f2937" }}>Profile</div>
                    <div style={{ fontSize: "0.72rem", color: "#6b7280", maxWidth: "140px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? "Account"}
                    </div>
                  </div>
                </button>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "40px",
                    height: "40px",
                    borderRadius: "999px",
                    border: "1px solid #e5e7eb",
                    background: "white",
                  }}
                >
                  <UserButton />
                </div>
              </>
            ) : (
              <span style={{ fontSize: "0.875rem", color: "#9ca3af" }}>AI-powered meal planning</span>
            )}
          </div>
        </div>
      </header>

      {/* Page content */}
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "28px 24px" }}>
        {error && (
          <div
            style={{
              marginBottom: "20px",
              padding: "12px 16px",
              background: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              borderRadius: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p style={{ color: "#dc2626", margin: 0, fontSize: "0.875rem", flex: 1 }}>{error}</p>
              <button
                onClick={() => setError("")}
                style={{ color: "#dc2626", background: "none", border: "none", cursor: "pointer", padding: "2px" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
          <div style={{ flex: "1 1 0", minWidth: 0 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
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
              <RecipeOutputPanel result={result} loading={loading} userId={authLoaded && isSignedIn ? userId ?? null : null} />
            </div>
          </div>

          <div style={{ flex: "0 0 280px" }}>
            <UserProfileSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
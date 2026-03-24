"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSnapChefAuth } from "../components/auth/AuthProvider";
import KitchenStatePanel from "../components/KitchenStatePanel";
import RecipeOutputPanel from "../components/RecipeOutputPanel";
import UserProfileSidebar from "../components/UserProfileSidebar";
import PreferencesModal from "../components/PreferencesModal";
import {
  generateRecipe,
  getErrorMessage,
  type GenerateRecipeResponse,
  type MealPlanInput,
} from "../lib/services/apiService";

interface Ingredient {
  name: string;
  priority: string;
}

export default function HomePage() {
  const router = useRouter();
  const {
    clerkUser,
    isGuest,
    isLoadingUserData,
    isLoggedIn,
    openAuthModal,
    preferences,
  } = useSnapChefAuth();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [meals, setMeals] = useState<MealPlanInput[]>([{ type: "lunch", people: 1 }]);
  const [result, setResult] = useState<GenerateRecipeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);

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
      const data = await generateRecipe({
        ingredients: ingredients.map((ingredient) => ingredient.name),
        constraints: {
          budget: 25,
          time: 30,
          effort: "Medium",
        },
        mode: undefined,
        userProfile: preferences
          ? {
              age: preferences.age || undefined,
              sex: preferences.sex || undefined,
              // Resolve custom goal to its display value
              goal: preferences.goal === "custom"
                ? (preferences.customGoal.trim() || undefined)
                : (preferences.goal || undefined),
              allergies: preferences.allergies,
              religiousRestrictions: preferences.religious,
              medicalRestrictions: preferences.medical ? [preferences.medical] : [],
              kitchenTools: preferences.kitchenTools.length > 0 ? preferences.kitchenTools : undefined,
            }
          : undefined,
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

  const handleProfileClick = () => {
    if (isLoggedIn) {
      router.push("/profile");
      return;
    }

    openAuthModal();
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--sc-bg, #f7f5f1)" }}>
      {/* Sticky top navbar */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "var(--sc-nav, #fffefb)",
          borderBottom: "1px solid var(--sc-nav-border, #ede9e1)",
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
            <div className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 md:block">
              {isLoggedIn ? "Signed in" : isGuest ? "Guest mode" : "Sign in to save your recipes"}
            </div>
            <button
                onClick={handleProfileClick}
                aria-label={isLoggedIn ? "Go to profile" : "Sign in"}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  background: "var(--sc-bg, #f7f5f1)",
                  border: "1px solid var(--sc-nav-border, #ede9e1)",
                  borderRadius: "999px",
                  padding: "6px 12px 6px 8px",
                  cursor: "pointer",
                  transition: "background 0.15s, border-color 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#efe9de"; e.currentTarget.style.borderColor = "#d4c9b8"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "var(--sc-bg, #f7f5f1)"; e.currentTarget.style.borderColor = "var(--sc-nav-border, #ede9e1)"; }}
              >
                {isLoggedIn && clerkUser?.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={clerkUser.imageUrl}
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
                      background: isLoggedIn ? "linear-gradient(135deg, #22c55e, #16a34a)" : "#e5e7eb",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: isLoggedIn ? "white" : "#4b5563",
                      flexShrink: 0,
                    }}
                  >
                    {isLoggedIn ? (
                      <span style={{ fontSize: "0.8rem", fontWeight: 700 }}>
                        {(clerkUser?.fullName ?? clerkUser?.email ?? "?")[0].toUpperCase()}
                      </span>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    )}
                  </div>
                )}
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1f2937" }}>
                    {isLoggedIn ? "Profile" : isGuest ? "Guest" : "Account"}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#6b7280", maxWidth: "140px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {isLoggedIn
                      ? (clerkUser?.fullName ?? clerkUser?.email ?? "Signed in")
                      : isGuest
                        ? "Browsing without saving"
                        : "Sign in to save"}
                  </div>
                </div>
              </button>
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
              <RecipeOutputPanel
                result={result}
                loading={loading}
                isGuest={isGuest}
              />
            </div>
          </div>

          <div style={{ flex: "0 0 280px" }}>
            <UserProfileSidebar
              isLoading={isLoadingUserData}
              onEditProfile={() => setShowPreferencesModal(true)}
            />
          </div>
        </div>
      </div>

      <PreferencesModal isOpen={showPreferencesModal} onClose={() => setShowPreferencesModal(false)} />
    </div>
  );
}
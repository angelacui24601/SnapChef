"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSnapChefAuth } from "../../components/auth/AuthProvider";
import type { FavoriteRecipeRecord, UserPreferencesRecord } from "../../services/backendApi";

const EMPTY_PREFERENCES: UserPreferencesRecord = {
  age: 0,
  sex: "",
  goal: "",
  customGoal: "",
  allergies: [],
  medical: "",
  religious: [],
  kitchenTools: [],
  kitchenImage: null,
};

export default function ProfilePage() {
  const router = useRouter();
  const {
    clerkUser,
    favorites,
    isGuest,
    isLoadingUserData,
    isLoggedIn,
    openAuthModal,
    preferences,
    removeFavoriteRecipe,
    requireAuth,
    saveFavoriteRecipe,
    saveUserPreferences,
    setGuestPreferences,
    syncError,
    userId,
  } = useSnapChefAuth();
  const [draftPreferences, setDraftPreferences] = useState<UserPreferencesRecord>(EMPTY_PREFERENCES);

  // Redirect unauthenticated, non-guest visitors back to home and open the sign-in modal
  useEffect(() => {
    if (!isLoadingUserData && !isLoggedIn && !isGuest) {
      router.replace("/");
      openAuthModal();
    }
  }, [isLoadingUserData, isLoggedIn, isGuest, router, openAuthModal]);
  const [draftFavorites, setDraftFavorites] = useState<FavoriteRecipeRecord[]>([]);
  const [newAllergy, setNewAllergy] = useState("");
  const [newReligiousRestriction, setNewReligiousRestriction] = useState("");
  const [newMedicalRestriction, setNewMedicalRestriction] = useState("");
  const [notice, setNotice] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDraftPreferences(preferences ?? EMPTY_PREFERENCES);
  }, [preferences]);

  useEffect(() => {
    setDraftFavorites(favorites);
  }, [favorites]);

  const updatePreferences = (fields: Partial<UserPreferencesRecord>) => {
    setDraftPreferences((current) => ({ ...current, ...fields }));
  };

  const addAllergy = () => {
    const trimmed = newAllergy.trim();
    if (trimmed && !draftPreferences.allergies.includes(trimmed)) {
      updatePreferences({ allergies: [...draftPreferences.allergies, trimmed] });
      setNewAllergy("");
    }
  };

  const removeAllergy = (index: number) => {
    updatePreferences({
      allergies: draftPreferences.allergies.filter((_, itemIndex) => itemIndex !== index),
    });
  };

  const addReligiousRestriction = () => {
    const trimmed = newReligiousRestriction.trim();
    if (trimmed && !draftPreferences.religious.includes(trimmed)) {
      updatePreferences({ religious: [...draftPreferences.religious, trimmed] });
      setNewReligiousRestriction("");
    }
  };

  const removeReligiousRestriction = (index: number) => {
    updatePreferences({
      religious: draftPreferences.religious.filter((_, itemIndex) => itemIndex !== index),
    });
  };

  const addMedicalRestriction = () => {
    const trimmed = newMedicalRestriction.trim();
    if (trimmed && trimmed !== draftPreferences.medical.trim()) {
      updatePreferences({ medical: trimmed });
      setNewMedicalRestriction("");
    }
  };

  const clearMedicalRestriction = () => {
    updatePreferences({ medical: "" });
  };

  const updateFavoriteRecipe = (recipeId: string, updater: (recipe: FavoriteRecipeRecord) => FavoriteRecipeRecord) => {
    setDraftFavorites((current) => current.map((recipe) => (recipe.recipeId === recipeId ? updater(recipe) : recipe)));
  };

  const addFavoriteStep = (recipeId: string) => {
    updateFavoriteRecipe(recipeId, (recipe) => ({
      ...recipe,
      steps: [...recipe.steps, ""],
    }));
  };

  const removeFavoriteStep = (recipeId: string, stepIndex: number) => {
    updateFavoriteRecipe(recipeId, (recipe) => ({
      ...recipe,
      steps: recipe.steps.filter((_, index) => index !== stepIndex),
    }));
  };

  const removeFavoriteFromDraft = (recipeId: string) => {
    setDraftFavorites((current) => current.filter((recipe) => recipe.recipeId !== recipeId));
  };

  const handleSave = async () => {
    setNotice("");

    if (!isGuest && clerkUser && !userId) {
      setNotice("Your account is still syncing. Try again in a moment.");
      return;
    }

    setIsSaving(true);

    try {
      await saveUserPreferences(draftPreferences);
      setGuestPreferences(draftPreferences);

      const removedRecipeIds = favorites
        .filter((recipe) => !draftFavorites.some((draft) => draft.recipeId === recipe.recipeId))
        .map((recipe) => recipe.recipeId);

      await Promise.all(removedRecipeIds.map((recipeId) => removeFavoriteRecipe(recipeId)));
      await Promise.all(
        draftFavorites.map((recipe) =>
          saveFavoriteRecipe({
            recipeId: recipe.recipeId,
            title: recipe.title,
            estimatedCookTime: recipe.estimatedCookTime,
            ingredients: recipe.ingredients,
            steps: recipe.steps,
          }),
        ),
      );

      router.push("/");
    } catch (error) {
      console.error("Failed to save profile", error);
      setNotice(error instanceof Error ? error.message : "Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push("/");
  };

  if (!isLoggedIn && !isGuest) {
    // Redirect is in-progress via useEffect above — render nothing
    return null;
  }

  if (isLoadingUserData) {
    return (
      <div className="min-h-screen bg-[linear-gradient(135deg,#f8fafc_0%,#f1f5f9_100%)] px-5 py-12">
        <div className="mx-auto max-w-2xl rounded-[28px] border border-white/70 bg-white p-8 text-slate-600 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          Loading your profile...
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          background: "white",
          borderRadius: "24px",
          padding: "40px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          animation: "fadeInUp 0.6s ease-out",
        }}
      >
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
            <Image
              src="/snapchef-logo.png"
              alt="SnapChef logo"
              width={44}
              height={44}
              style={{ borderRadius: "12px", objectFit: "cover", flexShrink: 0 }}
              priority
            />
            <h1 style={{ fontSize: "1.6rem", fontWeight: 700, color: "#1f2937", margin: 0 }}>Edit Profile</h1>
          </div>
          <p style={{ color: "#6b7280", margin: 0, fontSize: "0.9rem" }}>
            Update your dietary preferences and synced favorites.
          </p>
        </div>

        {(notice || syncError) && (
          <div
            style={{
              marginBottom: "24px",
              padding: "14px 16px",
              borderRadius: "16px",
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              color: "#1d4ed8",
              fontSize: "0.9rem",
            }}
          >
            {notice || syncError}
          </div>
        )}

        {isGuest && (
          <div
            style={{
              marginBottom: "24px",
              padding: "14px 16px",
              borderRadius: "16px",
              background: "#fffbeb",
              border: "1px solid #fde68a",
              color: "#92400e",
              fontSize: "0.9rem",
            }}
          >
            Guest mode is active. Changes here stay in memory only until you sign in.
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
              Age
            </label>
            <input
              type="number"
              min="0"
              value={draftPreferences.age}
              onChange={(event) => updatePreferences({ age: Number(event.target.value) })}
              placeholder="Enter your age"
              style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "1rem", outline: "none" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
              Allergies
            </label>
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              <input
                value={newAllergy}
                onChange={(event) => setNewAllergy(event.target.value)}
                placeholder="Add allergy (e.g., nuts)"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addAllergy();
                  }
                }}
                style={{ flex: 1, padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "1rem", outline: "none" }}
              />
              <button
                onClick={addAllergy}
                disabled={!newAllergy.trim()}
                style={{ padding: "12px 20px", borderRadius: "12px", background: !newAllergy.trim() ? "#d1d5db" : "#22c55e", color: "white", fontWeight: "600", border: "none", cursor: !newAllergy.trim() ? "not-allowed" : "pointer" }}
              >
                Add
              </button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {draftPreferences.allergies.map((allergy, index) => (
                <span key={`${allergy}-${index}`} style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#fee2e2", color: "#991b1b", padding: "6px 12px", borderRadius: "999px", fontSize: "0.9rem" }}>
                  {allergy}
                  <button onClick={() => removeAllergy(index)} style={{ border: "none", background: "transparent", cursor: "pointer", color: "#991b1b", fontSize: "1.2rem", lineHeight: "1" }}>
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
              Religious Restrictions
            </label>
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              <input
                value={newReligiousRestriction}
                onChange={(event) => setNewReligiousRestriction(event.target.value)}
                placeholder="Add restriction (e.g., halal)"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addReligiousRestriction();
                  }
                }}
                style={{ flex: 1, padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "1rem", outline: "none" }}
              />
              <button
                onClick={addReligiousRestriction}
                disabled={!newReligiousRestriction.trim()}
                style={{ padding: "12px 20px", borderRadius: "12px", background: !newReligiousRestriction.trim() ? "#d1d5db" : "#22c55e", color: "white", fontWeight: "600", border: "none", cursor: !newReligiousRestriction.trim() ? "not-allowed" : "pointer" }}
              >
                Add
              </button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {draftPreferences.religious.map((restriction, index) => (
                <span key={`${restriction}-${index}`} style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#dbeafe", color: "#1e3a8a", padding: "6px 12px", borderRadius: "999px", fontSize: "0.9rem" }}>
                  {restriction}
                  <button onClick={() => removeReligiousRestriction(index)} style={{ border: "none", background: "transparent", cursor: "pointer", color: "#1e3a8a", fontSize: "1.2rem", lineHeight: "1" }}>
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
              Medical Restrictions
            </label>
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              <input
                value={newMedicalRestriction}
                onChange={(event) => setNewMedicalRestriction(event.target.value)}
                placeholder="Add restriction (e.g., low sodium)"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addMedicalRestriction();
                  }
                }}
                style={{ flex: 1, padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "1rem", outline: "none" }}
              />
              <button
                onClick={addMedicalRestriction}
                disabled={!newMedicalRestriction.trim()}
                style={{ padding: "12px 20px", borderRadius: "12px", background: !newMedicalRestriction.trim() ? "#d1d5db" : "#22c55e", color: "white", fontWeight: "600", border: "none", cursor: !newMedicalRestriction.trim() ? "not-allowed" : "pointer" }}
              >
                Add
              </button>
            </div>
            {draftPreferences.medical && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#fef3c7", color: "#92400e", padding: "6px 12px", borderRadius: "999px", fontSize: "0.9rem" }}>
                  {draftPreferences.medical}
                  <button onClick={clearMedicalRestriction} style={{ border: "none", background: "transparent", cursor: "pointer", color: "#92400e", fontSize: "1.2rem", lineHeight: "1" }}>
                    ×
                  </button>
                </span>
              </div>
            )}
          </div>

          <div style={{ padding: "24px", borderRadius: "20px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
            <div style={{ marginBottom: "16px" }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#1f2937", margin: "0 0 6px 0" }}>Favorites</h2>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "#6b7280" }}>
                Saved recipes sync through your backend account and can be edited here.
              </p>
            </div>

            {draftFavorites.length === 0 ? (
              <div style={{ padding: "18px", borderRadius: "14px", background: "white", border: "1px dashed #cbd5e1", color: "#64748b" }}>
                Heart a recipe from the main page and it will appear here.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {draftFavorites.map((recipe) => (
                  <div key={recipe.recipeId} style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "18px", padding: "18px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "14px" }}>
                      <div>
                        <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#16a34a", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                          Saved Recipe
                        </div>
                        <div style={{ fontSize: "0.82rem", color: "#6b7280", marginTop: "2px" }}>
                          Saved {new Date(recipe.savedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        onClick={() => removeFavoriteFromDraft(recipe.recipeId)}
                        style={{ border: "none", background: "#fff1f2", color: "#be123c", borderRadius: "999px", padding: "8px 12px", cursor: "pointer", fontWeight: 600 }}
                      >
                        Remove
                      </button>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 180px", gap: "12px", marginBottom: "14px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#6b7280", marginBottom: "6px" }}>
                          Recipe Title
                        </label>
                        <input
                          value={recipe.title}
                          onChange={(event) => updateFavoriteRecipe(recipe.recipeId, (current) => ({ ...current, title: event.target.value }))}
                          style={{ width: "100%", padding: "11px 14px", border: "1px solid #d1d5db", borderRadius: "12px", fontSize: "0.95rem", outline: "none" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#6b7280", marginBottom: "6px" }}>
                          Cook Time
                        </label>
                        <input
                          value={recipe.estimatedCookTime ?? ""}
                          onChange={(event) => updateFavoriteRecipe(recipe.recipeId, (current) => ({ ...current, estimatedCookTime: event.target.value }))}
                          style={{ width: "100%", padding: "11px 14px", border: "1px solid #d1d5db", borderRadius: "12px", fontSize: "0.95rem", outline: "none" }}
                        />
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {recipe.steps.map((step, stepIndex) => (
                        <div key={`${recipe.recipeId}-${stepIndex}`} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                          <textarea
                            value={step}
                            onChange={(event) => updateFavoriteRecipe(recipe.recipeId, (current) => ({
                              ...current,
                              steps: current.steps.map((currentStep, index) => (index === stepIndex ? event.target.value : currentStep)),
                            }))}
                            rows={2}
                            style={{ flex: 1, padding: "12px 14px", border: "1px solid #d1d5db", borderRadius: "12px", fontSize: "0.95rem", resize: "vertical", outline: "none" }}
                          />
                          <button
                            onClick={() => removeFavoriteStep(recipe.recipeId, stepIndex)}
                            disabled={recipe.steps.length <= 1}
                            style={{ border: "none", background: recipe.steps.length <= 1 ? "#e5e7eb" : "#f3f4f6", color: "#374151", borderRadius: "12px", padding: "10px 12px", cursor: recipe.steps.length <= 1 ? "not-allowed" : "pointer" }}
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => addFavoriteStep(recipe.recipeId)}
                      style={{ marginTop: "12px", border: "none", background: "#ecfdf5", color: "#166534", borderRadius: "12px", padding: "10px 14px", cursor: "pointer", fontWeight: 600 }}
                    >
                      Add Step
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "16px", marginTop: "32px" }}>
            <button
              onClick={handleCancel}
              style={{ flex: 1, background: "#f3f4f6", color: "#374151", fontSize: "1rem", fontWeight: "600", padding: "16px 24px", border: "none", borderRadius: "16px", cursor: "pointer" }}
            >
              Cancel
            </button>
            <button
              onClick={() => requireAuth(handleSave)}
              disabled={isSaving}
              style={{ flex: 1, background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "white", fontSize: "1rem", fontWeight: "600", padding: "16px 24px", border: "none", borderRadius: "16px", cursor: isSaving ? "progress" : "pointer", boxShadow: "0 4px 16px rgba(34, 197, 94, 0.3)" }}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
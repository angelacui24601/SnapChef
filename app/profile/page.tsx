"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSnapChefAuth } from "../../components/auth/AuthProvider";
import type { FavoriteRecipeRecord, UserPreferencesRecord } from "../../lib/services/backendApi";

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

// ── helpers ──────────────────────────────────────────────────────────────────

const CHIP_COLORS: Record<string, { bg: string; text: string }> = {
  green:  { bg: "#dcfce7", text: "#166534" },
  red:    { bg: "#fee2e2", text: "#991b1b" },
  blue:   { bg: "#dbeafe", text: "#1e3a8a" },
  amber:  { bg: "#fef3c7", text: "#92400e" },
  purple: { bg: "#f3e8ff", text: "#6b21a8" },
  slate:  { bg: "#f1f5f9", text: "#475569" },
};

function Chip({ label, color = "slate" }: { label: string; color?: string }) {
  const { bg, text } = CHIP_COLORS[color] ?? CHIP_COLORS.slate;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "4px 10px", borderRadius: "999px", fontSize: "0.78rem", fontWeight: 600, background: bg, color: text, whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

function RemovableChip({ label, color, onRemove }: { label: string; color: string; onRemove: () => void }) {
  const { bg, text } = CHIP_COLORS[color] ?? CHIP_COLORS.slate;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: bg, color: text, padding: "4px 10px", borderRadius: "999px", fontSize: "0.82rem", fontWeight: 600 }}>
      {label}
      <button onClick={onRemove} style={{ border: "none", background: "transparent", cursor: "pointer", color: text, fontSize: "1.1rem", lineHeight: 1, padding: 0 }}>×</button>
    </span>
  );
}

function RecipeCard({ recipe, onRemove }: { recipe: FavoriteRecipeRecord; onRemove: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const MAX_INGREDIENTS = 5;
  return (
    <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "20px", padding: "20px", display: "flex", flexDirection: "column", gap: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
      {/* header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#1f2937", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={recipe.title}>
            {recipe.title}
          </h3>
          {recipe.estimatedCookTime && (
            <span style={{ marginTop: "4px", display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", color: "#6b7280", fontWeight: 500 }}>
              ⏱ {recipe.estimatedCookTime}
            </span>
          )}
        </div>
        <button onClick={() => onRemove(recipe.recipeId)} title="Remove" style={{ border: "none", background: "#fff1f2", color: "#be123c", borderRadius: "999px", width: "28px", height: "28px", cursor: "pointer", fontSize: "1rem", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          ×
        </button>
      </div>
      {/* ingredients */}
      {recipe.ingredients && recipe.ingredients.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
          {recipe.ingredients.slice(0, MAX_INGREDIENTS).map((ing, i) => <Chip key={i} label={ing} color="green" />)}
          {recipe.ingredients.length > MAX_INGREDIENTS && <Chip label={`+${recipe.ingredients.length - MAX_INGREDIENTS} more`} color="slate" />}
        </div>
      )}
      {/* steps toggle */}
      {recipe.steps && recipe.steps.length > 0 && (
        <div>
          <button onClick={() => setExpanded(v => !v)} style={{ border: "none", background: "none", padding: 0, cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, color: "#16a34a", display: "flex", alignItems: "center", gap: "4px" }}>
            {expanded ? "▲ Hide steps" : `▼ ${recipe.steps.length} steps`}
          </button>
          {expanded && (
            <ol style={{ margin: "8px 0 0 0", paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "6px" }}>
              {recipe.steps.map((step, i) => <li key={i} style={{ fontSize: "0.82rem", color: "#374151", lineHeight: 1.5 }}>{step}</li>)}
            </ol>
          )}
        </div>
      )}
      <div style={{ marginTop: "auto", fontSize: "0.73rem", color: "#9ca3af" }}>Saved {new Date(recipe.savedAt).toLocaleDateString()}</div>
    </div>
  );
}

const sharedInputStyle: React.CSSProperties = { width: "100%", padding: "11px 14px", border: "1.5px solid #e5e7eb", borderRadius: "12px", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" };
const sharedLabelStyle: React.CSSProperties = { display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#374151", marginBottom: "6px" };
const sharedChipsRowStyle: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: "6px" };
const addBtnStyle = (disabled: boolean): React.CSSProperties => ({ padding: "11px 18px", borderRadius: "12px", background: disabled ? "#d1d5db" : "#22c55e", color: "white", fontWeight: 700, border: "none", cursor: disabled ? "not-allowed" : "pointer", fontSize: "0.88rem", flexShrink: 0 });

// ── page ─────────────────────────────────────────────────────────────────────

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
  } = useSnapChefAuth();
  const [isEditing, setIsEditing] = useState(false);
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

      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save profile", error);
      setNotice(error instanceof Error ? error.message : "Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setDraftPreferences(preferences ?? EMPTY_PREFERENCES);
    setDraftFavorites(favorites);
    setNotice("");
  };

  if (!isLoggedIn && !isGuest) {
    // Redirect is in-progress via useEffect above — render nothing
    return null;
  }

  if (isLoadingUserData) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f8fafc 0%, #ecfdf5 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontSize: "0.95rem" }}>
        Loading profile…
      </div>
    );
  }

  // derived display values
  const displayName = clerkUser?.fullName ?? (clerkUser as { username?: string } | null)?.username ?? (isGuest ? "Guest" : "You");
  const displayEmail = clerkUser?.email ?? "";
  const avatarUrl = clerkUser?.imageUrl;
  const initials = displayName.split(" ").map((w: string) => w[0] ?? "").join("").toUpperCase().slice(0, 2);
  const activePrefs = preferences ?? EMPTY_PREFERENCES;
  const hasPrefs = activePrefs.goal || activePrefs.allergies.length > 0 || activePrefs.religious.length > 0 || activePrefs.medical || activePrefs.kitchenTools.length > 0 || activePrefs.age > 0;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f8fafc 0%, #ecfdf5 100%)" }}>

      {/* ── TOP NAVBAR ── */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "white", borderBottom: "1px solid #e5e7eb", padding: "0 24px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Brand logo — mirrors the main page navbar */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Image
              src="/snapchef-logo.png"
              alt="SnapChef logo"
              width={36}
              height={36}
              style={{ borderRadius: "10px", objectFit: "cover" }}
              priority
            />
            <span style={{ fontSize: "1.15rem", fontWeight: 700, color: "#1f2937" }}>SnapChef</span>
          </div>
          {/* Back to main app */}
          <button
            onClick={() => router.push("/")}
            style={{ display: "flex", alignItems: "center", gap: "6px", border: "1px solid #e5e7eb", background: "#f8fafc", borderRadius: "999px", padding: "7px 14px", cursor: "pointer", fontSize: "0.83rem", fontWeight: 600, color: "#374151", transition: "background 0.15s, border-color 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.borderColor = "#cbd5e1"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#e5e7eb"; }}
          >
            ← Home
          </button>
        </div>
      </header>

      {/* ── PROFILE BANNER ── */}
      <div style={{ width: "100%", background: "white", borderBottom: "1px solid #e5e7eb", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>

        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px 32px", display: "flex", alignItems: "center", gap: "28px", flexWrap: "wrap" }}>

          {/* avatar */}
          <div style={{ flexShrink: 0 }}>
            {avatarUrl ? (
              <Image src={avatarUrl} alt="Profile photo" width={80} height={80} style={{ borderRadius: "50%", objectFit: "cover", border: "3px solid #d1fae5", boxShadow: "0 4px 14px rgba(34,197,94,0.18)" }} />
            ) : (
              <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "linear-gradient(135deg, #4ade80, #16a34a)", display: "flex", alignItems: "center", justifyContent: "center", border: "3px solid #d1fae5", boxShadow: "0 4px 14px rgba(34,197,94,0.18)", flexShrink: 0 }}>
                <span style={{ fontSize: "1.6rem", fontWeight: 800, color: "white" }}>{initials || "?"}</span>
              </div>
            )}
          </div>

          {/* name / email */}
          <div style={{ flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "#111827" }}>{displayName}</h1>
              {isGuest && <span style={{ fontSize: "0.72rem", fontWeight: 700, background: "#fef3c7", color: "#92400e", padding: "2px 8px", borderRadius: "999px" }}>Guest</span>}
            </div>
            {displayEmail && <p style={{ margin: "2px 0 0 0", fontSize: "0.85rem", color: "#6b7280" }}>{displayEmail}</p>}
            <p style={{ margin: "4px 0 0 0", fontSize: "0.8rem", color: "#9ca3af" }}>{favorites.length} saved recipe{favorites.length !== 1 ? "s" : ""}</p>
          </div>

          {/* divider */}
          <div style={{ width: "1px", height: "56px", background: "#e5e7eb", flexShrink: 0 }} />

          {/* preferences chips */}
          <div style={{ flex: 1, minWidth: "200px" }}>
            <p style={{ margin: "0 0 8px 0", fontSize: "0.72rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em" }}>Dietary Profile</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {activePrefs.age > 0 && <Chip label={`Age ${activePrefs.age}`} color="slate" />}
              {activePrefs.goal && activePrefs.goal !== "other" && <Chip label={activePrefs.goal} color="green" />}
              {activePrefs.goal === "other" && activePrefs.customGoal && <Chip label={activePrefs.customGoal} color="green" />}
              {activePrefs.allergies.map(a => <Chip key={a} label={a} color="red" />)}
              {activePrefs.religious.map(r => <Chip key={r} label={r} color="blue" />)}
              {activePrefs.medical && <Chip label={activePrefs.medical} color="amber" />}
              {activePrefs.kitchenTools.map(t => <Chip key={t} label={t} color="purple" />)}
              {!hasPrefs && <span style={{ fontSize: "0.82rem", color: "#d1d5db", fontStyle: "italic" }}>No dietary preferences set</span>}
            </div>
          </div>

          {/* edit toggle */}
          <button
            onClick={() => { setIsEditing(v => !v); setNotice(""); }}
            style={{ flexShrink: 0, padding: "10px 20px", borderRadius: "14px", border: isEditing ? "2px solid #86efac" : "2px solid #e5e7eb", background: isEditing ? "#f0fdf4" : "white", color: isEditing ? "#166534" : "#374151", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer" }}
          >
            {isEditing ? "✕ Cancel Edit" : "✏ Edit Preferences"}
          </button>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px" }}>

        {/* alerts */}
        {notice && (
          <div style={{ marginBottom: "20px", padding: "14px 16px", borderRadius: "14px", background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1d4ed8", fontSize: "0.88rem" }}>
            {notice}
          </div>
        )}
        {isGuest && (
          <div style={{ marginBottom: "20px", padding: "14px 16px", borderRadius: "14px", background: "#fffbeb", border: "1px solid #fde68a", color: "#92400e", fontSize: "0.88rem" }}>
            Guest mode — changes stay in memory until you sign in.
          </div>
        )}

        {isEditing ? (
          /* ── EDIT FORM ── */
          <div style={{ background: "white", borderRadius: "24px", padding: "32px", boxShadow: "0 4px 24px rgba(0,0,0,0.07)", border: "1px solid #e5e7eb" }}>
            <h2 style={{ margin: "0 0 24px 0", fontSize: "1.15rem", fontWeight: 700, color: "#1f2937" }}>Edit Preferences</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>

              {/* age */}
              <div>
                <label style={sharedLabelStyle}>Age</label>
                <input type="number" min="0" value={draftPreferences.age} onChange={e => updatePreferences({ age: Number(e.target.value) })} placeholder="Enter your age" style={sharedInputStyle} />
              </div>

              {/* allergies */}
              <div>
                <label style={sharedLabelStyle}>Allergies</label>
                <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                  <input value={newAllergy} onChange={e => setNewAllergy(e.target.value)} placeholder="Add allergy (e.g., nuts)" onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addAllergy(); } }} style={{ ...sharedInputStyle, flex: 1 }} />
                  <button onClick={addAllergy} disabled={!newAllergy.trim()} style={addBtnStyle(!newAllergy.trim())}>Add</button>
                </div>
                <div style={sharedChipsRowStyle}>
                  {draftPreferences.allergies.map((a, i) => <RemovableChip key={`${a}-${i}`} label={a} color="red" onRemove={() => removeAllergy(i)} />)}
                </div>
              </div>

              {/* religious restrictions */}
              <div>
                <label style={sharedLabelStyle}>Religious Restrictions</label>
                <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                  <input value={newReligiousRestriction} onChange={e => setNewReligiousRestriction(e.target.value)} placeholder="Add restriction (e.g., halal)" onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addReligiousRestriction(); } }} style={{ ...sharedInputStyle, flex: 1 }} />
                  <button onClick={addReligiousRestriction} disabled={!newReligiousRestriction.trim()} style={addBtnStyle(!newReligiousRestriction.trim())}>Add</button>
                </div>
                <div style={sharedChipsRowStyle}>
                  {draftPreferences.religious.map((r, i) => <RemovableChip key={`${r}-${i}`} label={r} color="blue" onRemove={() => removeReligiousRestriction(i)} />)}
                </div>
              </div>

              {/* medical */}
              <div>
                <label style={sharedLabelStyle}>Medical Restriction</label>
                <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                  <input value={newMedicalRestriction} onChange={e => setNewMedicalRestriction(e.target.value)} placeholder="Add restriction (e.g., low sodium)" onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addMedicalRestriction(); } }} style={{ ...sharedInputStyle, flex: 1 }} />
                  <button onClick={addMedicalRestriction} disabled={!newMedicalRestriction.trim()} style={addBtnStyle(!newMedicalRestriction.trim())}>Add</button>
                </div>
                {draftPreferences.medical && (
                  <div style={sharedChipsRowStyle}>
                    <RemovableChip label={draftPreferences.medical} color="amber" onRemove={clearMedicalRestriction} />
                  </div>
                )}
              </div>

              {/* saved recipes editor */}
              <div style={{ padding: "20px", borderRadius: "18px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <h3 style={{ margin: "0 0 14px 0", fontSize: "1rem", fontWeight: 700, color: "#1f2937" }}>Saved Recipes</h3>
                {draftFavorites.length === 0 ? (
                  <div style={{ padding: "16px", borderRadius: "12px", background: "white", border: "1px dashed #cbd5e1", color: "#94a3b8", fontSize: "0.88rem" }}>No saved recipes yet.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {draftFavorites.map(recipe => (
                      <div key={recipe.recipeId} style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "16px", padding: "16px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "12px" }}>
                          <div>
                            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#16a34a", textTransform: "uppercase", letterSpacing: "0.08em" }}>Saved Recipe</div>
                            <div style={{ fontSize: "0.78rem", color: "#6b7280", marginTop: "2px" }}>Saved {new Date(recipe.savedAt).toLocaleDateString()}</div>
                          </div>
                          <button onClick={() => removeFavoriteFromDraft(recipe.recipeId)} style={{ border: "none", background: "#fff1f2", color: "#be123c", borderRadius: "999px", padding: "6px 12px", cursor: "pointer", fontWeight: 600, fontSize: "0.82rem" }}>Remove</button>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 160px", gap: "10px", marginBottom: "12px" }}>
                          <div>
                            <label style={sharedLabelStyle}>Title</label>
                            <input value={recipe.title} onChange={e => updateFavoriteRecipe(recipe.recipeId, r => ({ ...r, title: e.target.value }))} style={sharedInputStyle} />
                          </div>
                          <div>
                            <label style={sharedLabelStyle}>Cook Time</label>
                            <input value={recipe.estimatedCookTime ?? ""} onChange={e => updateFavoriteRecipe(recipe.recipeId, r => ({ ...r, estimatedCookTime: e.target.value }))} style={sharedInputStyle} />
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          {recipe.steps.map((step, si) => (
                            <div key={`${recipe.recipeId}-${si}`} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                              <textarea value={step} onChange={e => updateFavoriteRecipe(recipe.recipeId, r => ({ ...r, steps: r.steps.map((s, idx) => idx === si ? e.target.value : s) }))} rows={2} style={{ ...sharedInputStyle, flex: 1, resize: "vertical" }} />
                              <button onClick={() => removeFavoriteStep(recipe.recipeId, si)} disabled={recipe.steps.length <= 1} style={{ border: "none", background: recipe.steps.length <= 1 ? "#e5e7eb" : "#f3f4f6", color: "#374151", borderRadius: "10px", padding: "8px 10px", cursor: recipe.steps.length <= 1 ? "not-allowed" : "pointer", fontSize: "0.82rem" }}>×</button>
                            </div>
                          ))}
                        </div>
                        <button onClick={() => addFavoriteStep(recipe.recipeId)} style={{ marginTop: "10px", border: "none", background: "#ecfdf5", color: "#166534", borderRadius: "10px", padding: "8px 14px", cursor: "pointer", fontWeight: 600, fontSize: "0.82rem" }}>+ Add Step</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* save / cancel */}
              <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                <button onClick={handleCancel} style={{ flex: 1, background: "#f3f4f6", color: "#374151", fontSize: "0.95rem", fontWeight: 700, padding: "14px 20px", border: "none", borderRadius: "14px", cursor: "pointer" }}>
                  Cancel
                </button>
                <button onClick={() => requireAuth(handleSave)} disabled={isSaving} style={{ flex: 1, background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "white", fontSize: "0.95rem", fontWeight: 700, padding: "14px 20px", border: "none", borderRadius: "14px", cursor: isSaving ? "progress" : "pointer", boxShadow: "0 4px 14px rgba(34,197,94,0.3)" }}>
                  {isSaving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ── FAVORITES GRID ── */
          <section>
            <h2 style={{ margin: "0 0 20px 0", fontSize: "1.2rem", fontWeight: 800, color: "#1f2937", display: "flex", alignItems: "center", gap: "8px" }}>
              ❤ Saved Recipes
              <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#9ca3af", background: "#f3f4f6", padding: "2px 8px", borderRadius: "999px" }}>{favorites.length}</span>
            </h2>
            {favorites.length === 0 ? (
              <div style={{ padding: "48px 32px", borderRadius: "24px", background: "white", border: "1px dashed #d1d5db", textAlign: "center", color: "#9ca3af" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🍽</div>
                <p style={{ margin: 0, fontSize: "0.95rem", fontWeight: 500 }}>No saved recipes yet.</p>
                <p style={{ margin: "6px 0 0 0", fontSize: "0.85rem" }}>Heart a recipe on the main page and it will appear here.</p>
                <button onClick={() => router.push("/")} style={{ marginTop: "18px", border: "none", background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "white", fontWeight: 700, fontSize: "0.9rem", padding: "10px 24px", borderRadius: "12px", cursor: "pointer" }}>
                  Start cooking →
                </button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "18px" }}>
                {favorites.map(recipe => (
                  <RecipeCard key={recipe.recipeId} recipe={recipe} onRemove={id => removeFavoriteRecipe(id)} />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
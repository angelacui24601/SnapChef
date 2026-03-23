"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  getFavoritesUpdatedEventName,
  readFavoriteRecipes,
  type FavoriteRecipe,
  writeFavoriteRecipes,
} from "../../services/favorites";

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useUser();
  const [age, setAge] = useState(0);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [newAllergy, setNewAllergy] = useState("");
  const [religiousRestrictions, setReligiousRestrictions] = useState<string[]>([]);
  const [newReligiousRestriction, setNewReligiousRestriction] = useState("");
  const [medicalRestrictions, setMedicalRestrictions] = useState<string[]>([]);
  const [newMedicalRestriction, setNewMedicalRestriction] = useState("");
  const [favoriteRecipes, setFavoriteRecipes] = useState<FavoriteRecipe[]>([]);

  // Load existing profile
  useEffect(() => {
    const saved = localStorage.getItem("userProfile");
    if (saved) {
      try {
        const profile = JSON.parse(saved);
        setAge(profile.age || 0);
        setAllergies(profile.allergies || []);
        setReligiousRestrictions(profile.religiousRestrictions || []);
        setMedicalRestrictions(profile.medicalRestrictions || []);
      } catch (error) {
        console.warn("Failed to parse existing profile", error);
      }
    }
  }, []);

  useEffect(() => {
    if (!user?.id) {
      setFavoriteRecipes([]);
      return;
    }

    const loadFavorites = () => {
      setFavoriteRecipes(readFavoriteRecipes(user.id));
    };

    loadFavorites();
    window.addEventListener("storage", loadFavorites);
    window.addEventListener(getFavoritesUpdatedEventName(), loadFavorites);

    return () => {
      window.removeEventListener("storage", loadFavorites);
      window.removeEventListener(getFavoritesUpdatedEventName(), loadFavorites);
    };
  }, [user?.id]);

  const addAllergy = () => {
    const trimmed = newAllergy.trim();
    if (trimmed && !allergies.includes(trimmed)) {
      setAllergies([...allergies, trimmed]);
      setNewAllergy("");
    }
  };

  const removeAllergy = (index: number) => {
    setAllergies(allergies.filter((_, i) => i !== index));
  };

  const addReligiousRestriction = () => {
    const trimmed = newReligiousRestriction.trim();
    if (trimmed && !religiousRestrictions.includes(trimmed)) {
      setReligiousRestrictions([...religiousRestrictions, trimmed]);
      setNewReligiousRestriction("");
    }
  };

  const removeReligiousRestriction = (index: number) => {
    setReligiousRestrictions(religiousRestrictions.filter((_, i) => i !== index));
  };

  const addMedicalRestriction = () => {
    const trimmed = newMedicalRestriction.trim();
    if (trimmed && !medicalRestrictions.includes(trimmed)) {
      setMedicalRestrictions([...medicalRestrictions, trimmed]);
      setNewMedicalRestriction("");
    }
  };

  const removeMedicalRestriction = (index: number) => {
    setMedicalRestrictions(medicalRestrictions.filter((_, i) => i !== index));
  };

  const updateFavoriteRecipe = (recipeId: string, updater: (recipe: FavoriteRecipe) => FavoriteRecipe) => {
    setFavoriteRecipes((current) => current.map((recipe) => (recipe.id === recipeId ? updater(recipe) : recipe)));
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

  const removeFavoriteRecipe = (recipeId: string) => {
    setFavoriteRecipes((current) => current.filter((recipe) => recipe.id !== recipeId));
  };

  const handleSave = () => {
    const profile = {
      age,
      allergies,
      religiousRestrictions,
      medicalRestrictions,
    };

    localStorage.setItem("userProfile", JSON.stringify(profile));
    if (user?.id) {
      writeFavoriteRecipes(user.id, favoriteRecipes);
    }
    router.push("/");
  };

  const handleCancel = () => {
    router.push("/");
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        animation: 'fadeInUp 0.6s ease-out'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <Image
              src="/snapchef-logo.png"
              alt="SnapChef logo"
              width={44}
              height={44}
              style={{ borderRadius: '12px', objectFit: 'cover', flexShrink: 0 }}
              priority
            />
            <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1f2937', margin: 0 }}>
              Edit Profile
            </h1>
          </div>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '0.9rem' }}>
            Update your dietary preferences and restrictions
          </p>
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Age */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Age
            </label>
            <input
              type="number"
              min="0"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              placeholder="Enter your age"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '1rem',
                transition: 'border-color 0.3s ease',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#22c55e';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
            />
          </div>

          {/* Allergies */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Allergies
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                placeholder="Add allergy (e.g., nuts)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addAllergy();
                  }
                }}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  transition: 'border-color 0.3s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  (e.target as HTMLElement).style.borderColor = '#22c55e';
                }}
                onBlur={(e) => {
                  (e.target as HTMLElement).style.borderColor = '#e5e7eb';
                }}
              />
              <button
                onClick={addAllergy}
                disabled={!newAllergy.trim()}
                style={{
                  padding: '12px 20px',
                  borderRadius: '12px',
                  background: !newAllergy.trim() ? '#d1d5db' : '#22c55e',
                  color: 'white',
                  fontWeight: '600',
                  border: 'none',
                  cursor: !newAllergy.trim() ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Add
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {allergies.map((allergy, index) => (
                <span
                  key={`${allergy}-${index}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#fee2e2',
                    color: '#991b1b',
                    padding: '6px 12px',
                    borderRadius: '999px',
                    fontSize: '0.9rem'
                  }}
                >
                  {allergy}
                  <button
                    onClick={() => removeAllergy(index)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      color: '#991b1b',
                      fontSize: '1.2rem',
                      lineHeight: '1'
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Religious Restrictions */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Religious Restrictions
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input
                value={newReligiousRestriction}
                onChange={(e) => setNewReligiousRestriction(e.target.value)}
                placeholder="Add restriction (e.g., halal)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addReligiousRestriction();
                  }
                }}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  transition: 'border-color 0.3s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  (e.target as HTMLElement).style.borderColor = '#22c55e';
                }}
                onBlur={(e) => {
                  (e.target as HTMLElement).style.borderColor = '#e5e7eb';
                }}
              />
              <button
                onClick={addReligiousRestriction}
                disabled={!newReligiousRestriction.trim()}
                style={{
                  padding: '12px 20px',
                  borderRadius: '12px',
                  background: !newReligiousRestriction.trim() ? '#d1d5db' : '#22c55e',
                  color: 'white',
                  fontWeight: '600',
                  border: 'none',
                  cursor: !newReligiousRestriction.trim() ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Add
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {religiousRestrictions.map((restriction, index) => (
                <span
                  key={`${restriction}-${index}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#dbeafe',
                    color: '#1e3a8a',
                    padding: '6px 12px',
                    borderRadius: '999px',
                    fontSize: '0.9rem'
                  }}
                >
                  {restriction}
                  <button
                    onClick={() => removeReligiousRestriction(index)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      color: '#1e3a8a',
                      fontSize: '1.2rem',
                      lineHeight: '1'
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Medical Restrictions */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Medical Restrictions
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input
                value={newMedicalRestriction}
                onChange={(e) => setNewMedicalRestriction(e.target.value)}
                placeholder="Add restriction (e.g., low sodium)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addMedicalRestriction();
                  }
                }}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  transition: 'border-color 0.3s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  (e.target as HTMLElement).style.borderColor = '#22c55e';
                }}
                onBlur={(e) => {
                  (e.target as HTMLElement).style.borderColor = '#e5e7eb';
                }}
              />
              <button
                onClick={addMedicalRestriction}
                disabled={!newMedicalRestriction.trim()}
                style={{
                  padding: '12px 20px',
                  borderRadius: '12px',
                  background: !newMedicalRestriction.trim() ? '#d1d5db' : '#22c55e',
                  color: 'white',
                  fontWeight: '600',
                  border: 'none',
                  cursor: !newMedicalRestriction.trim() ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Add
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {medicalRestrictions.map((restriction, index) => (
                <span
                  key={`${restriction}-${index}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#fef3c7',
                    color: '#92400e',
                    padding: '6px 12px',
                    borderRadius: '999px',
                    fontSize: '0.9rem'
                  }}
                >
                  {restriction}
                  <button
                    onClick={() => removeMedicalRestriction(index)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      color: '#92400e',
                      fontSize: '1.2rem',
                      lineHeight: '1'
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div style={{ padding: '24px', borderRadius: '20px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1f2937', margin: '0 0 6px 0' }}>Favorites</h2>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#6b7280' }}>
                Saved recipes live here. This is the only place where you can edit recipe titles, cook times, and steps.
              </p>
            </div>

            {!user ? (
              <div style={{ padding: '18px', borderRadius: '14px', background: 'white', border: '1px dashed #cbd5e1', color: '#64748b' }}>
                Sign in to keep favorites tied to your account.
              </div>
            ) : favoriteRecipes.length === 0 ? (
              <div style={{ padding: '18px', borderRadius: '14px', background: 'white', border: '1px dashed #cbd5e1', color: '#64748b' }}>
                Heart a recipe from the main page and it will appear here.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {favoriteRecipes.map((recipe) => (
                  <div key={recipe.id} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '18px', padding: '18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '14px' }}>
                      <div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          {recipe.mealType}
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: '2px' }}>
                          Saved {new Date(recipe.savedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        onClick={() => removeFavoriteRecipe(recipe.id)}
                        style={{
                          border: 'none',
                          background: '#fff1f2',
                          color: '#be123c',
                          borderRadius: '999px',
                          padding: '8px 12px',
                          cursor: 'pointer',
                          fontWeight: 600,
                        }}
                      >
                        Remove
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 180px', gap: '12px', marginBottom: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#6b7280', marginBottom: '6px' }}>
                          Recipe Title
                        </label>
                        <input
                          value={recipe.title}
                          onChange={(e) => updateFavoriteRecipe(recipe.id, (current) => ({ ...current, title: e.target.value }))}
                          style={{ width: '100%', padding: '11px 14px', border: '1px solid #d1d5db', borderRadius: '12px', fontSize: '0.95rem', outline: 'none' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#6b7280', marginBottom: '6px' }}>
                          Cook Time
                        </label>
                        <input
                          value={recipe.estimatedCookTime ?? ''}
                          onChange={(e) => updateFavoriteRecipe(recipe.id, (current) => ({ ...current, estimatedCookTime: e.target.value }))}
                          style={{ width: '100%', padding: '11px 14px', border: '1px solid #d1d5db', borderRadius: '12px', fontSize: '0.95rem', outline: 'none' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {recipe.steps.map((step, stepIndex) => (
                        <div key={`${recipe.id}-${stepIndex}`} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                          <textarea
                            value={step}
                            onChange={(e) => updateFavoriteRecipe(recipe.id, (current) => ({
                              ...current,
                              steps: current.steps.map((currentStep, index) => index === stepIndex ? e.target.value : currentStep),
                            }))}
                            rows={2}
                            style={{ flex: 1, padding: '12px 14px', border: '1px solid #d1d5db', borderRadius: '12px', fontSize: '0.95rem', resize: 'vertical', outline: 'none' }}
                          />
                          <button
                            onClick={() => removeFavoriteStep(recipe.id, stepIndex)}
                            disabled={recipe.steps.length <= 1}
                            style={{
                              border: 'none',
                              background: recipe.steps.length <= 1 ? '#e5e7eb' : '#f3f4f6',
                              color: '#374151',
                              borderRadius: '12px',
                              padding: '10px 12px',
                              cursor: recipe.steps.length <= 1 ? 'not-allowed' : 'pointer',
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => addFavoriteStep(recipe.id)}
                      style={{
                        marginTop: '12px',
                        border: 'none',
                        background: '#ecfdf5',
                        color: '#166534',
                        borderRadius: '12px',
                        padding: '10px 14px',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      Add Step
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
            <button
              onClick={handleCancel}
              style={{
                flex: 1,
                background: '#f3f4f6',
                color: '#374151',
                fontSize: '1rem',
                fontWeight: '600',
                padding: '16px 24px',
                border: 'none',
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#e5e7eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f3f4f6';
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              style={{
                flex: 1,
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: 'white',
                fontSize: '1rem',
                fontWeight: '600',
                padding: '16px 24px',
                border: 'none',
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                boxShadow: '0 4px 16px rgba(34, 197, 94, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(34, 197, 94, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(34, 197, 94, 0.3)';
              }}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
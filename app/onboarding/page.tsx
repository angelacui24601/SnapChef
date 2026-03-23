"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const [age, setAge] = useState(0);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [newAllergy, setNewAllergy] = useState("");
  const [religiousRestrictions, setReligiousRestrictions] = useState<string[]>([]);
  const [newReligiousRestriction, setNewReligiousRestriction] = useState("");
  const [medicalRestrictions, setMedicalRestrictions] = useState<string[]>([]);
  const [newMedicalRestriction, setNewMedicalRestriction] = useState("");

  // Check if profile already exists
  useEffect(() => {
    const saved = localStorage.getItem("userProfile");
    if (saved) {
      try {
        const profile = JSON.parse(saved);
        if (profile.age || profile.allergies?.length || profile.religiousRestrictions?.length || profile.medicalRestrictions?.length) {
          router.push("/");
          return;
        }
      } catch (error) {
        console.warn("Failed to parse existing profile", error);
      }
    }
  }, [router]);

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

  const handleSubmit = () => {
    const profile = {
      age,
      allergies,
      religiousRestrictions,
      medicalRestrictions,
    };

    localStorage.setItem("userProfile", JSON.stringify(profile));
    router.push("/");
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '600px',
        width: '100%',
        background: 'white',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        animation: 'fadeInUp 0.6s ease-out'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 8px 32px rgba(34, 197, 94, 0.2)'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"/>
            </svg>
          </div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '8px',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Welcome to SnapChef
          </h1>
          <p style={{
            fontSize: '1.1rem',
            color: '#6b7280',
            marginBottom: '0'
          }}>
            Let's personalize your cooking experience
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
              Age (optional)
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
              Allergies (optional)
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
              Religious Restrictions (optional)
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
              Medical Restrictions (optional)
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

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: 'white',
              fontSize: '1.1rem',
              fontWeight: '600',
              padding: '16px 24px',
              border: 'none',
              borderRadius: '16px',
              cursor: 'pointer',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              boxShadow: '0 4px 16px rgba(34, 197, 94, 0.3)',
              marginTop: '16px'
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
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}
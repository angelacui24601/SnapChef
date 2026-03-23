"use client";

import { useState } from "react";
import type { OnboardingProfile } from "../../app/onboarding/page";

const DIETARY_OPTIONS = [
  "Halal",
  "Kosher",
  "Vegetarian",
  "Vegan",
  "Pescatarian",
  "Gluten-free",
  "Dairy-free",
  "Nut-free",
];

interface Props {
  profile: OnboardingProfile;
  update: (fields: Partial<OnboardingProfile>) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export default function StepDietaryNeeds({ profile, update, onNext, onBack, onSkip }: Props) {
  const [newAllergy, setNewAllergy] = useState("");

  const addAllergy = () => {
    const trimmed = newAllergy.trim();
    if (trimmed && !profile.allergies.includes(trimmed)) {
      update({ allergies: [...profile.allergies, trimmed] });
      setNewAllergy("");
    }
  };

  const removeAllergy = (i: number) => {
    update({ allergies: profile.allergies.filter((_, idx) => idx !== i) });
  };

  const toggleDietary = (opt: string) => {
    const val = opt.toLowerCase();
    const exists = profile.religious.includes(val);
    update({
      religious: exists
        ? profile.religious.filter((r) => r !== val)
        : [...profile.religious, val],
    });
  };

  return (
    <div>
      <h1 className="text-[1.6rem] font-bold text-gray-900 mb-1">Any dietary needs?</h1>
      <p className="text-sm text-gray-400 mb-8">All optional — you can skip this step</p>

      <div className="space-y-6">
        {/* Allergies */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Allergies</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. peanuts, shellfish"
              value={newAllergy}
              onChange={(e) => setNewAllergy(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addAllergy();
                }
              }}
              className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 transition-colors"
            />
            <button
              onClick={addAllergy}
              disabled={!newAllergy.trim()}
              className="px-4 py-2.5 bg-green-500 disabled:bg-gray-100 text-white disabled:text-gray-400 rounded-xl text-sm font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
          {profile.allergies.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {profile.allergies.map((a, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium border border-red-100"
                >
                  {a}
                  <button
                    onClick={() => removeAllergy(i)}
                    className="ml-0.5 hover:text-red-900 leading-none"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Medical restrictions */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Medical Restrictions
          </label>
          <input
            type="text"
            placeholder="e.g. low sodium, diabetic diet"
            value={profile.medical}
            onChange={(e) => update({ medical: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 transition-colors"
          />
        </div>

        {/* Dietary preferences */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Dietary Preferences
          </label>
          <div className="flex flex-wrap gap-2">
            {DIETARY_OPTIONS.map((opt) => {
              const active = profile.religious.includes(opt.toLowerCase());
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleDietary(opt)}
                  className={`px-3.5 py-2 rounded-xl border-2 text-xs font-semibold transition-all ${
                    active
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2.5 mt-8">
        <button
          onClick={onBack}
          className="px-5 py-3 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:border-gray-300 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-semibold transition-colors"
        >
          Next →
        </button>
        <button
          onClick={onSkip}
          className="px-5 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
        >
          Skip
        </button>
      </div>
    </div>
  );
}

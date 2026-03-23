"use client";

import type { OnboardingProfile } from "../../app/onboarding/page";

const GOALS = [
  { value: "weight-loss", label: "Weight Loss" },
  { value: "budget", label: "Budget-Friendly" },
  { value: "nutrition", label: "Maximize Nutrition" },
  { value: "custom", label: "Custom" },
];

const SEX_OPTIONS = ["Male", "Female", "Other"];

interface Props {
  profile: OnboardingProfile;
  update: (fields: Partial<OnboardingProfile>) => void;
  onNext: () => void;
}

export default function StepBasicInfo({ profile, update, onNext }: Props) {
  const isValid =
    profile.age !== "" &&
    Number(profile.age) > 0 &&
    profile.sex !== "" &&
    profile.goal !== "" &&
    (profile.goal !== "custom" || profile.customGoal.trim() !== "");

  return (
    <div>
      <h1 className="text-[1.6rem] font-bold text-gray-900 mb-1">Tell us about you</h1>
      <p className="text-sm text-gray-400 mb-8">Help us personalize your cooking experience</p>

      <div className="space-y-6">
        {/* Age */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Age</label>
          <input
            type="number"
            min={1}
            max={120}
            placeholder="e.g. 28"
            value={profile.age}
            onChange={(e) =>
              update({ age: e.target.value === "" ? "" : Number(e.target.value) })
            }
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 transition-colors"
          />
          <p className="text-xs text-gray-400 mt-1.5">Used to estimate your daily calorie needs</p>
        </div>

        {/* Biological Sex */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Biological Sex</label>
          <div className="flex gap-2">
            {SEX_OPTIONS.map((opt) => {
              const val = opt.toLowerCase();
              const active = profile.sex === val;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => update({ sex: val })}
                  className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
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

        {/* Goal */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Your Goal</label>
          <div className="grid grid-cols-2 gap-2">
            {GOALS.map((g) => {
              const active = profile.goal === g.value;
              return (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => update({ goal: g.value })}
                  className={`py-3 px-4 rounded-xl border-2 text-sm font-medium text-left transition-all ${
                    active
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {g.label}
                </button>
              );
            })}
          </div>
          {profile.goal === "custom" && (
            <input
              type="text"
              placeholder="Describe your custom goal…"
              value={profile.customGoal}
              onChange={(e) => update({ customGoal: e.target.value })}
              className="mt-3 w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 transition-colors"
              autoFocus
            />
          )}
        </div>
      </div>

      {/* Next */}
      <button
        onClick={onNext}
        disabled={!isValid}
        className={`mt-8 w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${
          isValid
            ? "bg-green-500 hover:bg-green-600 text-white cursor-pointer"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        }`}
      >
        Next →
      </button>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSnapChefAuth } from "../../components/auth/AuthProvider";
import type { UserPreferencesRecord } from "../../services/backendApi";
import StepBasicInfo from "../../components/onboarding/StepBasicInfo";
import StepDietaryNeeds from "../../components/onboarding/StepDietaryNeeds";
import StepKitchenSetup from "../../components/onboarding/StepKitchenSetup";

export interface OnboardingProfile {
  age: number | "";
  sex: string;
  goal: string;
  customGoal: string;
  allergies: string[];
  medical: string;
  religious: string[];
  kitchenTools: string[];
  kitchenImage: string | null;
}

const STEPS = ["Basic Info", "Dietary Needs", "Kitchen Setup"];

const EMPTY_PROFILE: OnboardingProfile = {
  age: "",
  sex: "",
  goal: "",
  customGoal: "",
  allergies: [],
  medical: "",
  religious: [],
  kitchenTools: [],
  kitchenImage: null,
};

function hasSavedPreferences(preferences: UserPreferencesRecord | null) {
  if (!preferences) {
    return false;
  }

  return Boolean(
    preferences.age > 0 ||
    preferences.allergies.length > 0 ||
    preferences.religious.length > 0 ||
    preferences.medical.trim().length > 0 ||
    preferences.sex ||
    preferences.goal ||
    preferences.kitchenTools.length > 0 ||
    preferences.kitchenImage,
  );
}

function toOnboardingProfile(preferences: UserPreferencesRecord | null): OnboardingProfile {
  if (!preferences) {
    return EMPTY_PROFILE;
  }

  return {
    age: preferences.age || "",
    sex: preferences.sex,
    goal: preferences.goal,
    customGoal: preferences.customGoal,
    allergies: preferences.allergies,
    medical: preferences.medical,
    religious: preferences.religious,
    kitchenTools: preferences.kitchenTools,
    kitchenImage: preferences.kitchenImage,
  };
}

function toPreferenceRecord(profile: OnboardingProfile): UserPreferencesRecord {
  return {
    age: profile.age === "" ? 0 : Number(profile.age),
    sex: profile.sex,
    goal: profile.goal,
    customGoal: profile.customGoal,
    allergies: profile.allergies,
    medical: profile.medical,
    religious: profile.religious,
    kitchenTools: profile.kitchenTools,
    kitchenImage: profile.kitchenImage,
  };
}

export default function OnboardingPage() {
  const router = useRouter();
  const { isGuest, isLoadingUserData, isLoggedIn, openAuthModal, preferences, saveUserPreferences, setGuestPreferences, syncError } = useSnapChefAuth();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<OnboardingProfile>(EMPTY_PROFILE);
  const [submitError, setSubmitError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [awaitingAuth, setAwaitingAuth] = useState(false);

  useEffect(() => {
    if (!isLoadingUserData) {
      setProfile(toOnboardingProfile(preferences));
    }
  }, [isLoadingUserData, preferences]);

  useEffect(() => {
    if (!isLoadingUserData && hasSavedPreferences(preferences)) {
      router.push("/");
    }
  }, [isLoadingUserData, preferences, router]);

  const update = (fields: Partial<OnboardingProfile>) => {
    setProfile((prev) => ({ ...prev, ...fields }));
  };

  const performSave = useCallback(async () => {
    setIsSaving(true);
    setSubmitError("");

    try {
      const nextPreferences = toPreferenceRecord(profile);
      await saveUserPreferences(nextPreferences);
      setGuestPreferences(nextPreferences);
      router.push("/");
    } catch (error) {
      console.error("Failed to save onboarding preferences", error);
      setSubmitError(error instanceof Error ? error.message : "Failed to save preferences.");
    } finally {
      setIsSaving(false);
    }
  }, [profile, saveUserPreferences, setGuestPreferences, router]);

  // When the user authenticates (or continues as guest) after we showed the
  // auth modal from the final onboarding step, complete the save.
  useEffect(() => {
    if (awaitingAuth && (isLoggedIn || isGuest)) {
      setAwaitingAuth(false);
      void performSave();
    }
  }, [awaitingAuth, isLoggedIn, isGuest, performSave]);

  const handleFinish = () => {
    if (!isLoggedIn && !isGuest) {
      setAwaitingAuth(true);
      openAuthModal();
      return;
    }

    void performSave();
  };

  const goTo = (n: number) => setStep(n);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50/40 flex flex-col items-center justify-center px-4 py-10">
      {/* Branding */}
      <div className="flex items-center gap-2.5 mb-8">
        <Image
          src="/snapchef-logo.png"
          alt="SnapChef"
          width={36}
          height={36}
          className="rounded-xl object-cover"
          priority
        />
        <span className="text-lg font-bold text-gray-800">SnapChef</span>
      </div>

      {/* Card */}
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Progress header */}
        <div className="px-7 pt-6 pb-5 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Step {step} of {STEPS.length}
            </span>
            <span className="text-xs font-semibold text-green-600">{STEPS[step - 1]}</span>
          </div>
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className="h-1.5 flex-1 rounded-full transition-all duration-300"
                style={{
                  background: i < step ? "linear-gradient(90deg, #22c55e, #16a34a)" : "#f1f5f9",
                }}
              />
            ))}
          </div>
        </div>

        {/* Step content — key triggers re-mount + step-enter CSS animation */}
        <div key={step} className="px-7 py-8 step-enter">
          {(submitError || syncError) && (
            <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {submitError || syncError}
            </div>
          )}
          {step === 1 && (
            <StepBasicInfo profile={profile} update={update} onNext={() => goTo(2)} />
          )}
          {step === 2 && (
            <StepDietaryNeeds
              profile={profile}
              update={update}
              onNext={() => goTo(3)}
              onBack={() => goTo(1)}
              onSkip={() => goTo(3)}
            />
          )}
          {step === 3 && (
            <StepKitchenSetup
              profile={profile}
              update={update}
              onNext={() => handleFinish()}
              onBack={() => goTo(2)}
              onSkip={() => handleFinish()}
              isSaving={isSaving}
            />
          )}
        </div>
      </div>
    </div>
  );
}

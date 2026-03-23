"use client";

import { useState, useCallback, useEffect } from "react";
import { useSignIn, useClerk } from "@clerk/nextjs";
import { useSnapChefAuth } from "./auth/AuthProvider";
import type { OnboardingProfile } from "../app/onboarding/page";
import type { UserPreferencesRecord } from "../services/backendApi";
import StepBasicInfo from "./onboarding/StepBasicInfo";
import StepDietaryNeeds from "./onboarding/StepDietaryNeeds";
import StepKitchenSetup from "./onboarding/StepKitchenSetup";

export const PENDING_PREFS_KEY = "snapchef:pendingPreferences";

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

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function PreferencesModal({ isOpen, onClose }: Props) {
  const {
    continueAsGuest,
    isGuest,
    isLoggedIn,
    preferences,
    saveUserPreferences,
    setGuestPreferences,
  } = useSnapChefAuth();
  const { signIn, fetchStatus: signInStatus } = useSignIn();
  const clerk = useClerk();

  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<OnboardingProfile>(EMPTY_PROFILE);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const isBusy = signInStatus === "fetching" || isSaving;

  // Seed form from existing preferences when modal opens
  useEffect(() => {
    if (!isOpen) return;
    if (preferences) {
      setProfile({
        age: preferences.age || "",
        sex: preferences.sex,
        goal: preferences.goal,
        customGoal: preferences.customGoal,
        allergies: preferences.allergies,
        medical: preferences.medical,
        religious: preferences.religious,
        kitchenTools: preferences.kitchenTools,
        kitchenImage: preferences.kitchenImage,
      });
    } else {
      setProfile(EMPTY_PROFILE);
    }
    setStep(1);
    setError("");
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // ESC to close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const update = (fields: Partial<OnboardingProfile>) =>
    setProfile((p) => ({ ...p, ...fields }));

  const performSave = useCallback(async () => {
    setIsSaving(true);
    setError("");
    try {
      const record = toPreferenceRecord(profile);
      await saveUserPreferences(record);
      setGuestPreferences(record);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save preferences.");
    } finally {
      setIsSaving(false);
    }
  }, [profile, saveUserPreferences, setGuestPreferences, onClose]);

  // After step 3 "Save Preferences" is clicked
  const handleSaveIntent = () => {
    if (isLoggedIn || isGuest) {
      void performSave();
    } else {
      setStep(4);
    }
  };

  const handleGuest = () => {
    if (isBusy) return;
    continueAsGuest();
    const record = toPreferenceRecord(profile);
    setGuestPreferences(record);
    onClose();
  };

  const handleGoogle = async () => {
    if (!signIn || isBusy) return;
    setError("");
    // Stash draft so it can be applied after the OAuth redirect
    sessionStorage.setItem(PENDING_PREFS_KEY, JSON.stringify(toPreferenceRecord(profile)));
    try {
      const { error: ssoError } = await signIn.sso({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectCallbackUrl: "/",
      });
      if (ssoError) {
        sessionStorage.removeItem(PENDING_PREFS_KEY);
        setError(ssoError.longMessage ?? "Google sign-in failed. Try another option.");
      }
    } catch {
      sessionStorage.removeItem(PENDING_PREFS_KEY);
      setError("Google sign-in is unavailable right now.");
    }
  };

  const handleApple = async () => {
    if (!signIn || isBusy) return;
    setError("");
    sessionStorage.setItem(PENDING_PREFS_KEY, JSON.stringify(toPreferenceRecord(profile)));
    try {
      const { error: ssoError } = await signIn.sso({
        strategy: "oauth_apple",
        redirectUrl: "/sso-callback",
        redirectCallbackUrl: "/",
      });
      if (ssoError) {
        sessionStorage.removeItem(PENDING_PREFS_KEY);
        setError(ssoError.longMessage ?? "Apple sign-in failed. Try another option.");
      }
    } catch {
      sessionStorage.removeItem(PENDING_PREFS_KEY);
      setError("Apple sign-in is unavailable right now.");
    }
  };

  const handleEmail = () => {
    if (isBusy) return;
    sessionStorage.setItem(PENDING_PREFS_KEY, JSON.stringify(toPreferenceRecord(profile)));
    onClose();
    clerk.openSignIn({
      fallbackRedirectUrl: "/",
      signUpFallbackRedirectUrl: "/",
      withSignUp: true,
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div className="w-full max-w-lg bg-white rounded-[28px] border border-white/60 shadow-[0_30px_90px_rgba(15,23,42,0.28)] overflow-hidden flex flex-col max-h-[90vh]">

        {/* Progress bar — shown only on pref steps */}
        {step <= 3 && (
          <div className="px-7 pt-6 pb-5 border-b border-gray-100 shrink-0">
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
        )}

        {/* Step content */}
        <div key={step} className="px-7 py-8 overflow-y-auto">
          {error && (
            <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          {step === 1 && (
            <StepBasicInfo profile={profile} update={update} onNext={() => setStep(2)} />
          )}

          {step === 2 && (
            <StepDietaryNeeds
              profile={profile}
              update={update}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
              onSkip={() => setStep(3)}
            />
          )}

          {step === 3 && (
            <StepKitchenSetup
              profile={profile}
              update={update}
              onNext={handleSaveIntent}
              onBack={() => setStep(2)}
              onSkip={handleSaveIntent}
              isSaving={isSaving}
            />
          )}

          {/* Step 4 — sign in / guest */}
          {step === 4 && (
            <div>
              <p className="mb-2 text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-emerald-600">
                Almost done
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900 mb-1">
                Save your preferences
              </h2>
              <p className="mt-1 mb-6 text-sm leading-6 text-slate-500">
                Sign in to sync preferences across devices, or continue as a guest.
              </p>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleGoogle}
                  disabled={isBusy}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5 flex-shrink-0" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <button
                  type="button"
                  onClick={handleApple}
                  disabled={isBusy}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-950 px-4 py-3.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white flex-shrink-0" aria-hidden="true">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.41.07 2.38.78 3.21.78.95 0 2.74-.97 4.62-.83.79.03 3 .32 4.42 2.38-3.87 2.38-3.25 7.58.75 9.05zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                  </svg>
                  <span>Continue with Apple</span>
                </button>

                <div className="flex items-center gap-3 py-1.5">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">OR</span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <button
                  type="button"
                  onClick={handleEmail}
                  disabled={isBusy}
                  className="w-full rounded-2xl bg-emerald-500 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Continue with Email
                </button>
              </div>

              <button
                type="button"
                onClick={handleGuest}
                disabled={isBusy}
                className="mt-5 w-full text-center text-sm font-medium text-slate-500 transition hover:text-slate-700 disabled:opacity-60"
              >
                Continue as Guest
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="mt-3 w-full text-center text-xs text-slate-400 transition hover:text-slate-600"
              >
                ← Back to preferences
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

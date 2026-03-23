"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<OnboardingProfile>(EMPTY_PROFILE);


  // Redirect if profile already exists
  useEffect(() => {
    const saved = localStorage.getItem("userProfile");
    if (!saved) return;
    try {
      const p = JSON.parse(saved);
      if (
        p.age ||
        p.allergies?.length ||
        p.religiousRestrictions?.length ||
        p.medicalRestrictions?.length
      ) {
        router.push("/");
      }
    } catch {
      // corrupt localStorage — ignore
    }
  }, [router]);

  const update = (fields: Partial<OnboardingProfile>) => {
    setProfile((prev) => ({ ...prev, ...fields }));
  };

  const saveProfile = () => {
    localStorage.setItem(
      "userProfile",
      JSON.stringify({
        age: profile.age === "" ? 0 : Number(profile.age),
        sex: profile.sex,
        goal: profile.goal,
        customGoal: profile.customGoal,
        // Preserve backward-compatible keys used by the API route + sidebar
        allergies: profile.allergies,
        religiousRestrictions: profile.religious,
        medicalRestrictions: profile.medical ? [profile.medical] : [],
        kitchenTools: profile.kitchenTools,
        kitchenImage: profile.kitchenImage,
      }),
    );
  };

  const handleFinish = () => {
    saveProfile();
    router.push("/");
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
              onNext={handleFinish}
              onBack={() => goTo(2)}
              onSkip={handleFinish}
            />
          )}
        </div>
      </div>
    </div>
  );
}

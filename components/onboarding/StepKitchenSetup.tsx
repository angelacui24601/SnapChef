"use client";

import { useState, useRef } from "react";
import type { OnboardingProfile } from "../../app/onboarding/page";

const TOOLS = ["Oven", "Microwave", "Blender", "Air Fryer", "Stove", "Knife", "None"];

interface Props {
  profile: OnboardingProfile;
  update: (fields: Partial<OnboardingProfile>) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  isSaving?: boolean;
}

export default function StepKitchenSetup({ profile, update, onNext, onBack, onSkip, isSaving = false }: Props) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => update({ kitchenImage: e.target?.result as string });
    reader.readAsDataURL(file);
  };

  const toggleTool = (tool: string) => {
    const val = tool.toLowerCase();
    if (val === "none") {
      update({ kitchenTools: profile.kitchenTools.includes("none") ? [] : ["none"] });
      return;
    }
    const withoutNone = profile.kitchenTools.filter((t) => t !== "none");
    const exists = withoutNone.includes(val);
    update({ kitchenTools: exists ? withoutNone.filter((t) => t !== val) : [...withoutNone, val] });
  };

  return (
    <div>
      <h1 className="text-[1.6rem] font-bold text-gray-900 mb-1">What&apos;s in your kitchen?</h1>
      <p className="text-sm text-gray-400 mb-8">Help us tailor recipes to your tools — optional</p>

      <div className="space-y-6">
        {/* Image upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Upload a photo of your kitchen tools
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) handleFile(e.target.files[0]);
            }}
          />
          {profile.kitchenImage ? (
            <div className="relative rounded-xl overflow-hidden border-2 border-green-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profile.kitchenImage}
                alt="Kitchen tools"
                className="w-full h-36 object-cover"
              />
              <button
                onClick={() => update({ kitchenImage: null })}
                className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full text-sm text-gray-600 hover:bg-white transition-colors flex items-center justify-center shadow-sm"
              >
                ×
              </button>
            </div>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                isDragOver
                  ? "border-green-400 bg-green-50"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <svg
                className="w-8 h-8 text-gray-300 mx-auto mb-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              <p className="text-sm text-gray-500">
                Drag & drop or{" "}
                <span className="text-green-600 font-semibold">browse</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10 MB</p>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs text-gray-400 font-medium">or select manually</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        {/* Tool chips */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Kitchen Equipment
          </label>
          <div className="flex flex-wrap gap-2">
            {TOOLS.map((tool) => {
              const active = profile.kitchenTools.includes(tool.toLowerCase());
              return (
                <button
                  key={tool}
                  type="button"
                  onClick={() => toggleTool(tool)}
                  className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                    active
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {tool}
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
          disabled={isSaving}
          className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-semibold transition-colors"
        >
          {isSaving ? "Saving..." : "Save Preferences"}
        </button>
        <button
          onClick={onSkip}
          disabled={isSaving}
          className="px-5 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
        >
          Skip
        </button>
      </div>
    </div>
  );
}

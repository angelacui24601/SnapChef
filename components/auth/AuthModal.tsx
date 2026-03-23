"use client";

import { useEffect, useState } from "react";
import { useClerk, useSignIn, useSignUp } from "@clerk/nextjs";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueAsGuest: () => void;
}

export default function AuthModal({ isOpen, onClose, onContinueAsGuest }: AuthModalProps) {
  const { signIn, fetchStatus: signInStatus } = useSignIn();
  const { fetchStatus: signUpStatus } = useSignUp();
  const clerk = useClerk();
  const [error, setError] = useState("");

  const isBusy = signInStatus === "fetching" || signUpStatus === "fetching";

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleGoogle = async () => {
    if (!signIn || isBusy) {
      return;
    }

    setError("");

    try {
      await signIn.sso({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectCallbackUrl: "/",
      });
    } catch (authError) {
      console.error("Google sign-in failed", authError);
      setError("Google sign-in is unavailable right now. Try email or guest mode.");
    }
  };

  const handleApple = async () => {
    if (!signIn || isBusy) {
      return;
    }

    setError("");

    try {
      await signIn.sso({
        strategy: "oauth_apple",
        redirectUrl: "/sso-callback",
        redirectCallbackUrl: "/",
      });
    } catch (authError) {
      console.error("Apple sign-in failed", authError);
      setError("Apple sign-in is unavailable right now. Try email or guest mode.");
    }
  };

  const handleEmail = () => {
    if (isBusy) {
      return;
    }

    setError("");
    onClose();
    clerk.openSignIn({
      fallbackRedirectUrl: "/",
      signUpFallbackRedirectUrl: "/",
      withSignUp: true,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-md auth-modal-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      role="presentation"
    >
      <div className="auth-modal-card w-full max-w-md overflow-hidden rounded-[28px] border border-white/60 bg-white/95 p-7 shadow-[0_30px_90px_rgba(15,23,42,0.28)] sm:p-8">
        <div className="mb-6">
          <p className="mb-2 text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-emerald-600">SnapChef</p>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Welcome to SnapChef</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">Save your recipes and preferences</p>
        </div>

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

        {error && <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p>}

        <button
          type="button"
          onClick={onContinueAsGuest}
          className="mt-5 w-full text-center text-sm font-medium text-slate-500 transition hover:text-slate-700"
        >
          Continue as Guest
        </button>
      </div>
    </div>
  );
}
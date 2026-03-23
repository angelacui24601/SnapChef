"use client";

import { useSignIn, useSignUp, useClerk } from "@clerk/nextjs";

interface Props {
  onBack: () => void;
  onFinish: () => void;
}

export default function StepAuth({ onBack, onFinish }: Props) {
  const { signIn, fetchStatus: signInStatus } = useSignIn();
  const { fetchStatus: signUpStatus } = useSignUp();
  const clerk = useClerk();

  // 'fetching' means Clerk is mid-request; disable buttons then
  const isBusy = signInStatus === "fetching" || signUpStatus === "fetching";

  const handleGoogle = async () => {
    if (isBusy) return;
    await signIn.sso({
      strategy: "oauth_google",
      redirectUrl: "/sso-callback",
      redirectCallbackUrl: "/",
    });
  };

  const handleApple = async () => {
    if (isBusy) return;
    await signIn.sso({
      strategy: "oauth_apple",
      redirectUrl: "/sso-callback",
      redirectCallbackUrl: "/",
    });
  };

  const handleEmail = () => {
    // Redirect to Clerk's hosted sign-up page for email/password flow
    clerk.redirectToSignUp({ redirectUrl: "/" });
  };

  return (
    <div>
      <h1 className="text-[1.6rem] font-bold text-gray-900 mb-1">Save your preferences</h1>
      <p className="text-sm text-gray-500 mb-8">
        Create an account to save your preferences and access personalized recipes
      </p>

      <div className="space-y-3">
        {/* Google */}
        <button
          onClick={handleGoogle}
          disabled={isBusy}
          className="w-full flex items-center gap-3 px-4 py-3.5 border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <span className="text-sm font-semibold text-gray-700">Continue with Google</span>
        </button>

        {/* Apple */}
        <button
          onClick={handleApple}
          disabled={isBusy}
          className="w-full flex items-center gap-3 px-4 py-3.5 bg-black rounded-xl hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white flex-shrink-0">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.41.07 2.38.78 3.21.78.95 0 2.74-.97 4.62-.83.79.03 3 .32 4.42 2.38-3.87 2.38-3.25 7.58.75 9.05zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
          <span className="text-sm font-semibold text-white">Continue with Apple</span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 py-1">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs text-gray-400 font-medium">or</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        {/* Email */}
        <button
          onClick={handleEmail}
          disabled={isBusy}
          className="w-full py-3.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          Continue with Email
        </button>
      </div>

      <button
        onClick={onBack}
        className="mt-5 w-full py-2.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
      >
        ← Back
      </button>
    </div>
  );
}

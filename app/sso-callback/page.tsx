"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

// Clerk redirects here after Google/Apple OAuth completes.
// This component handles token exchange and then redirects to /
export default function SSOCallbackPage() {
  return <AuthenticateWithRedirectCallback />;
}

"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import AuthModal from "./AuthModal";

interface SnapChefAuthContextValue {
  isLoggedIn: boolean;
  isGuest: boolean;
  showAuthModal: boolean;
  setShowAuthModal: (next: boolean) => void;
  openAuthModal: () => void;
  continueAsGuest: () => void;
  requireAuth: (action: () => void) => void;
}

const SnapChefAuthContext = createContext<SnapChefAuthContextValue | null>(null);

export function SnapChefAuthProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useAuth();
  const [isGuest, setIsGuest] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const isLoggedIn = Boolean(isSignedIn);

  useEffect(() => {
    if (isLoggedIn) {
      setIsGuest(false);
      setShowAuthModal(false);
    }
  }, [isLoggedIn]);

  const openAuthModal = () => {
    setShowAuthModal(true);
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    setShowAuthModal(false);
  };

  const requireAuth = (action: () => void) => {
    if (!isLoggedIn && !isGuest) {
      setShowAuthModal(true);
      return;
    }

    action();
  };

  return (
    <SnapChefAuthContext.Provider
      value={{
        isLoggedIn,
        isGuest,
        showAuthModal,
        setShowAuthModal,
        openAuthModal,
        continueAsGuest,
        requireAuth,
      }}
    >
      {children}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onContinueAsGuest={continueAsGuest}
      />
    </SnapChefAuthContext.Provider>
  );
}

export function useSnapChefAuth() {
  const context = useContext(SnapChefAuthContext);

  if (!context) {
    throw new Error("useSnapChefAuth must be used within SnapChefAuthProvider");
  }

  return context;
}
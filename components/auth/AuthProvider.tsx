"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import type { Dish } from "../../lib/services/apiService";
import {
  createFavoritePayloadFromDish,
  deleteFavorite,
  fetchFavorites,
  fetchPreferences,
  saveFavorite,
  savePreferences as savePreferencesRequest,
  type FavoriteRecipePayload,
  type FavoriteRecipeRecord,
  type UserPreferencesRecord,
} from "../../lib/services/backendApi";
import { buildRecipeSourceKey } from "../../lib/services/favorites";
import AuthModal from "./AuthModal";
import { PENDING_PREFS_KEY } from "../PreferencesModal";

interface ClerkUserSnapshot {
  id: string;
  email: string | null;
  fullName: string | null;
  imageUrl: string | null;
}

interface SnapChefAuthContextValue {
  isLoggedIn: boolean;
  isGuest: boolean;
  showAuthModal: boolean;
  setShowAuthModal: (next: boolean) => void;
  openAuthModal: () => void;
  continueAsGuest: () => void;
  requireAuth: (action: () => void | Promise<void>) => void;
  clerkUser: ClerkUserSnapshot | null;
  favorites: FavoriteRecipeRecord[];
  preferences: UserPreferencesRecord | null;
  isLoadingUserData: boolean;
  saveUserPreferences: (preferences: UserPreferencesRecord) => Promise<void>;
  setGuestPreferences: (preferences: UserPreferencesRecord | null) => void;
  saveFavoriteRecipe: (recipe: FavoriteRecipePayload) => Promise<FavoriteRecipeRecord | null>;
  removeFavoriteRecipe: (recipeId: string) => Promise<void>;
  toggleFavoriteDish: (dish: Pick<Dish, "title" | "estimatedCookTime" | "steps">) => Promise<boolean>;
}

const SnapChefAuthContext = createContext<SnapChefAuthContextValue | null>(null);

export function SnapChefAuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [isGuest, setIsGuest] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteRecipeRecord[]>([]);
  const [preferences, setPreferences] = useState<UserPreferencesRecord | null>(null);
  const [isLoadingUserData, setIsLoadingUserData] = useState(false);

  const isLoggedIn = Boolean(isSignedIn);
  const clerkUser = user
    ? {
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress ?? null,
        fullName: user.fullName ?? null,
        imageUrl: user.imageUrl ?? null,
      }
    : null;

  const hydrateUserData = async () => {
    setIsLoadingUserData(true);

    try {
      const [nextPreferences, nextFavorites] = await Promise.all([
        fetchPreferences(),
        fetchFavorites(),
      ]);

      setPreferences(nextPreferences);
      setFavorites(nextFavorites);
    } finally {
      setIsLoadingUserData(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      setIsGuest(false);
      setShowAuthModal(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn || !user) {
      setFavorites([]);
      setPreferences(null);
      setIsLoadingUserData(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      await hydrateUserData();

      if (!cancelled) {
        const pendingJson = sessionStorage.getItem(PENDING_PREFS_KEY);
        if (pendingJson) {
          try {
            sessionStorage.removeItem(PENDING_PREFS_KEY);
            const pendingPrefs = JSON.parse(pendingJson) as UserPreferencesRecord;
            const saved = await savePreferencesRequest(pendingPrefs);
            if (!cancelled) setPreferences(saved);
          } catch {
            // non-critical
          }
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, user]);

  const openAuthModal = () => {
    setShowAuthModal(true);
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    setShowAuthModal(false);
  };

  const requireAuth = (action: () => void | Promise<void>) => {
    if (!isLoggedIn && !isGuest) {
      setShowAuthModal(true);
      return;
    }

    void action();
  };

  const setGuestPreferences = (nextPreferences: UserPreferencesRecord | null) => {
    setPreferences(nextPreferences);
  };

  const saveUserPreferences = async (nextPreferences: UserPreferencesRecord) => {
    if (!isLoggedIn || isGuest) {
      setPreferences(nextPreferences);
      return;
    }

    const savedPreferences = await savePreferencesRequest(nextPreferences);
    setPreferences(savedPreferences);
  };

  const saveFavoriteRecipe = async (recipe: FavoriteRecipePayload) => {
    const sourceKey = buildRecipeSourceKey({
      title: recipe.title,
      estimatedCookTime: recipe.estimatedCookTime,
      steps: recipe.steps,
    });

    if (!isLoggedIn || isGuest) {
      const guestFavorite: FavoriteRecipeRecord = {
        id: recipe.recipeId ?? sourceKey,
        recipeId: recipe.recipeId ?? sourceKey,
        title: recipe.title,
        cookTime: null,
        estimatedCookTime: recipe.estimatedCookTime,
        ingredients: recipe.ingredients ?? [],
        steps: recipe.steps,
        savedAt: new Date().toISOString(),
        sourceKey,
      };

      setFavorites((current) => [guestFavorite, ...current.filter((entry) => entry.recipeId !== guestFavorite.recipeId)]);
      return guestFavorite;
    }

    const savedFavorite = await saveFavorite(recipe);
    setFavorites((current) => [savedFavorite, ...current.filter((entry) => entry.recipeId !== savedFavorite.recipeId)]);
    return savedFavorite;
  };

  const removeFavoriteRecipe = async (recipeId: string) => {
    if (!isLoggedIn || isGuest) {
      setFavorites((current) => current.filter((entry) => entry.recipeId !== recipeId));
      return;
    }

    await deleteFavorite(recipeId);
    setFavorites((current) => current.filter((entry) => entry.recipeId !== recipeId));
  };

  const toggleFavoriteDish = async (dish: Pick<Dish, "title" | "estimatedCookTime" | "steps">) => {
    const sourceKey = buildRecipeSourceKey(dish);
    const existingFavorite = favorites.find((entry) => entry.sourceKey === sourceKey);

    if (existingFavorite) {
      await removeFavoriteRecipe(existingFavorite.recipeId);
      return false;
    }

    await saveFavoriteRecipe(createFavoritePayloadFromDish(dish));
    return true;
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
        clerkUser,
        favorites,
        preferences,
        isLoadingUserData,
        saveUserPreferences,
        setGuestPreferences,
        saveFavoriteRecipe,
        removeFavoriteRecipe,
        toggleFavoriteDish,
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
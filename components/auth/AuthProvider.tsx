"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import type { Dish } from "../../services/apiService";
import {
  createFavoritePayloadFromDish,
  deleteFavorite,
  fetchFavorites,
  fetchPreferences,
  saveFavorite,
  savePreferences as savePreferencesRequest,
  syncClerkUser,
  type FavoriteRecipePayload,
  type FavoriteRecipeRecord,
  type UserPreferencesRecord,
} from "../../services/backendApi";
import { buildRecipeSourceKey } from "../../services/favorites";
import AuthModal from "./AuthModal";

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
  userId: string | null;
  favorites: FavoriteRecipeRecord[];
  preferences: UserPreferencesRecord | null;
  isSyncingUser: boolean;
  isLoadingUserData: boolean;
  syncError: string;
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
  const [userId, setUserId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<FavoriteRecipeRecord[]>([]);
  const [preferences, setPreferences] = useState<UserPreferencesRecord | null>(null);
  const [isSyncingUser, setIsSyncingUser] = useState(false);
  const [isLoadingUserData, setIsLoadingUserData] = useState(false);
  const [syncError, setSyncError] = useState("");

  const isLoggedIn = Boolean(isSignedIn);
  const clerkUser = user
    ? {
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress ?? null,
        fullName: user.fullName ?? null,
        imageUrl: user.imageUrl ?? null,
      }
    : null;

  const hydrateUserData = async (nextUserId: string) => {
    setIsLoadingUserData(true);

    try {
      const [nextPreferences, nextFavorites] = await Promise.all([
        fetchPreferences(nextUserId),
        fetchFavorites(nextUserId),
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
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn || !user) {
      setUserId(null);
      setFavorites([]);
      setPreferences(null);
      setSyncError("");
      setIsSyncingUser(false);
      setIsLoadingUserData(false);
      return;
    }

    const email = user.primaryEmailAddress?.emailAddress;
    if (!email) {
      setSyncError("Your account is missing an email address, so SnapChef cannot sync your data yet.");
      return;
    }

    let cancelled = false;

    const syncAndHydrate = async () => {
      setIsSyncingUser(true);
      setSyncError("");

      try {
        const syncedUser = await syncClerkUser(user.id, email);
        if (cancelled) {
          return;
        }

        setUserId(syncedUser.id);
        await hydrateUserData(syncedUser.id);
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to sync Clerk user with PostgreSQL", error);
          setSyncError(error instanceof Error ? error.message : "Failed to sync your account.");
        }
      } finally {
        if (!cancelled) {
          setIsSyncingUser(false);
        }
      }
    };

    void syncAndHydrate();

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
    setSyncError("");
  };

  const requireAuth = (action: () => void | Promise<void>) => {
    if (!isLoggedIn && !isGuest) {
      setShowAuthModal(true);
      return;
    }

    if (isLoggedIn && !userId) {
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

    if (!userId) {
      throw new Error("User sync is still in progress.");
    }

    const savedPreferences = await savePreferencesRequest(userId, nextPreferences);
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

    if (!userId) {
      throw new Error("User sync is still in progress.");
    }

    const savedFavorite = await saveFavorite(userId, recipe);
    setFavorites((current) => [savedFavorite, ...current.filter((entry) => entry.recipeId !== savedFavorite.recipeId)]);
    return savedFavorite;
  };

  const removeFavoriteRecipe = async (recipeId: string) => {
    if (!isLoggedIn || isGuest) {
      setFavorites((current) => current.filter((entry) => entry.recipeId !== recipeId));
      return;
    }

    if (!userId) {
      throw new Error("User sync is still in progress.");
    }

    await deleteFavorite(userId, recipeId);
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
        userId,
        favorites,
        preferences,
        isSyncingUser,
        isLoadingUserData,
        syncError,
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
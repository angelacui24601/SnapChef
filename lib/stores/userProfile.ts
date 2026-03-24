"use client";

import { useSnapChefAuth } from "../../components/auth/AuthProvider";
import type { UserPreferencesRecord, FavoriteRecipeRecord } from "../services/backendApi";

export type { UserPreferencesRecord, FavoriteRecipeRecord };

export interface UserProfile {
  age: number;
  allergies: string[];
  religiousRestrictions: string[];
  medicalRestrictions: string[];
}

/**
 * Global user state hook — wraps SnapChefAuthContext and exposes the
 * Clerk identity, PostgreSQL UUID, preferences, and favorites in one place.
 *
 * Must be called inside a component that is a descendant of
 * <SnapChefAuthProvider>.
 */
export function useUserProfile() {
  const {
    clerkUser,
    preferences,
    favorites,
    isLoggedIn,
    isGuest,
    isLoadingUserData,
    saveUserPreferences,
    toggleFavoriteDish,
    removeFavoriteRecipe,
  } = useSnapChefAuth();

  return {
    clerkUser,
    preferences,
    favorites,
    isLoggedIn,
    isGuest,
    isLoadingUserData,
    savePreferences: saveUserPreferences,
    toggleFavorite: toggleFavoriteDish,
    removeFavorite: removeFavoriteRecipe,
  };
}

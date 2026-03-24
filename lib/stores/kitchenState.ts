"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "kitchenState";

export interface KitchenIngredient {
  name: string;
  freshness: "fresh" | "stale" | "rotten" | string;
}

export interface KitchenState {
  ingredients: KitchenIngredient[];
  servings: number;
  people: number;
}

function getInitialKitchenState(): KitchenState {
  if (typeof window === "undefined") {
    return { ingredients: [], servings: 1, people: 1 };
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return { ingredients: [], servings: 1, people: 1 };
  }

  try {
    const parsed = JSON.parse(saved) as Partial<KitchenState>;
    return {
      ingredients: Array.isArray(parsed.ingredients) ? parsed.ingredients : [],
      servings: typeof parsed.servings === "number" ? parsed.servings : 1,
      people: typeof parsed.people === "number" ? parsed.people : 1,
    };
  } catch (error) {
    console.warn("Failed to parse kitchenState from localStorage", error);
    return { ingredients: [], servings: 1, people: 1 };
  }
}

function persistKitchenState(state: KitchenState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/**
 * React hook for kitchen state (ingredients, servings, people).
 * State is persisted to localStorage under the key "kitchenState".
 *
 * Must be used inside a Client Component.
 */
export function useKitchenStateStore() {
  const [state, setState] = useState<KitchenState>(getInitialKitchenState);

  useEffect(() => {
    persistKitchenState(state);
  }, [state]);

  const addIngredient = useCallback((ingredient: KitchenIngredient) => {
    setState((prev) => {
      const exists = prev.ingredients.some(
        (item) => item.name.toLowerCase() === ingredient.name.toLowerCase(),
      );
      if (exists) return prev;
      return { ...prev, ingredients: [...prev.ingredients, { ...ingredient }] };
    });
  }, []);

  const removeIngredient = useCallback((name: string) => {
    setState((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter(
        (item) => item.name.toLowerCase() !== name.toLowerCase(),
      ),
    }));
  }, []);

  const updateFreshness = useCallback(
    (name: string, freshness: KitchenIngredient["freshness"]) => {
      setState((prev) => ({
        ...prev,
        ingredients: prev.ingredients.map((item) =>
          item.name.toLowerCase() === name.toLowerCase()
            ? { ...item, freshness }
            : item,
        ),
      }));
    },
    [],
  );

  const setServings = useCallback((servings: number) => {
    setState((prev) => ({ ...prev, servings: Math.max(1, servings) }));
  }, []);

  const setPeople = useCallback((people: number) => {
    setState((prev) => ({ ...prev, people: Math.max(1, people) }));
  }, []);

  const resetKitchenState = useCallback(() => {
    setState({ ingredients: [], servings: 1, people: 1 });
  }, []);

  return {
    ...state,
    addIngredient,
    removeIngredient,
    updateFreshness,
    setServings,
    setPeople,
    resetKitchenState,
  };
}


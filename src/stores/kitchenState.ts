import { defineStore } from "pinia";

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
    return {
      ingredients: [],
      servings: 1,
      people: 1,
    };
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return {
      ingredients: [],
      servings: 1,
      people: 1,
    };
  }

  try {
    const parsed = JSON.parse(saved);
    return {
      ingredients: Array.isArray(parsed.ingredients) ? parsed.ingredients : [],
      servings: typeof parsed.servings === "number" ? parsed.servings : 1,
      people: typeof parsed.people === "number" ? parsed.people : 1,
    };
  } catch (error) {
    console.warn("Failed to parse kitchenState from localStorage", error);
    return {
      ingredients: [],
      servings: 1,
      people: 1,
    };
  }
}

export const useKitchenStateStore = defineStore("kitchenState", {
  state: (): KitchenState => getInitialKitchenState(),

  actions: {
    addIngredient(ingredient: KitchenIngredient) {
      const exists = this.ingredients.some(
        (item) => item.name.toLowerCase() === ingredient.name.toLowerCase()
      );
      if (!exists) {
        this.ingredients.push({ ...ingredient });
        this.persist();
      }
    },

    removeIngredient(name: string) {
      this.ingredients = this.ingredients.filter(
        (ingredient) => ingredient.name.toLowerCase() !== name.toLowerCase()
      );
      this.persist();
    },

    updateFreshness(name: string, freshness: KitchenIngredient["freshness"]) {
      const item = this.ingredients.find(
        (ingredient) => ingredient.name.toLowerCase() === name.toLowerCase()
      );
      if (item) {
        item.freshness = freshness;
        this.persist();
      }
    },

    setServings(servings: number) {
      this.servings = Math.max(1, servings);
      this.persist();
    },

    setPeople(people: number) {
      this.people = Math.max(1, people);
      this.persist();
    },

    resetKitchenState() {
      Object.assign(this, {
        ingredients: [],
        servings: 1,
        people: 1,
      });
      this.persist();
    },

    persist() {
      if (typeof window === "undefined") return;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.$state));
    },

    load() {
      Object.assign(this, getInitialKitchenState());
    },
  },
});

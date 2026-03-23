import { defineStore } from "pinia";

const STORAGE_KEY = "userProfile";

export interface UserProfile {
  age: number;
  allergies: string[];
  religiousRestrictions: string[];
  medicalRestrictions: string[];
}

function getInitialProfile(): UserProfile {
  if (typeof window === "undefined") {
    return {
      age: 0,
      allergies: [],
      religiousRestrictions: [],
      medicalRestrictions: [],
    };
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return {
      age: 0,
      allergies: [],
      religiousRestrictions: [],
      medicalRestrictions: [],
    };
  }

  try {
    const parsed = JSON.parse(saved);
    return {
      age: typeof parsed.age === "number" ? parsed.age : 0,
      allergies: Array.isArray(parsed.allergies) ? parsed.allergies : [],
      religiousRestrictions: Array.isArray(parsed.religiousRestrictions) ? parsed.religiousRestrictions : [],
      medicalRestrictions: Array.isArray(parsed.medicalRestrictions) ? parsed.medicalRestrictions : [],
    };
  } catch (error) {
    console.warn("Failed to parse userProfile from localStorage", error);
    return {
      age: 0,
      allergies: [],
      religiousRestrictions: [],
      medicalRestrictions: [],
    };
  }
}

export const useUserProfileStore = defineStore("userProfile", {
  state: () => ({
    userProfile: getInitialProfile(),
  }),

  actions: {
    setAge(age: number) {
      this.userProfile.age = age;
      this.persist();
    },

    setAllergies(allergies: string[]) {
      this.userProfile.allergies = allergies;
      this.persist();
    },

    setReligiousRestrictions(religiousRestrictions: string[]) {
      this.userProfile.religiousRestrictions = religiousRestrictions;
      this.persist();
    },

    setMedicalRestrictions(medicalRestrictions: string[]) {
      this.userProfile.medicalRestrictions = medicalRestrictions;
      this.persist();
    },

    resetProfile() {
      this.userProfile = {
        age: 0,
        allergies: [],
        religiousRestrictions: [],
        medicalRestrictions: [],
      };
      this.persist();
    },

    persist() {
      if (typeof window === "undefined") return;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.userProfile));
    },

    load() {
      this.userProfile = getInitialProfile();
    },
  },
});

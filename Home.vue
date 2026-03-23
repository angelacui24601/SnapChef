<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <!-- Background decorative elements -->
    <div class="absolute top-10 left-10 w-48 h-48 bg-green-500/5 rounded-full blur-xl"></div>
    <div class="absolute bottom-20 right-15 w-36 h-36 bg-orange-500/5 rounded-full blur-xl"></div>
    <div class="absolute top-60 left-70 w-24 h-24 bg-green-500/3 rounded-full blur-xl"></div>

    <div class="max-w-2xl w-full relative z-10">
      <!-- Header -->
      <div class="text-center mb-12 animate-fadeInUp">
        <div class="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg hover:scale-105 transition-transform duration-300">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"/>
          </svg>
        </div>
        <h1 class="text-4xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
          SnapChef
        </h1>
        <p class="text-lg text-gray-600 max-w-md mx-auto">
          AI-Powered Survival Cooking Assistant
        </p>
      </div>

      <!-- Kitchen State Panel -->
      <div class="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100 animate-fadeInUp animation-delay-200">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Kitchen State</h2>

        <div class="grid grid-cols-2 gap-4 mb-4">
          <label class="flex flex-col text-sm text-gray-600">
            Servings
            <input
              type="number"
              min="1"
              v-model.number="kitchenState.servings"
              class="mt-1 p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-300"
            />
          </label>
          <label class="flex flex-col text-sm text-gray-600">
            People
            <input
              type="number"
              min="1"
              v-model.number="kitchenState.people"
              class="mt-1 p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-300"
            />
          </label>
        </div>

        <div class="space-y-3 mb-4">
          <div v-for="(item, idx) in kitchenState.ingredients" :key="`${item.name}-${idx}`" class="flex gap-2 items-center">
            <input
              type="text"
              v-model="item.name"
              placeholder="Ingredient"
              class="flex-1 p-2 border border-gray-200 rounded-lg"
            />
            <select
              v-model="item.freshness"
              @change="kitchenState.updateFreshness(item.name, item.freshness)"
              class="p-2 border border-gray-200 rounded-lg"
            >
              <option value="fresh">Fresh</option>
              <option value="stale">Stale</option>
              <option value="rotten">Rotten</option>
            </select>
            <button
              @click="kitchenState.removeIngredient(item.name)"
              class="text-red-500 hover:text-red-600"
              type="button"
            >
              Remove
            </button>
          </div>
        </div>

        <div class="flex gap-2 items-center">
          <input
            v-model="newIngredient"
            placeholder="Add ingredient"
            class="flex-1 p-2 border border-gray-200 rounded-lg"
          />
          <select
            v-model="newIngredientFreshness"
            class="p-2 border border-gray-200 rounded-lg"
          >
            <option value="fresh">Fresh</option>
            <option value="stale">Stale</option>
            <option value="rotten">Rotten</option>
          </select>
          <button
            type="button"
            class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            @click="addKitchenIngredient"
          >
            Add
          </button>
        </div>

        <div class="text-right mt-3">
          <button
            type="button"
            class="text-sm text-gray-500 hover:text-gray-700"
            @click="kitchenState.resetKitchenState()"
          >
            Reset kitchen state
          </button>
        </div>
      </div>

      <!-- User Profile Settings -->
      <div class="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100 animate-fadeInUp animation-delay-200">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">User Profile Settings</h2>

        <div class="grid grid-cols-1 gap-4 mb-4">
          <label class="flex flex-col text-sm text-gray-600">
            Age
            <input
              type="number"
              min="0"
              v-model.number="profileAge"
              @change="userProfileStore.setAge(profileAge)"
              class="mt-1 p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-300"
            />
          </label>

          <div>
            <label class="block text-sm text-gray-600 mb-2">Allergies</label>
            <div class="flex flex-wrap gap-2 mb-2">
              <span
                v-for="(allergy, index) in userProfileStore.userProfile.allergies"
                :key="`allergy-${allergy}-${index}`"
                class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700"
              >
                {{ allergy }}
                <button
                  type="button"
                  class="ml-1 text-red-500 hover:text-red-700"
                  @click="removeAllergy(index)"
                >
                  ×
                </button>
              </span>
            </div>
            <div class="flex gap-2">
              <input
                v-model="newAllergy"
                type="text"
                placeholder="Add allergy"
                class="flex-1 p-2 border border-gray-200 rounded-lg"
              />
              <button
                type="button"
                class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                @click="addAllergy"
              >
                Add
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm text-gray-600 mb-2">Religious Restrictions</label>
            <div class="flex flex-wrap gap-2 mb-2">
              <span
                v-for="(value, index) in userProfileStore.userProfile.religiousRestrictions"
                :key="`relig- ${value}-${index}`"
                class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
              >
                {{ value }}
                <button
                  type="button"
                  class="ml-1 text-blue-500 hover:text-blue-700"
                  @click="removeReligiousRestriction(index)"
                >
                  ×
                </button>
              </span>
            </div>
            <div class="flex gap-2">
              <input
                v-model="newReligiousRestriction"
                type="text"
                placeholder="Add restriction"
                class="flex-1 p-2 border border-gray-200 rounded-lg"
              />
              <button
                type="button"
                class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                @click="addReligiousRestriction"
              >
                Add
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm text-gray-600 mb-2">Medical Restrictions</label>
            <div class="flex flex-wrap gap-2 mb-2">
              <span
                v-for="(value, index) in userProfileStore.userProfile.medicalRestrictions"
                :key="`medical-${value}-${index}`"
                class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700"
              >
                {{ value }}
                <button
                  type="button"
                  class="ml-1 text-yellow-500 hover:text-yellow-700"
                  @click="removeMedicalRestriction(index)"
                >
                  ×
                </button>
              </span>
            </div>
            <div class="flex gap-2">
              <input
                v-model="newMedicalRestriction"
                type="text"
                placeholder="Add restriction"
                class="flex-1 p-2 border border-gray-200 rounded-lg"
              />
              <button
                type="button"
                class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                @click="addMedicalRestriction"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        <div class="text-right mt-3">
          <button
            type="button"
            class="text-sm text-gray-500 hover:text-gray-700"
            @click="userProfileStore.resetProfile()"
          >
            Reset profile
          </button>
        </div>
      </div>

      <!-- Form Component -->
      <RecipeForm
        v-model:ingredients="ingredients"
        v-model:cuisine="cuisine"
        :loading="loading"
        :error="error"
        @submit="handleSubmit"
        class="animate-fadeInUp animation-delay-200"
      />

      <!-- Loading Component -->
      <LoadingAnimation
        v-if="loading"
        class="mt-8 animate-fadeInUp animation-delay-400"
      />

      <!-- Result Component -->
      <RecipeResult
        v-else-if="result"
        :result="result"
        class="mt-8 animate-fadeInUp animation-delay-400"
      />

      <!-- Empty State -->
      <div
        v-else
        class="mt-8 bg-white rounded-2xl p-12 shadow-sm border border-white/80 text-center animate-fadeInUp animation-delay-400"
      >
        <div class="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-3">
          Your Recipe Will Appear Here
        </h3>
        <p class="text-gray-500 max-w-md mx-auto leading-relaxed">
          Add some ingredients and select a cuisine type, then click generate to create your personalized recipe!
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import RecipeForm from './components/RecipeForm.vue'
import RecipeResult from './components/RecipeResult.vue'
import LoadingAnimation from './components/LoadingAnimation.vue'
import { generateRecipe } from '../services/apiService'
import { useKitchenStateStore } from '@/src/stores/kitchenState'
import { useUserProfileStore } from '@/src/stores/userProfile'

interface RecipeData {
  title: string
  steps: string[]
  nutrition?: Record<string, string | undefined>
}

const ingredients = ref('')
const cuisine = ref('any')
const result = ref<RecipeData | null>(null)
const loading = ref(false)
const error = ref('')

const kitchenState = useKitchenStateStore()
const userProfileStore = useUserProfileStore()
const newIngredient = ref('')
const newIngredientFreshness = ref<'fresh' | 'stale' | 'rotten'>('fresh')

const addKitchenIngredient = () => {
  if (!newIngredient.value.trim()) return;
  kitchenState.addIngredient({ name: newIngredient.value.trim(), freshness: newIngredientFreshness.value });
  newIngredient.value = '';
  newIngredientFreshness.value = 'fresh';
}

const updateKitchenFreshness = (name: string, freshness: string) => {
  kitchenState.updateFreshness(name, freshness);
}

const profileAge = ref(userProfileStore.userProfile.age)
const newAllergy = ref('')
const newReligiousRestriction = ref('')
const newMedicalRestriction = ref('')

const addAllergy = () => {
  const value = newAllergy.value.trim()
  if (!value) return
  userProfileStore.setAllergies([...userProfileStore.userProfile.allergies, value])
  newAllergy.value = ''
}

const removeAllergy = (idx: number) => {
  const cloned = [...userProfileStore.userProfile.allergies]
  cloned.splice(idx, 1)
  userProfileStore.setAllergies(cloned)
}

const addReligiousRestriction = () => {
  const value = newReligiousRestriction.value.trim()
  if (!value) return
  userProfileStore.setReligiousRestrictions([...userProfileStore.userProfile.religiousRestrictions, value])
  newReligiousRestriction.value = ''
}

const removeReligiousRestriction = (idx: number) => {
  const cloned = [...userProfileStore.userProfile.religiousRestrictions]
  cloned.splice(idx, 1)
  userProfileStore.setReligiousRestrictions(cloned)
}

const addMedicalRestriction = () => {
  const value = newMedicalRestriction.value.trim()
  if (!value) return
  userProfileStore.setMedicalRestrictions([...userProfileStore.userProfile.medicalRestrictions, value])
  newMedicalRestriction.value = ''
}

const removeMedicalRestriction = (idx: number) => {
  const cloned = [...userProfileStore.userProfile.medicalRestrictions]
  cloned.splice(idx, 1)
  userProfileStore.setMedicalRestrictions(cloned)
}

watch(profileAge, (value) => {
  userProfileStore.setAge(value)
})

const handleSubmit = async () => {
  if (!ingredients.value.trim()) {
    error.value = "Please enter some ingredients"
    return
  }

  loading.value = true
  error.value = ""
  result.value = null

  try {
    const ingredientsArray = ingredients.value
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0)

    const userProfile = {
      age: userProfileStore.userProfile.age ?? 0,
      allergies: Array.isArray(userProfileStore.userProfile.allergies) ? userProfileStore.userProfile.allergies : [],
      religiousRestrictions: Array.isArray(userProfileStore.userProfile.religiousRestrictions) ? userProfileStore.userProfile.religiousRestrictions : [],
      medicalRestrictions: Array.isArray(userProfileStore.userProfile.medicalRestrictions) ? userProfileStore.userProfile.medicalRestrictions : [],
    }

    const kitchen = {
      ingredients: Array.isArray(kitchenState.ingredients) ? kitchenState.ingredients.map(item => ({
        name: item.name.trim(),
        freshness: item.freshness || 'fresh',
      })) : [],
      servings: kitchenState.servings && kitchenState.servings > 0 ? kitchenState.servings : 1,
      people: kitchenState.people && kitchenState.people > 0 ? kitchenState.people : 1,
    }

    const recipeRequest = {
      ingredients: ingredientsArray,
      cuisine: cuisine.value === 'any' ? undefined : cuisine.value,
      userProfile,
      kitchenState: kitchen,
    }

    console.log('Generate recipe: profile:', userProfile)
    console.log('Generate recipe: parsed ingredients:', ingredientsArray)
    console.log('Generate recipe: kitchen state:', kitchen)
    console.log('Generate recipe: request payload:', recipeRequest)

    const data = await generateRecipe(recipeRequest)

    result.value = data
  } catch (err) {
    console.error('Recipe generation failed:', err)
    error.value = err instanceof Error ? err.message : 'Failed to generate recipe'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeInUp {
  animation: fadeInUp 0.6s ease-out forwards;
}

.animation-delay-200 {
  animation-delay: 0.2s;
}

.animation-delay-400 {
  animation-delay: 0.4s;
}
</style>
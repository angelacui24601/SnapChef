<template>
  <div class="min-h-screen bg-gray-50 p-4 md:p-8">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12">
        <div class="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
          </svg>
        </div>
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          SnapChef AI
        </h1>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Transform your ingredients into delicious recipes with AI-powered intelligence
        </p>
      </div>

      <!-- Error Display -->
      <div v-if="error" class="mb-8">
        <div class="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-4">
          <div class="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
          </div>
          <div class="flex-1">
            <h3 class="text-red-800 font-semibold mb-1">Error</h3>
            <p class="text-red-700 text-sm">{{ error }}</p>
          </div>
          <button
            @click="error = null"
            class="text-red-500 hover:text-red-700 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="grid lg:grid-cols-3 gap-8">
        <!-- Left Column - Input Section -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Ingredient Input Section -->
          <div class="bg-white rounded-2xl p-8 shadow-sm border border-white/80">
            <ImageUploader
              :is-detecting="isDetecting"
              @file-selected="handleFileSelected"
              @image-removed="handleImageRemoved"
            />

            <div class="mt-6">
              <IngredientInput
                :ingredients="ingredients"
                @add-ingredient="addIngredient"
                @remove-ingredient="removeIngredient"
              />
            </div>
          </div>

          <!-- Constraints Panel -->
          <div class="bg-white rounded-2xl p-8 shadow-sm border border-white/80">
            <ConstraintsPanel
              :budget="budget"
              :selected-time="selectedTime"
              :selected-effort="selectedEffort"
              @budget-changed="budget = $event"
              @time-changed="selectedTime = $event"
              @effort-changed="selectedEffort = $event"
            />
          </div>
        </div>

        <!-- Right Column - Mode Selector & Generate -->
        <div class="space-y-8">
          <!-- Mode Selector -->
          <div class="bg-white rounded-2xl p-8 shadow-sm border border-white/80">
            <ModeSelector
              :selected-modes="selectedModes"
              @modes-changed="selectedModes = $event"
            />
          </div>

          <!-- Generate Button -->
          <div class="bg-white rounded-2xl p-8 shadow-sm border border-white/80">
            <button
              @click="generateRecipe"
              :disabled="ingredients.length === 0 || isGenerating"
              class="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:shadow-none disabled:cursor-not-allowed transform hover:-translate-y-1 active:translate-y-0"
            >
              <template v-if="isGenerating">
                <svg class="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25"></circle>
                  <path fill="currentColor" class="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Recipe...
              </template>
              <template v-else>
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                Generate Recipe
              </template>
            </button>

            <p v-if="ingredients.length === 0" class="text-sm text-gray-500 text-center mt-3">
              Add some ingredients to get started
            </p>
          </div>
        </div>
      </div>

      <!-- Loading Animation -->
      <div v-if="isGenerating" class="mt-12">
        <LoadingAnimation />
      </div>

      <!-- Recipe Result -->
      <div v-else-if="recipe" class="mt-12">
        <RecipeResult :result="recipe" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { detectIngredients as detectIngredientsAPI, generateRecipe as generateRecipeAPI, getErrorMessage } from '../services/apiService'
import ImageUploader from './ImageUploader.vue'
import IngredientInput from './IngredientInput.vue'
import ConstraintsPanel from './ConstraintsPanel.vue'
import ModeSelector from './ModeSelector.vue'
import LoadingAnimation from './LoadingAnimation.vue'
import RecipeResult from './RecipeResult.vue'

interface Ingredient {
  name: string
  priority: string
}

// Reactive data
const ingredients = ref<Ingredient[]>([])
const budget = ref(25)
const selectedTime = ref('30')
const selectedEffort = ref('Medium')
const selectedModes = ref<string[]>([])

// Recipe result
const recipe = ref<any>(null)
const isGenerating = ref(false)
const isDetecting = ref(false)
const error = ref<string | null>(null)

// Methods
const addIngredient = (ingredient: Ingredient) => {
  ingredients.value.push(ingredient)
}

const removeIngredient = (index: number) => {
  ingredients.value.splice(index, 1)
}

const handleFileSelected = async (file: File) => {
  await detectIngredients(file)
}

const handleImageRemoved = () => {
  // Image removed, no action needed
}

const detectIngredients = async (file: File) => {
  isDetecting.value = true
  error.value = null

  try {
    const response = await detectIngredientsAPI(file)

    // Add detected ingredients if not already present
    if (response.ingredients && Array.isArray(response.ingredients)) {
      response.ingredients.forEach((ingredientName: string) => {
        const exists = ingredients.value.some(ing =>
          ing.name.toLowerCase() === ingredientName.toLowerCase()
        )
        if (!exists) {
          ingredients.value.push({
            name: ingredientName,
            priority: 'fresh' // Default priority for detected ingredients
          })
        }
      })
    }
  } catch (err) {
    console.error('Error detecting ingredients:', err)
    error.value = getErrorMessage(err)
  } finally {
    isDetecting.value = false
  }
}

const generateRecipe = async () => {
  if (ingredients.value.length === 0) return

  isGenerating.value = true
  error.value = null

  try {
    const requestData = {
      ingredients: ingredients.value.map(ing => ing.name),
      constraints: {
        budget: budget.value,
        time: parseInt(selectedTime.value),
        effort: selectedEffort.value.toLowerCase()
      },
      mode: selectedModes.value.length > 0 ? selectedModes.value.join(', ') : undefined
    }

    const response = await generateRecipeAPI(requestData)
    recipe.value = response
  } catch (err) {
    console.error('Error generating recipe:', err)
    error.value = getErrorMessage(err)
  } finally {
    isGenerating.value = false
  }
}
</script>
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
      <div v-if="error" class="mb-8 bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <div class="flex items-center justify-center gap-3 mb-3">
          <div class="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center">
            <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-red-800">Error</h3>
        </div>
        <p class="text-red-700">{{ error }}</p>
        <button
          @click="error = null"
          class="mt-3 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200"
        >
          Dismiss
        </button>
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
        <!-- Left Column - Input Section -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Ingredient Input Section -->
          <div class="bg-white rounded-2xl p-8 shadow-sm border border-white/80">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                </svg>
              </div>
              <h2 class="text-2xl font-bold text-gray-900">Ingredients</h2>
            </div>

            <!-- Image Upload Area -->
            <div class="mb-6">
              <div
                @dragover.prevent
                @drop.prevent="handleDrop"
                class="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center transition-all duration-300 hover:border-green-400 hover:bg-green-50 cursor-pointer"
                :class="{ 'border-green-500 bg-green-50': isDragOver }"
              >
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  @change="handleFileSelect"
                  class="hidden"
                />

                <div v-if="!uploadedImage" class="space-y-4">
                  <div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto">
                    <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <div>
                    <p class="text-lg font-semibold text-gray-700 mb-2">Upload Ingredient Photo</p>
                    <p class="text-gray-500">Drag & drop an image or click to browse</p>
                  </div>
                  <button
                    @click="$refs.fileInput.click()"
                    class="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
                  >
                    Choose Image
                  </button>
                </div>

                <div v-else-if="isDetecting" class="space-y-4">
                  <img :src="uploadedImage" alt="Uploaded ingredients" class="max-h-48 mx-auto rounded-xl shadow-sm opacity-50" />
                  <div class="flex flex-col items-center gap-3">
                    <div class="flex items-center gap-3">
                      <svg class="w-6 h-6 animate-spin text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25"></circle>
                        <path fill="currentColor" class="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span class="text-green-600 font-semibold">Detecting ingredients...</span>
                    </div>
                    <p class="text-sm text-gray-500">AI is analyzing your image</p>
                  </div>
                </div>

                <div v-else class="space-y-4">
                  <img :src="uploadedImage" alt="Uploaded ingredients" class="max-h-48 mx-auto rounded-xl shadow-sm" />
                  <div class="flex gap-3 justify-center">
                    <button
                      @click="$refs.fileInput.click()"
                      class="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 text-sm"
                    >
                      Change Image
                    </button>
                    <button
                      @click="removeImage"
                      class="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Manual Ingredient Input -->
            <div class="space-y-4">
              <label class="block text-sm font-semibold text-gray-700">
                Or add ingredients manually
              </label>
              <div class="flex gap-3">
                <input
                  v-model="newIngredient"
                  @keyup.enter="addIngredient"
                  placeholder="Enter ingredient (e.g., chicken breast)"
                  class="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                />
                <select
                  v-model="expirationPriority"
                  class="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                >
                  <option value="fresh">Fresh</option>
                  <option value="medium">Medium</option>
                  <option value="soon">Expiring Soon</option>
                </select>
                <button
                  @click="addIngredient"
                  :disabled="!newIngredient.trim()"
                  class="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
            </div>

            <!-- Ingredient Chips -->
            <div v-if="ingredients.length > 0" class="mt-6">
              <h3 class="text-sm font-semibold text-gray-700 mb-3">Your Ingredients:</h3>
              <div class="flex flex-wrap gap-3">
                <div
                  v-for="(ingredient, index) in ingredients"
                  :key="index"
                  class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105"
                  :class="getChipStyle(ingredient.priority)"
                >
                  <span>{{ ingredient.name }}</span>
                  <button
                    @click="removeIngredient(index)"
                    class="w-4 h-4 rounded-full bg-white/50 hover:bg-white flex items-center justify-center transition-colors"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Constraints Panel -->
          <div class="bg-white rounded-2xl p-8 shadow-sm border border-white/80">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"/>
                </svg>
              </div>
              <h2 class="text-2xl font-bold text-gray-900">Constraints</h2>
            </div>

            <div class="grid md:grid-cols-3 gap-6">
              <!-- Budget Slider -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-3">
                  Budget: ${{ budget }}
                </label>
                <input
                  v-model="budget"
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div class="flex justify-between text-xs text-gray-500 mt-1">
                  <span>$5</span>
                  <span>$50</span>
                </div>
              </div>

              <!-- Time Selector -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-3">
                  Cooking Time
                </label>
                <div class="grid grid-cols-3 gap-2">
                  <button
                    v-for="time in ['15', '30', '60']"
                    :key="time"
                    @click="selectedTime = time"
                    class="py-2 px-3 rounded-xl text-sm font-medium transition-all duration-200"
                    :class="selectedTime === time ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                  >
                    {{ time }}m
                  </button>
                </div>
              </div>

              <!-- Effort Level -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-3">
                  Effort Level
                </label>
                <div class="grid grid-cols-3 gap-2">
                  <button
                    v-for="effort in ['Low', 'Medium', 'High']"
                    :key="effort"
                    @click="selectedEffort = effort"
                    class="py-2 px-3 rounded-xl text-sm font-medium transition-all duration-200"
                    :class="selectedEffort === effort ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                  >
                    {{ effort }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column - Mode Selector & Generate -->
        <div class="space-y-8">
          <!-- Mode Selector -->
          <div class="bg-white rounded-2xl p-8 shadow-sm border border-white/80">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              </div>
              <h2 class="text-2xl font-bold text-gray-900">Mode</h2>
            </div>

            <div class="space-y-3">
              <button
                v-for="mode in ['Student', 'Budget-friendly', 'Quick meals', 'Family']"
                :key="mode"
                @click="toggleMode(mode)"
                class="w-full py-3 px-4 rounded-xl text-left font-medium transition-all duration-200 flex items-center justify-between"
                :class="selectedModes.includes(mode) ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
              >
                <span>{{ mode }}</span>
                <svg
                  v-if="selectedModes.includes(mode)"
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
              </button>
            </div>
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

      <!-- Result Section -->
      <div v-if="recipe" class="mt-12">
        <div class="bg-white rounded-2xl p-8 shadow-sm border border-white/80">
          <!-- Recipe Header -->
          <div class="flex items-center gap-4 mb-8">
            <div class="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
            </div>
            <div>
              <h2 class="text-3xl font-bold text-gray-900">{{ recipe.title }}</h2>
              <div class="flex gap-4 mt-2 text-sm text-gray-600">
                <span>⏱️ {{ selectedTime }} min</span>
                <span>💰 ${{ budget }}</span>
                <span>🔥 {{ selectedEffort }}</span>
              </div>
            </div>
          </div>

          <!-- Instructions -->
          <div class="mb-8">
            <h3 class="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
              Instructions
            </h3>
            <ol class="space-y-4">
              <li
                v-for="(step, index) in recipe.steps"
                :key="index"
                class="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-gray-100 transition-colors"
              >
                <div class="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                  {{ index + 1 }}
                </div>
                <div class="text-gray-700 leading-relaxed pt-1">
                  {{ step }}
                </div>
              </li>
            </ol>
          </div>

          <!-- Nutrition Information -->
          <div v-if="recipe.nutrition" class="border-t border-gray-200 pt-8">
            <h3 class="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
              Nutrition Information
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div
                v-for="[key, value] in Object.entries(recipe.nutrition)"
                :key="key"
                class="p-4 bg-orange-50 rounded-2xl border border-orange-100 text-center"
              >
                <div class="text-xl font-bold text-orange-600 mb-1">
                  {{ value }}
                </div>
                <div class="text-sm text-gray-600 capitalize">
                  {{ key.replace(/([A-Z])/g, ' $1').trim() }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { detectIngredients as detectIngredientsAPI, generateRecipe as generateRecipeAPI, getErrorMessage } from './services/apiService'

// Reactive data
const ingredients = ref<Array<{name: string, priority: string}>>([])
const newIngredient = ref('')
const expirationPriority = ref('fresh')
const uploadedImage = ref<string | null>(null)
const isDragOver = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

// Constraints
const budget = ref(25)
const selectedTime = ref('30')
const selectedEffort = ref('Medium')

// Mode selector
const selectedModes = ref<string[]>([])

// Recipe result
const recipe = ref<any>(null)
const isGenerating = ref(false)
const isDetecting = ref(false)
const error = ref<string | null>(null)

// Methods
const addIngredient = () => {
  if (newIngredient.value.trim()) {
    ingredients.value.push({
      name: newIngredient.value.trim(),
      priority: expirationPriority.value
    })
    newIngredient.value = ''
  }
}

const removeIngredient = (index: number) => {
  ingredients.value.splice(index, 1)
}

const getChipStyle = (priority: string) => {
  const baseClasses = 'transition-all duration-200'
  switch (priority) {
    case 'soon':
      return `${baseClasses} bg-red-100 text-red-800 border border-red-200`
    case 'medium':
      return `${baseClasses} bg-orange-100 text-orange-800 border border-orange-200`
    case 'fresh':
    default:
      return `${baseClasses} bg-green-100 text-green-800 border border-green-200`
  }
}

const handleDrop = (event: DragEvent) => {
  isDragOver.value = false
  const files = event.dataTransfer?.files
  if (files && files[0]) {
    handleFile(files[0])
  }
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files && files[0]) {
    handleFile(files[0])
  }
}

const handleFile = async (file: File) => {
  if (file.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = (e) => {
      uploadedImage.value = e.target?.result as string
    }
    reader.readAsDataURL(file)

    // Call API to detect ingredients
    await detectIngredients(file)
  }
}

const removeImage = () => {
  uploadedImage.value = null
  error.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
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

const toggleMode = (mode: string) => {
  const index = selectedModes.value.indexOf(mode)
  if (index > -1) {
    selectedModes.value.splice(index, 1)
  } else {
    selectedModes.value.push(mode)
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

<style scoped>
.slider::-webkit-slider-thumb {
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #22c55e;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.slider::-moz-range-thumb {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #22c55e;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style></content>
<parameter name="filePath">/Users/angela2007/ai-recipe/SnapChefUI.vue
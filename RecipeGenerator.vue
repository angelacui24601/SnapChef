<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="max-w-2xl w-full bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">AI Recipe Generator</h1>
        <p class="text-gray-600">Turn your ingredients into delicious meals</p>
      </div>

      <!-- Form -->
      <div class="space-y-6">
        <!-- Ingredients Input -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            🥕 Ingredients
          </label>
          <textarea
            v-model="ingredients"
            placeholder="Enter ingredients separated by commas (e.g., chicken, rice, carrots, onions)"
            class="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
            rows="3"
          ></textarea>
        </div>

        <!-- Cuisine Selector -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            🌍 Cuisine Type
          </label>
          <select
            v-model="cuisine"
            class="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
          >
            <option value="any">Any Cuisine</option>
            <option value="italian">Italian</option>
            <option value="mexican">Mexican</option>
            <option value="asian">Asian</option>
            <option value="mediterranean">Mediterranean</option>
            <option value="american">American</option>
          </select>
        </div>

        <!-- Generate Button -->
        <button
          @click="generateRecipe"
          class="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-2xl transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
          <span>Generate Recipe</span>
        </button>
      </div>

      <!-- Results Section -->
      <div class="mt-8">
        <div class="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center">
          <div class="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Your Recipe Will Appear Here</h3>
          <p class="text-gray-500">Add some ingredients and click generate to get started</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const ingredients = ref('')
const cuisine = ref('any')

const generateRecipe = () => {
  // TODO: Implement API call
  console.log('Generating recipe with:', { ingredients: ingredients.value, cuisine: cuisine.value })
}
</script>

<style scoped>
/* Additional custom styles if needed */
</style>
<template>
  <div class="bg-white rounded-2xl p-8 shadow-sm border border-white/80">
    <div class="grid gap-6">
      <!-- Ingredients Input -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">
          🥕 Ingredients
        </label>
        <textarea
          v-model="ingredientsValue"
          placeholder="Enter ingredients separated by commas (e.g., chicken, rice, carrots, onions)"
          class="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none transition-all duration-300"
          rows="4"
        />
      </div>

      <!-- Cuisine Selector -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">
          🌍 Cuisine Type
        </label>
        <select
          v-model="cuisineValue"
          class="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition-all duration-300"
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
        @click="$emit('submit')"
        :disabled="loading"
        class="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:shadow-none disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
      >
        <template v-if="loading">
          <svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25"></circle>
            <path fill="currentColor" class="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Generating Recipe...
        </template>
        <template v-else>
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
          Generate Recipe
        </template>
      </button>

      <!-- Error Message -->
      <div
        v-if="error"
        class="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 flex items-center gap-3"
      >
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  ingredients: string
  cuisine: string
  loading: boolean
  error: string
}

interface Emits {
  (e: 'update:ingredients', value: string): void
  (e: 'update:cuisine', value: string): void
  (e: 'submit'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const ingredientsValue = computed({
  get: () => props.ingredients,
  set: (value) => emit('update:ingredients', value)
})

const cuisineValue = computed({
  get: () => props.cuisine,
  set: (value) => emit('update:cuisine', value)
})
</script>
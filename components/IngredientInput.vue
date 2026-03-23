<template>
  <div class="space-y-4">
    <label class="block text-sm font-semibold text-gray-700">
      🥕 Ingredients
    </label>

    <!-- Manual Ingredient Input -->
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

    <!-- Ingredient Chips -->
    <div v-if="ingredients.length > 0" class="space-y-3">
      <h3 class="text-sm font-semibold text-gray-700">Your Ingredients:</h3>
      <div class="flex flex-wrap gap-3">
        <div
          v-for="(ingredient, index) in ingredients"
          :key="index"
          class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105"
          :class="getChipStyle(ingredient.priority)"
        >
          <span>{{ ingredient.name }}</span>
          <button
            @click="$emit('remove-ingredient', index)"
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
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Ingredient {
  name: string
  priority: string
}

interface Props {
  ingredients: Ingredient[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'add-ingredient': [ingredient: Ingredient]
  'remove-ingredient': [index: number]
}>()

// Local state
const newIngredient = ref('')
const expirationPriority = ref('fresh')

const addIngredient = () => {
  if (newIngredient.value.trim()) {
    emit('add-ingredient', {
      name: newIngredient.value.trim(),
      priority: expirationPriority.value
    })
    newIngredient.value = ''
  }
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
</script>
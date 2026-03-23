<template>
  <div class="bg-white rounded-2xl p-8 shadow-sm border border-white/80">
    <!-- Recipe Header -->
    <div class="flex items-center gap-4 mb-6">
      <div class="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center">
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
        </svg>
      </div>
      <h3 class="text-2xl font-bold text-gray-900">
        {{ result.title }}
      </h3>
    </div>

    <!-- Instructions -->
    <div class="mb-8">
      <h4 class="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
        Instructions
      </h4>
      <ol class="space-y-3">
        <li
          v-for="(step, index) in result.steps"
          :key="index"
          class="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100"
        >
          <div class="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {{ index + 1 }}
          </div>
          <div class="text-gray-700 leading-relaxed">
            {{ step }}
          </div>
        </li>
      </ol>
    </div>

    <!-- Nutrition Information -->
    <div v-if="result.nutrition && Object.keys(result.nutrition).length > 0">
      <h4 class="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
        </svg>
        Nutrition Information
      </h4>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          v-for="[key, value] in Object.entries(result.nutrition).filter(([, v]) => v)"
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
</template>

<script setup lang="ts">
interface RecipeData {
  title: string
  steps: string[]
  nutrition?: Record<string, string | undefined>
}

interface Props {
  result: RecipeData
}

defineProps<Props>()
</script>
<template>
  <div class="space-y-6">
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
            @click="$emit('time-changed', time)"
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
            @click="$emit('effort-changed', effort)"
            class="py-2 px-3 rounded-xl text-sm font-medium transition-all duration-200"
            :class="selectedEffort === effort ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
          >
            {{ effort }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  budget: number
  selectedTime: string
  selectedEffort: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'budget-changed': [budget: number]
  'time-changed': [time: string]
  'effort-changed': [effort: string]
}>()

// Reactive props with v-model support
const budget = computed({
  get: () => props.budget,
  set: (value) => emit('budget-changed', value)
})

const selectedTime = computed({
  get: () => props.selectedTime,
  set: (value) => emit('time-changed', value)
})

const selectedEffort = computed({
  get: () => props.selectedEffort,
  set: (value) => emit('effort-changed', value)
})
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
</style>
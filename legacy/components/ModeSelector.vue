<template>
  <div class="space-y-6">
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
        v-for="mode in availableModes"
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
</template>

<script setup lang="ts">
interface Props {
  selectedModes: string[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'modes-changed': [modes: string[]]
}>()

// Available modes
const availableModes = ['Student', 'Budget-friendly', 'Quick meals', 'Family']

const toggleMode = (mode: string) => {
  const currentModes = [...props.selectedModes]
  const index = currentModes.indexOf(mode)

  if (index > -1) {
    currentModes.splice(index, 1)
  } else {
    currentModes.push(mode)
  }

  emit('modes-changed', currentModes)
}
</script>
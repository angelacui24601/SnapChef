<template>
  <div class="bg-white rounded-2xl p-12 shadow-sm border border-white/80 text-center">
    <!-- Animated Chef Icon -->
    <div class="relative w-24 h-24 mx-auto mb-6">
      <!-- Chef Hat -->
      <div class="absolute inset-0 animate-bounce">
        <svg class="w-full h-full text-green-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      </div>

      <!-- Cooking Elements Animation -->
      <div class="absolute -top-2 -right-2 animate-ping">
        <svg class="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"/>
        </svg>
      </div>

      <!-- Ingredients Floating -->
      <div class="absolute -bottom-1 -left-1 animate-pulse">
        <svg class="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
        </svg>
      </div>
    </div>

    <!-- Loading Text -->
    <h3 class="text-xl font-semibold text-gray-900 mb-2">
      Crafting Your Recipe
    </h3>
    <p class="text-gray-600 mb-6">
      Our AI chef is working its magic...
    </p>

    <!-- Progress Animation -->
    <div class="flex justify-center space-x-2">
      <div class="w-3 h-3 bg-green-500 rounded-full animate-bounce"></div>
      <div class="w-3 h-3 bg-green-500 rounded-full animate-bounce animation-delay-100"></div>
      <div class="w-3 h-3 bg-green-500 rounded-full animate-bounce animation-delay-200"></div>
    </div>

    <!-- Fun Facts -->
    <div class="mt-8 p-4 bg-gray-50 rounded-2xl">
      <p class="text-sm text-gray-600 italic">
        "Did you know? The average person wastes 20-30% of the food they buy..."
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
// No props needed for loading animation
</script>

<style scoped>
.animation-delay-100 {
  animation-delay: 0.1s;
}

.animation-delay-200 {
  animation-delay: 0.2s;
}

/* Custom animations for more engaging loading */
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-float {
  animation: float 2s ease-in-out infinite;
}
</style>
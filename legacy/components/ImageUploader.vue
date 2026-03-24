<template>
  <div class="space-y-4">
    <label class="block text-sm font-semibold text-gray-700">
      📸 Upload Ingredient Photo
    </label>

    <!-- Upload Area -->
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
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  isDetecting: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'file-selected': [file: File]
  'image-removed': []
}>()

// Local state
const uploadedImage = ref<string | null>(null)
const isDragOver = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

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

const handleFile = (file: File) => {
  if (file.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = (e) => {
      uploadedImage.value = e.target?.result as string
      emit('file-selected', file)
    }
    reader.readAsDataURL(file)
  }
}

const removeImage = () => {
  uploadedImage.value = null
  emit('image-removed')
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>
# SnapChef AI - Vue 3 Recipe Generator UI

A comprehensive, vector-style Vue 3 UI component for an AI-powered recipe generator with advanced intelligent features.

## 🎨 Design Features

- **Vector-style UI**: Clean, modern design with rounded components (16-20px border radius)
- **Soft Color Palette**:
  - Primary: Green (#22c55e)
  - Accent: Orange (#f97316)
  - Background: Light gray (#f8fafc)
- **Minimal shadows** and clean layout with plenty of whitespace
- **Icon-based design** instead of realistic images
- **Friendly, accessible, slightly playful feel**

## 🚀 Core Features

### 1. Multi-Modal Ingredient Input
- **Text input** for manual ingredient entry (comma-separated)
- **Image upload** with drag & drop functionality
- **Ingredient chips** with removable interface
- **Expiration priority** system (fresh/medium/soon) with color coding:
  - 🟢 Green = Fresh
  - 🟠 Orange = Medium priority
  - 🔴 Red = Expiring soon

### 2. Advanced Image Processing
- **Drag & drop upload area** with visual feedback
- **Image preview** after upload
- **AI ingredient detection** simulation (ready for backend integration)
- **Auto-population** of ingredient chips from detected results
- **Edit/remove** detected ingredients

### 3. Smart Constraints Panel
- **Budget slider** ($5-$50 range)
- **Time selector** (15/30/60 minutes)
- **Effort level** (Low/Medium/High)

### 4. Social Impact Mode Selector
- **Toggle buttons** for different cooking preferences:
  - Student
  - Budget-friendly
  - Quick meals
  - Family

### 5. Intelligent Recipe Generation
- **Prominent generate button** with loading animation
- **Disabled state** when no ingredients provided
- **Smooth transitions** and hover effects

### 6. Comprehensive Result Display
- **Recipe title** with metadata
- **Numbered step instructions**
- **Optional nutrition information** in a clean grid layout

## 🛠️ Technical Implementation

- **Vue 3** with Composition API (`<script setup>`)
- **TypeScript** for type safety
- **TailwindCSS** for styling
- **Responsive design** (mobile-first approach)
- **Accessibility** considerations (proper labels, keyboard navigation)

## 📁 File Structure

```
SnapChefUI.vue          # Main component
demo.html               # Simple demo page
README.md              # This documentation
```

## 🔧 Usage

```vue
<template>
  <SnapChefUI />
</template>

<script setup>
import SnapChefUI from './components/SnapChefUI.vue'
</script>
```

## 🎯 UX Highlights

- **Smooth animations** for state changes and interactions
- **Visual feedback** for drag & drop operations
- **Color-coded priority system** for ingredient freshness
- **Progressive disclosure** of information
- **Intuitive iconography** throughout the interface
- **Responsive grid layouts** that work on all devices

## 🔮 Backend Integration Points

The component includes TODO comments for backend integration:

1. **Image Analysis API**: Call to detect ingredients from uploaded images
2. **Recipe Generation API**: Generate recipes based on ingredients and constraints
3. **Nutrition Calculation**: Optional nutrition information retrieval

## 🎨 Customization

The component uses CSS custom properties and Tailwind classes for easy theming:

- Modify color variables in the component
- Adjust border radius values
- Customize spacing and typography
- Extend the constraints and modes arrays

## 📱 Responsive Design

- **Mobile-first approach** with progressive enhancement
- **Flexible grid layouts** that adapt to screen size
- **Touch-friendly** button sizes and interactions
- **Optimized spacing** for different viewports

This component provides a complete, production-ready UI foundation for an AI-powered recipe generator with room for backend integration and further customization.</content>
<parameter name="filePath">/Users/angela2007/ai-recipe/README-SnapChef.md
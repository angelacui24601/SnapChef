# SnapChef AI - Modular Vue Components

A comprehensive, modular Vue 3 UI for an AI-powered recipe generator with advanced intelligent features.

## 🏗️ **Modular Architecture**

The application is now structured into focused, reusable Vue components:

### **Core Components**

#### 🏠 **Home.vue** - Main Container
- **Purpose**: Orchestrates all child components and manages global state
- **Props**: None
- **Emits**: None (manages internal state)
- **Children**: All other components
- **Responsibilities**:
  - State management for ingredients, constraints, modes
  - API orchestration (detect ingredients, generate recipes)
  - Error handling and loading states
  - Layout and responsive design

#### 📸 **ImageUploader.vue** - Image Upload & Detection
- **Purpose**: Handles image upload with drag & drop functionality
- **Props**:
  - `isDetecting: boolean` - Shows loading state during AI processing
- **Emits**:
  - `file-selected: [file: File]` - When user selects/uploads an image
  - `image-removed: []` - When user removes the uploaded image
- **Features**:
  - Drag & drop interface
  - File validation (image types, size limits)
  - Preview functionality
  - Loading states during AI processing

#### 🥕 **IngredientInput.vue** - Manual Ingredient Management
- **Purpose**: Text input and chip-based ingredient management
- **Props**:
  - `ingredients: Ingredient[]` - Array of current ingredients
- **Emits**:
  - `add-ingredient: [ingredient: Ingredient]` - When user adds new ingredient
  - `remove-ingredient: [index: number]` - When user removes ingredient
- **Features**:
  - Text input with enter key support
  - Expiration priority selection (fresh/medium/soon)
  - Color-coded ingredient chips
  - Remove functionality

#### ⚙️ **ConstraintsPanel.vue** - Recipe Constraints
- **Purpose**: Budget, time, and effort level controls
- **Props**:
  - `budget: number` - Current budget value
  - `selectedTime: string` - Selected cooking time
  - `selectedEffort: string` - Selected effort level
- **Emits**:
  - `budget-changed: [budget: number]`
  - `time-changed: [time: string]`
  - `effort-changed: [effort: string]`
- **Features**:
  - Interactive budget slider ($5-$50)
  - Time selector buttons (15/30/60 min)
  - Effort level buttons (Low/Medium/High)

#### 👥 **ModeSelector.vue** - Social Impact Modes
- **Purpose**: Toggle buttons for different cooking preferences
- **Props**:
  - `selectedModes: string[]` - Currently selected modes
- **Emits**:
  - `modes-changed: [modes: string[]]` - Updated mode selection
- **Features**:
  - Multi-select toggle buttons
  - Visual checkmarks for selected modes
  - Modes: Student, Budget-friendly, Quick meals, Family

#### ⏳ **LoadingAnimation.vue** - Animated Loading State
- **Purpose**: Vector-style animated loader during processing
- **Props**: None
- **Features**:
  - Animated chef icon with cooking elements
  - Bouncing progress dots
  - Fun facts display
  - Smooth transitions

#### 📋 **RecipeResult.vue** - Recipe Display
- **Purpose**: Displays generated recipe with steps and nutrition
- **Props**:
  - `result: RecipeData` - Recipe object with title, steps, nutrition
- **Features**:
  - Recipe title with metadata
  - Numbered step instructions
  - Nutrition information grid
  - Responsive layout

## 🔧 **Technical Implementation**

### **State Management**
- **Local Component State**: Each component manages its own internal state
- **Parent-Child Communication**: Props down, events up pattern
- **Centralized Logic**: Home.vue orchestrates API calls and shared state

### **API Integration**
- **Service Layer**: `services/apiService.ts` handles all backend communication
- **Error Handling**: Comprehensive error catching with user-friendly messages
- **Loading States**: Visual feedback during async operations

### **TypeScript Interfaces**
```typescript
interface Ingredient {
  name: string
  priority: string  // 'fresh' | 'medium' | 'soon'
}

interface RecipeData {
  title: string
  steps: string[]
  nutrition?: Record<string, string | undefined>
}
```

## 📁 **File Structure**
```
components/
├── Home.vue              # Main container component
├── ImageUploader.vue     # Image upload with drag & drop
├── IngredientInput.vue   # Text input and ingredient chips
├── ConstraintsPanel.vue  # Budget, time, effort controls
├── ModeSelector.vue      # Social impact mode toggles
├── LoadingAnimation.vue  # Animated loading state
└── RecipeResult.vue      # Recipe display component

services/
└── apiService.ts         # API communication layer

demo-modular.html         # Standalone demo page
```

## 🚀 **Usage**

### **Individual Components**
```vue
<template>
  <div>
    <ImageUploader
      :is-detecting="isDetecting"
      @file-selected="handleFile"
      @image-removed="handleRemove"
    />

    <IngredientInput
      :ingredients="ingredients"
      @add-ingredient="addIngredient"
      @remove-ingredient="removeIngredient"
    />
  </div>
</template>
```

### **Full Application**
```vue
<template>
  <Home />
</template>
```

## 🎨 **Design Consistency**

All components follow the established design system:
- **Border Radius**: `rounded-2xl` (16px) for containers
- **Color Palette**: Green (#22c55e), Orange (#f97316), Light Gray (#f8fafc)
- **Spacing**: Consistent padding (`p-8`) and gaps (`gap-6`, `gap-3`)
- **Typography**: Hierarchical font sizes and weights
- **Shadows**: Minimal `shadow-sm` for depth
- **Transitions**: Smooth `duration-200` animations

## 🔄 **Component Communication**

### **Data Flow**
```
Home.vue (Parent)
├── Manages global state
├── Handles API calls
└── Passes data to children via props

Child Components
├── Receive data via props
├── Emit events for user interactions
└── Parent updates state and re-renders
```

### **Event Patterns**
- **File Operations**: `file-selected`, `image-removed`
- **Data Changes**: `add-ingredient`, `remove-ingredient`, `budget-changed`
- **Selections**: `time-changed`, `effort-changed`, `modes-changed`

## 🧪 **Testing the Components**

Run the demo:
```bash
# Open in browser
open demo-modular.html
```

Or integrate into your Vue app:
```javascript
import Home from './components/Home.vue'

const app = Vue.createApp({
  components: { Home }
})
```

## 🔮 **Extensibility**

The modular architecture makes it easy to:
- **Add new constraint types** in `ConstraintsPanel.vue`
- **Extend mode options** in `ModeSelector.vue`
- **Enhance ingredient management** in `IngredientInput.vue`
- **Customize loading animations** in `LoadingAnimation.vue`
- **Modify result display** in `RecipeResult.vue`

Each component is self-contained with clear interfaces, making the codebase maintainable and scalable.
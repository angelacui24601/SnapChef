<div align="center">
  <img src="public/snapchef-logo.png" alt="SnapChef logo" width="96" height="96" />
  <h1>SnapChef</h1>
  <p><strong>Snap a photo of your fridge. Get a personalized meal plan in seconds.</strong></p>

  ![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)
  ![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
  ![License](https://img.shields.io/badge/license-MIT-green)
</div>

---

## Overview

SnapChef is an AI-powered meal planning assistant that turns what's already in your kitchen into a personalized recipe. Upload a photo of your fridge or pantry, and the app detects your ingredients, generates a full meal plan, and adapts every recipe to your dietary profile — allergies, health goals, religious restrictions, and available kitchen tools included.

---

## Features

| Feature | Description |
|---|---|
| **AI Ingredient Detection** | Upload a fridge/pantry photo; GPT-4o vision identifies every food ingredient automatically, discarding non-food objects |
| **Personalized Meal Plans** | Recipes respect allergies, religious restrictions, medical needs, health goals, sex, age, and available kitchen equipment |
| **Freshness-Aware Planning** | Mark ingredients as Fresh / Expiring Soon / Use Now — expiring items are prioritized in the meal plan |
| **Multi-Meal Scheduling** | Plan breakfast, lunch, dinner, and snacks in a single request; specify per-meal serving sizes |
| **Favorites & History** | Save recipes to your profile for later; full favorites management with one tap |
| **Onboarding Flow** | 3-step guided setup collects dietary needs, kitchen tools, and health goals before the first recipe |
| **Clerk Auth** | Email, Google, and Apple sign-in; guest mode available for trying the app without an account |

---

## Tech Stack

**Architectural Stack:** Built from scratch with **Next.js 16 (App Router) + React 19 + TypeScript**, **Clerk** for auth, **OpenAI gpt-4o-mini** for recipe generation and vision-based ingredient detection, **Neon PostgreSQL** for persistence, **Tailwind CSS v4** for styling, refined with **GitHub Copilot**, and deployed on **Vercel**.

---

## Getting Started

### Prerequisites

- Node.js ≥ 20
- A Neon (or any PostgreSQL) database
- OpenAI API key
- Clerk application (free tier works)

### Installation

```bash
git clone https://github.com/angelacui24601/SnapChef.git
cd SnapChef
npm install
```

### Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `OPENAI_API_KEY` | OpenAI secret key |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/` |
| `DATABASE_URL` | PostgreSQL connection string (Neon, Supabase, Railway, etc.) |

### Database Setup

Run the schema once against your database:

```bash
psql $DATABASE_URL < server/db/schema.sql
```

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
app/                        # Next.js App Router pages & API routes
├── api/
│   ├── detect-ingredients/ # POST — GPT-4o vision: photo → ingredient list
│   ├── recipe/             # POST — GPT-4o: ingredients + profile → meal plan
│   ├── preferences/        # GET/POST — user dietary profile (Neon DB)
│   ├── favorites/          # GET — list saved recipes
│   └── favorite/           # POST/DELETE — save / unsave a recipe
├── onboarding/             # 3-step onboarding wizard
├── profile/                # User profile & saved recipes
├── sign-in/ sign-up/       # Clerk hosted auth pages
└── snapchef/               # Alternative entry route

components/
├── KitchenStatePanel.tsx   # Ingredient management + photo upload
├── RecipeOutputPanel.tsx   # Recipe display, tabs, favoriting
├── UserProfileSidebar.tsx  # Dietary profile summary sidebar
├── PreferencesModal.tsx    # Edit dietary preferences in-app
├── auth/                   # Clerk auth context & modal
└── onboarding/             # Step components for onboarding

lib/
├── services/               # API service layer (apiService, recipeService, etc.)
├── stores/                 # Kitchen state + user profile stores
└── db/                     # Neon DB connection pool

server/                     # Legacy Express server (reference only)
public/                     # Static assets incl. snapchef-logo.png
```

---

## API Reference

### `POST /api/detect-ingredients`

Accepts a multipart image upload. Returns detected food ingredients only — kitchen equipment, packaging, and non-food objects are filtered out by the model.

**Response**
```json
{ "ingredients": ["chicken breast", "carrot", "olive oil"] }
```
If the image contains no food:
```json
{ "ingredients": [], "warning": "No food ingredients detected. The image appears to show kitchen equipment." }
```

### `POST /api/recipe`

Generates a meal plan from an ingredient list, meal requests, and an optional user profile.

**Request body (excerpt)**
```json
{
  "ingredients": [{ "name": "chicken breast", "priority": "fresh" }],
  "meals": [{ "type": "dinner", "people": 2 }],
  "userProfile": {
    "age": 27,
    "sex": "female",
    "goal": "high protein",
    "allergies": ["nuts"],
    "religiousRestrictions": ["halal"],
    "kitchenTools": ["oven", "air fryer"]
  }
}
```

---

## Contributing

1. Fork the repo and create a feature branch (`git checkout -b feat/your-feature`)
2. Commit your changes with a descriptive message
3. Open a pull request — all PRs welcome

---

## License

MIT © SnapChef


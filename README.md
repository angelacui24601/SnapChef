This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Backend API

This repo also includes a standalone Node.js + Express + PostgreSQL backend for SnapChef.

### Folder structure

- `db/`
- `controllers/`
- `routes/`
- `server.js`

### Setup

1. Copy `.env.example` to `.env` and update the PostgreSQL connection values.
2. Create the database tables with `db/schema.sql`.
3. Start the backend with `npm run dev:api`.

### API endpoints

- `POST /api/preferences`
- `GET /api/preferences/:userId`
- `POST /api/favorite`
- `DELETE /api/favorite`
- `GET /api/favorites/:userId`

### Example payloads

Save preferences:

```json
{
	"email": "chef@example.com",
	"age": 27,
	"sex": "female",
	"goal": "meal_prep",
	"customGoal": "high protein lunches",
	"allergies": ["nuts"],
	"medical": "low sodium",
	"religious": "halal",
	"kitchenTools": ["oven", "air fryer"],
	"kitchenImage": "https://cdn.example.com/kitchen.png"
}
```

Add favorite with recipe payload:

```json
{
	"userId": "00000000-0000-0000-0000-000000000001",
	"recipe": {
		"title": "Sheet Pan Chicken",
		"cookTime": 25,
		"ingredients": ["chicken", "broccoli", "olive oil"],
		"steps": ["Preheat oven", "Season chicken", "Roast until done"]
	}
}
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# African Stores Canada

Next.js 14 directory frontend for African grocery stores, markets, and specialty shops across Canada. Data is stored in MongoDB Atlas (populated by a separate Python crawler) and queried directly from Next.js Server Components and Route Handlers.

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Mongoose
- Vercel deployment

## Prerequisites

- Node.js 20+
- MongoDB Atlas database `african_stores` with `stores` collection (same URI as the Python agent)

## Setup

```bash
# Install dependencies (if not already done)
npm install

# Environment
cp .env.local.example .env.local
# Add your MONGODB_URI and NEXT_PUBLIC_SITE_URL

# Verify MongoDB connection
npm run verify:db

# Development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `NEXT_PUBLIC_SITE_URL` | Public site URL (e.g. `http://localhost:3000` or production domain) |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build (pre-renders store detail pages) |
| `npm run start` | Start production server |
| `npm run verify:db` | Test MongoDB connection and store count |

## Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage with stats, city cards, categories, recent stores |
| `/stores` | Filterable directory (`?city=&category=&region=&q=&page=`) |
| `/stores/[slug]` | Store detail (slug: `name-city` kebab-case) |
| `/cities/[city]` | All stores in a city |

## API routes

| Route | Description |
|-------|-------------|
| `GET /api/stores` | Paginated stores (`city`, `category`, `region`, `q`, `page`, `limit`) |
| `GET /api/stats` | Total stores, city counts, category counts |

## Deploy to Vercel

1. Push the repo to GitHub (`kere-sifon/african-stores-web` or your fork).
2. Import the project in [Vercel](https://vercel.com/new).
3. Add environment variables:
   - `MONGODB_URI` — same Atlas URI as local
   - `NEXT_PUBLIC_SITE_URL` — your production URL (e.g. `https://your-app.vercel.app`)
4. Deploy. The build runs `generateStaticParams` for all store detail pages.

**Note:** Ensure your MongoDB Atlas IP allowlist includes `0.0.0.0/0` (or Vercel’s IP ranges) so serverless functions can connect.

## Project structure

```
src/
  app/              # Pages and API routes
  components/       # UI components
  lib/
    db.ts           # Mongoose connection singleton
    models/store.ts # Store schema + IStore type
    stores.ts       # Data access functions
    utils.ts        # slugify, formatPhone, category colors
scripts/
  verify-db.ts      # Connection smoke test
```

## GitHub

Organization: [kere-sifon](https://github.com/kere-sifon)  
Suggested repo name: `african-stores-web`

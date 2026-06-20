# African Stores Canada

Next.js 15 directory frontend for African grocery stores, markets, and specialty shops across Canada. Data is stored in MongoDB Atlas (populated by a separate Python crawler) and queried directly from Next.js Server Components and Route Handlers. Includes a password-protected `/ops` dashboard for crawl monitoring, eval/cost trends, and a human-in-the-loop review queue.

## Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Recharts (`/ops` eval and cost trend charts only — code-split, not loaded on the public site)
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
# Add your MONGODB_URI, NEXT_PUBLIC_SITE_URL, and OPS_PASSWORD

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
| `OPS_PASSWORD` | Shared password gating `/ops/*` and `/api/v1/admin/*` (see [Ops dashboard](#ops-dashboard) below). If unset, those routes return `503` rather than opening up. |

## Branching

- **`develop`** — integration branch; all CI and security checks must pass here
- **`main`** — production branch for Vercel (promote from `develop`; no CI gates on `main`)

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full workflow and quality gates.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build (pre-renders store detail pages) |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript (`tsc --noEmit`) |
| `npm run test` | Unit tests (Vitest) |
| `npm run audit:deps` | Fail on high+ npm audit findings |
| `npm run verify:db` | Test MongoDB connection and store count |

## Security & CI

| Check | Tool |
|-------|------|
| Lint, types, tests, build | GitHub Actions `ci.yml` |
| SAST | CodeQL |
| SCA | `npm audit` |
| Secret scan | Gitleaks |
| DAST | OWASP ZAP baseline |

Details: [SECURITY.md](./SECURITY.md), [CONTRIBUTING.md](./CONTRIBUTING.md).

## Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage with stats, city cards, categories, recent stores |
| `/stores` | Filterable directory (`?city=&category=&region=&q=&page=`) |
| `/stores/[slug]` | Store detail (slug: `name-city` kebab-case) |
| `/cities/[city]` | All stores in a city |
| `/ops` | Crawl status: province coverage, recent runs, review queue preview (password-protected) |
| `/ops/evals` | Eval score trends — search precision, validator accuracy, storage new-insert rate (password-protected) |
| `/ops/costs` | Token usage and Bedrock cost trends, by agent (password-protected) |
| `/ops/review` | Review queue — approve/reject low-confidence stores flagged by the Validator Agent (password-protected) |
| `/ops/login` | Password entry for the ops dashboard |

## API routes

| Route | Description |
|-------|-------------|
| `GET /api/stores` | Paginated stores (`city`, `category`, `region`, `q`, `page`, `limit`) |
| `GET /api/stats` | Total stores, city counts, category counts |
| `GET /api/v1/admin/ops-status` | Province coverage, recent crawls, review queue stats (password-protected) |
| `GET /api/v1/admin/evals` | Eval score trend data, optional `?province=` filter (password-protected) |
| `GET /api/v1/admin/costs` | Token/cost trend data, optional `?province=` filter (password-protected) |
| `GET /api/v1/admin/review` | Review queue listing, `?status=pending\|approved\|rejected\|all` (password-protected) |
| `POST /api/v1/admin/review/[id]/approve` | Approve a flagged store — saves it into `stores` (password-protected) |
| `POST /api/v1/admin/review/[id]/reject` | Reject a flagged store — no save, optional `{ reason }` body (password-protected) |

## Ops dashboard

`/ops` and `/api/v1/admin/*` read from two collections the Python crawler agent writes to directly — `crawl_history` (eval scores, token/cost summaries, run health) and `pending_review` (low-confidence stores flagged by the Validator Agent for human review). The web app never writes to `crawl_history`; it only writes to `pending_review` (status updates on approve/reject) and `stores` (on approve).

**Auth:** a single shared password via `src/middleware.ts`, not per-user accounts — appropriate for a solo-maintained internal dashboard, not a multi-tenant admin panel. Vercel's own Deployment Protection is whole-domain only on every plan (no path-level scoping), so it can't protect `/ops` without also gating the public site — this middleware exists specifically to work around that limitation. The middleware cookie stores a SHA-256 hash of the password, not the password itself, and fails closed (`503`) if `OPS_PASSWORD` isn't configured.

**Local setup:** add `OPS_PASSWORD` to `.env.local` (see `.env.local.example`), then visit `http://localhost:3000/ops` — you'll be redirected to `/ops/login`.

## Deploy to Vercel

Production deploys **only from `main`**. The repo includes [`vercel.json`](vercel.json) so pushes to `develop` or feature branches do not trigger Vercel builds.

1. Push the repo to GitHub (`kere-sifon/african-stores-web` or your fork).
2. Import the project in [Vercel](https://vercel.com/new).
3. Set **Production Branch** to `main` (Settings → Git).
4. Add environment variables:
   - `MONGODB_URI` — same Atlas URI as local
   - `NEXT_PUBLIC_SITE_URL` — your production URL (e.g. `https://your-app.vercel.app`)
   - `OPS_PASSWORD` — strong, unique value for Production (not the `.env.local.example` default)
5. Merge `develop` → `main` when ready to release; only that merge deploys production.

**Note:** Ensure your MongoDB Atlas IP allowlist includes `0.0.0.0/0` (or Vercel’s IP ranges) so serverless functions can connect.

## Project structure

```
src/
  app/              # Pages and API routes
    ops/            # Status, evals, costs, review, login pages
    api/v1/admin/   # Ops-status, evals, costs, review API routes
  components/       # UI components
    ops/            # Ops dashboard components (nav, charts, review queue list)
  lib/
    db.ts           # Mongoose connection singleton
    models/
      store.ts          # Store schema + IStore type
      crawlHistory.ts   # crawl_history schema (read-only — written by the Python agent)
      pendingReview.ts  # pending_review schema (read + write — approve/reject actions)
    stores.ts       # Public store directory data access
    ops.ts          # Ops dashboard data access + approve/reject actions
    utils.ts        # slugify, formatPhone, category colors
  middleware.ts      # Password gate for /ops and /api/v1/admin/*
scripts/
  verify-db.ts      # Connection smoke test
```

## GitHub

Organization: [kere-sifon](https://github.com/kere-sifon)  
Repository: `african-stores-web`

Push `develop` and enable branch protection using [.github/BRANCH_PROTECTION.md](.github/BRANCH_PROTECTION.md).
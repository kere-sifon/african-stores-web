# Contributing

## Branch strategy

| Branch | Purpose |
|--------|---------|
| `develop` | Integration branch. **All CI and security checks run here** and must pass before merge. |
| `main` | Production branch for Vercel. No CI gates on `main` — only promoted code from `develop`. |

**Flow:** `feature/*` → PR into `develop` (checks required) → PR `develop` → `main` when ready to deploy.

Do not push directly to `main` or `develop`.

## Local setup

```bash
npm install
cp .env.local.example .env.local
# Edit MONGODB_URI and NEXT_PUBLIC_SITE_URL
npm run verify:db
npm run dev
```

## Quality gates (required before merge)

Run locally before opening a PR:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run audit:deps
```

### Automated checks (GitHub Actions)

| Workflow | What it does |
|----------|----------------|
| **CI** | ESLint, TypeScript, Vitest coverage, production build |
| **CodeQL** | SAST — static analysis for security vulnerabilities |
| **Security** | `npm audit` (SCA) + Gitleaks secret scanning |
| **DAST** | OWASP ZAP baseline against a running build |

Workflows run on pull requests and pushes to **`develop` only**. DAST uses `MONGODB_URI` from repository secrets when set (optional but recommended for full route coverage).

### Required checks on `develop` (must pass to merge)

- `Lint, typecheck, test, build`
- `npm audit (SCA)`
- `Gitleaks (secrets)`
- `Analyze JavaScript/TypeScript`
- `OWASP ZAP baseline scan`

`main` does not run these gates — open a release PR from `develop` after they have already passed.

## Enable branch protection on GitHub

See [.github/BRANCH_PROTECTION.md](.github/BRANCH_PROTECTION.md) for step-by-step UI and `gh` CLI commands.

## Crawler data contract

The Python crawler should populate for each store:

- `name_lower`, `city_lower` — for fast slug resolution
- `slug` (optional) — canonical `name-city` kebab slug; indexed uniquely when present
- At least one of `address` or `phone` (non-empty) for listing visibility

## Reporting security issues

Do not open public issues for vulnerabilities. Contact the maintainers privately.

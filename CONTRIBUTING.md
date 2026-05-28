# Contributing

## Branch strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code only. Protected; merges require passing checks. |
| `develop` | Integration branch for features, fixes, and security hardening. |

**Flow:** feature branch → PR into `develop` → after validation, PR `develop` → `main` for releases.

Do not push directly to `main`.

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

All workflows run on PRs to `develop` and `main`. DAST uses `MONGODB_URI` from repository secrets when set (optional but recommended for full route coverage).

## Enable branch protection on GitHub

After pushing `develop`, configure in **Settings → Branches**:

### `main`

- Require pull request before merging
- Require approvals: 1
- Require status checks: `Lint, typecheck, test, build`, `npm audit (SCA)`, `Gitleaks (secrets)`, `Analyze JavaScript/TypeScript`, `OWASP ZAP baseline scan`
- Require branches to be up to date
- Do not allow bypassing

### `develop`

- Require pull request before merging
- Require status checks: `Lint, typecheck, test, build`, `npm audit (SCA)`, `Gitleaks (secrets)`
- Recommended: also require CodeQL on PRs to `develop`

## Crawler data contract

The Python crawler should populate for each store:

- `name_lower`, `city_lower` — for fast slug resolution
- `slug` (optional) — canonical `name-city` kebab slug; indexed uniquely when present
- At least one of `address` or `phone` (non-empty) for listing visibility

## Reporting security issues

Do not open public issues for vulnerabilities. Contact the maintainers privately.

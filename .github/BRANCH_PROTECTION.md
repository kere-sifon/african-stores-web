# Branch protection setup

All quality and security checks run on **`develop`** only. **`main`** is the production branch for Vercel — code reaches it only after passing checks on `develop`.

## Required status checks (develop only)

Configure these on the **`develop`** branch after at least one workflow run has completed:

| Check name |
|------------|
| `Lint, typecheck, test, build` |
| `npm audit (SCA)` |
| `Gitleaks (secrets)` |
| `Analyze JavaScript/TypeScript` |
| `OWASP ZAP baseline scan` |

## Apply via GitHub UI

### `develop` (all gates)

**Settings → Branches → Add rule → Branch name: `develop`**

- [x] Require a pull request before merging
- [x] Require status checks to pass before merging
- [x] Require branches to be up to date before merging
- Status checks: select all five checks listed above
- [ ] Do not require approvals (optional: enable if you want review on develop)

### `main` (production deploy only)

**Settings → Branches → Add rule → Branch name: `main`**

- [x] Require a pull request before merging
- [ ] **Do not** require status checks (already validated on `develop`)
- [x] Require linear history (optional, recommended)
- [x] Do not allow bypassing the above settings
- Merge path: open PR **`develop` → `main`** when ready to release

Point Vercel **Production Branch** to `main`. Optionally set **Preview** deployments to `develop`.

## Apply via `gh` CLI

Replace owner/repo if needed (`kere-sifon/african-stores-web`).

### Protect `develop` (all checks)

```bash
gh api repos/kere-sifon/african-stores-web/branches/develop/protection -X PUT \
  --input - <<'EOF'
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "Lint, typecheck, test, build",
      "npm audit (SCA)",
      "Gitleaks (secrets)",
      "Analyze JavaScript/TypeScript",
      "OWASP ZAP baseline scan"
    ]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 0,
    "dismiss_stale_reviews": true
  },
  "restrictions": null,
  "required_linear_history": false,
  "allow_force_pushes": false,
  "allow_deletions": false
}
EOF
```

### Protect `main` (PR only, no CI gates)

```bash
gh api repos/kere-sifon/african-stores-web/branches/main/protection -X PUT \
  --input - <<'EOF'
{
  "required_status_checks": null,
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "required_approving_review_count": 0,
    "dismiss_stale_reviews": true
  },
  "restrictions": null,
  "required_linear_history": false,
  "allow_force_pushes": false,
  "allow_deletions": false
}
EOF
```

Status check names must match GitHub Actions job names exactly (see workflow `jobs.*.name` fields).

## Repository secrets

| Secret | Used by |
|--------|---------|
| `MONGODB_URI` | DAST workflow on `develop` (optional; improves route coverage) |

Add under **Settings → Secrets and variables → Actions**.

# Branch protection setup

Run once after `develop` exists on GitHub (requires `gh` CLI and admin access).

## Push develop

```bash
git push -u origin develop
```

## Protect `main`

```bash
gh api repos/{owner}/{repo}/branches/main/protection -X PUT \
  -f required_status_checks[strict]=true \
  -f required_status_checks[contexts][]='Lint, typecheck, test, build' \
  -f required_status_checks[contexts][]='npm audit (SCA)' \
  -f required_status_checks[contexts][]='Gitleaks (secrets)' \
  -f required_status_checks[contexts][]='Analyze JavaScript/TypeScript' \
  -f required_status_checks[contexts][]='OWASP ZAP baseline scan' \
  -f enforce_admins=true \
  -f required_pull_request_reviews[required_approving_review_count]=1 \
  -f required_pull_request_reviews[dismiss_stale_reviews]=true \
  -f restrictions=
```

Replace `{owner}/{repo}` with your repository (e.g. `kere-sifon/african-stores-web`).

## Protect `develop`

```bash
gh api repos/{owner}/{repo}/branches/develop/protection -X PUT \
  -f required_status_checks[strict]=true \
  -f required_status_checks[contexts][]='Lint, typecheck, test, build' \
  -f required_status_checks[contexts][]='npm audit (SCA)' \
  -f required_status_checks[contexts][]='Gitleaks (secrets)' \
  -f enforce_admins=false \
  -f required_pull_request_reviews[required_approving_review_count]=0 \
  -f restrictions=
```

Status check names must match the job names in GitHub Actions after the first workflow run.

## Repository secrets

| Secret | Used by |
|--------|---------|
| `MONGODB_URI` | DAST workflow (optional; enables full app scan) |

Add under **Settings → Secrets and variables → Actions**.

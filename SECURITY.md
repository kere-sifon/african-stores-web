# Security policy

## Supported branches

| Branch | Supported |
|--------|-----------|
| `main` | Yes |
| `develop` | Yes (pre-release) |

## Reporting a vulnerability

Please **do not** file a public GitHub issue for security vulnerabilities.

Contact the repository maintainers privately with:

- Description of the issue
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We aim to acknowledge reports within 5 business days.

## Security automation

This repository uses:

- **SAST** — GitHub CodeQL on TypeScript/JavaScript
- **SCA** — `npm audit` on pull requests (fails on high+ severity)
- **Secret scanning** — Gitleaks in CI
- **DAST** — OWASP ZAP baseline on pull requests to `develop` / `main`

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full quality gate list.

# Implementation Prompt: Automated CI/CD Pipeline & Vercel Deployment Infrastructure

## 1. Goal
Set up an enterprise-grade automated CI/CD pipeline and deployment configuration for Vertex:
1. **GitHub Actions CI Quality Gate (`.github/workflows/ci.yml`)**:
   - Automatically trigger on every `push` and `pull_request` targeting `main`, `feat/**`, or `fix/**`.
   - Run parallel, cached validation jobs:
     - TypeScript strict type verification (`tsc --noEmit`).
     - ESLint static analysis (`eslint`).
     - Full automated test suite (all 214 tests across 77 test suites via `node:test`).
     - Next.js Turbopack production build check (`next build`) using isolated build-time environment variables.
2. **GitHub Actions Automated Vercel CD Workflow (`.github/workflows/deploy.yml`)**:
   - Support automated Vercel deployment for both Preview (on pull requests) and Production (on merge/push to `main`).
   - Gracefully support both Vercel's native GitHub App integration and direct GitHub Actions Vercel CLI deployment using `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID`.
3. **Vercel Monorepo Configuration (`web/vercel.json`)**:
   - Define custom security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`).
   - Configure cache control and API headers.
4. **Comprehensive Production Deployment & CI/CD Guide (`DEPLOYMENT.md`)**:
   - Clear, step-by-step documentation detailing Vercel dashboard configuration (Root directory `web`).
   - Complete environment variable manifest for production.
   - GitHub branch protection setup (requiring CI check passage prior to merging).
   - Studio cloud deployment guide (`npm run deploy` for Sanity Context MCP).

---

## 2. Inspected Code & Architecture
- Vertex monorepo structure:
  - `web/` (Next.js 16.3.3 App Router frontend & APIs).
  - `studio/` (Sanity Studio v5).
- Currently no `.github/workflows/` directory or `vercel.json` exists in the repository.
- `web/package.json` provides scripts: `build`, `type-check`, `lint`, and `test`. All four passed locally in the previous turn with 0 errors.

---

## 3. Decisions & Implementation Details

1. **`.github/workflows/ci.yml`**:
   - Use `actions/checkout@v4` and `actions/setup-node@v4` with `cache: 'npm'` pointing to `web/package-lock.json`.
   - Environment variables for build check: provide safe, non-sensitive build-time dummy values so `next build` static page generation completes without needing real production secrets during CI.
   - Separate jobs for `web-quality-gate` (tests, types, lint, build) and `studio-quality-gate` (dependency and schema validation).

2. **`.github/workflows/deploy.yml`**:
   - Triggers on push to `main` and PRs.
   - Leverages `amondnet/vercel-action@v25` or `@vercel/cli` with GitHub Actions secrets (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`).
   - If secrets are absent, outputs an informational message advising the developer that native Vercel Git integration is handling the build, ensuring CI never breaks if secrets haven't been added to GitHub yet.

3. **`web/vercel.json`**:
   - Configure security headers for all routes (`/*`).
   - Ensure clean routing and framework targeting (`framework: "nextjs"`).

4. **`DEPLOYMENT.md`**:
   - Add detailed instructions for connecting GitHub repo to Vercel, configuring root directory to `web`, entering production env vars, and generating Vercel CLI tokens for GitHub Actions.

---

## 4. Files to Touch
1. `.github/workflows/ci.yml` (New) — Core CI validation pipeline.
2. `.github/workflows/deploy.yml` (New) — Vercel preview & production deployment workflow.
3. `web/vercel.json` (New) — Vercel security headers and framework configuration.
4. `DEPLOYMENT.md` (New) — Production deployment and CI/CD operations manual.
5. `README.md` — Link to CI/CD pipeline and deployment documentation with a CI badge.

---

## 5. Security & Boundary Considerations
- No real API keys or tokens are stored in workflow YAML files.
- Secrets are pulled exclusively from GitHub Repository Secrets (`${{ secrets.VERCEL_TOKEN }}`).
- Non-sensitive dummy keys used strictly for build-time static evaluation in CI.

---

## 6. Acceptance Criteria
- [ ] `.github/workflows/ci.yml` is syntactically valid YAML and defines automated type-checking, linting, testing, and production building.
- [ ] `.github/workflows/deploy.yml` is syntactically valid YAML supporting Vercel deployment with graceful fallback.
- [ ] `web/vercel.json` provides standard security headers and monorepo settings.
- [ ] `DEPLOYMENT.md` contains clear, actionable setup instructions.
- [ ] All local checks (`npm --prefix web run type-check`, `npm --prefix web test`, `npm --prefix web run lint`, `npm --prefix web run build`) continue to pass.
- [ ] Changes committed and pushed to GitHub.

---

## 7. Checks to Run
- `npm --prefix web run type-check`
- `npm --prefix web test`
- `npm --prefix web run lint`
- YAML syntax check on GitHub workflows
- `git status`
- `git push origin feat/search-caching-and-ui`

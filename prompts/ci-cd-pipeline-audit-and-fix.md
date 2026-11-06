# Implementation Prompt: CI/CD Pipeline Audit & Automated Test-Gated Deployment

## 1. Goal
Audit the existing GitHub Actions CI/CD pipeline and re-architect it so that pushing code to the `main` branch automatically runs the complete test and quality suite (types, lint, 235 unit tests, Next.js build, and Sanity Studio build), and only triggers production deployment when all automated quality gates pass.

---

## 2. Audit Findings & Root Causes

### Finding 1: Disconnected Workflows & Race Conditions
- **Current State**: `.github/workflows/ci.yml` and `.github/workflows/deploy.yml` run as two separate, uncoordinated workflows. In `deploy.yml`, `needs: []` is empty.
- **Root Cause & Risk**: When a commit is pushed to `main`, GitHub Actions triggers both workflows simultaneously. If tests fail or the build breaks, the deploy workflow does not wait and attempts to deploy broken code to production.
- **Remediation**: Unify CI and CD into a coordinated pipeline with strict DAG dependencies (`needs: [web-quality-gate, studio-quality-gate]`), guaranteeing that deployment only starts after 100% of tests and builds succeed.

### Finding 2: Unintended Deploy Triggers on Pull Requests
- **Current State**: `deploy.yml` listens to `pull_request: branches: [main]`.
- **Root Cause & Risk**: Pull requests should only run tests and verification gates, not trigger deployment workflows or pollute deployment status checks.
- **Remediation**: Explicitly gate the deployment job with `if: github.event_name == 'push' && github.ref == 'refs/heads/main'` (plus support for `workflow_dispatch` for manual triggers).

### Finding 3: Missing Environment Variables during CI Page Data Collection
- **Current State**: `ci.yml` supplied `CERTIFICATE_SIGNING_SECRET`, but `web/lib/certificate.ts` checked `CERTIFICATE_SECRET_KEY`, causing Next.js to log a warning during page data collection.
- **Remediation**: Supply both `CERTIFICATE_SECRET_KEY` and `CERTIFICATE_SIGNING_SECRET` in the CI mock environment, and support both names in `web/lib/certificate.ts`.

### Finding 4: Incomplete Sanity Studio Quality Gate
- **Current State**: `studio-quality-gate` only executed `npm ci` without verifying whether Sanity Studio actually compiles.
- **Remediation**: Add `npm run build` (`sanity build`) to the Studio job to verify schema and studio integrity.

---

## 3. Decisions & Architecture
1. **Unified Pipeline (`.github/workflows/ci-cd.yml`)**:
   - Consolidate `ci.yml` and `deploy.yml` into a single, cohesive workflow:
     - **Job 1: `web-quality-gate`**:
       - Setup Node.js 20 with npm caching.
       - Run `npm ci`.
       - Run `npm run type-check` (strict TypeScript check).
       - Run `npm run lint` (ESLint verification).
       - Run `npm test` (all 235 unit & integration tests).
       - Run `npm run build` (Next.js Turbopack production build with complete CI environment variables).
     - **Job 2: `studio-quality-gate`**:
       - Setup Node.js 20 with npm caching.
       - Run `npm ci`.
       - Run `npm run build` (Sanity Studio production build).
     - **Job 3: `deploy-production`**:
       - Strictly depends on: `needs: [web-quality-gate, studio-quality-gate]`.
       - Runs only when: `github.event_name == 'push' && github.ref == 'refs/heads/main'` (or manual `workflow_dispatch`).
       - If `secrets.VERCEL_TOKEN` is configured: executes `amondnet/vercel-action@v25` with `--prod` in `web`.
       - If `secrets.VERCEL_TOKEN` is not configured: outputs a clear notice that Vercel's native GitHub App will handle deployment automatically because all quality checks passed.
2. **Remove Redundant Workflows**:
   - Retire the old disconnected `.github/workflows/deploy.yml` and `.github/workflows/ci.yml` in favor of `.github/workflows/ci-cd.yml`.
3. **Environment Hardening**:
   - Update `web/lib/certificate.ts` to accept `CERTIFICATE_SECRET_KEY || CERTIFICATE_SIGNING_SECRET`.

---

## 4. Files to Touch
1. `.github/workflows/ci-cd.yml`: Create the unified, test-gated CI/CD pipeline.
2. `.github/workflows/ci.yml`: Remove or replace with `ci-cd.yml`.
3. `.github/workflows/deploy.yml`: Remove as its functionality is cleanly integrated into `ci-cd.yml`.
4. `web/lib/certificate.ts`: Update fallback order for `CERTIFICATE_SECRET_KEY` and `CERTIFICATE_SIGNING_SECRET`.

---

## 5. Security & Safety Considerations
- **No Secret Leakage**: All production secrets remain in GitHub Secrets or Vercel dashboard. The build step in CI only uses non-sensitive mock tokens to satisfy Next.js static page generation requirements.
- **Fail-Safe Gate**: If any test, type check, lint rule, or build fails, GitHub Actions halts execution immediately; the `deploy-production` job will not run.
- **Zero Push Violation**: In accordance with the user's explicit command, no `git push` or `git commit` commands will be executed until authorized.

---

## 6. Acceptance Criteria
- [ ] Pushing to `main` triggers automated testing (`type-check`, `lint`, `test`, `build`).
- [ ] Deployment is strictly gated behind the automated test and build quality gates.
- [ ] Pull requests run the quality gates but do not attempt production deployment.
- [ ] Manual triggers (`workflow_dispatch`) are supported for on-demand pipeline execution.
- [ ] All 235 unit tests pass (`npm --prefix web test`).
- [ ] TypeScript check (`npm --prefix web run type-check`) passes with 0 errors.
- [ ] ESLint check (`npm --prefix web run lint`) passes with 0 errors.
- [ ] Production build (`npm --prefix web run build`) succeeds with exit code 0.

---

## 7. Verification Steps
1. Run YAML syntax and structure verification on `.github/workflows/ci-cd.yml`.
2. Run `npm --prefix web test` to confirm test suite health.
3. Run `npm --prefix web run type-check` to confirm type safety.
4. Run `npm --prefix web run lint` to confirm ESLint checks pass.
5. Run `npm --prefix web run build` to confirm static build generation succeeds.

# Vertex — Production Deployment & CI/CD Operations Guide

This guide details how Vertex automates testing, type verification, and production deployments via GitHub Actions and Vercel.

---

## 🚀 1. Automated CI/CD Architecture

Vertex implements a two-stage automated delivery pipeline:

```
Push / Pull Request to GitHub
        │
        ▼
[GitHub Actions CI: .github/workflows/ci.yml]
  ├── TypeScript Strict Verification (tsc --noEmit)
  ├── ESLint Code Inspection (eslint)
  ├── 214 Automated Tests (node:test)
  └── Turbopack Production Build Check (next build)
        │
   (On Pass)
        │
        ▼
[Vercel Deployment Pipeline]
  ├── Preview Deployment (Pull Requests)
  └── Production Deployment (Merge to main)
```

---

## ⚙️ 2. Vercel Dashboard Project Setup

When importing the Vertex repository into [Vercel](https://vercel.com):

1. **Import Repository:** Select `Abhijith45/vertex-lms` from your GitHub account.
2. **Configure Root Directory:**
   * Click **Edit** next to **Root Directory**.
   * Set Root Directory to: `web` *(Critical: Vertex is a monorepo containing `web` and `studio`)*.
3. **Framework Preset:** Next.js (automatically detected).
4. **Build & Development Settings:**
   * Build Command: `next build` (Default)
   * Output Directory: `.next` (Default)
   * Install Command: `npm install` (Default)

---

## 🔐 3. Environment Variables Configuration (Vercel)

Add the following production environment variables in your Vercel Project Settings (**Settings → Environment Variables**):

| Variable Name | Environment | Description / Example |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Production & Preview | `pk_live_...` or `pk_test_...` from Clerk Dashboard |
| `CLERK_SECRET_KEY` | Production & Preview | `sk_live_...` or `sk_test_...` (Keep strictly server-side) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | All | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | All | `/sign-up` |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | All | Your Sanity project ID (e.g. `abc123xy`) |
| `NEXT_PUBLIC_SANITY_DATASET` | All | `production` |
| `SANITY_API_READ_TOKEN` | All | Viewer token with read access to private dataset |
| `SANITY_API_WRITE_TOKEN` | All | Editor token used server-side for progress/bookmarks |
| `SANITY_CONTEXT_MCP_URL` | All | `https://api.sanity.io/v2026-03-03/context/mcp/<PROJECT_ID>/production/search-context` |
| `OPENAI_API_KEY` | All | `sk-proj-...` from platform.openai.com |
| `STRIPE_SECRET_KEY` | All | `sk_live_...` or `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | All | `whsec_...` (From Stripe Dashboard → Webhooks endpoint) |
| `CERTIFICATE_SIGNING_SECRET` | All | 32+ byte random string for HMAC-SHA256 signatures |
| `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` | All | `phc_...` from PostHog Project Settings |
| `NEXT_PUBLIC_POSTHOG_HOST` | All | `https://us.i.posthog.com` |
| `NEXT_PUBLIC_SITE_URL` | All | Your canonical domain (e.g. `https://vertex-lms.vercel.app`) |

---

## 🛡️ 4. GitHub Branch Protection Setup

To prevent broken code from ever being deployed to production:

1. In your GitHub repository, navigate to **Settings → Branches**.
2. Click **Add branch protection rule** (or edit rule for `main`).
3. Set **Branch name pattern** to `main`.
4. Check **Require status checks to pass before merging**.
5. In the search box, select:
   * `Web Quality Gate (Types, Lint, Tests, Build)`
6. Check **Require branches to be up to date before merging**.
7. Click **Save Changes**.

---

## 🤖 5. (Optional) Direct GitHub Action Vercel Deployment

By default, Vercel deploys automatically whenever you push code. If you prefer the GitHub Action (`.github/workflows/deploy.yml`) to deploy directly via the Vercel CLI:

1. Obtain a Vercel Personal Access Token from [vercel.com/account/tokens](https://vercel.com/account/tokens).
2. Find your **Org ID** and **Project ID**:
   * Run `npx vercel link` inside `web/` locally, or check `.vercel/project.json`.
3. In GitHub, go to **Settings → Secrets and variables → Actions** and add:
   * `VERCEL_TOKEN`: Your Vercel personal access token.
   * `VERCEL_ORG_ID`: Your Vercel team/user ID.
   * `VERCEL_PROJECT_ID`: Your Vercel project ID.

*Note: If these secrets are not added, the workflow safely outputs an info notice and lets Vercel's native Git App handle the deployment.*

---

## 📝 6. Sanity Studio Cloud Deployment

The **Sanity Context MCP** requires a deployed Studio URL to serve schema context to OpenAI. Deploy the Studio UI:

```bash
cd studio
npx sanity login
npm run deploy
# Deploys your studio to https://<your-project-id>.sanity.studio
```

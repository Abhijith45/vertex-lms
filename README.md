# Vertex — AI-Powered Learning Platform

> A production-grade, AI-powered learning platform featuring intelligent plain-language video search, second-level timestamp deep-linking, structured engineering curriculum, learner progress tracking, and an enterprise compliance suite.

---

## 🌟 Overview & Core Differentiators

Vertex is an intelligent, full-stack learning management system built with Next.js 16, Sanity Studio v5, Clerk authentication, PostHog analytics, and the Sanity Context MCP.

### Key Capabilities:
* **Natural Language Video Search:** A learner enters a conceptual query (e.g. *"how does useMemo prevent child re-renders"* or *"docker multi-stage build caching"*) and receives ranked, clickable cards.
* **Two-Stage Timestamp Resolution:** Queries match clean, authored chapter markers first. If no chapter matches, the search engine falls back to timestamped transcript chunks for pinpoint precision.
* **On-Site Seek Playback:** Cards deep-link straight to the exact second in the lesson's video where that concept is explained, using official third-party embed players (YouTube, Vimeo, Bunny) with zero video re-hosting.
* **Learner State Tracking & Bookmarks:** Tracks completed lessons, resume playback positions, and course bookmarks per user via server-isolated private datastores.
* **Complete Compliance Suite:** Out-of-the-box legal, accessibility (WCAG 2.1 AA), privacy (GDPR/CCPA), DMCA takedown, security notice, dynamic sitemap, and robots.txt infrastructure.

---

## 🏗️ Monorepo Architecture

Vertex is structured as two independent, standalone workspaces in a monorepo:

```
vertex/
├── studio/     # Sanity Studio v5 — Content modeling, authoring UI & ingestion scripts
├── web/        # Next.js 16 (App Router) — Learner-facing site, search API & UI
└── prompts/    # Architecture decision records (ADRs) & implementation prompts
```

Both workspaces maintain **independent package manifests (`package.json`), separate dev servers, and isolated deployment pipelines**. This separation preserves TypeGen type generation, Studio auto-updates, and server/client security boundaries.

---

## 🛠️ Core Tooling Deep-Dive, Quotas & Alternatives

Vertex leverages best-in-class modern developer tools. Below is an exhaustive breakdown of why each tool was chosen, how it is implemented in Vertex, its free-tier quota limits, and viable alternatives:

### 1. 🔐 Clerk (Authentication & User Identity)
* **Purpose & Usage in Vertex:**
  - Manages secure user registration, multi-factor login, and passwordless authentication.
  - Controls route protection via Next.js middleware (`proxy.ts` / middleware).
  - Supplies client components (`<ClerkProvider>`, `<SignInButton>`, `<SignUpButton>`, `<UserButton>`) styled with Vertex design tokens (`#E05A36`).
  - Provides server-side `auth()` in API routes (`/api/progress`, `/api/bookmarks`) to key user progress documents to the authenticated `userId`.
  - Triggers sign-in modals when guest learners attempt to save progress or bookmark courses.
* **Free-Tier Limits:** Up to **10,000 Monthly Active Users (MAUs)** with unlimited sign-ins on the free development tier.
* **Viable Alternatives:**
  - **[NextAuth.js / Auth.js](https://authjs.dev/):** Free, open-source, self-hosted session management supporting OAuth and credentials.
  - **[Supabase Auth](https://supabase.com/auth):** Built on PostgreSQL Row Level Security (RLS) with 50,000 free MAUs.
  - **[Better-Auth](https://www.better-auth.com/) / [Lucia](https://lucia-auth.com/):** Lightweight, developer-controlled TypeScript authentication libraries.
  - **[Firebase Auth](https://firebase.google.com/docs/auth):** Generous 50,000 MAU free tier backed by Google Cloud.

---

### 2. 📝 Sanity Studio v5 (Headless CMS & Content Model)
* **Purpose & Usage in Vertex:**
  - Serves as the single source of truth for curriculum schemas: `course`, `module`, `lesson`, `instructor`, `category`, `video`, `agentContext`, and `progress`.
  - Content authoring using rich Portable Text for lesson notes, key points, and learning outcomes.
  - Generates strict TypeScript types via `sanity typegen`.
  - Powers the **Sanity Context MCP** endpoint (`SANITY_CONTEXT_MCP_URL`), allowing the AI search agent to query the private schema context and execute grounded GROQ queries.
  - Serves private dataset reads via server-only read tokens (`SANITY_API_READ_TOKEN`) and atomic progress/bookmark mutations via write tokens (`SANITY_API_WRITE_TOKEN`).
* **Free-Tier Limits:** Free plan includes **20 admin users, 100,000 API CDN requests/month, 10GB asset storage, and 10,000 documents**.
* **Viable Alternatives:**
  - **[Payload CMS](https://payloadcms.com/):** Code-first, open-source Next.js headless CMS with native TypeScript and PostgreSQL/MongoDB support.
  - **[Strapi](https://strapi.io/):** Popular open-source Node.js headless CMS with customizable REST/GraphQL endpoints.
  - **[Supabase (PostgreSQL + pgvector)](https://supabase.com/):** Direct relational database schema with vector embeddings for semantic search.
  - **[Contentful](https://www.contentful.com/):** Enterprise managed headless CMS.

---

### 3. 📊 PostHog (Product Analytics & Telemetry)
* **Purpose & Usage in Vertex:**
  - Captures privacy-preserving product engagement events on both client and server:
    - `catalog_viewed` & `course_detail_viewed`
    - `search_performed` (tracks query terms, search latency, and result counts)
    - `lesson_viewed` & `course_bookmarked`
    - `video_progress_milestone` (fires at 25%, 50%, 75%, and 100% video completion)
  - Links anonymous sessions to authenticated users via the `<PostHogIdentity />` component.
* **Free-Tier Limits:** **1,000,000 events/month and 5,000 session recordings/month for free**.
* **Viable Alternatives:**
  - **[Mixpanel](https://mixpanel.com/):** Product event analytics with 20M monthly events on free plan.
  - **[Plausible Analytics](https://plausible.io/) / [Umami](https://umami.is/):** Lightweight, open-source, cookie-less web analytics.
  - **[Google Analytics 4 (GA4)](https://analytics.google.com/):** Free standard web telemetry and conversion tracking.

---

### 4. 🐇 CodeRabbit (AI-Powered Code Reviews & CI/CD Guardrails)
* **Purpose & Usage in Vertex:**
  - Automated pull request code reviews directly on GitHub.
  - Enforces Next.js 16 App Router best practices, detects token leaks (e.g., verifying `SANITY_API_WRITE_TOKEN` remains strictly server-side), catches React hydration issues, and checks GROQ query efficiency.
  - Summarizes architectural diffs and validates test coverage across monorepo workspaces.
* **Free-Tier Limits:** Free 14-day Pro trial; **Free for open-source public repositories on GitHub/GitLab**.
* **Viable Alternatives:**
  - **[Qodo / PR-Agent](https://github.com/qodo-ai/pr-agent):** Open-source AI code review agent runnable in self-hosted GitHub Actions workflows.
  - **[Sourcery](https://sourcery.ai/):** AI-powered automated refactoring and PR review bot for Python and TypeScript.
  - **[SonarQube / SonarCloud](https://www.sonarsource.com/):** Industry-standard static analysis for code quality, security vulnerabilities, and test coverage.

---

## 📦 How to Seed Initial Content into Sanity

When setting up Vertex on a fresh Sanity project, your dataset will initially be empty. Follow these step-by-step instructions to load the curated courses, lessons, and AI Search Context:

### Step 1: Login to Sanity CLI
```bash
cd studio
npx sanity login
```

### Step 2: Import Courses, Lessons & Modules
Vertex includes a comprehensive seed dataset containing structured courses (Next.js for Production, DevOps with Docker & Kubernetes, TypeScript, System Design, AI Apps), lesson notes, modules, instructors, and categories:

```bash
# Import the seed dataset into your production dataset
npx sanity dataset import scripts/seed/seed.ndjson production --replace
```

### Step 3: Import AI Search Context Configuration
The AI search agent relies on an `agentContext` document in Sanity that instructs the LLM on schema relationships (such as reverse references between lessons and courses):

```bash
# Import the AI Search Context document
npx sanity dataset import scripts/seed/context.ndjson production --replace
```

### Step 4: Deploy the Studio UI
> ⚠️ **Critical:** The Sanity Context MCP requires a deployed Studio application before it can serve dataset context to OpenAI.

```bash
npm run deploy
# This deploys your Studio to https://<your-project-id>.sanity.studio
```

### Step 5: (Optional) Ingest Custom YouTube Video Transcripts
To add your own YouTube videos to the search index with timestamped transcript chunking:

```bash
# Ingests video transcript into Sanity video documents
npm run ingest -- --url="https://www.youtube.com/watch?v=YOUR_VIDEO_ID"
```

### Step 6: Generate TypeScript Types
Regenerate frontend TypeScript types based on your populated schema:

```bash
npm run typegen
```

---

## 🔍 Intelligent Search Pipeline

```
User Query: "how to create a custom hook in React"
   │
   ▼
[Next.js API Route Handler: /api/search]
   │
   ├─► 1. Query Normalization & Technical Synonym Expansion (Hook → State, Custom, Reusable)
   ├─► 2. Conversational Stop-Word Filtering ("can you tell me", "how to")
   ├─► 3. Connect to Sanity Context MCP (Injected schema + inline system prompt)
   ├─► 4. OpenAI GPT-4o Generates Grounded GROQ Query
   ├─► 5. Two-Stage Timestamp Resolution:
   │        ├── Priority 1: Authored Chapter Markers (Clean topic titles)
   │        └── Priority 2: Timestamped Transcript Chunks (Fallback speech search)
   │
   ▼
Structured JSON Output:
   ├── Video Moment Cards (Course icon, lesson label, start second, seek link)
   └── Lesson Cards (Course title, module number, key points, description)
```

---

## ⚖️ Full Legal, Compliance & SEO Suite

Vertex includes a comprehensive, production-grade 9-part compliance suite:

| Route | Shortcut Alias | Description |
|---|---|---|
| `/privacy-policy` | `/privacy` | Full GDPR, UK GDPR, and CCPA/CPRA privacy notice detailing Clerk auth, Sanity storage, PostHog telemetry, and data subject rights. |
| `/terms-of-service` | `/terms` | Platform terms of use, educational portfolio disclaimer, YouTube embed terms, and DMCA safe harbor procedures. |
| `/cookie-policy` | `/cookies` | Categorized disclosure of essential auth cookies (`__session`), local storage (`vertex-theme`), and PostHog analytics. |
| `/accessibility-statement` | `/accessibility` | Commitment to **WCAG 2.1 Level AA**, keyboard focus navigation, high-contrast light/dark themes, and screen reader landmarks. |
| `/dmca` | `/dmca-policy` | Dedicated DMCA takedown policy with 24–48h processing guarantee and Designated Agent info (`abhijeetrawat45@gmail.com`). |
| `/video-embedding-policy` | `/video-policy` | Architectural disclosure of third-party iframe embed streaming without downloading, altering, or re-hosting video media. |
| `/security-notice` | `/security` | Token isolation architecture, TLS 1.3 transit encryption, rate limiting, and vulnerability disclosure reporting. |
| `/user-rights-portal` | `/user-rights` | Interactive self-service data subject portal allowing learners to export their progress data (JSON) or submit erasure requests. |
| `/data-processing-agreement` | `/dpa` | Demonstration GDPR Article 28 DPA detailing sub-processors (Clerk, Sanity, PostHog) and security measures. |
| `/sitemap.xml` | — | Dynamic XML sitemap indexing all canonical routes with priority and change frequency metadata. |
| `/robots.txt` | — | Search engine crawler rules allowing public content and disallowing internal API endpoints. |

---

## ⚙️ Environment Variables Reference

### `web/` Environment Setup (`web/.env.local`)

```env
# ─────────────────────────────────────────────────────────
# Clerk Authentication (https://dashboard.clerk.com)
# ─────────────────────────────────────────────────────────
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# ─────────────────────────────────────────────────────────
# Sanity CMS (https://sanity.io/manage)
# ─────────────────────────────────────────────────────────
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_READ_TOKEN=sk_viewer_token...
SANITY_API_WRITE_TOKEN=sk_editor_token...
SANITY_CONTEXT_MCP_URL=https://api.sanity.io/v2026-03-03/context/mcp/YOUR_PROJECT_ID/production/search-context

# ─────────────────────────────────────────────────────────
# OpenAI Platform (https://platform.openai.com)
# ─────────────────────────────────────────────────────────
OPENAI_API_KEY=sk-proj-...

# ─────────────────────────────────────────────────────────
# PostHog Analytics (https://app.posthog.com)
# ─────────────────────────────────────────────────────────
NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# ─────────────────────────────────────────────────────────
# Site Canonical URL
# ─────────────────────────────────────────────────────────
NEXT_PUBLIC_SITE_URL=https://vertex.example.com
```

### `studio/` Environment Setup (`studio/.env.local`)

```env
SANITY_STUDIO_PROJECT_ID=your_project_id
SANITY_STUDIO_DATASET=production
SANITY_API_WRITE_TOKEN=sk_editor_token...
```

---

## 🚀 Running Locally

```bash
# 1. Install workspace dependencies
cd studio && npm install
cd ../web && npm install

# 2. Seed initial Sanity content (if fresh project)
cd ../studio
npx sanity dataset import scripts/seed/seed.ndjson production --replace
npx sanity dataset import scripts/seed/context.ndjson production --replace

# 3. Start development servers
# Terminal 1: Sanity Studio (http://localhost:3333)
cd studio && npm run dev

# Terminal 2: Next.js Web App (http://localhost:3000)
cd web && npm run dev
```

---

## 🧪 Testing & Code Quality

Execute tests and validation from `web/`:

```bash
cd web

# Run full unit test suite (150 tests covering search, video controls, bookmarks, compliance)
npm test

# Strict TypeScript type check
npm run type-check

# ESLint code inspection
npm run lint

# Production build validation with Turbopack
npm run build
```

---

## 🚢 Deployment

### 1. Web Deployment (Vercel — Recommended)
1. Push your repository to GitHub.
2. Import the project into [Vercel](https://vercel.com) and set the **Root Directory** to `web`.
3. Add all environment variables from `web/.env.example` in the Vercel dashboard.
4. Deploy.

### 2. Sanity Studio Deployment
Deploy the Studio UI to Sanity's managed cloud (required for Context MCP):
```bash
cd studio
npm run deploy
```

---

## 👨‍💻 Developer & Contact

**Vertex** is engineered by **Abhijeet Rawat** as a portfolio and educational demonstration.

* **Developer:** Abhijeet Rawat
* **Email & DMCA Agent:** [abhijeetrawat45@gmail.com](mailto:abhijeetrawat45@gmail.com)
* **GitHub Repository:** [https://github.com/Abhijith45/vertex-lms](https://github.com/Abhijith45/vertex-lms)

---

## 📄 License & Fair Use Notice

Vertex is provided for educational and portfolio demonstration purposes. All course video content is streamed via official third-party embed players (YouTube API). All copyrights, trademarks, and intellectual property remain the exclusive property of their respective creators.
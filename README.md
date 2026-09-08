# Vertex — AI-Powered Learning Platform

> A production-grade AI-powered learning platform with intelligent plain-language video search, structured engineering curriculum, learner progress tracking, and full compliance architecture.

---

## 🌟 Overview & Core Differentiators

Vertex is an intelligent learning platform engineered with Next.js 16, Sanity Studio v5, Clerk authentication, and the Sanity Context MCP. 

What sets Vertex apart is its **intelligent timestamped search**:
* **Plain-English Querying:** A learner searches for concepts like *"how does useMemo prevent re-renders"* or *"docker multi-stage builds"*.
* **Two-Stage Timestamp Resolution:** The search pipeline matches authored chapter markers first, falling back to timestamped transcript chunks for pinpoint accuracy.
* **Ranked, Grounded Cards:** Results return clean, structured cards linking directly to the exact second in the lesson video where that concept is explained.
* **On-Site Playback:** Videos play directly on the site via official third-party embed providers (YouTube, Vimeo, Bunny) with deep-linked start times without sending the learner away.

---

## 🏗️ Monorepo Architecture

Vertex is structured as two independent standalone workspaces in a unified repository:

```
vertex/
├── studio/     # Sanity Studio v5 — Content modeling, schemas & authoring
├── web/        # Next.js 16 (App Router) — Learner site, search API & UI
└── prompts/    # Engineering implementation prompts & architecture specs
```

Both workspaces maintain **standalone dependencies, independent deployments, and separate dev servers** to ensure clean boundaries, TypeGen support, and independent continuous delivery.

---

## 🛠️ Complete Technology Stack & Tooling Catalog

Every tool and framework in Vertex serves a precise, deliberate architectural purpose:

| Category | Tool / Library | Purpose in Vertex |
|---|---|---|
| **Core Framework** | **Next.js 16 (App Router & Turbopack)** | Server-side rendering (SSR), incremental static regeneration (ISR), API Route Handlers, middleware routing, and dynamic metadata generation. |
| **UI Library** | **React 19** | Modern UI composition, React Server Components (RSC), Suspense boundaries, and optimistic state updates. |
| **Styling & Tokens** | **Tailwind CSS v4** | Utility-first design system with CSS design tokens, custom primary color scales (`#E05A36`), responsive breakpoints, and dark mode variants. |
| **Typography** | **Google Fonts (`next/font`)** | Editorial headings with **Playfair Display** paired with modern interface typography via **Inter**. |
| **Theme System** | **Custom ThemeProvider** | Light / Dark / System theme state machine with an anti-flash inline boot script in `<head>` and `localStorage` persistence (`vertex-theme`). |
| **Authentication** | **Clerk (`@clerk/nextjs`)** | User identity, session JWT management, protected Next.js middleware, guest sign-in prompts, and `<UserButton>` profile controls. |
| **Headless CMS** | **Sanity Studio v5 (`next-sanity`)** | Structured content authoring, schema definitions (`defineType`, `defineField`), GROQ queries, Portable Text rich text, and TypeGen typing. |
| **AI Search Agent** | **Sanity Context MCP (`@ai-sdk/mcp`)** | Model Context Protocol server exposing private Sanity schema context and filtered search queries directly to the LLM. |
| **LLM Provider** | **OpenAI GPT-4o (`@ai-sdk/openai`)** | Natural language processing via the Vercel AI SDK to interpret search intent, expand technical synonyms, and rank results. |
| **Product Analytics** | **PostHog (`posthog-js`, `posthog-node`)** | Privacy-conscious user telemetry tracking catalog views, search queries, video watch milestones (25%, 50%, 75%, 100%), and bookmarking. |
| **Schema Validation** | **Zod (`zod`)** | Runtime schema parsing and type validation for search requests, progress payloads, and bookmark mutations. |
| **Icons** | **Lucide React (`lucide-react`)** | Clean, accessible vector icons across UI cards, navigation, video controls, and compliance badges. |
| **SEO & Discovery** | **Next.js Metadata, `sitemap.ts`, `robots.ts`** | Automated XML sitemap generation (`/sitemap.xml`), crawl directives (`/robots.txt`), OpenGraph cards, and canonical tags. |
| **Testing Suite** | **Node.js Native Test Runner (`node --test`)** | Zero-dependency, ultra-fast unit testing covering search flow, video controls, bookmarks, cache invalidation, and compliance routes. |

---

## 🔍 Intelligent Search Architecture

```
User Query ("docker multi-stage build")
   │
   ▼
[Next.js Server API: /api/search]
   │
   ├─► 1. Query Normalization & Technical Synonym Expansion (Docker → Container, DevOps)
   ├─► 2. Conversational Stop-Word Filtering ("how do I", "explain")
   ├─► 3. Connect to Sanity Context MCP (Injected schema & inline system prompt)
   ├─► 4. OpenAI Model Generates Grounded GROQ Query
   ├─► 5. Two-Stage Resolution:
   │        ├── Priority 1: Authored Table of Contents / Chapters
   │        └── Priority 2: Timestamped Transcript Chunks
   │
   ▼
Structured JSON Results (Lesson Cards + Timestamped Video Moment Cards)
```

1. **Grounded Results:** The search agent only returns courses, lessons, and timestamps that exist in the Sanity dataset. It never hallucinates timestamps or prices.
2. **Context Window Safety:** Never passes entire video transcripts wholesale; queries slice only top matched timestamp chunks.
3. **Provider Seek Formats:** Deep-links generate player-specific seek URLs:
   - YouTube: `https://www.youtube.com/embed/{id}?start={seconds}`
   - Vimeo: `https://player.vimeo.com/video/{id}#t={seconds}s`
   - Bunny: `https://iframe.mediadelivery.net/embed/{library}/{id}?t={seconds}`

---

## 👤 Authentication, Progress Tracking & Bookmarking

* **Authentication Boundaries:** Handled entirely by **Clerk**. The client browser never receives raw database write tokens.
* **Learner Progress:** Lesson completions and resume timestamps are saved to the user's private Sanity `progress` document via `POST /api/progress`.
* **Course Bookmarking:** Users can save courses to their **My Learning** dashboard. The bookmark button provides optimistic UI feedback, unauthenticated guest sign-in triggers, and persists to Sanity via `POST /api/bookmarks`.
* **Private Dataset Isolation:** Data fetching uses server-only Sanity clients with `SANITY_API_READ_TOKEN` and mutations use `SANITY_API_WRITE_TOKEN`.

---

## ⚖️ Legal, Compliance & Trust Suite

Vertex includes a complete, production-ready legal and compliance infrastructure:

| Route | Shortcut Alias | Description |
|---|---|---|
| `/privacy-policy` | `/privacy` | Full GDPR & CCPA privacy notice detailing Clerk auth, Sanity storage, PostHog telemetry, and data deletion rights. |
| `/terms-of-service` | `/terms` | Platform terms, educational portfolio disclaimer, YouTube embed terms, and DMCA safe harbor procedures. |
| `/cookie-policy` | `/cookies` | Disclosure of essential auth cookies (`__session`), theme `localStorage`, PostHog telemetry, and embed player cookies. |
| `/accessibility-statement` | `/accessibility` | Commitment to **WCAG 2.1 Level AA**, keyboard navigation, high contrast theme ratios, and accessibility contact. |
| `/dmca` | `/dmca-policy` | Dedicated DMCA takedown procedure with 24–48h processing guarantee and Designated Agent info (`abhijeetrawat45@gmail.com`). |
| `/video-embedding-policy` | `/video-policy` | Architectural disclosure of third-party iframe embed streaming without downloading, altering, or re-hosting video media. |
| `/security-notice` | `/security` | Token isolation architecture, TLS 1.3 transit encryption, rate limiting, and vulnerability disclosure policy. |
| `/user-rights-portal` | `/user-rights` | Self-service data subject portal allowing learners to export their progress data (JSON) or submit erasure requests. |
| `/data-processing-agreement` | `/dpa` | Demonstration GDPR Article 28 DPA detailing sub-processors (Clerk, Sanity, PostHog) and security measures. |
| `/sitemap.xml` | — | Dynamic XML sitemap indexing all canonical routes with priority and change frequency metadata. |
| `/robots.txt` | — | Search engine crawler rules allowing public content and disallowing internal API endpoints. |

---

## ⚙️ Environment Configuration

### 1. `web/` Environment Setup

Create `web/.env.local` based on `web/.env.example`:

```bash
cp web/.env.example web/.env.local
```

Fill in the required keys:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=your_sanity_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_READ_TOKEN=sk_viewer_token...
SANITY_API_WRITE_TOKEN=sk_editor_token...
SANITY_CONTEXT_MCP_URL=https://api.sanity.io/v2026-03-03/context/mcp/YOUR_PROJECT_ID/production/search-context

# OpenAI (AI Search via AI SDK)
OPENAI_API_KEY=sk-proj-...

# PostHog Analytics
NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Canonical URL
NEXT_PUBLIC_SITE_URL=https://vertex.example.com
```

### 2. `studio/` Environment Setup

Create `studio/.env.local`:

```bash
cp studio/.env.example studio/.env.local
```

---

## 🚀 Getting Started Locally

### 1. Install Dependencies
```bash
# In the studio workspace
cd studio
npm install

# In the web workspace
cd ../web
npm install
```

### 2. Start Local Development Servers
```bash
# Terminal 1: Sanity Studio (http://localhost:3333)
cd studio
npm run dev

# Terminal 2: Next.js Web App (http://localhost:3000)
cd web
npm run dev
```

---

## 🧪 Testing & Code Quality

Run tests and type checks from `web/`:

```bash
cd web

# 1. Run all unit tests (150+ tests covering search, video controls, bookmarks, compliance)
npm test

# 2. Strict TypeScript type check
npm run type-check

# 3. ESLint code quality inspection
npm run lint

# 4. Production build validation (Turbopack)
npm run build
```

---

## 🚢 Deployment

### 1. Web Deployment (Vercel)
1. Push your repository to GitHub.
2. Import the repo in [Vercel](https://vercel.com) and configure **Root Directory** as `web`.
3. Add all environment variables from `web/.env.example`.
4. Deploy.

### 2. Sanity Studio Deployment
Deploy the Studio UI to Sanity's managed cloud hosting (required for Context MCP):
```bash
cd studio
npm run deploy
```

---

## 👨‍💻 Developer & Contact

**Vertex** is crafted by **Abhijeet Rawat** as an engineering demonstration and educational platform.

* **Developer:** Abhijeet Rawat
* **Contact & DMCA Agent:** [abhijeetrawat45@gmail.com](mailto:abhijeetrawat45@gmail.com)
* **Repository:** [https://github.com/Abhijith45/vertex-lms](https://github.com/Abhijith45/vertex-lms)

---

## 📄 License & Fair Use Notice

Vertex is provided for educational and portfolio demonstration purposes. All course video content is streamed via official third-party embed players (YouTube API). All copyrights, trademarks, and intellectual property remain the exclusive property of their respective creators.
# Implementation Prompt: Home Page Fallback Course Removal & Portfolio/Resume Architecture Refinement

## 1. Goal
1. **Remove Home Page Fallback Courses**: Eliminate hardcoded mock courses (`fallbackCourses` in `web/app/page.tsx`) so that the home page strictly reflects genuine course data fetched from Sanity, displaying a graceful empty state if no courses are retrieved.
2. **Resume & Portfolio Architecture Refinement**:
   - Polish and format `README.md` into an industry-grade technical portfolio narrative suitable for Software Developer roles (2+ yrs experience).
   - Integrate 5 comprehensive Mermaid system architecture & dataflow diagrams:
     - End-to-End System Architecture (Monorepo, Next.js 16 App Router, Sanity CMS & Context MCP, Clerk Auth, Stripe SaaS, PostHog Telemetry).
     - Hybrid AI Search & Two-Stage Timestamp Resolution Pipeline.
     - Temporal AI Copilot & Interactive Video Synchronization (90s Sliding Window RAG, Click-to-Seek badges, Notes).
     - Cryptographic Proof & HMAC-SHA256 Verifiable Certificates Architecture (`/verify/[id]`).
     - SaaS Monetization, Stripe Webhook Idempotency & Dynamic `@vercel/og` Edge Image Generation.
   - Detail the 5 deep architectural challenges and solutions with concrete metrics and tradeoffs.
   - Create a dedicated companion guide `PORTFOLIO_RESUME_GUIDE.md` equipped with copy-paste STAR resume bullets, technical interview talking points, and system design defense Q&A.

---

## 2. Inspected Code & Deficiencies
- `web/app/page.tsx`:
  - Contains lines 28–60 defining `fallbackCourses` with mock static course data.
  - When Sanity fetch returns empty or fails, it falls back to these mock cards instead of reflecting genuine database/CMS truth.
- `README.md`:
  - Currently documents only the initial search and compliance tools; missing all production features engineered across Phase 1 (Interactive Media Engine), Phase 2 (AI Copilot & Temporal RAG), Phase 3 (Gamification & HMAC Verifiable Certificates), and Phase 4 (Stripe Monetization, Entitlements & OpenGraph Generation).
  - Lacks visual Mermaid architectural diagrams for interview walkthroughs.
  - Lacks structured resume bullets with quantified impact for recruiter and hiring manager review.

---

## 3. Decisions & Implementation Details

1. **`web/app/page.tsx`**:
   - Delete `fallbackCourses` mock array entirely.
   - If `courses` has items, map them to `displayCourses`. If `courses` is empty or null, set `displayCourses = []`.
   - Render the 3-column course grid when `displayCourses.length > 0`, otherwise render a minimal, accessible empty state card.

2. **`README.md`**:
   - Add high-impact badges (Next.js 16, TypeScript Strict, Turbopack, Clerk Auth, Sanity Studio v5, Stripe SaaS, Vercel AI SDK, 214 Tests Passing).
   - Add comprehensive Mermaid diagrams:
     1. High-Level Architecture (Client -> Edge -> App Router -> Services -> Datastores).
     2. Two-Stage Natural Language Video Search Pipeline.
     3. Temporal RAG Video Intelligence & Synchronized Interactive Media Engine.
     4. HMAC-SHA256 Digital Certificate Verification & Nonce Security.
     5. Stripe Webhook Ingestion, Idempotency Cache & Dynamic `@vercel/og` Image Generation.
   - Add an exhaustive breakdown of the full stack (Next.js 16 App Router, TypeScript, Sanity CMS, Clerk Auth, Stripe, PostHog, Vercel AI SDK).
   - Document the 214 unit and integration tests across 77 test suites.
   - Include clear setup and local execution instructions.

3. **`PORTFOLIO_RESUME_GUIDE.md`**:
   - Create a structured guide specifically targeted for a **Software Developer (2+ yrs experience)**:
     - 6 polished, high-impact resume bullet points with quantified metrics and action verbs.
     - 4 STAR Story frameworks (Situation, Task, Action, Result) ready for behavioral and technical screens.
     - 5 System Design Defense questions & answers (Why Clerk vs custom auth? Why hybrid search vs pure vector? How is Stripe webhook idempotency enforced? Why stateless HMAC certificates? How does temporal sliding window RAG work?).

---

## 4. Files to Touch
1. `web/app/page.tsx` — Remove `fallbackCourses` and wire live Sanity courses with empty-state handling.
2. `README.md` — Complete architecture documentation, Mermaid diagrams, and technical narrative refresh.
3. `PORTFOLIO_RESUME_GUIDE.md` — New companion guide with resume bullets, STAR stories, and system design interview cheatsheet.

---

## 5. Security & Boundary Considerations
- No mock data or unverified courses rendered on the home page.
- Security disclosures (HMAC-SHA256 signature verification, Stripe webhook secret validation, Open Redirect protection) preserved and highlighted.
- Server-side tokens remain strictly isolated from browser bundles.

---

## 6. Acceptance Criteria
- [ ] `fallbackCourses` is completely removed from `web/app/page.tsx`.
- [ ] Home page renders genuine courses returned from Sanity, or an empty state when none exist.
- [ ] `README.md` contains 5 clean, syntactically valid Mermaid diagrams and comprehensive technical documentation covering all 4 phases of Vertex.
- [ ] `PORTFOLIO_RESUME_GUIDE.md` provides actionable resume bullets and system design interview talking points for a 2+ yrs software developer role.
- [ ] TypeScript check (`npm --prefix web run type-check`) passes with 0 errors.
- [ ] Test suite (`npm --prefix web test`) passes all 214 tests.
- [ ] Production build (`npm --prefix web run build`) completes successfully.

---

## 7. Checks to Run
- `npm --prefix web run type-check`
- `npm --prefix web test`
- `npm --prefix web run build`

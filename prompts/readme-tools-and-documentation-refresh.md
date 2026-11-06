# Implementation Prompt: Comprehensive README Documentation & Tooling Refresh

## Goal
Perform an in-depth audit of the repository documentation, comprehensively update [README.md](file:///c:/Users/Abhijeet%20Rawat/Desktop/nextJS/vertex/README.md) to document every tool, framework, library, and system component across the **Vertex** platform and their specific purposes, update [web/.env.example](file:///c:/Users/Abhijeet%20Rawat/Desktop/nextJS/vertex/web/.env.example) to include all required environment variables (`SANITY_API_WRITE_TOKEN`), execute project verification checks, commit the updates, and push to the GitHub remote (`origin feat/search-caching-and-ui`).

---

## Skills Referenced
- `sanity-best-practices` (`~/.claude/skills/sanity-best-practices/SKILL.md`): Accurate documentation of Sanity schemas, TypeGen, private datasets, and Context MCP.
- `clerk-nextjs-patterns` (`.agents/skills/clerk-nextjs-patterns/SKILL.md`): Accurate documentation of Clerk authentication, middleware boundaries, and session handling.
- `seo-aeo-best-practices` (`.agents/skills/seo-aeo-best-practices/SKILL.md`): Documentation of dynamic sitemap (`sitemap.ts`) and robots directives (`robots.ts`).

---

## Code Inspected
- `README.md`: Current baseline README (124 lines) lacking detailed tool descriptions, architectural diagrams, theme system docs, bookmarking, and the new 9-part compliance & SEO suite.
- `web/package.json` & `studio/package.json`: Dependency manifests covering Next.js 16, React 19, Tailwind v4, `@clerk/nextjs`, `sanity`, `@ai-sdk/mcp`, `@ai-sdk/openai`, `posthog-js`, `posthog-node`, `lucide-react`, and `zod`.
- `web/.env.example` vs `web/.env.local`: `SANITY_API_WRITE_TOKEN` and `NEXT_PUBLIC_SITE_URL` need to be canonically documented.
- `web/app/`: Complete App Router routes including `/courses`, `/lessons/[slug]`, `/my-learning`, `/search`, `/sitemap.xml`, `/robots.txt`, and compliance pages (`/privacy-policy`, `/terms-of-service`, `/cookie-policy`, `/accessibility-statement`, `/dmca`, `/video-embedding-policy`, `/security-notice`, `/user-rights-portal`, `/data-processing-agreement`).
- `studio/schemaTypes/`: Schemas for `course`, `lesson`, `module`, `instructor`, `category`, `video`, `agentContext`, `progress`.

---

## Key Decisions & Assumptions
1. **Tooling & Purpose Documentation Breakdown**:
   - Organize the README into clear, professional sections:
     - **Platform Overview & Core Differentiators** (Instant second-level video timestamp search, structured engineering curricula).
     - **Architecture & Workspaces** (Standalone `web/` and `studio/` workspaces).
     - **Complete Technology Stack & Tooling Catalog**:
       1. *Next.js 16 (App Router & Turbopack)*: SSR/ISR data fetching, dynamic metadata, sitemap/robots generation, and middleware proxies.
       2. *React 19*: Modern React compiler support, server and client components, optimistic state transitions.
       3. *Tailwind CSS v4*: Modern CSS design tokens, responsive breakpoints, and dark mode variants.
       4. *Playfair Display & Inter (Google Fonts)*: Editorial typography paired with crisp UI sans-serif.
       5. *Theme Provider & Anti-Flash Engine*: Light/Dark/System theme switching with zero-FOUC inline initialization script.
       6. *Clerk Authentication*: Secure JWT user sessions, sign-in/up flows, user profile management, guest auth prompts.
       7. *Sanity Studio v5*: Headless CMS content modeling, structured Portable Text, TypeGen, private datasets.
       8. *Sanity Context MCP + OpenAI GPT-4o (Vercel AI SDK)*: Model Context Protocol connection, technical synonym expansion, conversational stop-word filtering, and grounded GROQ generation.
       9. *Two-Stage Timestamp Search*: Prioritizing authored chapter markers first, falling back to transcript chunk matches.
       10. *PostHog Analytics*: Client/server telemetry tracking course views, search latency, video watch milestones (25/50/75/100%), and bookmarking.
       11. *Video Ingestion & Playback Pipeline*: Offline Python/Node caption chunking into timestamped JSON, deep-link seeking for YouTube, Vimeo, and Bunny players.
       12. *Learner State & Bookmarking*: Server-only write client persisting lesson completion, resume timestamps, and bookmarked courses.
       13. *Comprehensive Compliance & Trust Suite*: All 9 legal pages (Privacy, Terms, Cookies, Accessibility, DMCA, Video Policy, Security Notice, User Rights Portal, DPA).
       14. *Testing & Quality Suite*: Node native test runner (`node --test`), TypeScript strict type checking (`tsc --noEmit`), ESLint 9.
2. **Environment Variable Parity**:
   - Update `web/.env.example` to ensure `SANITY_API_WRITE_TOKEN` and `NEXT_PUBLIC_SITE_URL` are clearly explained.
3. **Git Workflow**:
   - Run type checks and test suites.
   - Commit changes with a descriptive message.
   - Push branch `feat/search-caching-and-ui` to remote `origin`.

---

## Files to Touch
1. `README.md` — Rewrite with comprehensive architectural documentation, tools catalog, setup instructions, scripts, and deployment guides.
2. `web/.env.example` — Add `SANITY_API_WRITE_TOKEN` and `NEXT_PUBLIC_SITE_URL`.

---

## Security & Compliance Considerations
- **No Secrets in README**: Never put raw API keys or private tokens in `README.md`. Use clear placeholder names matching `.env.example`.
- **Accurate Disclosures**: Reference developer **Abhijeet Rawat** (`abhijeetrawat45@gmail.com`) and educational portfolio status.

---

## Acceptance Criteria
- [ ] `README.md` contains detailed descriptions and purposes for every major tool and library across the frontend, backend, search AI, CMS, auth, analytics, video pipeline, compliance, and testing.
- [ ] `web/.env.example` includes `SANITY_API_WRITE_TOKEN` and `NEXT_PUBLIC_SITE_URL`.
- [ ] TypeScript check (`npm run type-check`) and unit tests (`npm test`) pass with 0 errors.
- [ ] Changes are committed and pushed to `origin feat/search-caching-and-ui` on GitHub.

---

## Verification Plan & Checks to Run
1. **Type Check**: `npm run type-check` in `web/`.
2. **Unit Tests**: `npm test` in `web/`.
3. **Git Push**: `git push origin feat/search-caching-and-ui`.

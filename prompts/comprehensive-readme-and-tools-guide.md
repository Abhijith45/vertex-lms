# Implementation Prompt: Comprehensive README Tooling Deep-Dive, Quotas, Alternatives & Sanity Seeding Guide

## Goal
Substantially expand and enrich [README.md](file:///c:/Users/Abhijeet%20Rawat/Desktop/nextJS/vertex/README.md) to provide thorough, developer-friendly documentation for:
1. **Tooling Deep-Dive & Purpose**: Detailed breakdown of **Clerk**, **Sanity CMS**, **PostHog**, and **CodeRabbit**, explaining their exact architectural roles in Vertex.
2. **Quotas & Cost-Free Alternatives**: Specifying the free-tier limits of each third-party tool and providing viable open-source / cloud alternatives (e.g. Auth.js/Supabase Auth for Clerk; Payload/Strapi for Sanity; Umami/Mixpanel for PostHog; Qodo/SonarQube for CodeRabbit).
3. **Step-by-Step Initial Sanity Seeding Guide**: Clear, copy-pasteable commands for seeding a fresh Sanity dataset from `studio/scripts/seed/seed.ndjson` and `context.ndjson`, deploying the Studio for Context MCP activation, ingesting custom video transcripts with `npm run ingest`, and running TypeGen.
4. **Complete Development & Deployment Workflow**: Full documentation covering environment setup, testing, compliance suite, and CI/CD.

---

## Skills Referenced
- `sanity-best-practices` (`~/.claude/skills/sanity-best-practices/SKILL.md`): Schema definitions, dataset import commands (`sanity dataset import`), TypeGen workflow, Context MCP deployment rules.
- `clerk-nextjs-patterns` (`.agents/skills/clerk-nextjs-patterns/SKILL.md`): Middleware gating, session handling, `<ClerkProvider>` and `<UserButton>` usage.
- `sanity-migration` (`~/.claude/skills/sanity-migration/SKILL.md`): ndjson import and dataset replication patterns.

---

## Code Inspected
- `studio/scripts/seed/seed.ndjson` & `studio/scripts/seed/context.ndjson`: Existing Sanity seed datasets containing all courses, lessons, modules, instructors, categories, and AI Agent Context documents.
- `studio/scripts/ingest-video.ts`: Video ingestion script utilizing `youtube-transcript` and `@sanity/client` to chunk video transcripts into timestamped records.
- `studio/package.json`: Studio scripts (`dev`, `build`, `deploy`, `typegen`, `ingest`).
- `web/package.json`: Web dependencies and scripts.
- `web/app/api/`: Server route handlers for `/api/search`, `/api/progress`, and `/api/bookmarks`.

---

## Key Decisions & Assumptions
1. **Dedicated Third-Party Tooling Breakdown**:
   - Provide dedicated, structured sections for **Clerk**, **Sanity**, **PostHog**, and **CodeRabbit** covering:
     - *Why Vertex uses it* (Exact implementation and features in this codebase).
     - *Free-Tier Quota & Limits* (e.g. Clerk's 10k MAUs, Sanity's 100k API calls, PostHog's 1M events, CodeRabbit's trial/open-source support).
     - *Viable Alternatives* (Open-source, self-hosted, or alternative managed options).
2. **Initial Sanity Dataset Loading Guide**:
   - Provide explicit, sequential instructions for a developer setting up a brand-new Sanity project:
     - `npx sanity login`
     - `npx sanity dataset import scripts/seed/seed.ndjson production --replace`
     - `npx sanity dataset import scripts/seed/context.ndjson production --replace`
     - `npm run deploy` (Deploying Studio UI to activate Context MCP endpoint)
     - `npm run typegen` (Regenerating TypeScript schemas for the web app)
     - `npm run ingest -- --url="<youtube-url>"` (Ingesting new videos with transcript chunking)
3. **Accuracy & Clean Formatting**:
   - Maintain readable GitHub Flavored Markdown with clean tables, copyable code blocks, visual architecture diagrams, and direct contact details.

---

## Files to Touch
1. `README.md` — Expand with complete tooling deep-dive, free-tier quotas & alternatives table, step-by-step Sanity dataset loading guide, and CI/CD review workflows.

---

## Acceptance Criteria
- [ ] `README.md` contains comprehensive sections for Clerk, Sanity, PostHog, and CodeRabbit with their exact purpose, usage, free tier quotas, and alternative replacements.
- [ ] `README.md` contains a clear, actionable guide explaining how to seed and import initial course and AI context data into a fresh Sanity dataset from scratch.
- [ ] `README.md` documents custom video transcript ingestion and TypeGen generation.
- [ ] Git commit and push to GitHub remote (`origin feat/search-caching-and-ui`).

---

## Verification Plan & Checks to Run
1. Verify Markdown formatting and file integrity in `README.md`.
2. Run `git add README.md && git commit` and push to GitHub remote.

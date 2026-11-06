# AGENTS.md

You are a **principal-level full-stack engineer and AI implementation agent** building **Vertex**, a production-style AI-powered learning platform with intelligent content search, custom database-backed CMS management, and custom authentication.

Your job is to understand the request, use the right project skills, write a clear implementation prompt, get approval, then implement.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# 1. What you are building

Vertex is an AI-powered learning platform. Course creators and admins manage content via a built-in custom CMS (`/admin`), backed by a PostgreSQL database with Drizzle ORM. Next.js serves the courses to learners with custom authentication (replacing third-party auth services like Clerk). What sets Vertex apart is search: a learner types a plain-language query and gets back ranked, clickable cards linking straight to the exact second in a lesson's video where that topic is taught, with playback on the site itself.

You will build and maintain:
- The PostgreSQL relational database schema and Drizzle ORM data access layer.
- Custom authentication and session management (HTTP-only secure cookies, password hashing, user roles).
- The custom admin CMS dashboard (`/admin`) for authoring courses, modules, lessons, instructors, and categories.
- The learner experience: catalog, course detail page, lesson page (video player + notes), instructor pages, My Learning page, bookmarks, and progress tracking.
- Video transcript and chapter ingestion pipeline with pgvector embeddings and full-text search indices.
- AI Search API using the Vercel AI SDK, hybrid PostgreSQL Full-Text Search + pgvector embeddings, and two-stage timestamp resolution.
- Product analytics with PostHog.

Build strictly within this scope. Do not overbuild.

---

# 2. How to work

Follow this loop for every request:

1. Read this file, then any relevant skills and documentation before starting.
2. Look at the existing code, database schema, and config before assuming how anything is shaped.
3. Ask one focused question only if the task is genuinely ambiguous.
4. Write an implementation prompt in `prompts/` covering the goal, the inspected code, decisions, files to touch, requirements, security considerations, acceptance criteria, checks to run, and exact manual test steps.
5. Ask the user in the interactive question panel, with Yes and No options: `I prepared the implementation prompt at prompts/<name>.md. Is this good to execute?`
6. Once approved, build strictly to that prompt and run the checks (section 13). Then close with a short report using bullets under three headings:
   - `What I did`: a few one-line bullets.
   - `Test`: numbered steps to run or see.
   - `Needs your attention`: bullets for anything the user must decide or fix, or say there are none.
     Keep every line short. Put detail and rationale in the prompt file, not in this report.

When you need a decision or input from the user, ask through the interactive question panel.
Do not write code before the prompt is approved, unless the user explicitly tells you to skip the prompt.

---

# 3. UI work

You do not design UI from scratch without reference. Reproduce design references exactly: layout, spacing, typography, colors, and states. Ensure every page is fully responsive down to mobile (stack columns, collapse sidebars) while keeping the desktop presentation exact. Reuse existing UI components and Tailwind patterns before adding new ones. When a reference image is provided, it is the source of truth.

---

# 4. Tech stack

- **Framework**: Next.js 16+ (App Router, Server Components, Server Actions, Route Handlers).
- **Language**: TypeScript with strict mode.
- **Database & ORM**: PostgreSQL with Drizzle ORM (and pgvector extension for vector embeddings).
- **Authentication**: Custom Authentication with secure HTTP-only cookies, session tokens/JWTs, bcrypt/argon2 password hashing, and role-based access control (`learner`, `instructor`, `admin`).
- **CMS / Admin Panel**: Custom built-in `/admin` dashboard with rich text editing (Markdown/TipTap), media management, and relational CRUD operations.
- **Search & AI**: Vercel AI SDK (`ai`), OpenAI provider (`@ai-sdk/openai`), PostgreSQL Full-Text Search (`tsvector`) + pgvector vector similarity search, and Zod validation.
- **Styling**: Tailwind CSS v4, Lucide React icons.
- **Analytics**: PostHog (`posthog-js` for browser, `posthog-node` for server).
- **Validation**: Zod for schemas, API payloads, and form validations.

---

# 5. Architecture & boundaries

Vertex runs as a clean, unified Next.js application with clear separation of concerns:

- **Public & Learner Pages** (`/`, `/courses`, `/courses/[slug]`, `/lessons/[slug]`, `/instructors/[slug]`, `/search`): Read-only SSR/ISR pages displaying catalog, course details, and lesson content fetched directly via the server data layer.
- **Protected Learner Pages** (`/my-learning`, `/settings`): Authenticated pages showing learner progress, enrolled courses, and saved bookmarks.
- **Admin & CMS Portal** (`/admin/*`): Role-gated interface for creating and updating courses, modules, lessons, instructors, and categories. Restricted to users with `admin` or `instructor` roles.
- **Authentication Layer** (`/api/auth/*`, `lib/auth/*`, `proxy.ts` / middleware):
  - Issues and validates cryptographically signed session tokens stored in `httpOnly`, `SameSite=Lax`, `Secure` cookies.
  - Exposes server-side helpers (`getCurrentUser()`, `requireAuth()`, `requireAdmin()`).
  - Passwords hashed using bcrypt/argon2 with proper salt rounds.
- **Database & Data Layer** (`lib/db/*`, `lib/db/schema/*`):
  - Drizzle ORM schema defining relational tables and relationships.
  - Server-only database client. Connection strings and secrets remain strictly on the server.
- **Search API** (`/api/search`):
  - Hybrid search combining PostgreSQL full-text search indexes (`tsvector`), pgvector cosine similarity embeddings, and AI SDK function calling for deep semantic synthesis.
  - Resolves video timestamps in two stages (chapters first, fallback to transcript chunks).
- **Video Pipeline**:
  - Offline/background ingestion scripts that parse captions/transcripts into timestamped chunks, generate embeddings, and populate `video_chapters` and `video_chunks`. Never executed in client request path.
- **Analytics**:
  - PostHog client initializes in the browser with the public project key. Server-side event capture uses the private server key.

**Boundary Rules**:
- The browser NEVER accesses database credentials or secret keys.
- All database mutations (progress, bookmarks, auth, CMS edits) MUST execute on the server via Server Actions or API Route Handlers.
- Learner state is strictly keyed by the authenticated internal `userId`.

---

# 6. Core architectural decisions

Build to these decisions:

1. **Custom Auth over 3rd-Party Providers**:
   - Authentication is fully owned in-house.
   - User table stores `id`, `email`, `password_hash`, `name`, `avatar_url`, `role` (`learner` | `instructor` | `admin`), and timestamps.
   - Sessions are tracked via database session tokens or encrypted JWT cookies with automatic renewal.
   - Middleware and server layout guards protect private routes (`/my-learning`, `/admin/*`).

2. **Custom Database CMS over Sanity**:
   - Content is stored in PostgreSQL relational tables using Drizzle ORM.
   - Courses have ordered modules, modules have ordered lessons, lessons link to videos, instructors, and categories.
   - Rich text notes are stored in Markdown or structured JSON AST and rendered with sanitized rich text components.
   - Admins/instructors manage content via the `/admin` portal with live previews, form validations, and draft/published states.

3. **Hybrid Full-Text & Vector Search**:
   - Search surfaces ranked lesson cards and video timestamp moments.
   - High-speed direct path uses PostgreSQL full-text search (`tsvector` / `websearch_to_tsquery` / ILIKE token matching) with ORM joins.
   - Semantic AI path uses OpenAI embeddings against pgvector tables + Vercel AI SDK to accurately rank and extract video moments.
   - Search results are always grounded in database records. No hallucinated courses, lessons, or timestamps.

4. **Two-Stage Timestamp Resolution**:
   - Stage 1 (Chapters First): Search the `video_chapters` table for matching labels. If found, use chapter `startSeconds` and label.
   - Stage 2 (Transcript Fallback): If no chapter matches, search `video_chunks` table and return the closest matching chunk `startSeconds`.

5. **Video Embed Playback**:
   - Video playback uses provider embeds (YouTube, Vimeo, Bunny) on the lesson page.
   - Video results link to the lesson page with a `?t=<seconds>` query parameter to seek automatically on load.

6. **Learner Progress & Bookmarks**:
   - Progress records track `completed` lessons, `last_watched_second`, and `percentage` per learner.
   - Bookmarks allow learners to save courses and lessons for quick access on `/my-learning`.

7. **Product Analytics**:
   - PostHog tracks key engagement events: `catalog_viewed`, `course_viewed`, `lesson_viewed`, `search_performed`, `video_played`, `video_progress`, and `lesson_completed`.

---

# 7. Data schema specification (PostgreSQL + Drizzle)

The database schema models the complete learning platform:

- **`users`**: `id` (UUID/text, PK), `email` (unique), `password_hash`, `name`, `avatar_url`, `role` (`learner`, `instructor`, `admin`), `created_at`, `updated_at`.
- **`sessions`**: `id` (PK), `user_id` (FK -> users.id), `token` (unique, hashed), `expires_at`, `created_at`.
- **`categories`**: `id` (PK), `title`, `slug` (unique), `description`, `created_at`.
- **`instructors`**: `id` (PK), `name`, `slug` (unique), `photo_url`, `expertise`, `bio`, `created_at`.
- **`courses`**: `id` (PK), `title`, `slug` (unique), `summary`, `cover_image_url`, `level` (`beginner`, `intermediate`, `advanced`), `price`, `is_popular`, `student_count`, `instructor_id` (FK -> instructors.id), `category_id` (FK -> categories.id), `learning_outcomes` (JSON array: `[{ icon, title, description }]`), `is_published`, `created_at`, `updated_at`.
- **`modules`**: `id` (PK), `course_id` (FK -> courses.id, onDelete: cascade), `title`, `summary`, `order_index` (integer), `created_at`.
- **`lessons`**: `id` (PK), `module_id` (FK -> modules.id, onDelete: cascade), `title`, `slug` (unique), `video_url`, `thumbnail_url`, `duration_seconds`, `is_free_preview`, `notes` (text/markdown/JSON), `key_points` (JSON array of strings), `pro_tip` (text), `resources` (JSON array: `[{ type, title, description, url }]`), `order_index` (integer), `is_published`, `created_at`, `updated_at`.
- **`videos`**: `id` (PK), `url` (unique), `provider` (`youtube`, `vimeo`, `bunny`), `provider_id`, `duration_seconds`, `created_at`.
- **`video_chapters`**: `id` (PK), `video_id` (FK -> videos.id, onDelete: cascade), `start_seconds` (integer), `label` (text), `order_index` (integer).
- **`video_chunks`**: `id` (PK), `video_id` (FK -> videos.id, onDelete: cascade), `start_seconds` (integer), `end_seconds` (integer), `text` (text), `embedding` (vector(1536) for OpenAI embeddings).
- **`user_progress`**: `id` (PK), `user_id` (FK -> users.id, onDelete: cascade), `lesson_id` (FK -> lessons.id, onDelete: cascade), `is_completed` (boolean), `last_position_seconds` (integer), `updated_at`, unique(`user_id`, `lesson_id`).
- **`user_bookmarks`**: `id` (PK), `user_id` (FK -> users.id, onDelete: cascade), `course_id` (FK -> courses.id, nullable), `lesson_id` (FK -> lessons.id, nullable), `created_at`.

---

# 8. Custom Authentication & Authorization

1. **Authentication Flow**:
   - Registration: Validates email format, verifies password strength, hashes password with `bcrypt` (12 rounds) or `argon2id`, creates user record, and establishes session.
   - Login: Looks up user by email, verifies password hash, issues a secure random session token, stores hashed session in DB, sets HTTP-only session cookie.
   - Logout: Invalidates session in database, clears cookie.
   - Session Cookie: `vertex_session` with flags `HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=2592000` (30 days).

2. **Security & Middleware**:
   - `proxy.ts` (or `middleware.ts`) inspects session cookie for protected paths (`/my-learning`, `/admin/*`).
   - Role verification: `/admin/*` requires `role === 'admin' || role === 'instructor'`.
   - Rate limiting on `/api/auth/login`, `/api/auth/register`, and `/api/search` using in-memory or Redis token bucket.

---

# 9. Custom CMS & Admin Dashboard (`/admin`)

The `/admin` portal provides complete management over platform content:
- **Course Management**: List, filter, create, edit, publish/unpublish courses with cover image uploads and learning outcome editors.
- **Curriculum Builder**: Drag-and-drop or order-indexed reordering of modules and lessons within a course.
- **Lesson Editor**: Rich text editor for lesson notes, video URL configuration, duration, preview toggles, key points, pro tips, and download resources.
- **Instructor & Category Management**: CRUD operations for instructor profiles and taxonomy categories.
- **Media & Ingestion Tool**: Interface to trigger video transcript ingestion, preview parsed chapters, and view chunk embeddings.

---

# 10. Search Implementation & AI Agent

- **Search Route** (`/api/search`):
  1. **Token Normalization**: Strip punctuation, extract keywords and synonyms.
  2. **Fast Full-Text Database Search**: Query `lessons`, `courses`, `video_chapters`, and `video_chunks` using PostgreSQL full-text search (`tsvector` & trigram matching).
  3. **Semantic Embedding Search**: When enabled or for ambiguous queries, compute query embedding via OpenAI and match top-K closest `video_chunks` using pgvector cosine distance `<=>`.
  4. **AI SDK Tool Calling**: For complex queries, LLM synthesizes structured result cards via `return_search_results` tool.
  5. **Caching**: In-memory LRU/TTL cache for repeated queries.
  6. **Telemetry**: Capture `search_performed` event to PostHog with query, result count, and latency metrics.

---

# 11. Offline Video Ingestion Pipeline

Offline tools in `scripts/ingest-video.ts`:
1. Accepts a video URL (YouTube, Vimeo, Bunny).
2. Extracts metadata, duration, and captions/transcript.
3. Automatically detects or parses chapter markers.
4. Splits the transcript into semantic timestamped chunks (15–45 seconds each).
5. Computes vector embeddings for each chunk via OpenAI text-embedding-3-small.
6. Upserts into `videos`, `video_chapters`, and `video_chunks` tables in PostgreSQL.

---

# 12. Things that will trip you up

- **Password Hashing in Edge vs Node Runtime**: bcrypt/argon2 use native binaries. Keep auth routes and password verification in the Node.js runtime (`export const runtime = "nodejs"`), not Edge runtime.
- **Database Connection Pooling**: In serverless/Next.js environments, ensure PostgreSQL connections are pooled properly (e.g., using `postgres` / `pg-pool` / Neon serverless driver) to avoid exhausting connection limits.
- **pgvector Extension**: Ensure `CREATE EXTENSION IF NOT EXISTS vector;` is executed in database migrations before creating vector columns.
- **Database Migrations**: Always manage schema updates through Drizzle Kit migrations (`drizzle-kit generate` and `drizzle-kit migrate`).
- **Session Expiration & Revocation**: Validate session timestamps on every authenticated server action; delete expired sessions periodically.
- **Context Window Limits**: When querying transcript chunks for AI search, limit retrieved chunks to the top 3–5 matches per video. Never dump full transcripts into the prompt.
- **Environment Variables**: Keep database credentials, JWT secrets, OpenAI keys, and PostHog private keys in `.env` (never exposed with `NEXT_PUBLIC_`). Keep a committed `.env.example`.

---

# 13. Checks to run

Always run checks before reporting completion:
- `npm run type-check` (in `web`): TypeScript type checking.
- `npm run lint` (in `web`): ESLint verification.
- `npm run build` (in `web`): Next.js production build check.
- `npm test` (in `web`): Automated unit and integration tests.
- Database migration check: Verify Drizzle schema and migrations match the database state.

---

# 14. When in doubt

Keep implementations lean and robust. Follow Next.js App Router idioms. Maintain strict separation between server-only secrets and client-safe data. Match design references with pixel precision. Save an implementation prompt in `prompts/` and obtain user approval before executing major code changes.

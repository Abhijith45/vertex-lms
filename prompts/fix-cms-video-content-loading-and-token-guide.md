# Implementation Prompt: Fix Video Content Loading from CMS to Website UI & Long-Lived Token Guide

## 1. Goal
Diagnose and resolve the issue preventing video and lesson content from loading from Sanity CMS into the Vertex website UI, make data fetching resilient to token states, align schema image fields (`poster` vs `thumbnail`), import seed course and video data into the Sanity dataset, and provide an exhaustive step-by-step guide for generating permanent, long-lived Sanity API tokens.

---

## 2. Diagnosed Issues & Root Causes

### Issue A: Expired / Invalid Sanity Token causing 401 Unauthorized (`SIO-401-ANF`)
- **Inspection**: In `web/sanity/lib/client.ts`, `serverClient` initializes with `token: process.env.SANITY_API_READ_TOKEN`.
- **Root Cause**: The token currently configured in `web/.env.local` is returning `401 Unauthorized (Session not found)`. When any server component fetches data via `sanityFetch()`, the fetch throws a 401 error.
- **Impact**: In `web/app/lessons/[slug]/page.tsx`, the error is caught, leaving `lesson = null`. Next.js immediately executes `notFound()`, rendering a 404 page rather than the lesson and video player.

### Issue B: The Remote Sanity Dataset is Missing Course and Lesson Documents
- **Inspection**: Querying `*[]._type` on the live Sanity dataset (`projectId: lb09hkdy`, `dataset: production`) reveals only:
  - `progress`
  - `sanity.imageAsset`
  - `sanity.agentContext`
  - 1 single `video` document (`video-ZjAqacIC_3c`)
- **Root Cause**: The curated seed file `studio/scripts/seed/seed.ndjson` (141 documents covering 5 courses, dozens of modules, and interactive lessons with YouTube video URLs) has not been imported into the remote Sanity dataset.
- **Impact**: Even if the 401 error is bypassed, queries for `*[_type == "lesson" && slug.current == $slug][0]` return `null` because the lesson documents do not exist in the database.

### Issue C: Schema Field Name Discrepancy (`poster` vs `thumbnail`)
- **Inspection**: In `studio/schemaTypes/lesson.ts`, the cover image is named `poster`. However, in `studio/scripts/seed/seed.ndjson`, the image is stored as `thumbnail`.
- **Root Cause**: In `web/sanity/lib/queries.ts`, `getLessonWithCourseQuery` selects `poster` directly rather than `coalesce(poster, thumbnail)`.
- **Impact**: Lesson video posters and fallback cards fail to resolve thumbnail URLs.

### Issue D: Lack of Fallback to Public Dataset Reading in `sanityFetch`
- **Inspection**: For public Sanity datasets, queries execute without an Authorization header. If an invalid or expired token is present in `.env.local`, passing `token` causes Sanity to reject the request rather than reading the public data.
- **Fix**: Update `web/sanity/lib/client.ts` to attempt server fetch with the token, and if a 401 Unauthorized error occurs on a read operation, gracefully fall back to an unauthenticated public query so that learners can still view content.

---

## 3. Key Decisions & Assumptions
1. **Resilient Data Layer**:
   - Enhance `web/sanity/lib/client.ts` so `sanityFetch` handles 401 token authentication errors gracefully by attempting an unauthenticated read fallback for public queries.
2. **Query Alignment**:
   - Update `web/sanity/lib/queries.ts` to select `"poster": coalesce(poster, thumbnail)` in `getLessonWithCourseQuery`, `getCourseBySlugQuery`, and `getCoursesQuery`.
   - Include optional video intelligence chapter resolution in lesson queries so video markers can be utilized in the UI.
3. **Seeding Plan**:
   - Document the exact command to import `studio/scripts/seed/seed.ndjson` and `studio/scripts/seed/context.ndjson` into the production dataset.
4. **Token Generation Guide**:
   - Provide an exact, step-by-step walkthrough for creating a permanent, non-expiring API token directly in the Sanity Management Console (distinguishing persistent API tokens from temporary CLI session tokens).

---

## 4. Files to Touch
1. `web/sanity/lib/client.ts` — Add 401 fallback resilience to `sanityFetch`.
2. `web/sanity/lib/queries.ts` — Add `coalesce(poster, thumbnail)` to lesson and course queries.
3. `web/test/lesson-utils.test.ts` (or relevant test suites) — Verify queries and helpers work cleanly.

---

## 5. Security & Boundary Considerations
- `SANITY_API_WRITE_TOKEN` must remain strictly server-side (used only for user progress and bookmark writes).
- Client-side code must never receive write tokens.
- Fallback unauthenticated reads only apply to public content queries (courses, lessons, categories), never private user progress.

---

## 6. Acceptance Criteria
- [ ] `web/sanity/lib/client.ts` gracefully handles invalid tokens on public reads without throwing unhandled 401 errors.
- [ ] `web/sanity/lib/queries.ts` supports both `poster` and `thumbnail` fields via `coalesce()`.
- [ ] All automated unit tests in `web` pass (`npm test`).
- [ ] TypeScript type checks pass (`npm run type-check`).
- [ ] User receives an actionable guide to import seed data and generate a permanent long-lived Sanity token.

---

## 7. Verification Plan & Checks to Run
1. `cd web && npm run type-check`
2. `cd web && npm test`
3. Verify `GET http://localhost:3000` responds with 200 without 401 crash.

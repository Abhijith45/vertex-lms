# Implementation Prompt: Comprehensive PostHog Analytics Tracking

## 1. Goal
Implement production-grade PostHog event tracking across Vertex's core learner and search journeys, following PostHog's Next.js and product analytics best practices:
1. **Search Performed with Query**: Track search queries, result counts, and sources (both client-side in the search UI and server-side in `/api/search`).
2. **Search Results Opened with Result Type**: Track clicks on video moment results and lesson results with query context and result types (`"video"` vs. `"lesson"`).
3. **Video Play**: Track initial playback start and subsequent resumes with video URL, lesson metadata, and timestamps.
4. **Watch Depth**: Track engagement milestones at 25%, 50%, 75%, 90%, and 100% video completion, deduplicated per playback session.
5. **Resume Used**: Track when learners use resume affordances (Course Hero "Continue Learning", Sticky Progress "Continue Learning", or arriving at a lesson with a `?start=` timestamp).
6. **Lessons Completed**: Track lesson completions upon video finish (`ended` state) and 100% completion, both client-side and through a dedicated server-side `/api/progress` route.
7. **Key Supporting Engagement Events**: Track `lesson_viewed`, `course_viewed`, `search_suggestion_selected`, `lesson_tab_switched`, and `lesson_navigated`.
8. **Privacy Compliance**: Strict adherence to zero personally identifiable information (PII) in event properties; user identity is managed exclusively via the Clerk user ID in `posthog.identify()`.

---

## 2. Skills Consulted
- **AGENTS.md**:
  - Section 5 & 7: Separation of concerns, Clerk user ID as user identity key, progress writes through server route, PostHog public key for browser and server key for server-side.
  - Section 7: "Instrument the moments that show engagement: catalog and lesson views, a search performed, a video play and how far it is watched, and a lesson completed."
  - Section 12: "PostHog's project key is public by design and may reach the browser. Any private PostHog API key stays server only."
  - Section 13: Validation via typecheck, lint, build, and test suites.
- **clerk**: Clerk `@clerk/nextjs/server` `auth()` for resolving `userId` in server routes.
- **ui-ux-pro-max**: Clean event triggers without interfering with high-frequency video polling or UI responsiveness.

---

## 3. Code Inspected
- `web/lib/posthog-server.ts`: Server-side singleton client using `posthog-node` with `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST`.
- `web/instrumentation-client.ts`: Client-side PostHog initialization with reverse proxy (`/ingest`), exception capturing, and debug mode.
- `web/components/analytics/posthog-identity.tsx`: Clerk authentication identity synchronization (`posthog.identify(user.id)` and `posthog.reset()`).
- `web/app/api/search/route.ts`: Server search endpoint orchestrating MCP/GROQ searches and memory cache.
- `web/app/search/page.tsx`: Search results client page rendering `VideoResultCard` and `LessonResultCard`.
- `web/components/search/video-result-card.tsx` & `web/components/search/lesson-result-card.tsx`: Result cards linking to `/lessons/[slug]`.
- `web/components/search/search-input.tsx` & `web/components/search/search-modal.tsx`: Search inputs with autocomplete and keyboard navigation.
- `web/components/lesson/video-embed.tsx`: YouTube IFrame API player handling play, pause, seek, 200ms time polling, and video end.
- `web/app/lessons/[slug]/page.tsx`: Lesson detail page with curriculum sidebar and tabs.
- `web/components/course/course-hero.tsx` & `web/components/course/sticky-course-progress.tsx`: "Continue Learning" resume triggers.

---

## 4. Decisions and Assumptions
1. **Event Naming Taxonomy**:
   - Follow standard PostHog convention: lower snake_case `[object]_[action]` (e.g. `search_performed`, `search_result_opened`, `video_played`, `video_paused`, `video_watch_depth`, `resume_used`, `lesson_completed`, `lesson_viewed`, `course_viewed`).
2. **Server vs. Client Boundaries**:
   - `/api/search/route.ts` is server-side: capture `search_performed` server-side with `distinctId: userId || "anonymous"`.
   - `/api/progress/route.ts` [NEW]: create a server endpoint to record lesson completion and progress updates server-side with `getPostHogClient()`.
   - Client interactions (clicks, video playback, watch depth scrub events, tab switches) are captured client-side via `posthog-js`.
3. **Watch Depth Milestone De-duplication**:
   - In `video-embed.tsx`, use a `milestonesReachedRef = useRef<Set<number>>(new Set())` so that each milestone (25%, 50%, 75%, 90%, 100%) fires at most once per lesson viewing session, even if the user scrubs back and forth.
4. **Resume Tracking**:
   - Track `resume_used` from two key scenarios:
     1. User clicks "Continue Learning" on `CourseHero` or `StickyCourseProgress`.
     2. User arrives on a lesson with a `?start=` query param > 0 and playback starts at that resumed timestamp.
5. **No PII in Event Properties**:
   - No email, full name, or IP addresses in event properties. Event properties only contain identifiers (course slug, lesson slug, module index), counts, percentages, and duration numbers.

---

## 5. Files to Touch
1. **`web/app/api/search/route.ts`**:
   - Import `getPostHogClient` and `auth()` from `@clerk/nextjs/server`.
   - Capture server-side `search_performed` event upon executing queries with execution time, results count, query string, and cache status.
2. **`web/app/api/progress/route.ts`** [NEW]:
   - Server-side route handling `POST /api/progress` for recording completed lessons and resume positions.
   - Captures `lesson_completed` and `progress_updated` server-side using `getPostHogClient()`.
3. **`web/app/search/page.tsx`**:
   - Capture client-side `search_performed` on search results load.
   - Pass `query` context into result cards for attribution.
4. **`web/components/search/video-result-card.tsx`**:
   - Capture `search_result_opened` on click with `{ result_type: "video", query, lesson_slug, start_seconds, course_title }`.
5. **`web/components/search/lesson-result-card.tsx`**:
   - Capture `search_result_opened` on click with `{ result_type: "lesson", query, lesson_slug, course_title }`.
6. **`web/components/search/search-input.tsx` & `web/components/search/search-modal.tsx`**:
   - Capture `search_suggestion_selected` when selecting a suggestion.
7. **`web/components/lesson/video-embed.tsx`**:
   - Accept `lessonSlug`, `courseSlug`, and `lessonTitle` props.
   - Track `video_played` (with `is_initial_play` boolean flag), `video_paused`.
   - Track `video_watch_depth` (milestones 25%, 50%, 75%, 90%, 100%).
   - Track `resume_used` when playback initializes with `startSeconds > 0`.
   - Track `lesson_completed` when video finishes (`event.data === 0` / ENDED) or reaches 100%, and trigger POST to `/api/progress`.
8. **`web/app/lessons/[slug]/page.tsx`**:
   - Pass `lessonSlug={slug}`, `courseSlug={course?.slug}`, and `lessonTitle={lesson.title}` into `VideoEmbed`.
   - Include client analytics helper `LessonViewTracker` for `lesson_viewed`.
9. **`web/components/lesson/lesson-view-tracker.tsx`** [NEW]:
   - Client component mounting `posthog.capture("lesson_viewed", ...)` on lesson page load.
10. **`web/components/course/course-hero.tsx`**:
    - Capture `resume_used` when "Continue Learning" is clicked.
11. **`web/components/course/sticky-course-progress.tsx`**:
    - Capture `resume_used` alongside existing `course_started` on "Continue Learning" click.
12. **`web/components/lesson/lesson-content-tabs.tsx`**:
    - Track `lesson_tab_switched` (`tab_name: "content" | "notes"`).
13. **`web/components/lesson/lesson-footer-nav.tsx`**:
    - Track `lesson_navigated` (`direction: "prev" | "next"`).
14. **`web/test/posthog-analytics.test.ts`** [NEW]:
    - Unit tests validating event taxonomy, property payloads, watch depth milestone calculator, and zero PII.

---

## 6. Security Considerations
- **No PII Leakage**: Event properties strictly avoid emails, phone numbers, and full names.
- **Server-Side Credentials**: PostHog API keys and Sanity write tokens remain server-side only.
- **Rate Limiting**: Protected server routes continue to enforce existing IP/user rate limits.

---

## 7. Acceptance Criteria
- [ ] `search_performed` is captured with query, result counts, and source on both client and server.
- [ ] Clicking a video moment card captures `search_result_opened` with `result_type: "video"`.
- [ ] Clicking a lesson card captures `search_result_opened` with `result_type: "lesson"`.
- [ ] Playing a video captures `video_played` with lesson and duration metadata.
- [ ] Watching past 25%, 50%, 75%, 90%, and 100% captures `video_watch_depth` without duplicates.
- [ ] Clicking "Continue Learning" or starting a video with `startSeconds > 0` captures `resume_used`.
- [ ] Reaching video end captures `lesson_completed` client-side and triggers `/api/progress` server-side capture.
- [ ] All unit tests pass (`npm test`).
- [ ] TypeScript check passes with zero errors (`npx tsc --noEmit`).

---

## 8. Checks to Run
- `npm test`
- `npx tsc --noEmit`
- `npm run lint`

---

## 9. Manual Test Steps
1. Navigate to `http://localhost:3000/search?q=routing`. Open browser console and verify `search_performed` is captured with query and results count.
2. Click on a video moment result card. Verify `search_result_opened` is captured with `result_type: "video"` and `start_seconds`.
3. On the lesson page, verify `lesson_viewed` is captured.
4. Click play on the video player. Verify `video_played` is captured.
5. Let video play or scrub to 25%, 50%, and 75%. Verify `video_watch_depth` fires at each threshold once.
6. Scrub to end or let video finish. Verify `lesson_completed` is captured.
7. Return to `/courses/nextjs-app-router-in-depth` and click "Continue Learning". Verify `resume_used` is captured.

# Implementation Prompt: Clerk + Sanity Backend Bookmarking Solution

## Goal
Implement a production-grade, full-stack bookmarking feature for courses in Vertex. Learners can bookmark/save courses on course detail and lesson pages, have their bookmarks persisted in their Sanity learner progress document keyed by their Clerk user ID, experience seamless optimistic UI feedback with guest sign-in prompts, and access all saved courses in a dedicated section on the **My Learning** dashboard.

---

## Skills Referenced
- `sanity-best-practices` (`~/.claude/skills/sanity-best-practices/SKILL.md`): Schema modeling with `defineField` and reference arrays, GROQ projection, TypeGen compatibility, and atomic mutation patching (`insert`, `unset`).
- `clerk` / `clerk-nextjs-patterns` (`.agents/skills/clerk-nextjs-patterns/SKILL.md`): Server-side authentication via `auth()` in API routes and server components, plus client-side `useAuth()` and `useClerk().openSignIn()` for unauthenticated CTA handling.

---

## Code Inspected
- `studio/schemaTypes/progress.ts`: Current learner progress document schema holding `clerkUserId`, `completedLessons`, and `resumePositions`.
- `web/app/api/progress/route.ts`: Existing pattern for rate-limiting, Clerk `auth()` validation, Sanity `writeClient` transactions, cache tag revalidation (`revalidateTag`), and PostHog tracking.
- `web/components/course/bookmark-button.tsx`: Existing client component using ephemeral React state (`useState(false)`), without server persistence or Clerk integration.
- `web/components/course/course-hero.tsx`: Calls `<BookmarkButton courseId={course._id} />`.
- `web/app/courses/[slug]/page.tsx`: Server component fetching `progressDoc` from Sanity and computing progress percentage.
- `web/app/lessons/[slug]/page.tsx`: Contains `<BookmarkButton courseId={lesson._id} />` (lesson ID currently passed instead of parent course ID).
- `web/app/my-learning/page.tsx`: Server component querying progress and courses, rendering "In Progress" and "Completed Courses".
- `web/components/my-learning/my-learning-hero.tsx`: Statistics hero banner showing active courses and completed lessons.

---

## Key Decisions & Assumptions
1. **Data Model**: Bookmarks will be stored in the existing `progress` Sanity document under a new field `bookmarkedCourses: array of reference to course`. This keeps user-specific state unified in one document per Clerk user ID, avoiding extra document overhead.
2. **Server-Only Writes**: In strict compliance with `AGENTS.md` Rule 5 and Rule 12, the browser never writes directly to Sanity. All mutations flow through `POST /api/bookmarks` using the server-only `writeClient` with `SANITY_API_WRITE_TOKEN`.
3. **Guest Handling**: If an unauthenticated user clicks "Bookmark", the UI invokes Clerk's `openSignIn()` modal instead of silently failing or persisting ephemeral data.
4. **Optimistic UI with Rollback**: `BookmarkButton` toggles immediately for instant tactile responsiveness, captures PostHog events, and asynchronously syncs with `/api/bookmarks`. If the API call fails or returns 401, the button gracefully reverts and shows appropriate feedback.
5. **Lesson Page Association**: On lesson pages (`/lessons/[slug]`), the bookmark button will associate with the parent course ID (retrieved via GROQ `*[_type == "course" && references(^._id)][0]`), allowing learners to bookmark the entire course from inside any lesson.
6. **My Learning Dashboard**: "My Learning" (`/my-learning`) will display a dedicated "Saved Courses" / "Bookmarked" section with responsive course cards and an unbookmark action.

---

## Files to Touch
1. `studio/schemaTypes/progress.ts` — Add `bookmarkedCourses` array field of course references.
2. `web/app/api/bookmarks/route.ts` [NEW] — Route handler for `GET` (fetch user bookmarks) and `POST` (toggle bookmark status with Sanity writeClient patch).
3. `web/components/course/bookmark-button.tsx` — Add Clerk auth check, optimistic mutation call to `/api/bookmarks`, sign-in modal trigger, and initial state prop.
4. `web/components/course/course-hero.tsx` — Propagate `initialIsBookmarked` to `<BookmarkButton />`.
5. `web/app/courses/[slug]/page.tsx` — Fetch `bookmarkedCourses` in `progressDoc` query and pass `initialIsBookmarked` to `CourseHero`.
6. `web/app/lessons/[slug]/page.tsx` — Pass the parent course ID and its initial bookmark state to `<BookmarkButton />`.
7. `web/components/my-learning/bookmarked-course-card.tsx` [NEW] — Card component for displaying bookmarked courses on the dashboard with quick remove.
8. `web/app/my-learning/page.tsx` — Update `myLearningQuery` to include `bookmarkedCourses[]->`, calculate bookmark counts, and render the Bookmarked section.
9. `web/test/bookmarks.test.ts` [NEW] — Unit tests for bookmark API payload validation, toggle logic, and schema reference format.

---

## Security Considerations
- **Clerk Authentication**: Ensure all mutations in `/api/bookmarks` require `const { userId } = await auth()` and reject unauthorized requests with HTTP 401.
- **Rate Limiting**: Apply in-memory IP/user rate-limiting (e.g. 60 requests per minute) matching `/api/progress`.
- **Private Token Isolation**: Ensure `SANITY_API_WRITE_TOKEN` is strictly consumed on the server runtime and never leaked to the client bundle.
- **Input Validation**: Use strict runtime validation to ensure `courseId` is a non-empty string.

---

## Acceptance Criteria
- [ ] Clicking "Bookmark" when signed in saves the course to the user's Sanity `progress` document.
- [ ] Refreshing the course detail page preserves the bookmarked state.
- [ ] Clicking "Bookmark" when signed out opens Clerk's sign-in modal.
- [ ] Unbookmarking removes the course reference from the Sanity document.
- [ ] Navigating to `/my-learning` displays all bookmarked courses with cover images, titles, summaries, and quick links.
- [ ] Lesson page bookmark button links to the parent course rather than an orphan lesson ID.
- [ ] PostHog captures `course_bookmarked` events with `course_id`, `bookmarked`, and `source`.
- [ ] All unit tests and type checks pass with zero errors.

---

## Verification Plan & Checks to Run
1. **Type Check**: `npm run type-check` in `web/` to confirm zero TypeScript diagnostics.
2. **Unit Tests**: `npm test` in `web/` to ensure all existing tests and new bookmark tests pass.
3. **Live Browser Verification**:
   - Navigate to `/courses/building-ai-apps-with-llms`.
   - Click "Bookmark" and verify the active state and network payload.
   - Refresh page to verify bookmark state persists.
   - Navigate to `/my-learning` to see the course in the "Saved Courses" section.
   - Click remove/unbookmark and verify real-time removal.

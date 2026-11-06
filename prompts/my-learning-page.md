# Build "My Learning" Page for Individual Users

## Goal
Build the `/my-learning` page for individual authenticated users. The page will read the user's progress from Sanity and display personalized in-progress courses, resume positions with direct timestamped links, completed courses, and learning overview statistics.

## Skills Read & References
- `AGENTS.md` (sections 1, 2, 5, 7, 8, 12, 13)
- `clerk` (server-side authentication via `auth()`)
- `sanity-best-practices` (GROQ queries, server-only data fetching with private token)

## Code Inspected & Assumptions
- `web/proxy.ts`: Already marks `/my-learning(.*)` as a protected route using Clerk middleware.
- `web/components/layout/navbar.tsx`: Already has an active navigation link pointing to `/my-learning`.
- `schemaTypes/progress.ts`: The Sanity schema holds `clerkUserId`, `completedLessons[]` (references to `lesson`), and `resumePositions[]` (objects with `lesson` reference and `positionSeconds`).
- Per `AGENTS.md` Section 7: "The My Learning page is presentational only, with no backend of its own... My Learning may read existing progress for display."
- Assumption: The page will be a Server Component fetching the current user's progress and joining with Sanity courses.

## Files to Touch
1. **[NEW]** `web/app/my-learning/page.tsx`
   - Server Component reading `auth()`, fetching the user's `progress` document and all available courses from Sanity.
   - Computes which courses are in progress (has completed lessons or resume positions) vs completed vs not started.
   - Renders the layout, stats header, in-progress cards, and empty state if no courses have been started.
2. **[NEW]** `web/components/my-learning/my-learning-hero.tsx`
   - Header with learner welcome and summary metric pills (e.g. Active Courses, Completed Lessons).
3. **[NEW]** `web/components/my-learning/in-progress-card.tsx`
   - Course card showing cover image, title, progress bar, completion percentage, last played lesson title, and a "Resume" button linking to `/lessons/[slug]?start=[positionSeconds]`.
4. **[NEW]** `web/components/my-learning/empty-learning-state.tsx`
   - Clean empty state with call-to-action button linking to `/courses`.

## Requirements
- Strictly read-only presentational page; writes are not performed on this page.
- Private Sanity data fetched server-side; tokens are never exposed to the client.
- Responsive design matching Vertex aesthetics (light and dark mode, 1440px canvas, terracotta accent `#E05A36`).
- Direct timestamp seek support for the "Resume" button so users jump straight to where they left off.

## Security Considerations
- The Clerk `userId` from `auth()` determines which progress record is fetched. Unauthenticated requests are redirected by middleware.
- Server-side fetching ensures zero token leakage.

## Acceptance Criteria
- Visiting `http://localhost:3000/my-learning` loads the personalized learning page.
- A user with active progress (e.g. "Building AI Apps with LLMs") sees the course in the In-Progress section with their actual percentage (8%) and a "Resume" button pointing to `Temperature and sampling` with their saved timestamp.
- A user with no progress sees the clean empty state inviting them to start learning.
- Seamless light and dark mode styling.

## Checks to Run
- `npm run type-check` in `web`
- `npm run lint` in `web`

## Exact Manual Test Steps
1. Navigate to `http://localhost:3000/my-learning` in the browser while logged in.
2. Confirm the page displays your learning summary metrics and "Building AI Apps with LLMs" in the In-Progress list.
3. Verify the card displays the 8% progress bar and a "Resume" button.
4. Click "Resume" and verify it navigates to `/lessons/building-ai-apps-with-llms-temperature-and-sampling?start=...` and resumes playback.

# Track Video Progress

## Goal
Connect the YouTube video playback to the Sanity database to track real-time progress and update the course completion UI automatically, replacing the hardcoded 35%.

## Code Inspected & Assumptions
- `video-embed.tsx`: Already polls YouTube API and sends POST requests to `/api/progress` at 25%, 50%, 75%, 90%, 100% milestones.
- `/api/progress/route.ts`: Currently only fires PostHog analytics events. It does not save the progress to the database.
- `schemaTypes/progress.ts`: A Sanity schema exists for Learner Progress (`progress`), containing `clerkUserId`, `completedLessons` (array of references), and `resumePositions` (array of objects).
- `courses/[slug]/page.tsx`: The `StickyCourseProgress` component is hardcoded to `progressPercentage={35}`.
- Assumption: We will use a Sanity write token (e.g., `SANITY_API_WRITE_TOKEN`) in the Next.js server route to update the progress document.

## Files to Touch
1. **[MODIFY]** `web/app/api/progress/route.ts`
   - Update to use `@sanity/client` with a write token.
   - Fetch the existing `progress` document for the `userId`. If it doesn't exist, create it.
   - If `completed: true` is sent, add the `lessonSlug` reference to `completedLessons` array (avoiding duplicates).
   - Update the `resumePosition` for this lesson.
2. **[NEW]** `web/lib/sanity/write-client.ts`
   - Create a dedicated Sanity client initialized with a `token` (e.g., `process.env.SANITY_API_WRITE_TOKEN`) for database mutations.
3. **[MODIFY]** `web/app/(courses)/courses/[slug]/page.tsx`
   - Read the user's progress record from Sanity.
   - Calculate `progressPercentage` dynamically based on `(completedLessons in course) / (totalLessons in course) * 100`.
   - Pass this dynamic value to `StickyCourseProgress`.
4. **[MODIFY]** `web/components/lesson/lesson-sidebar.tsx`
   - If the lesson sidebar also has a hardcoded 35%, update it to use real progress (or accept it as a prop).

## Requirements
- Real-time updates: As a user finishes a video, the Next.js cache should be revalidated so the course page shows updated progress.
- Write operations must remain strictly on the server route (`/api/progress`).
- The browser must not hold or send the Sanity write token.

## Security Considerations
- The `clerkUserId` from `auth()` is the sole source of truth for which progress record to update.
- Ensure the write token is kept secure on the server.

## Acceptance Criteria
- Video milestones hit `/api/progress`.
- The API updates the Sanity `progress` document correctly.
- Navigating back to the course page reflects the accurate completion percentage based on Sanity data.

## Checks to Run
- `npm run build` inside `web` to ensure no type errors.
- Manual test in local dev environment.

## Exact Manual Test Steps
1. Start the web and studio dev servers.
2. Sign in via Clerk.
3. Navigate to a course page (e.g., Next.js course). Notice the progress percentage.
4. Click a lesson and watch or scrub the video to >90% (to trigger completion).
5. Verify in Sanity Studio that the `progress` document for your user has been created/updated with the lesson.
6. Navigate back to the course page and verify the progress percentage has increased.

# Fix Progress Tracking & Live Localhost Browser Test

## Goal
Fix the issue where course/lesson progress does not update after video playback or completion, restart the stale Next.js dev server so it picks up `SANITY_API_WRITE_TOKEN`, ensure instantaneous cache revalidation and UI refresh, and run an interactive live browser test on localhost to verify end-to-end functionality with the user logging in.

## Skills Read & References
- `AGENTS.md` (sections 1, 2, 5, 7, 8, 12, 13)
- `sanity-best-practices` (Sanity client mutations, write token handling, GROQ dereferencing)
- `clerk` (Clerk Next.js server auth and user verification)

## Code Inspected & Assumptions
- `web/sanity/lib/write-client.ts`: Uses `process.env.SANITY_API_WRITE_TOKEN`.
- `web/.env.local`: Contains `SANITY_API_WRITE_TOKEN`. However, the running `npm run dev` process in `web` started 30+ hours ago, before the token was added to `.env.local`, so the running server has `undefined` for `SANITY_API_WRITE_TOKEN`.
- `web/app/api/progress/route.ts`: Swallowed Sanity write exceptions in a `try/catch` and returned `{ success: true }`, concealing mutation failures.
- `web/components/lesson/video-embed.tsx`: Required `m === 100` for completion, which was rarely met during polling. Also made unawaited calls to `/api/progress` without calling `router.refresh()`, meaning the Server Component never updated the UI.
- `web/app/lessons/[slug]/page.tsx` & `web/app/courses/[slug]/page.tsx`: Cached user progress with `revalidate: 300` (5 minutes), preventing immediate display of newly saved progress.
- Assumption: Learner progress is dynamic user data and must be fetched with `revalidate: 0` (no-store), with `router.refresh()` called upon successful progress write.

## Files to Touch
1. **[MODIFY]** `web/app/api/progress/route.ts`
   - Return 500 error if Sanity mutation throws so failures are not concealed.
   - Ensure `revalidateTag` runs on completion.
2. **[MODIFY]** `web/app/lessons/[slug]/page.tsx`
   - Set progress query fetch to `revalidate: 0` so latest progress is returned on page render.
3. **[MODIFY]** `web/app/courses/[slug]/page.tsx`
   - Set progress query fetch to `revalidate: 0` for course completion percentage.
4. **[MODIFY]** `web/components/lesson/video-embed.tsx`
   - Set completion to trigger on >= 90% watch milestone or on `event.data === 0` (ENDED).
   - Await the `/api/progress` POST call and invoke `router.refresh()` so the sidebar completion percentage updates immediately in the UI.
   - When video ends and autoplay is active, await the progress save before navigating to the next lesson.

## Requirements
- Writes must remain strictly on the server route using `writeClient` with `SANITY_API_WRITE_TOKEN`.
- Browser only sends lesson slug and position; server verifies Clerk authentication.
- Updating progress must reflect immediately in the UI without waiting for a 5-minute cache expiry.
- A live localhost test must be conducted using the browser tool, asking the user to log in.

## Security Considerations
- `SANITY_API_WRITE_TOKEN` remains on the server only, never exposed to the client.
- `auth()` from `@clerk/nextjs/server` verifies the caller identity before any mutation.

## Acceptance Criteria
- Web server has loaded `SANITY_API_WRITE_TOKEN`.
- Playing a lesson past 90% or to video end saves the completion to Sanity under the user's `progress` document.
- The lesson sidebar completion percentage updates from 0% to the real course progress percentage.
- The course detail page shows the updated completion percentage.

## Checks to Run
- Dev server restart for `web`.
- `npm run type-check` in `web`.
- `npm run lint` in `web`.

## Exact Manual Test Steps
1. Navigate browser to `http://localhost:3000/sign-in` (or lesson page).
2. Prompt user to log in with their credentials.
3. Open lesson `http://localhost:3000/lessons/building-ai-apps-with-llms-temperature-and-sampling`.
4. Observe initial progress (0% complete).
5. Scrub video to past 90% and let it reach completion.
6. Verify `/api/progress` responds 200 OK with `completed: true`.
7. Verify sidebar updates with new percentage (e.g. 8% complete).
8. Verify in Sanity database that the `progress` record contains the lesson reference.

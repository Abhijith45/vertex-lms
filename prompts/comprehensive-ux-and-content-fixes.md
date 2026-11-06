# Implementation Prompt: Comprehensive UX, Content & State Fixes

## Goal
Implement the audited UX, content, and conditional state improvements across the application:
1. Dynamic Course CTAs ("Start Learning" on 0%, "Continue Learning" on >0%, "Review Course" on 100%) and true resume routing.
2. Completion checkmarks in the course curriculum accordion and lesson sidebar.
3. Breadcrumb correction and final lesson "Complete Course" CTA in the lesson footer navigation.
4. Dark mode styling for the bookmark button.
5. Progress and resume affordances on the Course Catalog (`/courses`) for authenticated users.
6. Search API immediate fallback on MCP timeout and functional search results sort dropdown.

## Skills Read & References
- `AGENTS.md` (sections 1, 2, 3, 5, 7, 8, 11, 12, 13)
- `sanity-best-practices`
- `clerk`

## Code Inspected & Assumptions
- `web/components/course/course-hero.tsx` & `web/components/course/sticky-course-progress.tsx`: Currently hardcode "Continue Learning" regardless of course state.
- `web/app/courses/[slug]/page.tsx`: Currently points `continueLearningUrl` to `allLessons[0]`, bypassing the learner's actual progress and resume timestamps.
- `web/components/lesson/lesson-sidebar.tsx`: Evaluates module completion with `mIdx < activeModuleIndex` and lacks lesson completion checkmarks.
- `web/components/lesson/lesson-footer-nav.tsx`: Renders an empty space on the final lesson.
- `web/app/api/search/route.ts`: Caught `AbortError` and returned 503 waking_up in a loop instead of executing the Sanity GROQ keyword search fallback.
- `web/app/search/page.tsx`: Had an un-wired `<select>` element for sorting.

## Files to Touch
1. `web/components/course/course-hero.tsx` [MODIFY]
2. `web/components/course/sticky-course-progress.tsx` [MODIFY]
3. `web/app/courses/[slug]/page.tsx` [MODIFY]
4. `web/components/course/course-content-accordion.tsx` [MODIFY]
5. `web/app/lessons/[slug]/page.tsx` [MODIFY]
6. `web/components/lesson/lesson-sidebar.tsx` [MODIFY]
7. `web/components/lesson/lesson-footer-nav.tsx` [MODIFY]
8. `web/components/course/bookmark-button.tsx` [MODIFY]
9. `web/app/courses/page.tsx` [MODIFY]
10. `web/components/courses/courses-catalog-view.tsx` [MODIFY]
11. `web/components/home/home-course-card.tsx` [MODIFY]
12. `web/app/api/search/route.ts` [MODIFY]
13. `web/app/search/page.tsx` [MODIFY]

## Requirements
- Respect `AGENTS.md` constraints: UI matches existing visual language, no client-side tokens, all mutations through server routes.
- Light and dark mode support for all modified components.
- Accurate state rendering across 0% (unstarted), in-progress, and 100% (completed).

## Security Considerations
- Authentication gating preserved via Clerk.
- Server-side data fetching for user progress with zero client token leaks.

## Acceptance Criteria
- Unstarted courses display "Start Learning" (or "Start Course").
- In-progress courses display "Continue Learning" and resume at the true saved lesson and timestamp.
- 100% completed courses display "Review Course".
- Breadcrumb "All Courses" links to `/courses`.
- Final lesson shows "Complete Course" CTA instead of empty space.
- Lessons that are completed display clear checkmark indicators in accordion and sidebar.
- Catalog displays progress bars / badges for started courses.
- Search fails over to GROQ results immediately without hanging on 503.

## Checks to Run
- `npm run type-check` in `web`
- `npm run lint` in `web`
- Live browser test across the updated pages.

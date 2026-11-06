# Implementation Prompt: Search Results UI Refinements & 404 Navigation Fix

## 1. Goal
1. **Search Results UI Improvements (`/ui-ux-pro-max`)**:
   - **Hover Color**: When hovering over a search result item, transition the title color to the platform's brand color (orange variant: `text-primary-500` / `#F97316`).
   - **Remove 'Back to home' Button**: Remove the redundant `← Back to home` button from the top breadcrumb bar while keeping the breadcrumb `Home > Search`.
   - **Center Align Search Results Header**: Horizontally center the `Search Results` title and center the search input bar.
   - **Compact Spacing & Remove Divider Lines**: Remove the upper dividing line (`border-b` on header) and lower dividing line (`border-b` on result count bar), reducing excessive padding/margins around `"Found X results for 'query'"` to minimize vertical space consumption.
   - **Card Micro-interactions**: Refine card borders (`hover:border-primary-300`, `hover:shadow-md`), badges, and affordances.
2. **Fix 404 Error on Result Card Click**:
   - **Root Cause Identified**: `LessonResultCard` was routing to `/courses/${lesson.slug}` instead of `/lessons/${lesson.slug}`. Because `lesson.slug` is a lesson identifier (e.g., `react-performance-engineering-code-splitting`), Next.js checked the courses collection, found no matching course, and triggered a 404 page.
   - **Fix**: Update `LessonResultCard` to link to `/lessons/${lesson.slug}` using `getLessonUrl(lesson.slug)`.
   - Update `VideoResultCard` to use query param `?start=${seconds}` matching `LessonPage`'s expected parameter.
3. **Automated Unit Tests**:
   - Run existing unit test suites for search flow, lesson URL resolution, and cache implementation (`npm test`).
   - Add test assertion in `search-flow.test.ts` verifying that lesson result card URLs always point to `/lessons/...` and never `/courses/...`.

---

## 2. Skills Consulted
- **AGENTS.md**: Section 2 (loop, prompt, confirmation panel), Section 3 (UI reproduction), Section 7 (provider embeds and timestamp navigation via `?start=`), Section 13 (checks).
- **ui-ux-pro-max**:
  - Color styling: Semantic brand orange tokens (`primary-500: #F97316`, `primary-50: #FFEEE5`, `primary-300: #FDBA74`).
  - Layout density: Removing unnecessary horizontal dividers to eliminate visual noise and reduce vertical whitespace above search result cards.
  - Interactive states: Smooth color and border transitions on hover (`transition-colors duration-200 group-hover:text-primary-500`).

---

## 3. Code Inspected
- `web/components/search/lesson-result-card.tsx`:
  - Line 18: `href={`/courses/${lesson.slug}`}` causing the 404 error on click.
  - Line 29: `group-hover:text-blue-600` instead of the application orange variant.
- `web/components/search/video-result-card.tsx`:
  - Line 26: Uses `?startSeconds=` instead of `?start=`.
  - Line 44: `group-hover:text-blue-600` instead of orange variant.
- `web/app/search/page.tsx`:
  - Lines 96-103: Contains the redundant `Back to home` button.
  - Lines 107-114: `h1` has `text-left` and is wrapped in `border-b border-neutral-100 pb-8 mb-8`.
  - Line 131: Result count wrapper has `border-b border-neutral-100 pb-4` creating extra horizontal lines and spacing.

---

## 4. Decisions and Assumptions
1. **Centering the Header**:
   - Center align `Search Results` heading (`text-center font-display text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 mb-5`).
   - Search input centered with `max-w-3xl mx-auto w-full`.
2. **Compact Result Count Area**:
   - Remove the `border-b` on the search input header container.
   - Remove the `border-b` on the result count bar.
   - Reduce vertical margins to `mt-4 mb-3` so results sit immediately beneath the search query.
3. **Card Theming & Orange Highlight**:
   - In `LessonResultCard` and `VideoResultCard`, replace `group-hover:text-blue-600` with `group-hover:text-primary-500 transition-colors duration-150`.
   - Update border hover to `hover:border-primary-300 hover:shadow-md`.
   - Replace lesson card badge with brand primary variant (`bg-primary-50 text-primary-600`).
4. **Lesson Link Navigation Fix**:
   - Route `LessonResultCard` directly to `/lessons/${lesson.slug}`.
   - Route `VideoResultCard` to `/lessons/${videoMoment.lessonSlug}?start=${videoMoment.startSeconds}`.
   - Clicking any search result card directly opens the lesson player and curriculum sidebar.

---

## 5. Files Expected to Touch
- `web/app/search/page.tsx` (Modify): Remove "Back to home" button, center search header, remove upper/lower border lines and reduce margins.
- `web/components/search/lesson-result-card.tsx` (Modify): Fix link destination to `/lessons/${lesson.slug}`, apply orange hover highlight, refine badges.
- `web/components/search/video-result-card.tsx` (Modify): Fix timestamp param to `?start=`, apply orange hover highlight.
- `web/test/search-flow.test.ts` (Modify): Add assertion verifying lesson result URLs route to `/lessons/...`.

---

## 6. Requirements & Acceptance Criteria
- [ ] On search results page, hovering a result card changes its title to the orange brand color (`#F97316`).
- [ ] The "Back to home" link is removed from the top navigation; breadcrumb `Home > Search` remains.
- [ ] `Search Results` heading and search input are centered horizontally.
- [ ] No divider lines appear above or below the result count text, and vertical whitespace is significantly reduced.
- [ ] Clicking any search result card routes to the lesson page (`/lessons/[slug]`) without 404 errors.
- [ ] Unit tests for search flow and caching pass with 0 errors.
- [ ] Production build (`npm run build`) passes cleanly.

---

## 7. Security Considerations
- All links remain client-side Next.js route transitions; no security or token implications.

---

## 8. Checks to Run
- `npm test` in `web/` covering all test suites.
- `npm run build` in `web/` to confirm zero build/type errors.
- Visual browser verification: test search, card hover color, click card to verify lesson page loads (no 404), check centered header and compact spacing.

---

## 9. Manual Test Steps
1. Navigate to `http://localhost:3000/search?q=react`.
2. Verify `Search Results` title and search bar are centered.
3. Verify top breadcrumb has no "Back to home" button.
4. Verify there are no horizontal lines directly above or below "Found X results for 'react'" and spacing is compact.
5. Hover over a result card and confirm the title turns orange (`#F97316`).
6. Click on the first result (`Code splitting that pays off`) and confirm it loads `http://localhost:3000/lessons/react-performance-engineering-code-splitting` with video player (NOT a 404).

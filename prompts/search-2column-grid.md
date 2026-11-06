# Implementation Prompt: Search Result Page 2-Column Desktop Grid & Consistent Card Design

## 1. Goal
Update the Search Results page UI to display search result cards in a **2-column grid on desktop** (`grid-cols-1 lg:grid-cols-2 gap-6`) and unify the visual design of `VideoResultCard` and `LessonResultCard` so they have **consistent card background colors, preview canvas background colors, uniform card heights/max-heights, and aligned footers**.

## 2. Code Inspected & Current Inconsistencies
- `web/app/search/page.tsx`:
  - Currently renders a single-column stack: `<div className="flex flex-col gap-4">`.
  - Loading skeleton also uses a single-column stack.
- `web/components/search/video-result-card.tsx`:
  - Uses `bg-neutral-900 dark:bg-black` for the left preview box.
  - Left preview width recently set to `sm:w-[330px] lg:w-[350px]`, which is too wide for a 2-column grid where column width is ~550–650px.
- `web/components/search/lesson-result-card.tsx`:
  - Uses `bg-neutral-50/70 dark:bg-neutral-950/60` for the left box, causing a jarring visual mismatch with the dark video cards in the same grid.
  - Has variable height due to extra key points pills and unconstrained description lengths, causing cards in adjacent grid columns to have ragged, uneven heights.
- `web/components/search/search-result-logo.tsx`:
  - Logo sizing and default container background need to scale cleanly within the unified preview canvas.

## 3. Key Design Decisions & Changes
1. **2-Column Grid Layout on Desktop:**
   - In `web/app/search/page.tsx`, change the results container from `flex flex-col gap-4` to:
     `<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">`
   - Update the loading skeleton container to the same 2-column grid so layout shifts are eliminated during loading.
2. **Unified Preview Canvas (Consistent Background & Proportion):**
   - Standardize the left preview container in both `VideoResultCard` and `LessonResultCard`:
     - Background: `bg-[#0F172A] dark:bg-black` across both cards.
     - Width: `w-full sm:w-[210px] md:w-[220px] lg:w-[230px] shrink-0` with `overflow-hidden` so both the video thumbnail and the course logo have the identical dark, sleek presentation and leave ~60% width for content in 2-column mode.
3. **Consistent Card Height & Typography Clamping:**
   - Card container: `h-full flex flex-col sm:flex-row rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 shadow-xs hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md transition-all`.
   - Content area: `flex flex-col justify-between p-5 sm:p-5 w-full min-w-0`.
   - Standardize title and description typography:
     - Title: `text-heading-4 sm:text-heading-3 line-clamp-1 font-semibold text-neutral-900 dark:text-neutral-100`.
     - Description: `text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed`.
     - Lesson key points pills: if present, render up to 1 compact pill (`line-clamp-1`) or align nicely within the text column without expanding card height beyond its row sibling.
   - Pinned footer: `mt-4 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800 pt-3 text-xs`.
4. **Card Hover & Interaction Polish:**
   - Keep subtle hover transitions, active states, and PostHog tracking intact.

## 4. Files to Touch
- `web/app/search/page.tsx`: Update cards container and skeleton to `grid grid-cols-1 lg:grid-cols-2 gap-6`.
- `web/components/search/video-result-card.tsx`: Apply unified preview width, dark bg, consistent card height, and typography clamping.
- `web/components/search/lesson-result-card.tsx`: Match preview width and dark bg (`bg-[#0F172A]`), consistent card height, and typography clamping.
- `web/components/search/search-result-logo.tsx`: Ensure logos scale proportionately within the unified container.

## 5. Acceptance Criteria
- [ ] On desktop screens (viewport >= 1024px), search result cards render in a balanced 2-column grid.
- [ ] On mobile / tablet (< 1024px), cards stack gracefully in a single column.
- [ ] Both Video and Lesson cards share consistent background colors (dark preview container `bg-[#0F172A]`, white/neutral-900 card surface).
- [ ] Both cards maintain a consistent, aligned height in each grid row without layout overflow or ragged misalignment.
- [ ] All 138 unit tests pass (`npm test`).
- [ ] `npm run type-check` passes with zero errors.

## 6. Checks to Run
- `npm test`
- `npm run type-check`
- Live browser verification on `http://localhost:3000/search?q=Next` and `http://localhost:3000/search?q=Docker` capturing desktop and responsive layout screenshots.

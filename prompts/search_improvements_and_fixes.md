# Implementation Prompt: Search Skeletons, Result Card Preview, and Suggestion Click Fix

## 1. Goal
Improve the Vertex search experience with:
1. High-fidelity skeleton loading state for search results.
2. Result card preview layout matching the reference UI design (left-hand preview pane with key points/bullets, checkmark affordance, metadata badges, "Lesson Match" tag, and hover states).
3. Fixing typeahead suggestion click functionality so clicking suggestions in `SearchInput` and `SearchModal` immediately navigates to the selected query or course.

## 2. Skills and References
- `AGENTS.md` rules and specifications.
- Attached UI reference (`vertex-search.png` / user screenshot).
- `ui-ux-pro-max` design patterns and Tailwind CSS styling.

## 3. Code Inspected
- `web/app/search/page.tsx`: Search results layout, pagination, loading states.
- `web/components/search/search-input.tsx`: Typeahead suggestions dropdown and click event handling.
- `web/components/search/search-modal.tsx`: Modal search suggestions and navigation.
- `web/components/search/lesson-result-card.tsx`: Lesson match card layout and preview section.
- `web/components/search/video-result-card.tsx`: Video moment card layout with preview and timestamps.
- `web/app/api/search/route.ts`: Search API data fetching and fallback metadata.

## 4. Decisions and Assumptions
- **Skeleton Loading State**: Replace the generic spinner with a skeleton grid of 4 cards that mimics the 2-column layout of the result cards (left preview container + right content lines).
- **Result Card Preview**: In `LessonResultCard`, ensure the left pane displays 3 concise preview bullet points (using `lesson.keyPoints` or gracefully extracting key sentences if missing), with the bottom-right subtle circular checkmark, matching the screenshot. In the right pane, display the course icon badge, `LESSON` tag, clear heading, description, `Lesson Match` label, and `View lesson ->` action.
- **Suggestion Click Fix**: Use `onMouseDown` with `e.preventDefault()` on typeahead suggestion items so that clicking a suggestion triggers navigation before the input blur event collapses the dropdown.

## 5. Files to Touch
- [MODIFY] `web/app/search/page.tsx`
- [MODIFY] `web/components/search/search-input.tsx`
- [MODIFY] `web/components/search/search-modal.tsx`
- [MODIFY] `web/components/search/lesson-result-card.tsx`
- [MODIFY] `web/components/search/video-result-card.tsx`

## 6. Security Considerations
- Client-side navigation uses `encodeURIComponent` for query parameters.
- No sensitive tokens exposed to the client.

## 7. Acceptance Criteria
1. Loading search results renders animated skeleton cards matching the loaded card geometry.
2. Search result cards display the left-side preview bullet points, checkmark icon, and metadata according to the reference UI.
3. Clicking any suggested keyword navigates to `/search?q=<keyword>` and closes the dropdown cleanly.
4. Clicking any suggested course navigates to `/courses/<slug>`.

## 8. Checks to Run
- TypeScript compilation check (`npm run build` or `npx tsc --noEmit` in `web`).
- Automated/browser subagent verification of suggestion click, loading skeleton, and result card layout.

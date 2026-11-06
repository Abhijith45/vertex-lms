# Implementation Prompt: Sticky Toolbar on Courses Catalog & Search Page Refinement

## Goal
1. **Review user's search page changes**: Ensure the result count & sort controls moved into the sticky header on `/search` are properly aligned with the search input (`max-w-4xl mx-auto`) and only display when results are ready.
2. **Sticky Toolbar on `/courses` page**: Update `CoursesCatalogView` so the search input, category filter pills, and results count stick directly beneath the Navbar (`sticky top-20 z-20`) with backdrop blur (`bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md`), allowing the course grid cards to scroll smoothly behind it.

---

## Skills & Reference Guidelines
- **`AGENTS.md`**: Section 3 (UI fidelity and responsiveness), Section 5/6 (App structure and Tailwind patterns), Section 13 (Run checks: type-check, lint, build, dev).
- **`ui-styling`**: Sticky header styling, negative margin full-bleed padding, dark/light mode parity.

---

## Inspected Code & Architecture Decisions
1. **Navbar positioning**:
   - `Navbar` is `sticky top-0 z-30 h-20` (80px).
2. **Courses Catalog Toolbar**:
   - In `web/components/courses/courses-catalog-view.tsx`, the search bar, category pills, and "Showing X courses" row currently sit in a static block above the grid.
   - We will wrap this toolbar in a sticky container:
     `sticky top-20 z-20 -mx-6 px-6 sm:-mx-12 sm:px-12 lg:-mx-16 lg:px-16 py-4 mb-8 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-b border-neutral-100/80 dark:border-neutral-800/80 transition-all`
   - Course cards in the grid (`z-0`) will scroll behind the toolbar seamlessly.
3. **Search page polish**:
   - In `web/app/search/page.tsx`, ensure the sticky container wraps both the search bar and the result count/sort row inside `max-w-4xl mx-auto` so they align flush.

---

## Files to Touch
1. **[web/components/courses/courses-catalog-view.tsx](file:///c:/Users/Abhijeet/Rawat/Desktop/nextJS/vertex/web/components/courses/courses-catalog-view.tsx)**:
   - Make the search input, category pills, and count row sticky under the Navbar at `top-20 z-20` with backdrop blur and border.
2. **[web/app/search/page.tsx](file:///c:/Users/Abhijeet/Rawat/Desktop/nextJS/vertex/web/app/search/page.tsx)**:
   - Align the result count and sort select inside the `max-w-4xl mx-auto` container within the sticky bar.

---

## Security Considerations
- Client-side presentational changes; no API keys, tokens, or auth headers affected.

---

## Acceptance Criteria
1. When scrolling down `/courses`, the search bar, category filter pills, and results count stick right below the Navbar at `top-20`.
2. Course cards scroll smoothly behind the sticky toolbar and behind the Navbar.
3. Category selection and search filtering continue to work instantaneously while sticky.
4. On `/search`, the sticky search box and result count/sort row are cleanly aligned in both light and dark mode.
5. `npm test` and `npm run type-check` pass with 0 errors.

---

## Verification Plan
### Automated Tests
- Run `npm test` in `web/`.
- Run `npm run type-check` in `web/`.

### Manual / Browser Verification
- Open `http://localhost:3000/courses` in browser.
- Scroll down: verify search input and category pills stick to `top-20` (flush with Navbar) and course cards scroll behind.
- Click category pills (e.g. "Data", "AI Engineering"): verify filter works while sticky.
- Open `http://localhost:3000/search?q=docker` and verify alignment and scroll behavior.

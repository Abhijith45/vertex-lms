# Implementation Prompt: Search Input Clear Button, Dropdown Auto-Collapse & Full Navigation Flow Tests

## 1. Goal
1. **Clear 'X' Button in Search Input (`/ui-ux-pro-max`)**:
   - Provide an accessible, smoothly styled 'X' button inside `SearchInput` whenever `query.length > 0` (or after keywords have been input/submitted).
   - Clicking 'X' immediately resets the query to empty, clears suggestion lists, collapses the dropdown, and returns focus to the input field.
2. **Auto-Collapse / Suppress Suggestions Dropdown on Results Page**:
   - When navigating to `/search?q=...` or when the page mounts with `initialQuery`, prevent the suggestion dropdown from automatically popping open.
   - The suggestion dropdown should only open when the user actively interacts with the input (focusing or typing).
   - Upon submitting a search or selecting an item, ensure the dropdown closes immediately and the input is blurred to prevent reopening.
3. **Comprehensive Search & Navigation Unit Tests (`web/test/search-flow.test.ts`)**:
   - Create automated unit tests using `node:test` and `node:assert/strict` testing the complete user journey:
     - Home page (`/`) search triggering
     - Search results page (`/search?q=...`) URL parsing, query formatting, pagination logic
     - Clear button state transitions & dropdown visibility state machine
     - Lesson navigation (`/lessons/[slug]?start=[seconds]`)
     - Return navigation to `/search?q=...` and back to Home (`/`)
   - Update `web/package.json` to include the test in `npm test` and run checks.
4. **Browser & UI Verification**:
   - Verify visual interactions in the browser using `browser_subagent`: home search -> result page (confirming dropdown is hidden and X button works) -> lesson page -> back to results -> back to home.

---

## 2. Skills Consulted
- **AGENTS.md**: Section 2 (working loop, implementation prompt creation, user confirmation panel), Section 3 (UI reproduction), Section 7 (grounded search, provider embeds, navigation boundaries), Section 13 (checks: type check, test runner, build).
- **ui-ux-pro-max**:
  - Accessible clear button with `aria-label="Clear search"`, appropriate touch targets, subtle hover/focus rings (`hover:bg-neutral-100`, `text-neutral-400 hover:text-neutral-700`).
  - Text-input padding considerations: preserve adequate right padding (`pr-20`) so text never clips underneath the `X` clear button or the `Search` / `Loader` icon.
  - Suggestion dropdown lifecycle: avoid intrusive layout shifts or unwanted auto-popups when landing on search result pages.
- **Next.js & React 19 Best Practices**: Controlled inputs, `useRef` for focus management, clean effect dependency hygiene.

---

## 3. Code Inspected
- `web/components/search/search-input.tsx`:
  - Currently initializes `query` with `initialQuery`.
  - The debounced suggestion fetch runs on initial mount when `query.length >= 2`, which unconditionally triggers `setIsOpen(nextKeywords.length > 0 || nextCourses.length > 0)`.
  - Lacks an `X` clear button (unlike `search-modal.tsx`).
  - Input padding is `pr-12`, which only accounts for the submit button.
- `web/app/search/page.tsx`:
  - Renders `<SearchInput initialQuery={query} />`.
  - Has breadcrumb navigation (`Home > Search`) and "Back to home" link.
- `web/package.json`:
  - Test runner script: `"test": "node --test test/lesson-utils.test.ts test/video-controls.test.ts"`.
- `web/test/`:
  - `lesson-utils.test.ts` & `video-controls.test.ts` demonstrate pure unit testing with `node:test` and `node:assert/strict`.

---

## 4. Decisions and Assumptions
1. **Dropdown Suppression on Page Landing**:
   - Track `isFocused` state on `<input>` (`onFocus={() => setIsFocused(true)}`, `onBlur`).
   - In `useEffect` for fetching suggestions: only set `setIsOpen(true)` if `isFocused` is `true` AND `query.trim().length >= 2`.
   - On initial mount or when `initialQuery` changes, `isFocused` is `false`, ensuring the dropdown remains collapsed.
   - When submitting (`handleSubmit`, `handleSelectKeyword`, `handleSelectCourse`), immediately set `setIsOpen(false)` and blur `inputRef.current?.blur()`.
2. **Clear 'X' Button**:
   - Render a clear button when `query.length > 0`.
   - Position it inside the input container to the left of the search submit button:
     ```tsx
     {query && (
       <button
         type="button"
         onClick={handleClear}
         aria-label="Clear search query"
         className="absolute right-10 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
       >
         <X className="h-4 w-4" />
       </button>
     )}
     ```
   - Update input styling to `pr-20` so long query strings don't slide under the clear or submit icons.
   - In `handleClear`: reset `query` to `""`, reset `selectedIndex` to `-1`, clear `keywords` and `courses`, set `isOpen = false`, and call `inputRef.current?.focus()`.
3. **Unit Tests (`web/test/search-flow.test.ts`)**:
   - Create a robust utility module or state machine test covering:
     - Query normalization & URL generation (`formatSearchUrl`, `parseSearchQuery`).
     - Clear button behavior (clearing query string, resetting pagination, resetting suggestion cache).
     - Dropdown visibility logic (determining whether dropdown should open based on focus, query length, and submit events).
     - Full navigation journey state resolver:
       - Home (`/`) -> submits search query -> redirects to `/search?q={query}`
       - Search results (`/search?q={query}`) -> clicks lesson result -> navigates to `/lessons/{slug}?start={startSeconds}`
       - Lesson page -> clicks breadcrumb / back -> returns to `/search?q={query}`
       - Search results -> clicks "Home" breadcrumb -> returns to `/`
     - Pagination math & bounds checking (first page, last page, clamped page indices, 6 items per page).

---

## 5. Files Expected to Touch
- `web/components/search/search-input.tsx` (Modify):
  - Add `X` clear button when `query.length > 0`.
  - Add focus tracking & suppress dropdown when not focused or upon initial mount / page load.
  - Adjust padding to `pr-20`.
- `web/lib/utils/search.ts` (New):
  - Pure helper functions for search URL formatting, query normalization, pagination slicing, and navigation path resolution (enabling thorough unit testing and clean code reuse).
- `web/test/search-flow.test.ts` (New):
  - Unit tests for search input, clear button action, dropdown state transitions, navigation flows, and pagination.
- `web/package.json` (Modify):
  - Add `test/search-flow.test.ts` to `npm test` script.

---

## 6. Requirements & Acceptance Criteria
- [ ] An `X` clear button appears in `SearchInput` whenever `query.length > 0`.
- [ ] Clicking the `X` button clears the query, clears suggestions, closes the dropdown, and refocuses the input.
- [ ] When landing on `/search?q=...`, the suggestion dropdown remains collapsed/hidden until the user explicitly focuses or types.
- [ ] When searching or navigating, the dropdown closes immediately.
- [ ] Unit test suite in `web/test/search-flow.test.ts` covers the full user journey from Home -> Search -> Lesson -> Search -> Home.
- [ ] `npm test` passes all tests cleanly with zero failures.
- [ ] `npm run build` succeeds with zero TypeScript or bundling errors.
- [ ] Browser verification confirms the visual and interaction improvements.

---

## 7. Security Considerations
- Pure client-side UI and utility helpers; no token exposure or backend security impact.
- Query sanitization ensures URI encoding before push to URL.

---

## 8. Checks to Run
- `npm test` in `web/` (must pass all test files: `lesson-utils.test.ts`, `video-controls.test.ts`, `search-flow.test.ts`).
- `npm run build` in `web/` to confirm zero type or build errors.
- Visual browser session using `browser_subagent` checking Home -> Search -> Lesson -> Search -> Home.

---

## 9. Manual Test Steps
1. Navigate to `http://localhost:3000/`.
2. Click the Hero search input, type `"react"`, and press Enter.
3. Observe landing on `http://localhost:3000/search?q=react`:
   - Verify the suggestion dropdown is **NOT** open.
   - Verify the `X` clear button is visible in the search input field.
4. Click the `X` clear button:
   - Verify the input is cleared.
   - Verify focus remains on or returns to the input.
5. Type `"next"`:
   - Verify suggestions dropdown appears with keywords and courses.
6. Click a course/lesson or press Enter to navigate.
7. Click a lesson result card to navigate to `/lessons/...`.
8. Click "Search" in breadcrumbs or browser back to return to `/search?q=...`.
9. Click "Home" in breadcrumb to return to `/`.

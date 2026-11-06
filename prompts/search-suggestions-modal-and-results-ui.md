# Implementation Prompt: Search Suggestions, Hero Search Modal & Results Page Consistency

## 1. Goal
1. **Grounded Typeahead Suggestions**: Enhance `/api/search/suggestions` to return only suggestions with verified content in Sanity, structured into **Keywords** first and **Courses** second.
2. **Home Page Search Modal**: Remove search input from navbar on the Home page, and open a rich search modal with trending/default keywords upon clicking or focusing the Hero search input field.
3. **Consistent Search Results Page**: Bring the Search Results page into exact UI consistency with the application layout (1440px canvas, `#FAF9F6` background, `Navbar`, `BottomGraphic` footer, and `Home > Search` breadcrumbs linking back to the Home page).

---

## 2. Skills Consulted
- **AGENTS.md**: Section 2 (loop, implementation prompts, confirmation panel), Section 3 (UI reproduction & responsive adaptations), Section 5 & 6 (client/server boundaries, Next.js App Router, Sanity server client with private read token), Section 7 & 8 (grounded search, course and lesson relationships).
- **sanity-best-practices**: GROQ queries for suggestions filtering only non-empty database records, projecting course slugs and lesson metadata.
- **ui-ux-pro-max**: Modal focus trapping, keyboard navigation (`ArrowUp`, `ArrowDown`, `Enter`, `Escape`), subtle micro-interactions, responsive search cards.

---

## 3. Code Inspected
- `web/components/layout/navbar.tsx`: Currently shows search input unconditionally on desktop (`<div className="hidden flex-1 px-8 md:flex lg:px-12"><SearchInput /></div>`).
- `web/components/home/hero-search.tsx`: Hero search bar on the home page with `⌘K` keyboard shortcut.
- `web/app/page.tsx`: Home page using `<Navbar activePath="/" />` and `<HeroSearch />`.
- `web/app/courses/page.tsx`: Reference catalog page showing exact container styling (`bg-[#FAF9F6]`, `max-w-[1440px] bg-white shadow-xs`, `Navbar`, `BottomGraphic`, and breadcrumbs).
- `web/app/search/page.tsx`: Current search results page lacking `Navbar`, `BottomGraphic`, breadcrumb to home, and application canvas wrapper.
- `web/app/api/search/suggestions/route.ts`: Current suggestions endpoint needing two-tier grouped response (`keywords` and `courses`) filtered strictly to available database items.

---

## 4. Decisions and Assumptions
- **Grounded Suggestions API (`/api/search/suggestions`)**:
  - Will query Sanity and verify matches:
    - **Keywords**: Matching lesson titles, category titles, and video chapter labels where lessons or courses exist.
    - **Courses**: Matching course titles with `title`, `slug`, and `category`.
  - Structured response:
    ```json
    {
      "keywords": ["React Server Components", "Docker containers"],
      "courses": [
        { "title": "Next.js App Router in Depth", "slug": "nextjs-app-router-in-depth", "category": "Web Development" }
      ]
    }
    ```
  - Also provide trending/default suggestions when query is empty: `["Next.js", "Docker", "TypeScript", "Server Components", "System Design", "AI Engineering", "PostgreSQL"]`.
- **Navbar on Home Page**:
  - Add `showSearch?: boolean` prop to `<Navbar />` (defaults to `true`).
  - Pass `showSearch={false}` on `web/app/page.tsx`.
  - On `/courses`, `/search`, and `/lessons/[slug]`, `showSearch` remains `true`.
- **Search Modal on Home Page (`web/components/search/search-modal.tsx`)**:
  - Triggered on click or focus of the Hero input in `HeroSearch`, or pressing `⌘K` / `Ctrl+K`.
  - Modal overlay with backdrop blur, centered container.
  - Search input with auto-focus.
  - Initial/Empty state: Displays "Trending Searches" badges.
  - Active search state: Displays "Suggested Keywords" followed by "Matching Courses".
  - Clicking a keyword executes search; clicking a course directly navigates to `/courses/[slug]`.
- **Search Results Page UI (`web/app/search/page.tsx`)**:
  - Wrap in `min-h-screen w-full bg-[#FAF9F6]` outer canvas and `mx-auto min-h-screen max-w-[1440px] bg-white shadow-xs flex flex-col justify-between`.
  - Header: `<Navbar activePath="/search" />`.
  - Breadcrumb: `Home > Search` with clickable `Home` link navigating back to `/`.
  - Search Header: Headline, search bar, and result counter.
  - Full-width simplified meta result cards (title and short description).
  - 6-item pagination controls.
  - Footer: `<BottomGraphic />`.

---

## 5. Files Expected to Touch
- `web/components/layout/navbar.tsx` (Modify): Add `showSearch?: boolean` prop (default `true`).
- `web/app/page.tsx` (Modify): Pass `showSearch={false}` to `<Navbar />`.
- `web/app/api/search/suggestions/route.ts` (Modify): Return verified `keywords`, `courses`, and default/trending suggestions.
- `web/components/search/search-modal.tsx` (New): Modal dialog with auto-focus input, trending searches, and two-section suggestions list.
- `web/components/home/hero-search.tsx` (Modify): Connect to `SearchModal` on click or focus.
- `web/components/search/search-input.tsx` (Modify): Support two-tier suggestion list (`keywords` and `courses`) with keyboard navigation.
- `web/app/search/page.tsx` (Modify): Add `Navbar`, `BottomGraphic`, breadcrumb with Home link, and 1440px white canvas.

---

## 6. Requirements & Acceptance Criteria
- [ ] On the Home page, the search input is removed from the navbar.
- [ ] On the Home page, clicking or focusing the Hero search input opens the Search Modal.
- [ ] The Search Modal shows trending/default search topics when input is empty.
- [ ] Typing in the Search Modal or search inputs displays verified suggestions separated into Keywords and Courses.
- [ ] All suggestions are grounded in real Sanity database content.
- [ ] Search Results page (`/search`) includes the app `Navbar`, `BottomGraphic` footer, and `Home > Search` breadcrumb linking back to `/`.
- [ ] Search Results page retains full-width meta cards, total result count, and 6-item pagination.
- [ ] TypeScript check and build (`npm run build`) pass cleanly with 0 errors.

---

## 7. Security Considerations
- Sanity read token remains strictly server-side.
- Rate limiting on `/api/search` and `/api/search/suggestions` continues to protect against query flooding.

---

## 8. Checks to Run
- `npm run build` in `web/` to verify TypeScript types and page bundling.
- Visual browser verification across home page modal, suggestions dropdown, and search results page.

---

## 9. Manual Test Steps
1. Navigate to `http://localhost:3000/`.
2. Verify navbar has NO search input on the Home page.
3. Click the Hero search input or press `⌘K` / `Ctrl+K`. Verify the Search Modal opens with trending search tags.
4. Type `"Next"` in the modal. Verify suggestions display "Keywords" (e.g. lessons/topics) followed by "Courses" (e.g. Next.js App Router in Depth).
5. Press Enter or click a suggestion to navigate to `/search?q=Next`.
6. Verify the `/search` page has the standard app `Navbar`, a breadcrumb with a clickable `Home` link, full-width meta cards, 6-item pagination, and `<BottomGraphic />` footer.
7. Click `Home` in the breadcrumb to verify smooth navigation back to the Home page.

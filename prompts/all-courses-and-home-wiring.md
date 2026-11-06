# Implementation Prompt: All Courses Page & Home Page Sanity Wiring

## 1. Goal
1. Build the All Courses page (`/courses`) strictly matching the Vertex design system and aesthetics established in `vertex-home.png` and `vertex-course.png`.
2. Wire the Home page (`/`) course cards with live seeded Sanity content instead of hardcoded mock data.

## 2. Skills Consulted
- **AGENTS.md**: Section 2 (loop, prompts, interactive confirmation), Section 3 (UI reproduction standards, responsiveness down to mobile), Section 5 & 6 (server-side data fetching with token, Next.js App Router, Clerk auth), Section 7 & 8 (grounded content model, course-to-module-to-lesson relationships).
- **sanity-best-practices**: GROQ queries using `defineQuery`, `serverClient` with private read token, resolving category references, computing modules and lesson durations.

## 3. Code Inspected
- `web/app/page.tsx`: Currently has 3 hardcoded `HomeCourseCard` instances.
- `web/components/home/home-course-card.tsx`: Card component with icon, title, description, level, duration, and modules count.
- `web/components/home/course-icons.tsx`: Next.js, Docker, and TypeScript SVG icons.
- `web/sanity/lib/queries.ts`: `getCoursesQuery` which fetches courses from Sanity.
- `web/sanity/lib/client.ts`: `serverClient` initialized with `SANITY_API_READ_TOKEN`.
- `studio/scripts/seed/seed.ndjson`: 10 courses with categories ("Web Development", "AI Engineering", "Backend & Infrastructure", "Data", "Languages", "Security").

## 4. Decisions and Assumptions
- **Home Page (`web/app/page.tsx`) Wiring**:
  - Convert `web/app/page.tsx` into an async Server Component fetching courses via `serverClient.fetch(getCoursesQuery)`.
  - Display the top 3 featured/popular courses (or all seeded courses if specified) with live data from Sanity:
    - Title, summary, level, dynamically calculated total duration, and module count.
    - Icons dynamically resolved by course category / technology (Next.js, Docker, TypeScript, React, Python, Postgres, AI, Security).
    - Links point to `/courses/${course.slug}`.
- **All Courses Page (`web/app/courses/page.tsx`) Architecture & Design**:
  - Layout: Centered `max-w-[1440px]` canvas with `#FAF9F6` outer background and crisp white container (`bg-white shadow-xs`).
  - Top Navigation: Reusable `<Navbar activePath="/courses" />` with Clerk auth buttons and user button.
  - Page Hero & Header:
    - Breadcrumb: `Home > Courses`
    - Headline: "All Courses" in `font-display` (`Playfair Display`), elegant, bold.
    - Subtitle: "Explore in-depth engineering courses covering modern frontend, AI systems, backend architecture, and security."
    - Category Filter Tabs: Interactive filter pills ("All", "Web Development", "AI Engineering", "Backend & Infrastructure", "Data", "Languages", "Security") with item count badge.
    - Instant search input to filter courses by keyword or title.
  - Course Grid:
    - 3-column responsive grid on desktop (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8`).
    - Course cards featuring:
      - Category badge and "POPULAR" pill when `course.popular === true`.
      - Rich branded icons for every topic (Next.js, React, TypeScript, Python, Docker/Kubernetes, PostgreSQL, AI/LLMs, RAG, System Design, Security).
      - Title (`font-display font-bold text-xl text-neutral-900 group-hover:text-primary-500`).
      - Summary description (`text-neutral-500 text-sm line-clamp-3`).
      - Metadata row: Level (`Intermediate`, `Beginner`, `Advanced`), Duration (`Xh Ym`), Module count.
      - Clickable link navigating to `/courses/[slug]`.
  - Empty state when search or filter matches 0 courses with a quick "Reset filters" button.
  - Bottom aesthetic: Ambient skyline bar graphic (`<BottomGraphic />`) matching the rest of the application.

## 5. Files Expected to Touch
- `web/sanity/lib/queries.ts` (Modify): Update `getCoursesQuery` to project category titles, module counts, and lesson durations; add `getCategoriesQuery`.
- `web/components/home/course-icons.tsx` (Modify): Add technology icons for React, Python, AI/LLMs, PostgreSQL, System Design, and Security; add a universal `CourseIcon` component that picks the right icon based on course slug or category.
- `web/app/page.tsx` (Modify): Wire "All Courses" section with live Sanity data using `serverClient`.
- `web/app/courses/page.tsx` (New): Server Component for the All Courses catalog page.
- `web/components/courses/courses-catalog-view.tsx` (New): Client Component managing search query, category selection, and dynamic course card rendering.

## 6. Requirements & Acceptance Criteria
- [ ] Home page displays 3 real courses fetched from Sanity (`Next.js App Router in Depth`, `DevOps with Docker and Kubernetes`, `TypeScript for Application Developers`, etc.) with correct levels, durations, module counts, and links.
- [ ] All Courses page at `/courses` renders the full catalog of seeded Sanity courses.
- [ ] Category filter pills accurately filter courses by category ("All", "Web Development", "AI Engineering", etc.).
- [ ] Keyword search input filters courses in real time.
- [ ] Each course card links directly to `/courses/[slug]`.
- [ ] Visual consistency: Exact match with Vertex design system typography (`Playfair Display`, `Inter`), spacing, warm background `#FAF9F6`, container `max-w-[1440px]`, and bottom skyline graphic.
- [ ] Zero TypeScript errors (`npx tsc --noEmit`), passes build cleanly.

## 7. Security Considerations
- Data fetching performed server-side with private read token (`SANITY_API_READ_TOKEN`).
- No private tokens or secret keys exposed to the client bundle.

## 8. Checks to Run
- TypeScript check in `web`: `npx tsc --noEmit`
- Next.js build verification: `npm run build`
- Visual browser verification: Check `/` and `/courses` in browser.

## 9. Manual Test Steps
1. Navigate to `http://localhost:3000/`.
2. Verify the 3 course cards are rendered from live Sanity data with valid links.
3. Click "View all courses →" or the "Courses" nav link in the header to go to `/courses`.
4. Verify all 10 seeded courses are displayed in a clean 3-column responsive grid.
5. Click on category filter pills (e.g. "AI Engineering", "Web Development") and verify that course cards filter instantly.
6. Type in the search box (e.g. "Docker" or "Python") and verify filtered results.
7. Click any course card and confirm it navigates to its `/courses/[slug]` detail page.

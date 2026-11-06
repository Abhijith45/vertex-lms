# Implementation Prompt: Vertex Course Detail Page

## 1. Goal
Implement the production-grade Vertex Course Detail Page (`/courses/[slug]`) strictly matching the desktop design reference at [design/vertex-course.png](file:///c:/Users/Abhijeet Rawat/Desktop/nextJS/vertex/design/vertex-course.png) wired with seeded Sanity content, while ensuring full responsiveness down to mobile viewports in accordance with `AGENTS.md` and project UI guidelines.

## 2. Skills Consulted
- **AGENTS.md**:
  - Section 2 (loop: inspect code, write implementation prompt in `prompts/`, obtain approval via interactive question, implement strictly to prompt, run checks).
  - Section 3 (UI work: exact reproduction of layout, spacing, typography, colors, responsive down to mobile, no restyling).
  - Section 5 & 6 (architecture: Next.js App Router, server-side data fetching using private read token, client components only where interactivity is required, Clerk auth).
  - Section 7 & 8 (grounded Sanity data model: courses, modules, lessons, learning outcomes, progress affordances).
- **sanity-best-practices**: Server-side data fetching with `defineQuery`, `serverClient`, resolving references, formatting Portable Text or raw data fields cleanly.

## 3. Code Inspected
- `design/vertex-course.png`: Desktop visual source of truth (header, breadcrumb, course hero with metallic Next.js cover / logo, metadata badges, "What you'll learn" 2x2 grid, "Course Content" module list with duration & accordion chevrons, "Show all modules" expander, and sticky bottom progress bar).
- `studio/scripts/seed/seed.ndjson`: Contains 10 real seeded courses (including `nextjs-app-router-in-depth`), with modules, lessons, durations, learning outcomes, and instructors.
- `web/sanity/lib/client.ts`: Configures `serverClient` using `process.env.SANITY_API_READ_TOKEN`.
- `web/sanity/lib/queries.ts`: Contains `getCourseBySlugQuery`.
- `web/components/home/`: Contains Vertex logo, icons, header elements, course icons.
- `web/app/page.tsx`: References `/courses/nextjs-for-production`.
- `web/.env.local`: Needs `SANITY_API_READ_TOKEN` populated from `studio/.env.local` to enable server-side reads on the private dataset.

## 4. Decisions and Assumptions
- **Route & Slug Handling**:
  - Route: `web/app/courses/[slug]/page.tsx`
  - When `$slug` is `nextjs-for-production` (the slug used in the design mock and home page card), it will alias/resolve to `nextjs-app-router-in-depth` in Sanity, ensuring both URLs load the complete Next.js course seamlessly.
  - Returns `notFound()` if a course does not exist in Sanity.
- **Data Fetching & Computation**:
  - Fetched server-side via `serverClient.fetch(getCourseBySlugQuery, { slug })`.
  - Total duration dynamically calculated from summing the durations of all lessons across modules (formatted as `Xh Ym`).
  - Total modules count derived from `course.modules.length`.
  - Dynamic fallback: if a course is `nextjs-app-router-in-depth` or has fewer than 6 modules, modules are rendered cleanly with their lesson counts and durations. In case of 4 modules, "Course Content" displays all modules with interactive collapsible/expandable lesson accordions.
- **Design & Visual Hierarchy (Source of Truth: `vertex-course.png`)**:
  - Canvas: Centered `max-w-[1440px]` with subtle diagonal striped texture and clean white card background.
  - Header: Shared top navigation with Vertex logo mark + "Vertex", "Courses", "My Learning", notifications Bell, and Clerk user auth controls.
  - Breadcrumbs: `All Courses` (linking to `/`) > `[Course Title]` with subtle chevron divider.
  - Hero Section:
    - Left: Square card with Next.js metallic "N" logo / Sanity cover image with rounded corners (`rounded-2xl`).
    - Right:
      - "POPULAR" pill badge if `course.popular` is true.
      - Course Title: `font-display` (`Playfair Display`), bold, tracking-tight.
      - Summary: `text-neutral-600` leading-relaxed.
      - Metadata row: Level (`Intermediate`), Duration (e.g. `18h 24m`), Modules (e.g. `12 modules` or module count), and Students (e.g. `2.1k students`).
      - Action buttons: "Continue Learning →" terracotta/orange button (`bg-[#EA580C] hover:bg-[#C2410C]`) and "Bookmark" outline button.
  - "What you'll learn" Section:
    - Enclosed container with rounded corners and subtle border.
    - Title: "What you'll learn" in serif font.
    - 2x2 grid with outcome items: custom outline icons (Layers, Database/Workflow, Gauge, Cloud/Rocket) matching Sanity's `icon` field, outcome title, and description.
  - "Course Content" Section:
    - Header with "Course Content" on left, total modules and duration on right.
    - Interactive accordion rows with numbered circle badge (`1`, `2`, `3`, ...), module title, module summary, duration, and chevron down icon.
    - Clicking a module row expands it to reveal its lessons (with lesson title, duration, free preview badge, and link).
    - Expand/collapse toggle ("Show all modules" / "Show less") if more than 6 modules.
  - Bottom Sticky Progress Bar:
    - Floating/fixed bar at bottom of viewport: "Your Progress", "35% complete" (or actual learner progress), orange progress bar, and "Continue Learning →" button.
- **Client/Server Split**:
  - `web/app/courses/[slug]/page.tsx` is an async React Server Component.
  - Interactive elements (accordion expand/collapse, bookmark toggle, sticky bar) encapsulated in client components: `web/components/course/course-modules-accordion.tsx`, `web/components/course/sticky-progress-bar.tsx`.

## 5. Files Expected to Touch
- `web/.env.local` (Modify): Add `SANITY_API_READ_TOKEN` for server-side Sanity access.
- `web/sanity/lib/queries.ts` (Modify/Verify): Ensure `getCourseBySlugQuery` fetches all necessary fields (including cover image, learning outcomes, module summaries, and lesson details).
- `web/app/courses/[slug]/page.tsx` (New): Course detail page server component.
- `web/components/course/course-hero.tsx` (New): Course hero component with metadata, cover image, and CTA buttons.
- `web/components/course/what-youll-learn.tsx` (New): "What you'll learn" 2x2 grid with corresponding icons.
- `web/components/course/course-content-accordion.tsx` (New): Interactive module accordion list with expandable lesson items.
- `web/components/course/sticky-course-progress.tsx` (New): Sticky bottom progress bar.
- `web/components/course/course-header.tsx` (New/Reuse): Vertex navigation header.

## 6. Requirements & Acceptance Criteria
- [ ] Navigating to `/courses/nextjs-app-router-in-depth` or `/courses/nextjs-for-production` renders the full course page with data fetched directly from Sanity.
- [ ] Layout, typography, colors, badges, spacing, and micro-interactions match `vertex-course.png` with pixel accuracy on desktop.
- [ ] Responsive adaptation: smoothly stacks on tablet and mobile with touch targets >= 44px.
- [ ] Cover image renders the stylized metallic Next.js card / image cleanly.
- [ ] Metadata displays level, total formatted duration, modules count, and student count.
- [ ] "What you'll learn" renders the 4 learning outcomes from Sanity in a 2x2 responsive grid with matching icons.
- [ ] "Course Content" displays modules with numbers, titles, summaries, durations, and interactive accordions that expand to reveal lessons.
- [ ] Sticky bottom progress bar renders progress percentage, visual bar, and "Continue Learning →" action button.
- [ ] Clerk authentication state integrates seamlessly in the header.
- [ ] Zero TypeScript errors (`npx tsc --noEmit`), clean build (`npm run build`).

## 7. Security Considerations
- Sanity API token remains strictly server-side (`SANITY_API_READ_TOKEN` in `.env.local` without `NEXT_PUBLIC_` prefix).
- Clerk publishable key only on the client; secret key on the server.
- All user input sanitized via standard Next.js parameters.

## 8. Checks to Run
- TypeScript check in `web`: `npx tsc --noEmit`
- Next.js build in `web`: `npm run build`
- Dev server verification & visual check using browser screenshot.

## 9. Manual Test Steps
1. Start dev server in `web/` (`npm run dev`).
2. Visit `http://localhost:3000/courses/nextjs-for-production` and `http://localhost:3000/courses/nextjs-app-router-in-depth`.
3. Verify the breadcrumb reads `All Courses > [Course Title]`.
4. Verify hero renders title, popular badge, metadata (Intermediate, duration, module count, students), and CTA buttons.
5. Verify "What you'll learn" displays the 4 outcome cards with icons and descriptions.
6. Verify "Course Content" lists the modules, and clicking an accordion item smoothly toggles the lesson list.
7. Verify the bottom sticky progress bar is visible and stays anchored as the user scrolls.
8. Verify responsive behavior at 375px (mobile), 768px (tablet), and 1440px (desktop).

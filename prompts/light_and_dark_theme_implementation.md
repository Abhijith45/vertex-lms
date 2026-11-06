# Implementation Prompt: Light & Dark Theme System (ui-ux-pro-max & ui-styling)

## Goal
Implement a comprehensive, accessible, and persistent Light and Dark theme system for the Vertex web application using `/ui-ux-pro-max` and `/ui-styling` guidelines. The theme must support seamless switching between Light, Dark, and System preference, prevent any flash of unstyled theme (FOUC), and style every core surface, layout, card, navigation element, and interactive component across the entire app.

---

## Skills Consulted
- `ui-ux-pro-max` (`.agents/skills/ui-ux-pro-max/SKILL.md`):
  - Dark mode contrast requirements: Normal text contrast >= 4.5:1 on dark surfaces, non-text UI/borders >= 3:1.
  - Consistent surface readability: Cards and surfaces clearly separated from background with distinct elevation/borders.
  - Border and divider visibility in both themes (no disappearing borders).
  - Micro-interaction feedback: Tactile theme toggle with smooth rotation/scaling transition.
  - Safe-area and viewport consistency across mobile and desktop.
- `ui-styling` (`.agents/skills/ui-styling/SKILL.md`):
  - Utility-first dark mode via Tailwind CSS class strategy (`dark:` variant).
  - Theme provider architecture with CSS variables and token consistency.
  - Clean component layer styling with Radix/Lucide accessibility primitives.
- `AGENTS.md`:
  - Preserve server/client boundaries.
  - Run full test suite (`npm test`) and type check (`npx tsc --noEmit`).

---

## Code Inspected
- `web/app/globals.css`: Tailwind v4 `@import "tailwindcss"` and `@theme inline`. Needs `@custom-variant dark (&:where(.dark, .dark *));` to support class-based dark mode alongside dark body tokens.
- `web/app/layout.tsx`: Root HTML and Body. Needs `ThemeProvider`, hydration-safe `<script>` to prevent FOUC, and `suppressHydrationWarning`.
- `web/components/layout/navbar.tsx`: Header component rendered across all pages. Needs `ThemeToggle` integration and dark variants.
- `web/app/page.tsx`, `web/components/home/`: Home canvas, cards, search, divider.
- `web/app/courses/page.tsx`, `web/components/courses/courses-catalog-view.tsx`: Courses catalog, filters, search.
- `web/app/courses/[slug]/page.tsx`, `web/components/course/`: Hero, WhatYoullLearn, Accordion, StickyCourseProgress.
- `web/app/lessons/[slug]/page.tsx`, `web/components/lesson/`: Sidebar, Tabs, Overview, Key Points, ProTip, Resources, FooterNav.
- `web/app/search/page.tsx`, `web/components/search/`: SearchInput, LessonResultCard, VideoResultCard, Pagination.

---

## Decisions & Technical Approach
1. **Tailwind v4 Class-Based Dark Mode**:
   - Add `@custom-variant dark (&:where(.dark, .dark *));` to `web/app/globals.css`.
   - Update `body` styles to support dark background (`#090D16`) and light foreground (`#F8FAFC`).
2. **ThemeProvider & Context**:
   - Create `web/components/theme/theme-provider.tsx` managing `theme` (`"light" | "dark" | "system"`) and `resolvedTheme` (`"light" | "dark"`).
   - Persist user preference to `localStorage` under `"vertex-theme"`.
   - Add inline script to `web/app/layout.tsx` `<head>` that immediately applies `.dark` before page paint if saved theme is `"dark"` or system preference matches.
3. **ThemeToggle Component**:
   - Create `web/components/theme/theme-toggle.tsx` with Sun and Moon vector icons.
   - Smooth rotation/scale icon transition, accessible tooltip, touch target >= 44x44px, and focus rings.
   - Integrated into `Navbar`.
4. **Comprehensive Component Theming**:
   - **Navbar**: Dark background `dark:bg-neutral-900/95`, border `dark:border-neutral-800`, text `dark:text-neutral-100`, hover states.
   - **Canvas & Containers**: `bg-[#FAF9F6] dark:bg-[#090D16]`, canvas `bg-white dark:bg-[#0F172A] border-neutral-200/60 dark:border-neutral-800`.
   - **Cards**: `HomeCourseCard`, `LessonResultCard`, `VideoResultCard`, `CourseCatalogItem` with `dark:bg-neutral-900 dark:border-neutral-800 dark:hover:border-neutral-700`.
   - **Typography**: Text headings `dark:text-neutral-100`, body `dark:text-neutral-300`, captions `dark:text-neutral-400`.
   - **Course Detail & Accordions**: What You'll Learn cards, module accordions, sticky progress bar with dark theme variables.
   - **Lesson Page & Sidebar**: Sidebar sticky container, lessons list, tabs, notes, resources, pro-tip callouts, navigation footer.
   - **Search & Suggestions**: Search input, autocomplete dropdown, select filter, pagination controls.

---

## Files to Create & Modify
- **New Files**:
  - `web/components/theme/theme-provider.tsx`
  - `web/components/theme/theme-toggle.tsx`
  - `web/test/theme.test.ts`
- **Modified Files**:
  - `web/app/globals.css`
  - `web/app/layout.tsx`
  - `web/components/layout/navbar.tsx`
  - `web/app/page.tsx`
  - `web/components/home/home-course-card.tsx`
  - `web/components/home/hero-search.tsx`
  - `web/app/courses/page.tsx`
  - `web/components/courses/courses-catalog-view.tsx`
  - `web/app/courses/[slug]/page.tsx`
  - `web/components/course/course-hero.tsx`
  - `web/components/course/what-youll-learn.tsx`
  - `web/components/course/course-content-accordion.tsx`
  - `web/components/course/sticky-course-progress.tsx`
  - `web/app/lessons/[slug]/page.tsx`
  - `web/components/lesson/lesson-sidebar.tsx`
  - `web/components/lesson/lesson-content-tabs.tsx`
  - `web/components/lesson/lesson-footer-nav.tsx`
  - `web/app/search/page.tsx`
  - `web/components/search/search-input.tsx`
  - `web/components/search/lesson-result-card.tsx`
  - `web/components/search/video-result-card.tsx`
  - `web/package.json`

---

## Security & Performance Considerations
- Zero external network dependencies for theming; operates strictly via `localStorage` and CSS classes.
- Zero layout shift (CLS = 0) and zero FOUC using the synchronous inline head script.
- All Clerk auth and Sanity private token boundaries remain untouched and fully compliant.

---

## Acceptance Criteria
- [x] Theme toggle button in Navbar toggles between Light and Dark mode smoothly.
- [x] Preference persists across page refreshes and navigation via `localStorage`.
- [x] System color scheme preference is respected when no manual override is set.
- [x] All main pages (Home, Courses, Course detail, Lesson, Search) adapt completely to Light and Dark modes with WCAG >= 4.5:1 text contrast.
- [x] No flash of unstyled theme on initial load.
- [x] Unit tests for theme logic pass and TypeScript compiles cleanly with 0 errors.

---

## Checks to Run
- `npm test` in `web/`
- `npx tsc --noEmit` in `web/`
- Visual browser verification via subagent across Home, Courses, Course detail, Lesson, and Search in both Light and Dark modes.

---

## Manual Test Steps
1. Navigate to `http://localhost:3000/`.
2. Click the Sun/Moon theme toggle in the top navigation bar.
3. Verify the canvas, cards, navbar, and typography transition smoothly to Dark mode.
4. Navigate to Courses (`/courses`), Course detail (`/courses/nextjs-app-router-in-depth`), Lesson (`/lessons/nextjs-app-router-in-depth-file-system-routing`), and Search (`/search?q=nextjs`).
5. Verify each page renders dark background, dark card surfaces, and high-contrast legible text.
6. Refresh the page in Dark mode; verify there is no flash of light theme.
7. Click the theme toggle again to switch back to Light mode; verify all pages render clean light theme.

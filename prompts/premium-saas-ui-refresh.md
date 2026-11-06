# Implementation Prompt: Premium SaaS UI/UX Refresh & Polish

## 1. Goal
Elevate the entire Vertex user interface to a top-tier, modern SaaS aesthetic (inspired by leading SaaS products like Linear, Vercel, Supabase, and Stripe). Standardize typography hierarchy, micro-spacing (margins, padding, gap rhythm), card elevations, glassmorphism surface depths, interactive hover/focus states, and perform real-time browser testing with an objective UX/UI scorecard ranked out of 10.

## 2. Skills Consulted
- `ui-ux-pro-max`: SaaS design system patterns, 8px grid spacing rhythm, line-length readability (65-75ch), glassmorphism depth, touch targets, and contrast requirements.
- `ui-styling`: Tailwind CSS utility-first design tokens, consistent radius/shadow scales, dark mode refinement, and accessible focus states.
- `AGENTS.md`: Preservation of existing functional logic, Clerk auth boundaries, Sanity queries, and unit tests.

## 3. Current State & Baseline UI Score (Baseline: 7.2 / 10)
- **Strengths:** Clean information architecture, fast search, dark mode support, functional video embeds and progress tracking.
- **Opportunities for SaaS Polish:**
  1. *Spacing Discrepancies:* Inconsistent input heights (`h-[58px]` vs `py-3.5`), padding variations across cards (`p-7` vs `p-5`), and loose vertical gaps in hero sections.
  2. *Card Surfaces & Borders:* Flat border lines without subtle inner highlight/depth (`border-neutral-200` without subtle gradient or shadow layering).
  3. *Micro-typography:* Category tags, popular chips, and metadata badges have varied font weights and padding (`px-2.5 py-0.5` vs `px-4 py-1.5`).
  4. *Interaction Polish:* Cards and buttons lack subtle elevation lift (`-translate-y-0.5`) and refined focus rings.

## 4. Key UI Refinements Planned

### A. Global Design Tokens & Typography (`web/app/globals.css`)
- Refine font scaling, line heights, and letter spacing across display, headings, and body tokens.
- Add subtle modern SaaS box shadows (`--shadow-card`, `--shadow-card-hover`, `--shadow-glass`).
- Enhance dark mode surface tones (`#0B0F17` / `#111827`) for deeper contrast.

### B. Navbar & Navigation Header (`web/components/layout/navbar.tsx`)
- Sleek glassmorphism header (`bg-white/85 dark:bg-[#0F172A]/85 backdrop-blur-md`).
- Refined navigation active pill indicator and smooth hover transitions.
- Polished CTA button ("Get started") and user avatar alignment.

### C. Home Page & Hero Section (`web/app/page.tsx`, `web/components/home/hero-search.tsx`)
- Tighter, unified hero cluster with balanced vertical rhythm.
- Modern SaaS search bar with refined inner border, focus ring (`ring-primary-500/20`), and subtle `⌘K` keyboard badge.
- Polished "New courses added every week" social-proof divider.

### D. Course Cards & Catalog (`web/components/home/home-course-card.tsx`, `web/components/courses/courses-catalog-view.tsx`)
- Standardized card padding (`p-6`), sleek icon badges, crisp popular pill (`border-amber-200/80 bg-amber-50/70 text-amber-700`).
- Harmonized metadata footer (Level, Duration, Modules) with consistent icons and typography.
- Polished category filter pills on `/courses` with crisp border, active state, and smooth hover.

### E. Search Results Page (`web/app/search/page.tsx`, `web/components/search/*-result-card.tsx`)
- Harmonized 2-column card layout with crisp typography clamping (`line-clamp-1` title, `line-clamp-2` description).
- Aligned metadata tags, clean video duration chip, and unified dark preview canvas.

### F. Course Detail & Curriculum Accordion (`web/components/course/course-hero.tsx`, `course-content-accordion.tsx`)
- Sleek course overview header with clear metadata chips and prominent action buttons.
- Clean curriculum modules with refined accordion item states and lesson status badges.

## 5. Files to Touch
- `web/app/globals.css`: Typography, shadow tokens, and base elevation classes.
- `web/components/layout/navbar.tsx`: Header spacing, active links, and glassmorphism.
- `web/components/home/hero-search.tsx`: Input height, focus state, and kbd styling.
- `web/components/home/home-course-card.tsx`: Card padding, typography, hover lift, and footer metrics.
- `web/components/courses/courses-catalog-view.tsx`: Toolbar spacing, search bar, and filter pills.
- `web/components/search/video-result-card.tsx` & `lesson-result-card.tsx`: Card polish and spacing.
- `web/components/course/course-hero.tsx` & `course-content-accordion.tsx`: Course detail layout.

## 6. Acceptance Criteria
- [ ] Application presents a cohesive, high-end SaaS visual identity with consistent spacing, typography, and depth.
- [ ] All clickable interactive elements have visible focus states, smooth hover transitions, and `cursor-pointer`.
- [ ] Responsive layouts look balanced and intentional on mobile (375px), tablet (768px), and desktop (1440px).
- [ ] Both light and dark modes have excellent text contrast ($\ge 4.5:1$).
- [ ] All existing functional workflows (search, video seek, progress tracking, category filtering) continue to work seamlessly.
- [ ] Test suite (`npm test`) passes with 100% passing tests.
- [ ] TypeScript compilation (`npm run type-check`) passes with 0 errors.
- [ ] Real-time browser testing executed across all pages with an objective UI score out of 10 provided.

## 7. Verification Plan
- `npm test` in `web/`
- `npm run type-check` in `web/`
- Browser subagent navigation and visual capture across Home (`/`), Catalog (`/courses`), Search (`/search?q=Next`), Course (`/courses/devops-with-docker-and-kubernetes`), and My Learning (`/my-learning`).

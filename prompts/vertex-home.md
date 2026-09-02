# Implementation Prompt: Vertex Home Page

## 1. Goal
Implement the production-grade Vertex Home Page (`/`) strictly matching the desktop design reference at [design/vertex-home.png](file:///c:/Users/Abhijeet Rawat/Desktop/nextJS/vertex/design/vertex-home.png) while making it responsive across tablet and mobile viewports in accordance with `ui-ux-pro-max` guidelines and `AGENTS.md`.

## 2. Skills Consulted
- **AGENTS.md**: Section 2 (working loop), Section 3 (UI reproduction standards: exact desktop reproduction, responsive adaptation down to mobile, no restyling), Section 5 & 6 (tech stack: Next.js App Router, Tailwind v4, Lucide icons).
- **ui-ux-pro-max**: Hero + Features + CTA landing pattern, responsive layout padding (`px-4 sm:px-6 lg:px-8`), mobile-first breakpoints, accessible semantic controls, vector-only icons, stable interaction states, contrast >= 4.5:1.

## 3. Code Inspected
- `app/globals.css`: Tailwind v4 theme tokens including primary orange palette (`--color-primary-100` through `500`), neutral slate palette, font definitions (`--font-display: Playfair Display`, `--font-sans: Inter`), radii and shadows.
- `app/layout.tsx`: Root layout configuring `Playfair_Display` and `Inter` Google fonts.
- `components/ui/card.tsx`, `components/ui/button.tsx`, `components/ui/badge.tsx`, `components/ui/input.tsx`: Existing design system components.
- `app/system-design/page.tsx`: Existing showcase page moved from `/`.
- `app/page.tsx`: Current temporary home page.

## 4. Decisions and Assumptions
- **Desktop Source of Truth**: The layout, typography, colors, and components on desktop (`>= 1024px`) will match `vertex-home.png` pixel-for-pixel:
  - Outer background with subtle diagonal stripe texture and centered clean white container card (`max-w-6xl`).
  - Top navigation with Vertex logo, navigation links ("Courses", "My Learning"), notifications bell, and avatar.
  - Hero section with "INTELLIGENT LEARNING" badge, Playfair Display heading ("Search your learning in plain English."), subtitle, "Explore Courses →" button, and large search input with `⌘ K` indicator.
  - "All Courses" section with "View all courses →" link, 3 course cards (Next.js for Production, Docker Essentials, TypeScript Deep Dive) with precise logos, typography, descriptions, and metadata rows (Level, Duration, Modules).
  - Divider banner: "New courses and lessons added every week." with star icon.
  - Bottom aesthetic cityscape/equalizer vertical bar gradient skyline illustration.
- **Responsive Behavior**:
  - Grid collapses smoothly from 3 columns on desktop (`md:grid-cols-3`) to 1 column on mobile (`grid-cols-1`).
  - Navbar maintains clean spacing on mobile, with touch targets >= 44px.
  - Search bar and hero text scale gracefully with fluid typography.
  - Container padding adapts mobile-first (`px-4 sm:px-6 lg:px-8`).
- **Icons & Logos**:
  - Next.js "N" logo container in black rounded square.
  - Docker whale vector icon SVG.
  - TypeScript "TS" blue rounded square logo.
  - Lucide icons for Bell, Search, Star, BarChart3, Clock, BookOpen, ArrowRight.
- **Client/Server Boundary**:
  - `app/page.tsx` will be clean, performant React server/client code adhering to Next.js 16 conventions. Search input interactive component or navigation linking to `/search` and `/courses`.

## 5. Files Expected to Touch
- `app/page.tsx` (Modify): Complete implementation of Vertex Home Page.
- `components/ui/course-card.tsx` or `components/ui/card.tsx` (Reuse/Enhance if needed for custom card icons): CourseCard component to ensure exact visual fidelity for Next.js, Docker, and TypeScript logos.
- `components/home/hero-search.tsx` (New, if isolated for client-side search input & keyboard shortcut `⌘ K`).
- `components/home/bottom-graphic.tsx` (New): SVG/CSS skyline bar gradient graphic.

## 6. Requirements & Acceptance Criteria
- [ ] Header renders Vertex logo mark + text, "Courses", "My Learning", Bell icon, and profile avatar.
- [ ] Hero displays "INTELLIGENT LEARNING" pill, Playfair Display title, subtitle, "Explore Courses →" button.
- [ ] Search box contains search icon, placeholder "Ask anything about your learning...", and `⌘ K` badge.
- [ ] "All Courses" section displays header with "View all courses →" link.
- [ ] 3 Course cards render exact content from design (Next.js for Production, Docker Essentials, TypeScript Deep Dive) with icons, title, description, level, duration, and module count.
- [ ] Star divider: "New courses and lessons added every week."
- [ ] Bottom vertical bar gradient graphic matches aesthetic of reference.
- [ ] Seamlessly responsive across 375px (mobile), 768px (tablet), and 1280px+ (desktop).
- [ ] Zero TypeScript errors in project code, passes ESLint and Next.js build.

## 7. Security Considerations
- Purely public presentational home page; no secret keys or private data exposed.
- Image assets use secure SVG or optimized Next.js Image components.

## 8. Checks to Run
- `npx tsc --noEmit` (TypeScript check)
- `npm run lint` (ESLint)
- `npm run build` (Next.js Turbopack build)

## 9. Manual Test Steps
1. Navigate to `http://localhost:3000/`.
2. Inspect desktop layout at 1280px+ and compare with `vertex-home.png`.
3. Check header: Logo, links, notification bell, avatar.
4. Check hero typography: Playfair Display heading, orange pill badge, button hover effects, search input focus.
5. Check all 3 course cards: icons, titles, descriptions, metadata rows.
6. Verify star divider and bottom gradient artwork.
7. Resize browser to tablet (768px) and mobile (375px) to verify responsive stacking and touch targets.

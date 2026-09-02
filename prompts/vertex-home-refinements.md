# Implementation Prompt: Vertex Home Page UI Refinements

## 1. Goal
Refine and polish the Vertex Home Page (`/`) to achieve exact 1:1 visual parity with [design/vertex-home.png](file:///c:/Users/Abhijeet Rawat/Desktop/nextJS/vertex/design/vertex-home.png), fixing icon shapes, navbar link visibility, badges, typography, cards, and bottom graphic artwork.

## 2. Skills Consulted
- **AGENTS.md**: Section 3 (exact desktop reproduction, responsive adaptation down to mobile, no restyling beyond reference).
- **ui-ux-pro-max**: Vector-only brand assets, precise token scales, 4.5:1 contrast, stable non-shifting hover states, accessible controls.

## 3. Code Inspected & Issues Identified
1. **Next.js & TypeScript Brand Icons**:
   - The Next.js and TypeScript logos need exact corner radius matching `rounded-2xl` (~14-16px, not 24px/circular) and crisp vector rendering.
   - The Docker logo should feature the classic light-blue container ship/whale on transparent background matching `vertex-home.png`.
2. **Top Navigation**:
   - Ensure "Courses" and "My Learning" links are clearly visible on desktop with proper spacing and hover states.
   - Replace the vector avatar with an authentic photographic circular avatar matching the friendly portrait in `vertex-home.png`.
3. **Hero Section**:
   - Badge "INTELLIGENT LEARNING": Fill with warm peach background (`#FFF4ED`), subtle orange border (`#FDBA74`), and bold orange uppercase tracking (`#EA580C`).
   - Search input: Ensure ⌘K shortcut badge is visible and properly styled, search icon has optical alignment and 14-16px corner radius.
4. **All Courses Grid**:
   - Ensure the 3 course cards have `rounded-2xl` borders (`#E2E8F0`), padding, Playfair Display serif titles, and footer metadata with BarChart3, Clock, and FileText/BookOpen icons.
5. **Bottom Skyline Artwork**:
   - Reconstruct the warm equalizer vertical bars using precise gradient steps matching `vertex-home.png`.

## 4. Decisions and Assumptions
- Use crisp inline SVGs for the Vertex V emblem, Next.js 'N', Docker whale, and TypeScript 'TS' logos.
- Use a high-quality circular photographic portrait for the user avatar.
- Outer container will maintain the diagonal warm-hatched texture with centered pure-white card container (`max-w-[1120px]`).
- All interactive controls will have proper focus-visible rings and active states.

## 5. Files Expected to Touch
- `app/page.tsx`: Layout, hero, navigation, section hierarchy.
- `components/home/course-icons.tsx`: High-fidelity Next.js, Docker, and TypeScript icons.
- `components/home/hero-search.tsx`: Refined search bar with ⌘K badge.
- `components/home/home-course-card.tsx`: Exact card padding, typography, and metadata icons.
- `components/home/bottom-graphic.tsx`: Refined skyline equalizer artwork.
- `components/home/user-avatar.tsx`: Refined photographic avatar.

## 6. Requirements & Acceptance Criteria
- [ ] Header displays exact Vertex logo, visible "Courses" & "My Learning" links, bell icon, and photographic avatar.
- [ ] "INTELLIGENT LEARNING" badge has warm peach fill, border, and orange text.
- [ ] Heading renders Playfair Display serif matching reference.
- [ ] Search input has search icon, placeholder, and ⌘K badge.
- [ ] All 3 course cards display Next.js, Docker, and TypeScript logos with rounded-2xl corners, serif titles, and metadata rows.
- [ ] Star divider line with "New courses and lessons added every week." is centered and clean.
- [ ] Bottom vertical bar gradient graphic renders cleanly.
- [ ] Zero TypeScript or ESLint errors in project code.

## 7. Security Considerations
- Purely public presentational home page; no client secrets.

## 8. Checks to Run
- `npx eslint app/ components/`
- `npx tsc --noEmit`
- Browser screenshot verification using `browser_subagent` on `http://localhost:3000`.

## 9. Manual Test Steps
1. Open `http://localhost:3000` in desktop browser.
2. Verify all elements against `vertex-home.png`: header, hero, search bar, course cards, divider, and bottom artwork.
3. Test ⌘K keyboard shortcut to focus search.
4. Test responsive layout on tablet and mobile viewports.

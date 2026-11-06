# Implementation Prompt: Sticky Sidebar, Default Light Theme, and Theme-Adaptive Auth Modal

## Goal
Resolve three user-facing layout and styling requirements:
1. Make the lesson page left column (`LessonSidebar`) sticky respective to the navbar (`top-20` / 80px offset and `h-[calc(100vh-5rem)]`), ensuring its header, back button, and content are never hidden behind the navbar during page scroll.
2. Set the default application theme to `"light"` for all new, unauthenticated, and first-time visitors (removing automatic fallback to OS dark mode preference), while preserving explicit user choices.
3. Update the video auth restriction login/sign-up modal (`AuthPromptModal`) to adapt dynamically to the active theme (light frosted card with crisp dark typography in light mode, deep dark glassmorphism card in dark mode).

---

## Skills Consulted
- `ui-ux-pro-max` (`.agents/skills/ui-ux-pro-max/SKILL.md`):
  - Theme consistency & light mode aesthetics: Clean neutral borders (`border-neutral-200/90`), subtle shadows (`shadow-2xl shadow-neutral-900/10`), crisp contrast (`text-neutral-900`, `text-neutral-600`), and warm terracotta accents (`#E05A36`).
  - Sticky viewport layout: Maintain proper clearance below fixed/sticky navigation headers, define internal scroll containers (`overflow-y-auto overscroll-contain`), and enforce `self-start` in flex layouts to prevent layout breakage.
  - Accessibility & touch targets: Minimum 44px touch targets, visible high-contrast focus rings for both light (`focus:ring-offset-white`) and dark (`focus:ring-offset-neutral-950`) modes.
- `ui-styling` (`.agents/skills/ui-styling/SKILL.md`):
  - Tailwind CSS dark variant usage (`dark:...`) paired with semantic light classes for zero flash of unstyled content and consistent theming.
- `AGENTS.md`:
  - Strict loop adherence: Write implementation prompt in `prompts/`, solicit user approval via interactive question, implement upon approval, run required checks (`npm test`, `npx tsc --noEmit`), and output brief structured report.

---

## Code Inspected
- `web/components/lesson/lesson-sidebar.tsx`:
  - Currently uses `lg:sticky lg:top-0 lg:h-screen`. Because `Navbar` is `sticky top-0 z-30 h-20` (80px), scrolling down pushes the sidebar under the navbar, obscuring the "Back to course" link and course header.
- `web/app/layout.tsx`:
  - Script in `<head>` checked `if (saved === 'dark' || (!saved && prefersDark))`. If a new user visited with OS dark mode enabled, it automatically defaulted to dark.
- `web/lib/utils/theme.ts`:
  - Helper functions `isValidTheme`, `resolveTheme`, `getNextTheme`. Fallback logic in `resolveTheme` needs to guarantee `"light"` as the default unless `"system"` or `"dark"` is explicitly specified.
- `web/components/theme/theme-provider.tsx`:
  - `getInitialTheme()` returned `"system"` as fallback when no storage key exists. Needs to default to `"light"`.
- `web/components/lesson/auth-prompt-modal.tsx`:
  - Modal card currently hardcodes dark background classes (`bg-neutral-950/95`, `text-white`, `border-white/10`, `divide-white/[0.05]`). When light theme is active, it remains dark instead of adapting.
- `web/test/theme.test.ts`:
  - Unit tests verifying theme resolution, toggling, and storage keys. Needs updates to assert `"light"` default behavior.

---

## Decisions & Assumptions
1. **Sidebar Sticky Positioning**:
   - `Navbar` is 80px tall (`h-20`). The sidebar `<aside>` should use `lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] lg:self-start lg:overflow-y-auto lg:overscroll-contain`.
   - This ensures the sidebar top begins exactly at the bottom edge of the navbar (80px / 5rem down) during scrolling. Content at the top of the sidebar is never hidden or clipped.
2. **Default Theme to Light**:
   - In `web/app/layout.tsx`: Update inline `<script>` to only activate dark mode if `saved === 'dark' || (saved === 'system' && prefersDark)`. Unsaved visitors will execute the `else` branch (`document.documentElement.classList.remove('dark')` and `style.colorScheme = 'light'`).
   - In `web/components/theme/theme-provider.tsx`: Change `getInitialTheme()` fallback from `"system"` to `"light"`.
   - In `web/lib/utils/theme.ts`: Add `DEFAULT_THEME: Theme = "light"` and update `resolveTheme` so `(!theme || theme === 'light')` returns `"light"`.
3. **Theme-Adaptive Auth Modal (`AuthPromptModal`)**:
   - Backdrop: `bg-neutral-950/50 dark:bg-black/85 backdrop-blur-sm dark:backdrop-blur-md`.
   - Card Container: `bg-white/95 dark:bg-neutral-950/95 backdrop-blur-2xl border border-neutral-200/90 dark:border-white/10 text-neutral-900 dark:text-white shadow-2xl shadow-neutral-900/10 dark:shadow-black/90 ring-1 ring-neutral-900/5 dark:ring-white/5`.
   - Ambient Glow: Softer in light mode (`bg-[#E05A36]/15 blur-3xl`), deeper in dark mode (`dark:bg-[#E05A36]/25 blur-3xl`).
   - Close Button: `bg-neutral-100 hover:bg-neutral-200/80 dark:bg-white/5 dark:hover:bg-white/10 border border-neutral-200 dark:border-white/10 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white`.
   - Feature List Container: `bg-neutral-50/90 dark:bg-white/[0.03] border border-neutral-200/80 dark:border-white/[0.08] divide-y divide-neutral-200/60 dark:divide-white/[0.05]`.
   - Feature List Items: Light text `text-neutral-900 dark:text-neutral-200`, subtitles `text-neutral-500 dark:text-neutral-400`.
   - Secondary Button (Create Account): `border border-neutral-300 dark:border-white/15 bg-neutral-50 hover:bg-neutral-100 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] hover:border-neutral-400 dark:hover:border-white/25 text-neutral-800 hover:text-neutral-950 dark:text-neutral-200 dark:hover:text-white`.
   - Focus rings: Adaptive ring offsets (`focus:ring-offset-white dark:focus:ring-offset-neutral-950`).

---

## Files Expected to Touch
- `web/components/lesson/lesson-sidebar.tsx` — Adjust sticky top offset and height.
- `web/app/layout.tsx` — Inline head script to default to light mode.
- `web/lib/utils/theme.ts` — Update theme resolver and export default theme constant.
- `web/components/theme/theme-provider.tsx` — Default initial theme state to light.
- `web/components/lesson/auth-prompt-modal.tsx` — Apply theme-adaptive styling across dialog elements.
- `web/test/theme.test.ts` — Update unit tests to verify default light theme behavior.

---

## Requirements
- Left column must stick smoothly below the navbar during scrolling without hiding any header elements.
- Initial load on any device without previous saved theme must be light mode.
- Explicit toggle to dark mode must continue to function and persist in `localStorage`.
- Auth prompt modal must look gorgeous and native in both light mode and dark mode.

---

## Security Considerations
- Client-side styling and layout adjustments only.
- No sensitive credentials or API keys exposed.
- Preserves Clerk modal security.

---

## Acceptance Criteria
- [x] Left column on lesson page sticks below the 80px navbar (`top-20`) when page is scrolled; top content ("Back to course", course title) remains fully visible and interactive.
- [x] When `localStorage` has no theme set, the site opens in Light mode even if the operating system is set to dark mode.
- [x] AuthPromptModal renders with a polished light theme styling when the page is in light mode, and dark styling in dark mode.
- [x] All unit tests pass (`npm test`).
- [x] TypeScript compilation passes (`npx tsc --noEmit`).
- [x] ESLint passes with 0 errors on modified files.

---

## Checks to Run
- `npm test` in `web/` (must pass all test suites).
- `npx tsc --noEmit` in `web/` (must pass with 0 type errors).
- ESLint check on modified files.
- Browser inspection of sticky scrolling and modal in light/dark modes.

---

## Exact Manual Test Steps
1. Navigate to `http://localhost:3000/lessons/nextjs-app-router-in-depth-server-actions-basics`.
2. Scroll down through the lesson content on the right: verify that the left column sticks at the bottom of the navbar and its top items are not covered by the navbar.
3. Open browser console, run `localStorage.removeItem('vertex-theme')`, and reload the page: verify the site loads in Light mode by default.
4. Click the play button on the video player to trigger the Auth Prompt Modal: verify the modal appears in light mode with bright card background, dark text, clean borders, and terracotta accents.
5. Click the Theme toggle in the navbar to switch to Dark mode.
6. Trigger the modal again: verify the modal renders with dark glassmorphism styling.

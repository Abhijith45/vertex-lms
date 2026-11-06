# Implementation Prompt: Consistent App Layout & Auth Card Visual Proportions Fix

## 1. Goal
Resolve the visual distortion shown in the user's uploaded screenshots where the login and sign-up card expands across the entire viewport width (~1000px), restore layout consistency with the rest of the Vertex application (unifying the global Navbar and Footer), and establish an exact, centered, proportional card architecture (`max-w-md` / 448px) adhering to the `ui-ux-pro-max` design system.

---

## 2. Inspected Deficiencies from User Screenshots

1. **Card Container Stretching (Critical Visual Bug)**:
   - In both screenshots (`media_1793892164964_725c0162.png` and `media_1793892187303_371cca5a.png`), the authentication card is stretching horizontally across 95%+ of the screen.
   - The root cause is `w-full max-w-[490px]` in `auth-card-layout.tsx`: arbitrary Tailwind class `max-w-[490px]` inside a flex parent without `mx-auto` or fallback constraints allowed `w-full` to stretch to 100% of the flex parent container (992px).
   - This distortion stretches social buttons, first/last name columns, email/password fields, and the submit CTA into abnormally long, flat strips across the screen.

2. **App Layout Inconsistency**:
   - The auth pages currently render a standalone custom `<header>` with only the logo and ThemeToggle, and a detached copyright line at the bottom.
   - The rest of Vertex (`/`, `/courses`, `/courses/[slug]`, `/my-learning`) uses the unified, sticky `<Navbar />` (with navigation links, search toggle, and account status) and standard `<Footer />`.
   - Adhering to the `ui-ux-pro-max` layout guidelines, the user experience must maintain a unified, cohesive application frame.

---

## 3. Decisions & UI/UX Pro Max Architecture

1. **Card Width & Centering Enforcement**:
   - Replace arbitrary `max-w-[490px]` with standard, guaranteed Tailwind token `max-w-md` (28rem = 448px) and add inline style `style={{ maxWidth: "448px", width: "100%" }}` as a defensive guarantee.
   - Wrap `<main>` as a centered flex container:
     ```tsx
     <main className="flex-1 flex flex-col items-center justify-center py-10 sm:py-14 px-4 sm:px-6 my-auto w-full">
     ```
   - Center the card with `w-full max-w-md mx-auto`.
   - This guarantees that on desktop screens, the card remains a compact, floating 448px card (just like Clerk/Stripe/Supabase auth dialogs), while on mobile screens it responsively adapts with comfortable edge padding.

2. **Unified App Frame (Header & Footer)**:
   - In [auth-card-layout.tsx](file:///c:/Users/Abhijeet%20Rawat/Desktop/nextJs/vertex/web/components/auth/auth-card-layout.tsx), replace the custom header with the application's global `<Navbar showSearch={false} />`.
   - Replace the makeshift footer paragraph with the application's global `<Footer />` (or unified branded footer layout), maintaining consistent typography, navigation links, and theme toggle across all routes.

3. **Micro-Components in Balanced Proportions**:
   - Once constrained to 448px:
     - Google & GitHub buttons sit side-by-side at a comfortable ~180px width each with `h-12`.
     - First Name & Last Name inputs sit side-by-side at ~180px width each with `h-12`.
     - Email and Password fields have balanced, readable widths without excessive horizontal whitespace.
     - Submit CTA button is compact, tactile, and prominent.

---

## 4. Files to Touch
1. `web/components/auth/auth-card-layout.tsx` - Enforce 448px card width with defensive styling; integrate global `Navbar` (`showSearch={false}`) and unified footer.
2. `web/components/auth/custom-sign-in-form.tsx` - Verify form alignment inside the 448px container.
3. `web/components/auth/custom-sign-up-form.tsx` - Verify 2-column name row alignment inside the 448px container.

---

## 5. Security & Boundary Considerations
- Passwords remain masked (`type="password"`) by default with optional toggle.
- Open Redirect defense (`sanitizeRedirectUrl`) remains active.
- Clerk authentication state machine remains unmodified.

---

## 6. Acceptance Criteria
- [ ] On desktop screens, the login and sign-up card is centered and strictly constrained to 448px width (no 1000px stretch).
- [ ] On mobile screens (<640px), the card adapts fluidly with `px-4` margins.
- [ ] The page includes the consistent Vertex `<Navbar showSearch={false} />` matching the rest of the application.
- [ ] Social buttons, 2-column name inputs, email/password fields, and CTA buttons are visually balanced and proportional.
- [ ] Automated test suite (`npm test`) passes 100% (163/163 tests).
- [ ] TypeScript check (`npm run type-check`) passes with 0 errors.

---

## 7. Checks to Run
- `cd web; npm test`
- `cd web; npm run type-check`
- Visual curl/browser verification of card width and layout.

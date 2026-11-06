# Implementation Prompt: Auth Form Spacing, Typography & Viewport Fit Optimization

## 1. Goal
Address the UX/UI spacing and typography issues in the Sign-In and Sign-Up forms requested under `/ui-ux-pro-max`:
1. **Provide consistent vertical space between inputs**: Eliminate erratic jumping margins (previously swinging between 8px, 14px, 20px, 24px, and 48px divider gaps) by enforcing a strict, harmonious 4px/8px design system scale (`space-y-3.5` between field groups, `mb-1.5` on labels, and `my-3.5` on the divider).
2. **Standardize space between icon and text input & fix eye icon overflow**:
   - Fix the flex overflow bug where `<input className="w-full">` pushed the password toggle eye button outside the rounded card border.
   - Transition inputs to a rock-solid flex structure (`flex-1 min-w-0`) with optical 10px-12px padding between the leading icon and text placeholder/value (`pl-2.5` to `pl-3`).
   - Keep the password reveal button neatly inset inside the border with `shrink-0 p-1.5 mr-0.5`.
3. **Adjust overall layout and density so forms fit comfortably inside standard desktop and laptop viewports without scrolling**:
   - Reduce outer padding in `auth-card-layout.tsx` from oversized `py-10 sm:py-14` to a balanced, centered `py-4 sm:py-6` with `min-h-[calc(100dvh-5rem)]`.
   - Refine card padding from `p-8 sm:p-10` to `p-6 sm:p-7`.
   - Scale headers and controls to professional, ergonomic heights: buttons/inputs at `h-11` (44px standard touch target), header margin `mb-4 sm:mb-5`, and compact typography.
   - Keep the first name / last name fields in a 2-column grid (`grid-cols-2 gap-3`) so Sign-Up does not vertically balloon.

---

## 2. Inspected Code & Deficiencies
- `web/components/auth/auth-card-layout.tsx`:
  - Outer `<main>` wrapper uses `py-10 sm:py-14`, adding 112px+ of vertical dead space.
  - Card padding `p-8 sm:p-10` and header `mb-8` pushes the form controls down.
  - Combined with `<Navbar>` and `<Footer>`, the total height exceeds 1000px, forcing the user to scroll to view and submit the form.
- `web/components/auth/custom-sign-in-form.tsx`:
  - Uses `space-y-6` at root, `my-6` on the divider, and `space-y-5` between form fields.
  - Password input container lacks `min-w-0` on the input element, causing the trailing `<button>` (eye icon) to be shoved outside the border boundary as seen in user screenshot `media_1793894775716_fea041c3.png`.
- `web/components/auth/custom-sign-up-form.tsx`:
  - Same flex overflow vulnerability on the password field.
  - Sits at ~720px height; stacking first and last name on small viewports causes severe vertical overflow.
- `web/components/auth/social-auth-buttons.tsx`:
  - Height `h-12` contributes unnecessary vertical bulk; standardizing to `h-10.5` (42px) or `h-11` (44px) harmonizes with form fields.

---

## 3. Decisions & Implementation Details

1. **`web/components/auth/auth-card-layout.tsx`**:
   - Container max width: `max-w-[460px]`.
   - Internal card padding: `p-6 sm:p-7`.
   - Outer padding: `py-4 sm:py-6` with flex alignment that centers the card within the visible viewport.
   - Header margin: `mb-4 sm:mb-5`. Title: `text-xl sm:text-2xl font-bold tracking-tight mb-1.5`. Subtitle: `text-xs sm:text-sm text-neutral-600 dark:text-neutral-400`.

2. **`web/components/auth/custom-sign-in-form.tsx`**:
   - Root spacing: `space-y-3.5 sm:space-y-4`.
   - Divider: `my-3 sm:my-3.5` with subtle `text-[10.5px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500`.
   - Inputs spacing: `space-y-3 sm:space-y-3.5`.
   - Labels: `block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5`.
   - Input containers:
     - Height: `h-11` (44px).
     - Structure: `group relative flex items-center h-11 w-full rounded-xl border border-neutral-300 dark:border-neutral-700/80 bg-white dark:bg-neutral-900 px-3.5 focus-within:border-[#E05A36] focus-within:ring-2 focus-within:ring-[#E05A36]/20 transition-all shadow-2xs`.
     - Leading Icon: `h-4 w-4 shrink-0 text-neutral-400 dark:text-neutral-500 group-focus-within:text-[#E05A36] transition-colors pointer-events-none`.
     - Input text element: `flex-1 min-w-0 h-full bg-transparent pl-2.5 pr-1 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 border-0 outline-hidden focus:outline-hidden focus:ring-0`.
     - Password toggle button: `shrink-0 flex items-center justify-center p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors cursor-pointer rounded-lg`.
   - Primary button: `h-11 w-full text-sm font-semibold rounded-xl bg-gradient-to-r from-[#E05A36] to-[#C2410C] hover:from-[#EA580C] hover:to-[#9A3412] text-white shadow-sm`.
   - Bottom link: `pt-1.5 text-center text-xs`.

3. **`web/components/auth/custom-sign-up-form.tsx`**:
   - Apply matching `space-y-3.5 sm:space-y-4` layout, `h-11` inputs, `flex-1 min-w-0` inputs with `pl-2.5` icon spacing.
   - First and Last name fields: `grid grid-cols-2 gap-3` with `h-11` inputs.
   - Terms disclaimer: `text-[11.5px] leading-normal pt-0.5 text-neutral-500 dark:text-neutral-400`.
   - Sign-in bottom link: `pt-1.5 text-center text-xs`.

4. **`web/components/auth/social-auth-buttons.tsx`**:
   - Harmonize OAuth buttons to `h-10.5` (42px) with `gap-2.5` and `text-xs sm:text-sm font-medium`.

---

## 4. Files to Touch
1. `web/components/auth/auth-card-layout.tsx`
2. `web/components/auth/custom-sign-in-form.tsx`
3. `web/components/auth/custom-sign-up-form.tsx`
4. `web/components/auth/social-auth-buttons.tsx`

---

## 5. Security & Boundary Considerations
- Form validation, Clerk hooks (`useSignIn`, `useSignUp`), and OTP verification logic remain 100% intact.
- Password inputs remain masked by default (`type="password"`) with toggle functionality.
- Sanitized redirects via `sanitizeRedirectUrl` remain unchanged.

---

## 6. Acceptance Criteria
- [ ] Sign-In form and Sign-Up form both comfortably fit inside standard 768px-900px vertical laptop/desktop viewports without page scroll.
- [ ] All inputs have consistent vertical spacing (`space-y-3 sm:space-y-3.5` between fields, `mb-1.5` on labels).
- [ ] Optical space between leading icon and input placeholder/value is clean and consistent across all fields (~10px-12px).
- [ ] Password eye toggle icon is strictly contained inside the right edge of the input pill border on both forms.
- [ ] Responsive behavior: forms display beautifully on both mobile screens (375px+) and desktop displays.
- [ ] TypeScript check (`npm --prefix web run type-check`) passes with 0 errors.
- [ ] Unit & integration test suite (`npm --prefix web test`) passes 100% of tests.

---

## 7. Checks to Run
- `npm --prefix web run type-check`
- `npm --prefix web test`
- Visual inspection via browser on `http://localhost:3000/sign-in` and `http://localhost:3000/sign-up`.

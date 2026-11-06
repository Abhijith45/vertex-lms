# Implementation Prompt: Auth Form Layout, Spacing & Micro-Component Arrangement

## 1. Goal
Refactor and elevate the UI layout, spacing (padding, margin, gap rhythm), and micro-component arrangement (input icons, password visibility toggles, OAuth brand icons, submit button arrow transitions, OTP split-boxes, error alerts) for the custom Clerk authentication forms (`/sign-in` and `/sign-up`) adhering to the `ui-styling` skill guidelines and design tokens.

---

## 2. Inspected Code & Current Deficiencies

1. **`web/components/auth/auth-card-layout.tsx`**:
   - Max-width is constrained to `max-w-md` (448px), creating horizontal crowding especially on multi-column inputs ("First name" + "Last name").
   - Padding is `p-6 sm:p-8`, which feels tight against header titles and footer links.
   - Header margin `mb-6` crowds the social auth section.

2. **`web/components/auth/custom-sign-in-form.tsx` & `custom-sign-up-form.tsx`**:
   - Input heights are `h-11` (44px) with small `h-4 w-4` icons. In modern form design, `h-12` (48px) provides superior touch ergonomics, visual balance, and spaciousness.
   - **Missing Password Visibility Toggle**: Neither form has an interactive `Eye` / `EyeOff` toggle button, forcing users to type passwords blindly.
   - **Asymmetrical Name Inputs in Sign Up**: "First name" has a `<User>` icon with `pl-10`, while "Last name" has no icon with `px-3.5`, creating an awkward asymmetrical appearance in the 2-column row.
   - Input spacing `space-y-4` and divider spacing `my-5` cause micro-components to feel compressed together.
   - Submit buttons lack dynamic micro-interaction states (e.g. arrow icon subtle translation on hover).

3. **`web/components/auth/social-auth-buttons.tsx`**:
   - Buttons are `h-11` with `text-xs`, making them feel secondary and cramped.
   - Gap between buttons is `gap-3`.

4. **`web/components/auth/otp-input.tsx`**:
   - Digit boxes are `h-12 w-10 sm:h-14 sm:w-12`, which is slightly narrow on mobile touchscreens.
   - Title and description spacing `mb-2` and `mb-6` can be spaced more deliberately for visual focus.

---

## 3. Decisions & UI Styling Specification

1. **Card Container & Spatial Hierarchy**:
   - Increase width to `max-w-[480px]` (or `max-w-lg` at 512px on sm+ screens) with generous internal padding: `p-8 sm:p-10 md:p-12`.
   - Refine ambient terracotta accent glow: soften blur to `blur-3xl` and position cleanly above and below card.
   - Increase header title margin to `mb-8`, providing clear visual separation between branding/title and interactive controls.

2. **Form Spacing & Rhythm (8pt Token System)**:
   - Input height: Standardized to `h-12` (48px) with `rounded-xl` or `rounded-2xl`.
   - Field vertical rhythm: Increased from `space-y-4` to `space-y-5`.
   - Label spacing: Increased to `mb-2` with crisp, legible hierarchy (`text-xs font-semibold text-neutral-700 dark:text-neutral-300`).
   - Section divider: Spacious `my-6` with expanded horizontal border lines and subtle badge text (`text-[11px] font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500`).

3. **Micro-Components & Icon Arrangement**:
   - **Interactive Password Visibility Toggle**:
     - Integrate a toggle button inside the password inputs using `lucide-react`'s `Eye` and `EyeOff` icons.
     - Positioned at `absolute right-3.5 top-1/2 -translate-y-1/2` with smooth hover states (`text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200`) and `aria-label="Toggle password visibility"`.
     - Input padding updated to `pl-11 pr-11` to prevent text overlap with icons on both sides.
   - **Symmetrical 2-Column Inputs**:
     - Provide consistent `<User>` icon for both First Name and Last Name with symmetrical `pl-11 pr-4` padding and `gap-3.5 sm:gap-4`.
   - **Leading Icon Alignment**:
     - Icons sized to `h-4.5 w-4.5` (18px) and positioned at `left-3.5 top-1/2 -translate-y-1/2` for optical centering.
     - Text inputs styled with `pl-11` to provide comfortable 14px breathing room after the icon.
   - **OAuth Social Buttons**:
     - Height increased to `h-12` (48px), `rounded-xl`, `text-sm font-medium`, `gap-3`.
     - Elevated hover effects with border transition (`hover:border-neutral-400 dark:hover:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800/60`).
   - **Submit & Action Buttons**:
     - Height `h-12` (48px) with warm terracotta gradient (`from-[#E05A36] to-[#C2410C]`), subtle glow shadow, and interactive arrow translation on hover (`group-hover:translate-x-0.5 transition-transform`).
   - **OTP Digit Inputs**:
     - Increased digit box size to `h-14 w-11 sm:h-16 sm:w-13` with `gap-2.5 sm:gap-3.5`.
     - Focus ring tuned to `focus:ring-2 focus:ring-[#E05A36]/25`.

4. **Accessibility & Dark Mode**:
   - Contrast compliant in both light mode (`#FAF9F6`) and dark mode (`#090D16` / `#0F172A`).
   - Clear ARIA labels on all interactive micro-components (`button`, `input`, password toggle).

---

## 4. Files to Touch
1. `web/components/auth/auth-card-layout.tsx` - Expand card container padding and header spacing.
2. `web/components/auth/social-auth-buttons.tsx` - Polish button sizing, icons, hover elevations, and gaps.
3. `web/components/auth/custom-sign-in-form.tsx` - Add password visibility toggle, increase input heights/spacing, optimize icon alignment.
4. `web/components/auth/custom-sign-up-form.tsx` - Symmetrical first/last name icons, password visibility toggle, improved spacing and micro-components.
5. `web/components/auth/otp-input.tsx` - Increase digit box dimensions, optimize micro-spacing and resend button feedback.

---

## 5. Security & Boundary Considerations
- Passwords remain masked (`type="password"`) by default; toggling is purely client-side local React state and never logged or exposed.
- Redirect URLs continue to run through `sanitizeRedirectUrl()` to uphold CWE-601 open redirect defense.
- Clerk authentication state machine (`signIn`, `signUp`, MFA, emailCode) behavior remains untouched.

---

## 6. Acceptance Criteria
- [ ] Sign-in and sign-up cards feel spacious, well-proportioned, and visually aligned on mobile, tablet, and desktop.
- [ ] Password fields include an interactive eye icon to toggle visibility between masked and plain text.
- [ ] All inputs have consistent `h-12` (48px) height with optically centered icons and balanced internal padding (`pl-11`).
- [ ] First Name and Last Name in sign-up form have balanced, symmetrical icon treatments.
- [ ] Social auth buttons and primary submit buttons have tactile `h-12` dimensions with polished hover states.
- [ ] OTP split boxes provide generous touch targets (`h-14 w-11 sm:h-16 sm:w-13`).
- [ ] `npm test` passes 100% of tests.
- [ ] `npm run type-check` exits with 0 errors.

---

## 7. Checks to Run
- `cd web; npm test`
- `cd web; npm run type-check`

# Implementation Prompt: Auth Form Box Padding & Input Field Icon Alignment

## 1. Goal
Address the layout issues visible in the user's uploaded sign-up form screenshot (`media_1793893556490_a0dcb2f4.png`):
1. **Increase the padding in the form box** (`auth-card-layout.tsx`) so form elements do not crowd the outer card border.
2. **Add front padding / inward offset to input fields** (`custom-sign-up-form.tsx` and `custom-sign-in-form.tsx`) so the leading icons (`User`, `Mail`, `Lock`) are optically centered inside the input fields with clear separation from the rounded border curve, and the placeholder/typed text has proper clearance.

---

## 2. Inspected Deficiencies from Screenshot

1. **Input Icon Border Collision**:
   - In `media_1793893556490_a0dcb2f4.png`, the `<User>` icons in "First name" and "Last name", the `<Mail>` icon in "Email address", and the `<Lock>` icon in "Password" are positioned at `left-3.5` (14px).
   - Because the inputs use `rounded-xl` / `rounded-2xl` corners, a 14px offset places the icons directly on the boundary curve of the input border, causing visual collision and overlap.
   - Text padding `pl-11` (44px) leaves an uneven gap relative to the crowded icon.

2. **Form Box Padding**:
   - The card container currently uses `p-7 sm:p-9` inside a 448px container.
   - The inputs sit too close to the card's outer border, giving a cramped appearance.

---

## 3. Decisions & UI Styling Improvements

1. **Card Container & Box Padding**:
   - Adjust the card container to a spacious 480px max-width (`max-w-[480px]`, `style={{ maxWidth: "480px", width: "100%" }}`).
   - Increase internal box padding to `p-8 sm:p-10` (or `p-8 sm:p-11`), creating generous breathing room between the form inputs and the card's perimeter.
   - Maintain the global `<Navbar showSearch={false} />` and `<Footer />` framework.

2. **Input Field Padding & Icon Alignment**:
   - **Leading Icon Position**: Move from `left-3.5` (14px) to `left-4.5` (18px) or `left-4` (16px) with precise vertical centering (`top-1/2 -translate-y-1/2`). This places the icon squarely within the flat, safe area of the input field, completely clearing the border radius.
   - **Input Text Padding**: Increase from `pl-11` (44px) to `pl-12` (48px) across all text inputs, ensuring clean 14px spacing between the icon and placeholder/typed text.
   - **Trailing Action (Password Toggle)**: Set at `right-4` with `pr-12` input padding for symmetrical balance.
   - Apply these refinements symmetrically across:
     - `custom-sign-up-form.tsx`: "First name", "Last name", "Email address", "Password"
     - `custom-sign-in-form.tsx`: "Email address", "Password"

---

## 4. Files to Touch
1. `web/components/auth/auth-card-layout.tsx` - Increase box padding to `p-8 sm:p-10` and expand container to 480px.
2. `web/components/auth/custom-sign-up-form.tsx` - Realign leading icons (`left-4.5`) and increase input text padding (`pl-12`).
3. `web/components/auth/custom-sign-in-form.tsx` - Apply identical leading icon alignment (`left-4.5`) and input text padding (`pl-12`).

---

## 5. Security & Boundary Considerations
- Passwords remain masked (`type="password"`) by default with client toggle.
- Open Redirect defense (`sanitizeRedirectUrl`) remains active.
- Clerk auth handlers and verification states remain untouched.

---

## 6. Acceptance Criteria
- [ ] The form box has comfortable, spacious internal padding (`p-8 sm:p-10`), preventing edge crowding.
- [ ] All leading icons (`User`, `Mail`, `Lock`) sit cleanly inside the input field with no border overlap.
- [ ] Input placeholders ("Ada", "Lovelace", "you@domain.com", "••••••••••••") have clear, readable padding after the icon (`pl-12`).
- [ ] Password eye toggle sits balanced at `right-4` with `pr-12`.
- [ ] Sign-up and Sign-in forms share identical, pixel-perfect alignment.
- [ ] `npm test` passes 100% of tests (163/163).
- [ ] `npm run type-check` passes with 0 errors.

---

## 7. Checks to Run
- `cd web; npm test`
- `cd web; npm run type-check`
- Verify rendered HTML on `http://localhost:3000/sign-up` and `http://localhost:3000/sign-in`.

# Implementation Prompt: Custom Clerk Sign-In, Sign-Up, OTP Input & Logout

## 1. Goal
Upgrade the authentication experience from standard prebuilt Clerk widgets to fully custom, responsive, production-ready components that match the Vertex terracotta design system:
1. **Custom Sign-In Form**: Email/password and email-code login with OAuth SSO (Google/GitHub), forgot-password reset, field-level error feedback, and session finalization.
2. **Custom Sign-Up Form**: Registration with Name, Email, Password, bot protection container (`#clerk-captcha`), OAuth SSO, and automatic transition to email OTP verification.
3. **Custom OTP Input Form**: 6-digit split-box PIN component with auto-focus, paste distribution, keyboard navigation, and countdown timer.
4. **Secure Logout**: Custom sign-out trigger with loading spinner and redirect handling via Clerk's `signOut()`.
5. **Theme & Design Consistency**: Terracotta accents (`#E05A36`), dark/light mode support, and full accessibility.

---

## 2. Skills & References
- `clerk-custom-ui` (`.agents/skills/clerk-custom-ui/core-3/custom-sign-in.md` & `custom-sign-up.md`): Core 3 SDK v7 APIs for `useSignIn`, `useSignUp`, `signIn.password`, `signIn.emailCode`, `signUp.password`, `signUp.verifications`, and `finalize()`.
- `clerk-nextjs-patterns` (`.agents/skills/clerk-nextjs-patterns/SKILL.md`): Middleware routing, redirect params, and session validation.

---

## 3. Files to Touch
1. `web/components/auth/otp-input.tsx` [NEW] — 6-digit PIN input with paste and countdown timer.
2. `web/components/auth/social-auth-buttons.tsx` [NEW] — Google and GitHub OAuth buttons.
3. `web/components/auth/auth-card-layout.tsx` [NEW] — Reusable card shell with Vertex branding, ambient glows, and dark mode.
4. `web/components/auth/custom-sign-in-form.tsx` [NEW] — Custom sign-in with password, email OTP, and reset flows.
5. `web/components/auth/custom-sign-up-form.tsx` [NEW] — Custom sign-up with email verification step and captcha container.
6. `web/components/auth/sign-out-button.tsx` [NEW] — Reusable sign-out button component.
7. `web/app/(auth)/sign-in/[[...sign-in]]/page.tsx` [MODIFY] — Render custom sign-in.
8. `web/app/(auth)/sign-up/[[...sign-up]]/page.tsx` [MODIFY] — Render custom sign-up.
9. `web/test/otp-input.test.ts` [NEW] — Unit tests for OTP input validation, paste handling, and formatting.

---

## 4. Verification Plan
- `npm run type-check` (in `web`)
- `npm test` (in `web`)
- Manual verification of `/sign-in` and `/sign-up` forms and OTP states on `http://localhost:3000`.

# Implementation Prompt: Auth-Gated Video Playback & Creative Modern Sign-In Modal

## 1. Goal
Restrict video playback across all course and lesson videos to authenticated (signed-in/signed-up) users. When an unauthenticated visitor clicks any play trigger (center play button, video overlay, or control bar play), prevent playback and display a modern, creative, and attractive Sign In / Sign Up modal dialog.

## 2. Skills and References
- `AGENTS.md` (Sections 5, 7, 12 - Auth is Clerk, private routes gated, free preview is label not access control).
- `clerk` skill & `@clerk/nextjs` modal patterns (`<SignInButton mode="modal">`, `<SignUpButton mode="modal">`).
- `ui-ux-pro-max` design guidelines (creative dark-mode glassmorphism card, gradient accents, clear visual hierarchy, micro-interactions).

## 3. Code Inspected
- `web/components/lesson/video-embed.tsx`: Auth state checking (`useUser`), play gating (`togglePlay`), overlay rendering, and Clerk integration.
- `web/test/video-controls.test.ts`: Video controls and playback test suite.

## 4. Decisions and Assumptions
- **Universal Auth Gating**: Video playback requires authentication (`!isSignedIn`). If unauthenticated, all play actions (`togglePlay`) intercept playback and display the sign-in modal.
- **Creative Modern Modal UI**:
  - Glassmorphic dark modal with ambient terracotta/orange gradient glow (`#E05A36`).
  - Sleek lock / spark icon badge with pulse animation.
  - Value proposition highlights (full video access, progress tracking, intelligent moment search).
  - One-click Sign In and Sign Up triggers using Clerk's modal mode.
  - Accessible dismissal via close button and Escape key.
- **Automated Unit Testing**:
  - Unit tests verifying that `shouldAllowPlayback(isSignedIn)` rejects unauthenticated users and allows authenticated users.
  - Tests ensuring play triggers intercept playback and set modal visibility state.

## 5. Files to Touch
- [MODIFY] `web/components/lesson/video-embed.tsx`
- [NEW] `web/components/lesson/auth-prompt-modal.tsx`
- [NEW] `web/test/auth-gate.test.ts`
- [MODIFY] `web/package.json` (to include new unit test in `npm test`)

## 6. Security Considerations
- Auth gating keys off Clerk's client/server authentication state (`useUser()`, `auth()`).
- Video stream does not play without explicit authentication.

## 7. Acceptance Criteria
1. Unauthenticated users cannot play course/lesson videos.
2. Clicking play opens an attractive, modern Sign In / Sign Up modal.
3. Clicking Sign In or Create Account launches Clerk's modal authentication flow.
4. Authenticated users can play and control videos smoothly.
5. All automated unit tests pass with 100% green assertions.

## 8. Checks to Run
- `npm test` in `web`.
- `npx tsc --noEmit` in `web`.
- `npm run build` in `web`.

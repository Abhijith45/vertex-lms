# Implementation Prompt: Audit-Driven Architecture, Performance & Security Enhancements

## Goal
Implement the high-impact enhancements identified by `react-doctor` and `next-doctor` audits across architecture, performance, memory management, and security:
1. **Parallelize Sequential Async Awaits**: Parallelize `await auth()` and `await currentUser()` using `Promise.all` in `/api/checkout` and `/api/certificates/claim` to cut server-side latency by ~50%.
2. **Eliminate Memory Leaks in Timers**: Add unmount cleanup handlers for `hideControlsTimerRef` and `pollIntervalRef` in `video-embed.tsx` and for focus timeout in `search-modal.tsx`.
3. **Optimize Server Component Boundary**: Remove redundant `"use client"` directive from `search-result-logo.tsx` to turn it into a zero-bundle Server Component.
4. **Harden Secret Fallbacks**: Eliminate static hardcoded secret fallbacks in `certificate.ts` and `stripe.ts` by requiring environment variables in production and throwing/warning if missing.
5. **Safeguard Network Ingestion**: Check `response.ok` before consuming fetch streams in `api/search/route.ts` to prevent uncaught JSON parsing failures.
6. **Add HTTP Security Headers**: Configure standard enterprise security headers (`X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`) in `next.config.ts`.
7. **Landing Page SEO**: Add comprehensive `export const metadata: Metadata` to `app/page.tsx`.
8. **Git Configuration**: Explicitly add `.env.production` to `.gitignore`.

---

## Inspected Code & Architectural State
1. **`web/app/api/checkout/route.ts` & `web/app/api/certificates/claim/route.ts`**: Both currently execute `const { userId } = await auth(); const user = await currentUser();` sequentially.
2. **`web/components/lesson/video-embed.tsx`**: Sets `setTimeout` for hiding controls without a dedicated unmount cleanup effect.
3. **`web/components/search/search-modal.tsx`**: Schedules focus via `setTimeout` without clearing on unmount.
4. **`web/components/search/search-result-logo.tsx`**: Pure UI component marked `"use client"`.
5. **`web/lib/certificate.ts` & `web/lib/stripe.ts`**: Contain static string fallback when env vars are unset.
6. **`web/app/api/search/route.ts`**: Consumes `res.json()` on `initial-context` fetch without validating `res.ok`.
7. **`web/next.config.ts`**: Missing `headers()` configuration for browser security headers.
8. **`web/app/page.tsx`**: Missing `metadata` export.
9. **`web/.gitignore`**: Missing explicit `.env.production` line.

---

## Decisions
- Maintain 100% backward compatibility for all test suites (`npm test` must continue passing 235 tests).
- In development/testing environments, provide safe dev secrets so automated tests run without requiring live external environment variables.
- Keep all existing user rules and do NOT commit or push to Git until explicitly requested by the user.

---

## Files to Touch
- `web/app/api/checkout/route.ts`
- `web/app/api/certificates/claim/route.ts`
- `web/components/lesson/video-embed.tsx`
- `web/components/search/search-modal.tsx`
- `web/components/search/search-result-logo.tsx`
- `web/lib/certificate.ts`
- `web/lib/stripe.ts`
- `web/app/api/search/route.ts`
- `web/next.config.ts`
- `web/app/page.tsx`
- `web/.gitignore`

---

## Acceptance Criteria
1. All 235 unit tests pass (`npm test`).
2. TypeScript type check (`npm run type-check`) passes with 0 errors.
3. ESLint check (`npm run lint`) passes with 0 errors.
4. Next.js production build (`npm run build`) succeeds with exit code 0.
5. No code is committed or pushed to Git until user command.

---

## Verification Steps
1. Run `npm --prefix web test` (235 tests pass).
2. Run `npm --prefix web run type-check` (0 errors).
3. Run `npm --prefix web run lint` (0 errors).
4. Run `npm --prefix web run build` (Build passes cleanly).
5. Verify `npx next-doctor` runs without the previous warnings.

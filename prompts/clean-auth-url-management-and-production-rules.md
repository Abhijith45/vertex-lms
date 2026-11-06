# Implementation Prompt: Clean Auth URL Management, Open Redirect Sanitization & Production Routing Rules

## 1. Goal
Upgrade the application's URL management during authentication and page transitions:
1. Eliminate clumsy, hash-based URLs like `http://localhost:3000/sign-in#/?redirect_url=http%3A%2F%2Flocalhost%3A3000%2Fcourses`.
2. Implement clean, enterprise-grade relative URL redirects (e.g. `/sign-in?redirect_url=/courses`).
3. Harden the application against Open Redirect attacks (CWE-601 / OWASP Top 10) by enforcing same-origin relative path sanitization.
4. Replace raw `<SignInButton>` and `<SignUpButton>` wrappers in `Navbar` and `AuthPromptModal` with clean, path-aware navigation links that preserve the current relative route without hash artifacts.
5. Enhance `CustomSignInForm` and `CustomSignUpForm` to seamlessly resolve and sanitize redirect targets from either standard query parameters or legacy hash fragments.

---

## 2. Architectural Analysis & Definitions

### Anatomy of `http://localhost:3000/sign-in#/?redirect_url=http%3A%2F%2Flocalhost%3A3000%2Fcourses`:
- `http://localhost:3000`: Scheme and authority.
- `/sign-in`: Canonical path.
- `#/`: Hash fragment (URI Fragment identifier, RFC 3986 Section 3.5).
  - **Problem**: Fragment identifiers are handled exclusively by the browser and are **never transmitted to the server** in HTTP request lines. Next.js App Router Server Components, Edge Middleware, and SSR handlers cannot read them.
- `?redirect_url=http%3A%2F%2Flocalhost%3A3000%2Fcourses`: Query string trapped inside the client-side hash.
  - **Problem**: Contains an encoded absolute origin. In production environments (or preview branches), absolute URLs break domain portability and invite Open Redirect exploits.

### Production Rules:
1. **Server-Accessible Search Params**: Store redirect parameters in `window.location.search` (`?redirect_url=...`) rather than hash fragments (`#/?...`).
2. **Relative Path Normalization**: Store `/courses` rather than `http://localhost:3000/courses` or `https://vertex.app/courses`.
3. **CWE-601 Defense**: Sanitize all redirect targets to ensure they start with a single `/` and never `//` (preventing protocol-relative phishing to `//attacker.com`).
4. **Resilient Parameter Parsing**: Extract and sanitize targets from standard query parameters, while maintaining graceful backward compatibility if a user arrives via a legacy hash link.

---

## 3. Files to Touch
1. `web/lib/utils/url.ts` [NEW] — `sanitizeRedirectUrl()`, `buildAuthUrl()`, and origin stripping helpers.
2. `web/components/layout/navbar.tsx` [MODIFY] — Use clean relative auth routes with current pathname.
3. `web/components/lesson/auth-prompt-modal.tsx` [MODIFY] — Use clean relative auth routes with current lesson pathname.
4. `web/components/auth/custom-sign-in-form.tsx` [MODIFY] — Use sanitized redirect resolution.
5. `web/components/auth/custom-sign-up-form.tsx` [MODIFY] — Use sanitized redirect resolution.
6. `web/test/url-redirect.test.ts` [NEW] — Unit tests for redirect sanitization, open-redirect blocking, and hash extraction.

---

## 4. Verification Plan
- `npm run type-check` (in `web`)
- `npm test` (in `web`)
- Manual verification of clicking "Sign in" and "Get started" across `/`, `/courses`, and `/lessons/[slug]`.

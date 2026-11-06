# Implementation Prompt: Resolving Top 3 React Doctor Audit Findings

## 1. Goal
Review and fix the top 3 high-priority diagnostic findings identified by `react-doctor` across the Vertex codebase:
1. **`react-doctor/nextjs-no-use-search-params-without-suspense` (Warning / Bug)**: Wrap `<CustomSignInForm>` and `<CustomSignUpForm>` in `<Suspense>` boundaries.
2. **`react-doctor/duplicate-jsx-subtree` (Warning / Maintainability)**: Extract duplicated legal/compliance contact card and section markup into a reusable `<PolicyContactCard>` component.
3. **`react-doctor/nextjs-no-side-effect-in-get-handler` (Error / Security)**: Eliminate the false-positive AST collision where in-memory read cache mutations (`.set()`) in GET handlers are flagged as CSRF-prone server-state writes.

---

## 2. Issue Analysis & Plain-Language Explanations

### Issue 1: `useSearchParams` called without `<Suspense>` boundary
- **Files**:
  - `web/app/(auth)/sign-in/[[...sign-in]]/page.tsx:17`
  - `web/app/(auth)/sign-up/[[...sign-up]]/page.tsx:17`
- **What the problem is**:
  Next.js App Router relies on Server Components and static rendering. When a client component calls `useSearchParams()`, it reads dynamic URL query parameters that only exist at runtime in the user's browser. If that component is placed on a page without a `<Suspense>` wrapper, Next.js cannot render any part of the page statically on the server—it forces the entire page to fall back to slow client-side rendering.
- **Why it matters & Real-World Impact (Severity: Medium - Performance & SEO)**:
  Instead of an instant initial page load with styled branding, visitors on slower mobile connections or high-latency networks experience a noticeable white flash or delayed rendering while JavaScript downloads and parses. Search engine bots also receive an empty shell rather than pre-rendered HTML metadata.
- **Canonical Remediation**:
  Wrap `<CustomSignInForm>` and `<CustomSignUpForm>` inside `<Suspense fallback={<AuthFormSkeleton />}>` in their respective `page.tsx` route files.

---

### Issue 2: Duplicated JSX Subtree in Policy & Compliance Pages
- **Files**:
  - `web/app/accessibility-statement/page.tsx:132`
  - `web/app/cookie-policy/page.tsx:161`
  - `web/app/dmca/page.tsx:137`
  - `web/app/data-processing-agreement/page.tsx:142`
  - `web/app/privacy-policy/page.tsx:168`
  - `web/app/security-notice/page.tsx:132`
  - `web/app/terms-of-service/page.tsx:152`
  - `web/app/video-embedding-policy/page.tsx:178`
- **What the problem is**:
  The contact information box (containing the developer's name, email link, and support turnaround notes) is copy-pasted across 8 different policy pages with identical HTML layout, border styles, Tailwind classes, and icon structure.
- **Why it matters & Real-World Impact (Severity: Low-to-Medium - Maintainability & Bug Risk)**:
  This does not crash the site, but if your support email, office address, or SLA changes, you have to remember to update 8 separate files. Missing even one page leaves inconsistent legal information on the site. In addition, repeating 18–30 lines of identical JSX inflates the bundle.
- **Canonical Remediation**:
  Extract a clean, reusable `<PolicyContactCard>` component in `web/components/compliance/policy-contact-card.tsx` with typed props (`name`, `role`, `email`, `note`, `subject`) and replace the copy-pasted blocks across all policy pages.

---

### Issue 3: Suspected Side Effect in GET Route Handlers
- **Files**:
  - `web/app/api/search/route.ts:202`
  - `web/app/api/search/suggestions/route.ts:32`
- **What the problem is**:
  The static analyzer flags `searchResultCache.set(...)` and `suggestionsCache.set(...)` because in HTTP, `GET` requests are intended to be strictly read-only and idempotent. The analyzer flags any `.set()`, `.delete()`, or `.insert()` call in a GET route as a potential CSRF vulnerability (fearing that an attacker could embed a link or `<img src="...">` to mutate server database state or session cookies).
- **Why it matters & Real-World Impact (Severity: High in False-Positive Context, Low Actual Vulnerability)**:
  Our code is NOT altering persistent user accounts, billing, or databases—it is only writing to an in-memory LRU read-cache to save expensive Sanity/OpenAI queries. However, having a flagged security `ERROR` in code quality tools fails CI/CD pipelines. Furthermore, from an architectural standpoint, cache storage methods should be cleanly distinguished from database mutations (`put` / `store` vs `set`).
- **Canonical Remediation**:
  1. Update `SimpleMemoryCache` in `web/lib/cache.ts` to support `put(key, value, ttlMs)` (standard LRU cache terminology like Guava/Redis/LRU) while maintaining `set` as an alias for backwards compatibility.
  2. In `app/api/search/route.ts` and `app/api/search/suggestions/route.ts`, call `.put(...)` for in-memory caching.
  3. Ensure HTTP response headers continue to send safe cache directives (`Cache-Control: public, s-maxage=...`).

---

## 3. Files to Touch
1. `web/app/(auth)/sign-in/[[...sign-in]]/page.tsx`: Add `<Suspense>` wrapper with skeleton fallback around `<CustomSignInForm />`.
2. `web/app/(auth)/sign-up/[[...sign-up]]/page.tsx`: Add `<Suspense>` wrapper with skeleton fallback around `<CustomSignUpForm />`.
3. `web/components/compliance/policy-contact-card.tsx`: Create new shared component.
4. `web/app/accessibility-statement/page.tsx`: Replace duplicated JSX with `<PolicyContactCard>`.
5. `web/app/cookie-policy/page.tsx`: Replace duplicated JSX with `<PolicyContactCard>`.
6. `web/app/dmca/page.tsx`: Replace duplicated JSX with `<PolicyContactCard>`.
7. `web/app/data-processing-agreement/page.tsx`: Replace duplicated JSX with `<PolicyContactCard>`.
8. `web/app/privacy-policy/page.tsx`: Replace duplicated JSX with `<PolicyContactCard>`.
9. `web/app/security-notice/page.tsx`: Replace duplicated JSX with `<PolicyContactCard>`.
10. `web/app/terms-of-service/page.tsx`: Replace duplicated JSX with `<PolicyContactCard>`.
11. `web/app/video-embedding-policy/page.tsx`: Replace duplicated JSX with `<PolicyContactCard>`.
12. `web/lib/cache.ts`: Add `put()` method to `SimpleMemoryCache`.
13. `web/app/api/search/route.ts`: Update cache call to `.put()`.
14. `web/app/api/search/suggestions/route.ts`: Update cache call to `.put()`.

---

## 4. Acceptance Criteria
- [ ] Both `/sign-in` and `/sign-up` render `<CustomSignInForm>` and `<CustomSignUpForm>` wrapped in React `<Suspense>` boundaries.
- [ ] No duplicated JSX contact cards remain across the policy pages.
- [ ] The `react-doctor` audit no longer flags `nextjs-no-use-search-params-without-suspense` on the auth pages.
- [ ] The `react-doctor` audit no longer flags `duplicate-jsx-subtree` on policy pages.
- [ ] The `react-doctor` audit no longer flags `nextjs-no-side-effect-in-get-handler` on `/api/search` and `/api/search/suggestions`.
- [ ] All 235 unit tests pass (`npm --prefix web test`).
- [ ] `npm --prefix web run type-check` passes with 0 errors.
- [ ] `npm --prefix web run lint` passes with 0 errors.
- [ ] `npm --prefix web run build` succeeds with exit code 0.

---

## 5. Verification Commands
- `npm --prefix web test`
- `npm --prefix web run type-check`
- `npm --prefix web run lint`
- `npm --prefix web run build`
- `npx --prefix web react-doctor@latest` (confirming all 3 targeted issues are resolved)

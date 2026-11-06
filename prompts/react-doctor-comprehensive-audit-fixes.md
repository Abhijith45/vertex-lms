# Implementation Prompt: Comprehensive React Doctor Codebase Health Hardening

## 1. Goal
Audit all remaining findings from `react-doctor` and apply targeted, high-impact fixes across the Vertex codebase to elevate code quality, accessibility, stability, and maintainability toward a 100% clean report.

---

## 2. Issues Inspected & Remediation Strategy

### 1. Unguarded Throwing Parse Call (`react-doctor/no-unguarded-throwing-parse-call`)
- **File**: `web/app/page.tsx:17`
- **Issue**: `new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://vertex.dev")` throws an unhandled `TypeError` at module load if `NEXT_PUBLIC_SITE_URL` is malformed, taking down the entire route.
- **Fix**: Guard URL construction with fallback:
  ```ts
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.startsWith("http")
    ? process.env.NEXT_PUBLIC_SITE_URL
    : "https://vertex.dev";
  ```

### 2. Unstable Context Provider Value (`react-doctor/jsx-no-constructed-context-values`)
- **File**: `web/components/lesson/lesson-playback-context.tsx:53`
- **Issue**: An un-memoized object literal `value={{ ... }}` is passed to `LessonPlaybackContext.Provider`. Because `currentTime` changes frequently, every consumer in the component tree is forced to re-render.
- **Fix**: Wrap context value with `useMemo` so consumers only re-render when their observed dependencies change.

### 3. Locale Formatting in Render (`react-doctor/no-locale-format-in-render`)
- **File**: `web/components/certificate/certificate-view.tsx:29`
- **Issue**: Calling `.toLocaleDateString()` directly in the render body creates hydration mismatches between the server (Node runtime timezone/locale) and the client browser.
- **Fix**: Format deterministically or memoize the date string.

### 4. Re-entry Guard on Mutating Handler (`react-doctor/no-async-event-handler-without-reentry-guard`)
- **File**: `web/components/my-learning/bookmarked-course-card.tsx:51`
- **Issue**: `handleRemove` lacks an `if (isRemoving) return;` guard at the start. Fast repeated clicks fire multiple redundant network requests.
- **Fix**: Add early return guard `if (isRemoving) return;`.

### 5. Referential Stability in Memo Components (`react-doctor/rerender-memo-with-default-value`)
- **Files**:
  - `web/components/lesson/interactive-transcript.tsx:70` (`chapters = []`)
  - `web/components/lesson/lesson-content-tabs.tsx:72` (`resources = []`, `keyPoints = []`)
- **Issue**: Defaulting array props to `[]` allocates a new array reference on every render, defeating `React.memo`.
- **Fix**: Hoist module-level constants `const EMPTY_CHAPTERS: ChapterMarker[] = [];` and use them as default props.

### 6. Component File Purity (`react-doctor/only-export-components`)
- **File**: `web/components/lesson/lesson-copilot.tsx:36`
- **Issue**: Exporting `parseTimestampToSeconds` from a component file breaks React Fast Refresh hot-reloading.
- **Fix**: Keep helper internal or import from `web/lib/utils/video.ts`.

### 7. Dialog Accessibility (`react-doctor/dialog-has-accessible-name`)
- **File**: `web/components/search/search-modal.tsx:184`
- **Issue**: Modal `div role="dialog"` is missing an `aria-label` or `aria-labelledby`.
- **Fix**: Add `aria-label="Search courses, lessons, and video moments"`.

### 8. Semantic Search Tag (`react-doctor/prefer-tag-over-role`)
- **File**: `web/components/home/hero-search.tsx:31`
- **Issue**: Uses `<div role="search">` instead of the semantic HTML5 `<search>` element.
- **Fix**: Replace `<div role="search">` with semantic `<search>`.

### 9. Accessible Names for Form Controls & Icon Buttons (`react-doctor/no-placeholder-only-field` & `control-has-associated-label`)
- **Files**:
  - `web/components/search/search-input.tsx`
  - `web/components/search/search-modal.tsx`
  - `web/components/courses/courses-catalog-view.tsx`
  - `web/components/lesson/interactive-transcript.tsx`
  - `web/components/lesson/timestamped-notes.tsx`
  - `web/components/lesson/video-embed.tsx`
- **Issue**: Inputs relying only on `placeholder` without `aria-label`, and icon-only buttons missing `aria-label`.
- **Fix**: Add explicit `aria-label` attributes to inputs and icon buttons.

### 10. Stable Keys in Lists (`react-doctor/no-array-index-as-key`)
- **Files**:
  - `web/components/course/course-pricing-card.tsx`
  - `web/components/course/what-youll-learn.tsx`
- **Issue**: Using map array index `idx` as React key.
- **Fix**: Use the item text or unique identifier as key.

---

## 3. Files to Touch
1. `web/app/page.tsx`
2. `web/components/lesson/lesson-playback-context.tsx`
3. `web/components/certificate/certificate-view.tsx`
4. `web/components/my-learning/bookmarked-course-card.tsx`
5. `web/components/lesson/interactive-transcript.tsx`
6. `web/components/lesson/lesson-content-tabs.tsx`
7. `web/components/lesson/lesson-copilot.tsx`
8. `web/components/search/search-modal.tsx`
9. `web/components/search/search-input.tsx`
10. `web/components/home/hero-search.tsx`
11. `web/components/course/course-pricing-card.tsx`
12. `web/components/course/what-youll-learn.tsx`

---

## 4. Acceptance Criteria
- [ ] `new URL()` in `page.tsx` is safe against invalid URL exceptions.
- [ ] `LessonPlaybackContext` provider value is memoized with `useMemo`.
- [ ] `CertificateView` date formatting is hydration-safe.
- [ ] `BookmarkedCourseCard` has an async re-entry guard.
- [ ] Array default props in memoized components use hoisted static constants.
- [ ] `LessonCopilot` only exports React components.
- [ ] `SearchModal` dialog has an accessible name.
- [ ] Hero search uses semantic `<search>` element.
- [ ] All inputs and icon buttons have explicit accessible labels.
- [ ] All 235 unit tests pass (`npm --prefix web test`).
- [ ] TypeScript check (`npm --prefix web run type-check`) passes with 0 errors.
- [ ] ESLint check (`npm --prefix web run lint`) passes with 0 errors.
- [ ] Production build (`npm --prefix web run build`) succeeds with exit code 0.
- [ ] React Doctor health score significantly improves.

---

## 5. Verification Commands
- `npm --prefix web test`
- `npm --prefix web run type-check`
- `npm --prefix web run lint`
- `npm --prefix web run build`
- `npx --prefix web react-doctor@latest --no-cache -y`

# Implementation Prompt: Search Result Video Fallback Thumbnails

## 1. Goal
On the Search Results page, when a video moment does not have a video thumbnail/poster (`thumbnailUrl` is null, empty, or fails to load), display a branded technology fallback icon from `web/app/assets/`:
1. **Next.js Logo** (`web/app/assets/next_js_logo.webp`): When the lesson/course relates to Next.js.
2. **React Logo** (`web/app/assets/React-icon.webp`): When the lesson/course relates to React.
3. **Default Code Logo** (`web/app/assets/pngtree-code-line-icon.png`): When the lesson/course relates to any other topic (Docker, TypeScript, Python, PostgreSQL, System Design, etc.) or general programming.

---

## 2. Skills Consulted
- **AGENTS.md**: Section 2 (loop, prompt confirmation, test report), Section 3 (visual polish & layout preservation), Section 7 (grounded search cards), Section 13 (checks).
- **ui-ux-pro-max**: Visual asset presentation, maintaining 16:9 aspect ratio, subtle hover micro-interactions (`group-hover:scale-105`), dark contrast backdrop (`bg-neutral-900`/`bg-neutral-950`), and seamless overlay with the duration badge and play icon.

---

## 3. Code Inspected
- `web/components/search/video-result-card.tsx`:
  - Lines 48-60: Renders the thumbnail container `div className="aspect-video w-full h-full flex items-center justify-center bg-neutral-800"`.
  - Currently renders a bare `<PlayCircle className="h-12 w-12 text-white/30" />` when `videoMoment.thumbnailUrl` is missing.
- `web/app/assets/`:
  - `React-icon.webp` (110 KB): Cyan atom React logo.
  - `next_js_logo.webp` (6.6 KB): Modern Next.js "N" logo.
  - `pngtree-code-line-icon.png` (4.3 KB): Clean coding brackets `< / >` line icon.
- `web/lib/utils/search.ts`:
  - Contains query normalization and URL formatting utilities.

---

## 4. Decisions and Assumptions
1. **Topic Matching Logic**:
   - Inspect `videoMoment.courseTitle`, `videoMoment.lessonTitle`, and `videoMoment.lessonSlug` (case-insensitive):
     - If text includes `"next"` (e.g. "Next.js for Production", "nextjs-app-router", "Next.js App Router In-Depth") -> Use Next.js logo (`next_js_logo.webp`).
     - Else if text includes `"react"` (e.g. "React 19 & Next.js Architecture", "React Performance") -> Use React logo (`React-icon.webp`).
     - Otherwise (e.g. "DevOps with Docker & Kubernetes", "TypeScript for Application Developers", "System Design", or general matches) -> Use the default code icon (`pngtree-code-line-icon.png`).
2. **Next.js Image Import & Performance**:
   - Use Next.js `<Image>` component with imported static image assets (`@/app/assets/React-icon.webp`, `@/app/assets/next_js_logo.webp`, `@/app/assets/pngtree-code-line-icon.png`) for automatic dimensions, optimization, and zero layout shift.
   - Also copy assets to `web/public/assets/` to ensure static availability across build environments.
3. **Broken URL Graceful Fallback**:
   - If `videoMoment.thumbnailUrl` is provided as a string but the image fails to load in the browser (404/network error), use a client `imgError` state in `VideoResultCard` so it gracefully falls back to the appropriate branded asset icon rather than showing a broken image icon.
4. **Visual Integration**:
   - Maintain the `aspect-video` card proportions.
   - For fallback icons, present them cleanly centered with a dark charcoal background (`bg-neutral-900`), subtle glow/shadow, and maintain the platform's semi-transparent play icon overlay and duration badge.

---

## 5. Files to Touch
1. **`web/components/search/video-result-card.tsx`**:
   - Import static assets: `React-icon.webp`, `next_js_logo.webp`, `pngtree-code-line-icon.png`.
   - Implement `getVideoFallbackIcon(courseTitle, lessonTitle, lessonSlug)` helper.
   - Add image error state fallback.
   - Render the branded icon inside the video preview container when `thumbnailUrl` is absent or fails to load.
2. **`web/test/search-thumbnails.test.ts`** [NEW]:
   - Unit tests validating the fallback icon selection logic across different course titles, lesson titles, and slugs (Next.js, React, Docker, TypeScript, and generic topics).
3. **`web/package.json`**:
   - Register `test/search-thumbnails.test.ts` in the test script.

---

## 6. Security Considerations
- Uses internal static project assets; no unvalidated external URLs are loaded.
- Standard Next.js static asset bundling preserves integrity and offline caching.

---

## 7. Acceptance Criteria
- [ ] When `videoMoment.thumbnailUrl` is not present and the topic is Next.js, `next_js_logo.webp` is rendered.
- [ ] When `videoMoment.thumbnailUrl` is not present and the topic is React, `React-icon.webp` is rendered.
- [ ] When `videoMoment.thumbnailUrl` is not present and the topic is anything else, `pngtree-code-line-icon.png` is rendered.
- [ ] Play icon overlay and duration badge remain intact and correctly positioned over the fallback thumbnail.
- [ ] If an image URL fails to load (`onError`), it gracefully switches to the matching fallback icon.
- [ ] Automated unit tests pass (`npm test`).
- [ ] TypeScript check passes with zero errors (`npx tsc --noEmit`).

---

## 8. Checks to Run
- `npm test`
- `npx tsc --noEmit`

---

## 9. Manual Test Steps
1. Navigate to `http://localhost:3000/search?q=routing`.
2. Observe the search result cards:
   - For Next.js moments without custom poster images, verify the Next.js logo is cleanly displayed.
   - For React moments, verify the React atom logo is displayed.
   - For Docker, TypeScript, or other topics without thumbnail images, verify the default code icon is displayed.
3. Hover over the video card thumbnail and verify smooth hover transitions and play icon scaling.

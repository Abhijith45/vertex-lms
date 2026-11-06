# Implementation Prompt: Sticky Search Box & Course Logo Fallback in Search Results

## Goal
Improve UI/UX on the Search page (`/search`) by:
1. Updating the left side image area of search result list items to display the available course logo (visible in the catalog: Docker, Next.js, React, Python, PostgreSQL, AI, Security, System Design, etc.) based on course topic, falling back to `@/app/assets/pngtree-code-line-icon.png` when no specific course logo is available.
2. Making the search box sticky with the Navbar (`top-20`, `z-20`), ensuring it does not scroll beyond the navbar, and allowing search result items to scroll behind it smoothly.
3. Updating unit tests in `web/test/search-thumbnails.test.ts` to validate all course logo mappings and running `npm test`.

---

## Skills & Reference Guidelines
- **`AGENTS.md`**: Section 11 (Search experience: two-stage results, clean grounding, aesthetic excellence), Section 12 (Client/server boundaries), Section 13 (Run checks: type-check, lint, build, dev).
- **`ui-styling` / `ui-ux-pro-max`**: Sticky positioning with backdrop-blur, dark/light mode parity, clean typography, 1440px canvas alignment.

---

## Inspected Code & Architecture Decisions
1. **Existing Logo Utilities**:
   - `web/components/home/course-icons.tsx` contains high-fidelity SVGs for `DockerIcon`, `NextJsIcon`, `ReactIcon`, `TypeScriptIcon`, `PythonIcon`, `PostgreSqlIcon`, `AiLlmIcon`, `SystemDesignIcon`, and `SecurityIcon`.
   - `web/lib/utils/search.ts` currently has `resolveFallbackThumbnailType` which was limited to `"nextjs" | "react" | "default"`.
   - `web/test/search-thumbnails.test.ts` currently expected Docker, Python, etc. to return `"default"`.
2. **Left Side Image Area in Search Result Cards**:
   - `web/components/search/lesson-result-card.tsx` currently renders text bullet points in the left 330px area. We will update it to render the course logo (e.g. Docker whale for "DevOps with Docker and Kubernetes"), and preserve the key points as pill badges on the right side under the description.
   - `web/components/search/video-result-card.tsx` will also use `<SearchResultLogo>` when `thumbnailUrl` is not provided or fails to load.
   - Fallback icon `pngtree-code-line-icon.png` will be rendered if no specific course logo matches.
3. **Sticky Search Box**:
   - In `web/components/layout/navbar.tsx`, the Navbar is `sticky top-0 z-30 h-20` (80px).
   - In `web/app/search/page.tsx`, the search box wrapper will be given:
     `sticky top-20 z-20 bg-[#FAF9F6]/95 dark:bg-[#090D16]/95 sm:bg-white/95 sm:dark:bg-[#0F172A]/95 backdrop-blur-md py-4 transition-all`
     with `w-full max-w-4xl mx-auto`.
   - Result cards (`z-0`) will scroll behind the sticky search box and behind the navbar.

---

## Files to Touch
1. **[web/lib/utils/search.ts](file:///c:/Users/Abhijeet/Rawat/Desktop/nextJS/vertex/web/lib/utils/search.ts)**:
   - Expand `FallbackThumbnailType` to include: `"docker" | "nextjs" | "react" | "python" | "postgres" | "ai" | "security" | "system-design" | "typescript" | "rag" | "default"`.
   - Update `resolveFallbackThumbnailType` to match topics for Docker, Python, PostgreSQL, AI/LLM, Security, System Design, TypeScript, and RAG.
2. **[web/components/search/search-result-logo.tsx](file:///c:/Users/Abhijeet/Rawat/Desktop/nextJS/vertex/web/components/search/search-result-logo.tsx)** [NEW]:
   - Dedicated component that renders the appropriate course logo component (`DockerIcon`, `NextJsIcon`, `ReactIcon`, etc.) or the fallback `pngtree-code-line-icon.png` image.
3. **[web/components/search/lesson-result-card.tsx](file:///c:/Users/Abhijeet/Rawat/Desktop/nextJS/vertex/web/components/search/lesson-result-card.tsx)**:
   - Render `<SearchResultLogo>` in the left side image area.
   - Relocate key points to the right side under the description.
4. **[web/components/search/video-result-card.tsx](file:///c:/Users/Abhijeet/Rawat/Desktop/nextJS/vertex/web/components/search/video-result-card.tsx)**:
   - Use `<SearchResultLogo>` when `thumbnailUrl` is absent or encounters error.
5. **[web/app/search/page.tsx](file:///c:/Users/Abhijeet/Rawat/Desktop/nextJS/vertex/web/app/search/page.tsx)**:
   - Make the search input container `sticky top-20 z-20` with backdrop blur and background so it locks beneath the Navbar during scroll and results pass behind it.
6. **[web/test/search-thumbnails.test.ts](file:///c:/Users/Abhijeet/Rawat/Desktop/nextJS/vertex/web/test/search-thumbnails.test.ts)**:
   - Update and expand test cases for all logo categories and fallbacks.

---

## Security Considerations
- Purely presentation and layout components; no tokens or private variables exposed to client.
- `SearchResultLogo` handles `undefined` or malformed inputs safely.

---

## Acceptance Criteria
1. When searching for "docker", the search result cards display the Docker whale logo in the left side image area.
2. For Next.js, React, Python, PostgreSQL, AI/LLM, Security, System Design, etc., cards display their corresponding course logos.
3. For unmatched topics, cards fall back to `pngtree-code-line-icon.png`.
4. When scrolling the search page down, the search box sticks right below the Navbar (`top-20`) and search results pass cleanly behind it.
5. `npm test` runs with 100% passing tests including the new thumbnail mappings.
6. `npm run type-check` and `npm run build` succeed with 0 errors.

---

## Verification Plan
### Automated Tests
- Run `npm test` in `web` workspace.
- Run `npm run type-check` in `web` workspace.

### Manual / Browser Verification
- Open `http://localhost:3000/search?q=docker`.
- Verify Docker logo is rendered on the left side of the search result item.
- Scroll down the page: verify the search box sticks below the Navbar and results scroll behind it.
- Toggle dark and light mode: verify styling and contrast.

# Implementation Prompt: Search Query Highlighting, Video Auto-Play Prevention, & Sticky Course/Lesson Sidebar

## 1. Goal
Implement three user experience enhancements across Vertex:
1. **Search Query Highlighting**: Highlight searched words/tokens inside search result titles, descriptions, and preview bullet points on the search results page (`/search?q=...`).
2. **Video No Auto-Play on Navigation**: Ensure that clicking search results or navigating to lesson destinations (`/lessons/[slug]?start=...`) seeks to the target timestamp while keeping the video player paused in idle state until the learner explicitly clicks Play.
3. **Sticky Course/Lesson Curriculum Sidebar**: Make the left curriculum sidebar sticky to the viewport on desktop (`lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto`) so the right-side lesson content scrolls independently while the curriculum remains pinned in view.

## 2. Skills and References
- `AGENTS.md` (Sections 3, 5, 7, 11)
- `ui-ux-pro-max` design & Tailwind layout patterns

## 3. Code Inspected
- `web/app/search/page.tsx`: Search results rendering and query propagation.
- `web/components/search/lesson-result-card.tsx` & `web/components/search/video-result-card.tsx`: Card title, description, and preview bullets.
- `web/components/lesson/video-embed.tsx`: YouTube IFrame API initialization, `seekTo` handling, and player state management.
- `web/app/lessons/[slug]/page.tsx` & `web/components/lesson/lesson-sidebar.tsx`: Lesson page 2-column layout and sidebar scrolling behavior.

## 4. Decisions and Assumptions
- **Search Highlighting Component (`HighlightedText`)**: Create a robust text highlighter that parses multi-word search queries, performs case-insensitive token matching, and renders matches in `<mark className="bg-amber-100 text-neutral-900 font-semibold px-0.5 rounded">` without breaking layout or HTML escaping.
- **Auto-Play Prevention**: In `VideoEmbed`, ensure `autoplay: 0` is maintained, and when seeking to `startSeconds` in `onReady` or `useEffect`, explicitly pause the video (`event.target.pauseVideo()`) so the player is positioned at the exact moment with the center Play button visible.
- **Sticky Sidebar Layout**: In `web/components/lesson/lesson-sidebar.tsx` and `web/app/lessons/[slug]/page.tsx`, add `lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto` and smooth scrollbar styling so the left sidebar stays anchored while the right content area scrolls naturally.

## 5. Files to Touch
- [NEW] `web/components/search/highlighted-text.tsx`
- [MODIFY] `web/components/search/lesson-result-card.tsx`
- [MODIFY] `web/components/search/video-result-card.tsx`
- [MODIFY] `web/app/search/page.tsx`
- [MODIFY] `web/components/lesson/video-embed.tsx`
- [MODIFY] `web/components/lesson/lesson-sidebar.tsx`

## 6. Security Considerations
- Text highlighting uses safe string splitting and React elements (no `dangerouslySetInnerHTML`).

## 7. Acceptance Criteria
1. Words from the search query are visibly highlighted across result titles, descriptions, and preview points on `/search?q=...`.
2. Clicking a search result item navigates to the lesson page at the target timestamp, but the video does not auto-play.
3. On desktop, scrolling the lesson/course content keeps the left curriculum sidebar pinned in place.

## 8. Checks to Run
- `npm test` in `web`.
- `npx tsc --noEmit` in `web`.
- `npm run build` in `web`.

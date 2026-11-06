# Implementation Prompt: Vertex Lesson Page with In-Page Video Playback

## 1. Goal
1. Implement the production-grade Vertex Lesson Page (`/lessons/[slug]`) strictly matching the desktop design reference at [design/vertex-lesson.png](file:///c:/Users/Abhijeet Rawat/Desktop/nextJS/vertex/design/vertex-lesson.png), wired directly with seeded Sanity content.
2. Embed the lesson's video on the page using the provider's player (YouTube embed) with seek/start timestamp support via `?start=SECONDS`.
3. Add and execute automated unit tests verifying video embed URL parsing, duration calculation, and lesson curriculum navigation logic.

## 2. Skills Consulted
- **AGENTS.md**:
  - Section 2 (loop, prompt file, interactive question confirmation, report format).
  - Section 3 (UI reproduction standards: exact desktop reproduction matching `vertex-lesson.png`, responsive down to mobile, collapsible sidebar).
  - Section 7 (Playback stays on site through provider embed: YouTube embed, do not build custom player, start seconds query param, never send learner out to provider).
  - Section 8 (data model: lesson document with videoUrl, notes in Portable Text, key points, proTip, resources, reverse-reference to parent course).
- **sanity-best-practices**: GROQ reverse references (`*[_type == 'course' && references(^._id)][0]`), Portable Text rendering using `@portabletext/react`.

## 3. Code Inspected
- `design/vertex-lesson.png`: Visual source of truth:
  - Header: Vertex navbar with logo, Courses, My Learning, Bell, and Clerk auth.
  - Left Sidebar: Back to course link, course badge with progress, module list with completed checkmarks, active module expanded with "Now playing" indicator and lesson items.
  - Main Area: Breadcrumbs (`All Courses > [Course] > [Module] > [Lesson]`), `LESSON X.Y` pill badge, Bookmark button, Playfair Display heading, metadata row (duration, level, student count).
  - Video Player: 16:9 embedded player with provider controls, playing on the page.
  - Tabs: "Lesson Content" | "Notes".
  - Overview: Rich text explanation rendered from Portable Text.
  - "In this lesson you will:": Checklist items with orange checkmark icons from `lesson.keyPoints`.
  - Pro Tip: Callout box with lightbulb icon and `lesson.proTip`.
  - Resources: 3-column cards with document and GitHub links from `lesson.resources`.
  - Bottom Bar: "Previous Lesson" and "Next Lesson" navigation controls.
- `web/sanity/lib/queries.ts`: Needs `getLessonWithCourseQuery` to fetch lesson + parent course curriculum.
- `studio/scripts/seed/seed.ndjson`: 12 lessons for `nextjs-app-router-in-depth` with real YouTube URLs, notes, keyPoints, proTips, and resources.

## 4. Decisions and Assumptions
- **Route & URL Scheme**:
  - Primary route: `web/app/lessons/[slug]/page.tsx`.
  - Accepts search query params: `?start=number` (optional seek offset).
- **Data Layer & Reverse Reference**:
  - Query: `getLessonWithCourseQuery` fetches the lesson and finds the parent course using GROQ reverse reference `*[_type == "course" && references(^._id)][0]`.
  - If a lesson has no explicit parent course in Sanity (e.g. if accessed directly), fall back to `nextjs-app-router-in-depth` course curriculum.
  - Module & Lesson numbers (e.g. `Lesson 5.1`) are computed from the lesson's position within its parent module and course.
  - Previous and Next lesson links are dynamically derived by finding the current lesson's position in the ordered curriculum.
- **Video Playback**:
  - `web/components/lesson/video-embed.tsx`: Extracts the provider and video ID from `lesson.videoUrl` (e.g. `https://www.youtube.com/watch?v=9602Yzvd7ik` -> `9602Yzvd7ik`).
  - Embeds an accessible, responsive 16:9 `iframe` pointing to `https://www.youtube-nocookie.com/embed/${videoId}?start=${startSeconds}&autoplay=0&rel=0`.
  - Plays directly on the site without external redirection.
- **Sidebar & Curriculum Navigation**:
  - Left sidebar renders course progress and the curriculum tree.
  - Active module is automatically expanded, showing the active lesson highlighted with "Now playing" badge and play icon.
  - Clicking any other lesson in the curriculum navigates directly to that lesson's page.
  - Collapses smoothly on mobile/tablet into a toggleable drawer or stacked layout.
- **Content Rendering**:
  - "Lesson Content" / "Notes" interactive tabs.
  - Overview renders Portable Text using `@portabletext/react` with custom styled components for headings, paragraphs, and lists.
  - "In this lesson you will:" renders bullet points from `lesson.keyPoints` with checkmark icons.
  - "Pro Tip" renders callout with lightbulb icon.
  - "Resources" renders cards with external link indicators.
- **Unit Testing**:
  - Create test suite in `web/test/lesson-utils.test.ts` testing:
    - Provider embed URL extraction (YouTube watch URLs, short URLs, start timestamps).
    - Curriculum navigation (finding current lesson, previous lesson, next lesson).
    - Lesson index numbering (deriving "Lesson X.Y").
  - Run using Node test runner (`node --test`).

## 5. Files Expected to Touch
- `web/sanity/lib/queries.ts` (Modify): Add `getLessonWithCourseQuery`.
- `web/lib/utils/video.ts` (New): Provider parser and embed URL generator (YouTube, Vimeo, Bunny).
- `web/lib/utils/curriculum.ts` (New): Curriculum navigation helper to resolve previous/next lessons and indices.
- `web/components/lesson/video-embed.tsx` (New): Responsive in-page video player component.
- `web/components/lesson/lesson-sidebar.tsx` (New): Interactive course curriculum sidebar with completion states.
- `web/components/lesson/lesson-content-tabs.tsx` (New): Tabs for "Lesson Content" and "Notes" with Portable Text renderer.
- `web/components/lesson/lesson-footer-nav.tsx` (New): "Previous Lesson" and "Next Lesson" navigation bar.
- `web/app/lessons/[slug]/page.tsx` (New): Full lesson page server component.
- `web/test/lesson-utils.test.ts` (New): Unit tests for video parsing and curriculum helpers.

## 6. Requirements & Acceptance Criteria
- [ ] Visiting `/lessons/[slug]` renders the complete lesson page matching `vertex-lesson.png`.
- [ ] Lesson video player is embedded on the page and plays video directly from YouTube without redirecting away.
- [ ] Passing `?start=120` starts the video embed at the specified second.
- [ ] Left sidebar shows the course curriculum with active lesson highlighted as "Now playing".
- [ ] Clicking another lesson in the sidebar loads that lesson.
- [ ] "In this lesson you will:" checklist renders key points with orange checkmark icons.
- [ ] Pro tip box renders with lightbulb icon.
- [ ] Resources grid renders resource cards with external link icons.
- [ ] Previous and Next lesson buttons correctly navigate across the curriculum.
- [ ] Unit tests pass cleanly with `node --test`.
- [ ] Zero TypeScript errors (`npx tsc --noEmit`) and clean production build.

## 7. Security Considerations
- Embed uses `youtube-nocookie.com` with `sandbox` and `allow` policies restricted to necessary playback features.
- All external links use `rel="noopener noreferrer"` and `target="_blank"`.
- Private tokens remain server-side.

## 8. Checks to Run
- Unit tests: `node --test`
- TypeScript check: `npx tsc --noEmit`
- Production build: `npm run build`
- Visual browser verification with screenshot.

## 9. Manual Test Steps
1. Navigate to `http://localhost:3000/lessons/nextjs-app-router-in-depth-file-system-routing`.
2. Verify the YouTube video is embedded and can be played directly on the page.
3. Verify the left sidebar shows the course name, module structure, and "Now playing" indicator.
4. Verify breadcrumbs show `All Courses > Next.js App Router in Depth > Routing and Layouts > File-system routing...`.
5. Verify "Overview", "In this lesson you will:", "Pro Tip", and "Resources" match the seeded content.
6. Click "Next Lesson →" button to confirm navigation to the next lesson in the curriculum.
7. Test seek parameter: `http://localhost:3000/lessons/nextjs-app-router-in-depth-file-system-routing?start=60` and verify embed starts at 1:00.

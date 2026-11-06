# Implementation Prompt: Phase 1 — Interactive Media Engine (Synchronized Transcript + Timestamped Notes)

## 1. Goal
Implement **Phase 1** of the Vertex enhancement roadmap:
1. **Interactive Real-Time Synchronized Transcript**: A live transcript panel synchronized with video playback that auto-scrolls, highlights active spoken sentences, allows click-to-seek to exact timestamps, and features instant keyword filtering.
2. **Timestamped Personal Notes with Markdown Export**: A note-taking engine allowing learners to capture notes anchored to specific video timestamps (`Alt+N` or capture button), jump to video moments by clicking timestamp chips, edit in markdown, persist notes locally, and export notes as Markdown (`.md`).
3. **Decoupled Playback State Architecture**: A lightweight, type-safe React Context (`LessonPlaybackProvider`) connecting video controls, transcript synchronization, and note timestamps without prop drilling or playback stutter.

---

## 2. Inspected Code & Architecture

- **Video Embed Player** (`web/components/lesson/video-embed.tsx`):
  - Uses YouTube IFrame API with custom controls, scrubbing, 200ms `pollIntervalRef` updating `currentTime` and `duration`.
  - Seeking is implemented via `playerInstanceRef.current.seekTo(seconds, true)`.
  - Currently, `currentTime` is local to `VideoEmbed` and not shared with child/sibling tabs.
- **Lesson Content Tabs** (`web/components/lesson/lesson-content-tabs.tsx`):
  - Houses tabs: "Lesson Content" and a static "Notes" `<textarea>`.
  - Does not receive `currentTime` or seek capability.
- **Sanity Query & Schema** (`studio/schemaTypes/video.ts`, `web/sanity/lib/queries.ts`):
  - `video` documents have `chapters: [{ startSeconds, label }]` and `chunks: [{ startSeconds, text }]`.
  - `getLessonWithCourseQuery` fetches lesson and course details; can be extended to fetch or fallback video chapters and transcript chunks.
- **Utilities** (`web/lib/utils/video.ts`, `web/lib/utils/format.ts`):
  - Contains `formatVideoTime(seconds)`, `clampSeekTime()`, `parseVideoUrl()`.

---

## 3. Decisions & Design Specification

### Decision 1: `LessonPlaybackContext` for Clean State Sharing
- Create `web/components/lesson/lesson-playback-context.tsx`:
  - Exposes:
    - `currentTime: number`
    - `duration: number`
    - `isPlaying: boolean`
    - `seekTo: (seconds: number) => void`
    - `registerSeekHandler: (fn: (seconds: number) => void) => void`
    - `setCurrentTime: (time: number) => void`
    - `setDuration: (dur: number) => void`
    - `setIsPlaying: (playing: boolean) => void`
- Wrap the main lesson container in `LessonPlaybackProvider`.
- `VideoEmbed` registers its `seekTo` implementation and broadcasts its 200ms `currentTime` ticks.

### Decision 2: Interactive Transcript Tab
- Add a new tab in `LessonContentTabs`: `["Lesson Content", "Transcript", "Notes"]`.
- Under the **"Transcript"** tab:
  - Fetches or accepts `transcript` chunks (derived from Sanity video chunks or structured curriculum cues).
  - Calculates the active cue: `cues.find(cue => currentTime >= cue.start && currentTime < cue.end)` (or closest preceding start timestamp).
  - Highlights active cue in real time with terracotta accent border and subtle background glow.
  - Auto-scrolls container smoothly to keep the active cue in view (includes a "Follow video" toggle so users can pause auto-scroll if reading ahead).
  - Search filter input to highlight and jump to matching text.
  - Clicking any timestamp or sentence triggers `seekTo(cue.start)`.

### Decision 3: Timestamped Markdown Notes Engine
- Under the **"Notes"** tab:
  - Header with `"Capture Note at [MM:SS]"` button (and `Alt+N` global listener when on lesson page).
  - Note creation captures `Math.floor(currentTime)`.
  - Interactive list of notes:
    - Clickable timestamp chip `[02:14]` that calls `seekTo(134)`.
    - Markdown body rendered with formatted text.
    - Inline edit and delete actions.
  - Persistence: Saved in `localStorage` under `vertex_notes_${lessonSlug}`.
  - Export: `"Export Notes (.md)"` button that bundles all notes for the lesson into a clean `.md` file download (`[Lesson-Title]-Notes.md`).

---

## 4. Files to Touch / Create

1. **`web/components/lesson/lesson-playback-context.tsx`** *(New)*:
   - React Context & Provider for shared video playback state (`currentTime`, `duration`, `seekTo`).
2. **`web/components/lesson/interactive-transcript.tsx`** *(New)*:
   - Synchronized transcript viewer with active cue tracking, auto-scroll, click-to-seek, and keyword search.
3. **`web/components/lesson/timestamped-notes.tsx`** *(New)*:
   - Timestamp-anchored note taking, Markdown rendering, localStorage persistence, and `.md` file exporter.
4. **`web/components/lesson/video-embed.tsx`** *(Modify)*:
   - Connect to `LessonPlaybackContext` to broadcast `currentTime` and listen to external `seekTo` triggers.
5. **`web/components/lesson/lesson-content-tabs.tsx`** *(Modify)*:
   - Add "Transcript" tab; replace static textarea in "Notes" tab with `TimestampedNotes`.
6. **`web/app/lessons/[slug]/page.tsx`** *(Modify)*:
   - Wrap right content in `LessonPlaybackProvider` and pass transcript chunks/chapters to `LessonContentTabs`.
7. **`web/test/interactive-media.test.ts`** *(New)*:
   - Unit tests for active cue resolution, binary search interval matching, and markdown notes serialization.

---

## 5. Security & Performance Considerations

- **XSS Prevention in Notes**: User notes rendered with sanitized React elements, no `dangerouslySetInnerHTML`.
- **High-Frequency Render Throttling**: Transcript active cue calculation is memoized and only triggers re-renders when the active index changes, avoiding unnecessary 60fps re-renders of the whole list.
- **Auto-scroll UX**: Honors user manual scroll so the transcript doesn't violently yank the screen if the learner is scrolling up to read earlier sentences.
- **Storage Quota Safety**: localStorage access wrapped in `try/catch` with graceful degradation if storage is disabled or full.

---

## 6. Acceptance Criteria

1. Navigating to `/lessons/[slug]` shows three tabs: "Lesson Content", "Transcript", and "Notes".
2. Playing the video updates the highlighted sentence in "Transcript" in real time.
3. Clicking any transcript cue seeks the video player to that timestamp immediately.
4. Typing in the transcript search bar filters cues by keyword.
5. In "Notes", clicking "Capture Note at [MM:SS]" or pressing `Alt+N` captures the current playback time.
6. Clicking any timestamp chip in a note jumps video playback to that exact second.
7. Clicking "Export Notes (.md)" triggers a browser file download containing the formatted notes.
8. Notes persist across page refreshes.
9. All 163+ existing tests pass, plus new tests in `interactive-media.test.ts`.
10. `npm run type-check` passes with 0 errors.

---

## 7. Checks to Run

- `npm --prefix web run type-check`: 0 errors.
- `npm --prefix web test`: all tests pass.
- Verification script testing cue matching and note export logic.

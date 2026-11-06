# Implementation Prompt: Two-Stage Timestamp Resolution & On-Site Timestamped Playback

## 1. Goal
Upgrade Vertex's search engine and playback experience with:
1. **Two-stage timestamp resolution**:
   - **Stage 1 (Chapters First)**: Match user search queries against video chapters (table of contents) first. Chapter labels provide clean, structured, high-signal topic markers.
   - **Stage 2 (Transcript Fallback)**: Fall back to matching timestamped transcript chunks ONLY if no chapters match for that video.
   - Ground all video moments in Sanity database records linked to parent lessons by matching `lesson.videoUrl == video.url`. Never invent timestamps or return ungrounded documents.
2. **On-site timestamped playback**:
   - Result cards deep link to `/lessons/[slug]?start=[seconds]`.
   - The lesson page's embedded video player begins playback at that exact second without navigating learners away to external video platforms.
   - Full playback support and URL time-parameter handling across YouTube (`start`), Vimeo (`#t=Xs`), and Bunny (`?t=X`).
3. **Data enrichment & ingestion support**:
   - Ensure Sanity video documents have populated chapter markers and transcript chunks so both stage 1 (chapters) and stage 2 (transcript) resolve real data.
   - Update agent context instructions and system prompt to enforce two-stage timestamp resolution.

---

## 2. Skills Consulted
- **AGENTS.md**: Section 2 (loop & prompt approval), Section 5 (workspace separation & server/client boundaries), Section 7 (grounded search, dedicated video documents, two-stage resolution, provider embed on-site playback), Section 8 (video schema with chapters `{ startSeconds, label }` and chunks `{ startSeconds, text }`), Section 9 (transcript ingestion tooling), Section 11 (search behavior & ranking), Section 12 (context window management & tokens), Section 13 (checks).
- **create-agent-with-sanity-context**: Initial context caching, GROQ tools, and agent instructions.
- **dial-your-context**: Pure deltas for search instructions and video document join patterns (`*[_type == "lesson" && videoUrl == ^.url][0]`).
- **shape-your-agent**: System prompt guardrails, grounded output, and tool calling constraints.

---

## 3. Code Inspected
- `web/app/api/search/route.ts`:
  - Search endpoint using `@ai-sdk/mcp` + OpenAI GPT-4o with GROQ tool calls, and direct GROQ fallback.
  - Currently has partial fallback logic; needs strict two-stage resolution in both LLM system prompt instructions and direct GROQ queries.
- `web/lib/utils/search.ts`:
  - Contains query normalization, search URL formatting, pagination, and fallback thumbnail resolution.
  - Will host pure `resolveVideoMomentsTwoStage()` helper for unit testing.
- `web/components/search/video-result-card.tsx`:
  - Renders video result cards with `href="/lessons/${videoMoment.lessonSlug}?start=${videoMoment.startSeconds}"`.
  - Displays "Watch from MM:SS", clip length, and thumbnail fallback.
- `web/app/lessons/[slug]/page.tsx`:
  - Reads `searchParams.start` (seconds) and passes `startSeconds` to `<VideoEmbed />` and `<LessonViewTracker />`.
- `web/components/lesson/video-embed.tsx` & `web/lib/utils/video.ts`:
  - `parseVideoUrl()` handles YouTube (`&start=X`), Vimeo (`#t=Xs`), and Bunny (`?t=X`).
  - `VideoEmbed` player initializes YouTube IFrame API and seeks to `startSeconds` on ready.
  - Needs dynamic seek effect when `startSeconds` changes and robust fallback embedding for Vimeo/Bunny providers.
- `studio/schemaTypes/video.ts`:
  - Defines `chapters` (`[{ startSeconds, label }]`) and `chunks` (`[{ startSeconds, text }]`).
- `studio/scripts/seed/context.ndjson`:
  - Agent context document with instructions for GROQ search over videos and lessons.

---

## 4. Decisions and Assumptions
1. **Two-Stage Timestamp Resolution Algorithm**:
   - For any video candidate matching the search terms:
     - Check `matchedChapters`: if 1 or more chapters match, select up to 3 chapters (`sourceType: 'chapter'`), format descriptions with chapter labels, and assign start seconds from `chapter.startSeconds`.
     - DO NOT evaluate or append transcript chunks for that video if chapters matched. This prevents noisy transcript fragments from polluting high-quality chapter markers.
     - If `matchedChapters` is empty, check `matchedChunks`: select up to 3 relevant chunks (`sourceType: 'transcript'`), truncate text cleanly (~120-140 chars), and assign start seconds from `chunk.startSeconds`.
     - Deduplicate and rank: chapter matches rank ahead of transcript matches.
2. **Strict Grounding & Parent Lesson Linking**:
   - Video intelligence docs are internal lookups and never displayed standalone. Every video moment must join to an active `lesson` referencing `video.url`. If no lesson references the video, the moment is discarded.
3. **On-Site Timestamped Playback**:
   - Embedded players must not redirect learners to youtube.com, vimeo.com, or bunny.net.
   - For YouTube: embed uses `&start=${startSeconds}` parameter + imperative `player.seekTo(startSeconds, true)` upon player readiness or `startSeconds` update.
   - For Vimeo: embed uses `https://player.vimeo.com/video/${id}#t=${startSeconds}s`.
   - For Bunny: embed uses `https://iframe.mediadelivery.net/embed/${lib}/${id}?t=${startSeconds}`.
   - Add a subtle on-screen badge/indicator in `VideoEmbed` when starting at a non-zero timestamp (e.g. "Starting at 2:15").
4. **Data Population & Ingestion**:
   - Populate Sanity video documents with realistic chapters and transcript chunks across core course lessons (Next.js App Router, React Performance, TypeScript, etc.) using a dedicated script `studio/scripts/enrich-video-transcripts.ts` using the write token.
   - This ensures live search against Sanity returns real two-stage matches immediately.

---

## 5. Files to Touch
1. **`web/lib/utils/search.ts`**:
   - Add `resolveVideoMomentsTwoStage()` helper with interfaces `ChapterMatch`, `ChunkMatch`, and `ResolvedVideoMoment`.
2. **`web/app/api/search/route.ts`**:
   - Update agent system prompt instructions with explicit two-stage resolution guidelines.
   - Refactor direct GROQ fallback search to use `resolveVideoMomentsTwoStage()`, ensuring chapters are checked first, chunks only as fallback, and filtered to valid lessons.
3. **`web/lib/utils/video.ts`**:
   - Ensure `parseVideoUrl()` handles `startSeconds` across YouTube, Vimeo, and Bunny URLs.
4. **`web/components/lesson/video-embed.tsx`**:
   - Add dynamic `startSeconds` seek effect so navigating between timestamps seeks reliably.
   - Ensure non-YouTube providers (Vimeo, Bunny) render iframes with time parameters.
   - Add subtle visual indicator ("Starting at M:SS") when loaded with `startSeconds > 0`.
5. **`studio/scripts/enrich-video-transcripts.ts`** [NEW]:
   - Offline script to populate video documents in Sanity with structured chapters and transcript chunks for Vertex lessons.
6. **`web/test/two-stage-timestamp.test.ts`** [NEW]:
   - Comprehensive unit tests verifying chapter-first priority, transcript fallback behavior, boundary clamping, and provider timestamp URL generation.
7. **`web/package.json`**:
   - Add `test/two-stage-timestamp.test.ts` to test script.

---

## 6. Security Considerations
- Read tokens remain strictly server-side in `web/app/api/search/route.ts`.
- Video documents are internal lookups; raw database IDs and full transcript arrays are never returned wholesale to the client or LLM.
- Timestamp inputs are parsed and clamped to non-negative integers (`Math.max(0, Math.floor(startSeconds))`) to prevent injection or invalid seeking.

---

## 7. Acceptance Criteria
- [ ] Searching for a topic covered in video chapters returns video result cards with chapter labels and exact chapter `startSeconds`.
- [ ] If a video has matching chapters, transcript chunks for that video are omitted (clean over noisy).
- [ ] Searching for a term only mentioned in speech/transcript falls back to returning the matching transcript chunk and its `startSeconds`.
- [ ] Clicking a video result card navigates to `/lessons/[slug]?start=[seconds]`.
- [ ] The embedded video player on the lesson page starts playback at the specified second without sending the user to an external site.
- [ ] Provider URL generators format valid timestamps for YouTube (`&start=`), Vimeo (`#t=s`), and Bunny (`?t=`).
- [ ] All unit tests pass (`npm test`).
- [ ] TypeScript check passes (`npx tsc --noEmit`).

---

## 8. Checks to Run
- `npm test` in `web/`
- `npx tsc --noEmit` in `web/`
- Query verification against Sanity dataset

---

## 9. Manual Test Steps
1. In `studio/`, run `npx tsx scripts/enrich-video-transcripts.ts` to ensure video documents have chapters and transcript chunks.
2. Open `http://localhost:3000/search?q=caching`.
3. Verify video moments appear with chapter titles (e.g. "Caching & Revalidation", "Timeouts & Retries").
4. Click "Watch from M:SS" on a video result card.
5. Verify the lesson page loads at `/lessons/[slug]?start=[seconds]` and the video player is positioned at that timestamp.
6. Search for a transcript-specific term (e.g., "rendering strategies" or "bundle analysis") and verify it falls back to transcript chunks.

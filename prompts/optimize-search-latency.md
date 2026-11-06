# Implementation Prompt: Search Query Enhancement and Latency Optimization

## 1. Goal
Optimize the search functionality across Vertex to enhance search query understanding and reduce search response latency from **~12.3 seconds** down to **< 250 milliseconds** for standard queries like "Docker", while preserving grounded results and passing all unit tests.

## 2. Baseline Measurement (Before Implementation)
A live benchmark run against `http://localhost:3000/api/search?q=Docker` revealed:
- **Baseline Latency:** `12,335.65ms` (~12.3 seconds)
- **Bottlenecks Identified:**
  1. Synchronous waiting on MCP/LLM agent initialization with `gpt-4o` and up to 8 tool call steps.
  2. 8-second timeout abort (`Delay was aborted`) on cold/unreachable MCP endpoint before fallback is initiated.
  3. Sequential N+1 Sanity GROQ queries in fallback loop (`for (const v of matchedVideos) { await serverClient.fetch(...) }`) adding 1.5–3.0s of sequential network overhead.

## 3. Skills & Rules Consulted
- `AGENTS.md`: Sections 5, 6, 7, 8, 11, 12, 13 (Two-stage timestamp resolution, grounded data, Sanity server client, no client tokens, proper caching).
- `sanity-best-practices`: Efficient GROQ projections, batch queries, avoiding N+1 roundtrips.

## 4. Key Decisions & Architecture
1. **Hybrid Fast-Path Architecture (Optimistic Direct Search):**
   - For keyword/concept queries (e.g. "Docker", "Next.js", "PostgreSQL", "React", "Authentication"), execute an optimized Sanity GROQ query first.
   - If direct GROQ returns verified lesson/video results, return them immediately (< 100ms) with `X-Cache: MISS-FAST-GROQ`.
   - If direct GROQ finds zero or sparse matches, fallback to the AI/MCP agent or execute semantic query expansion.
2. **Eliminate N+1 GROQ Queries:**
   - In `web/app/api/search/route.ts`, replace the sequential `for (const v of matchedVideos)` loop with a single joined query or batch resolution (`*[_type == "lesson" && videoUrl in $matchedUrls]`), resolving all video parents in a single network round-trip.
3. **Query Enhancement (Stopwords & Synonyms):**
   - In `web/lib/utils/search.ts`, add query pre-processing to filter noise words ("how", "to", "in", "the", "a") and expand common technical synonyms (e.g., "docker" -> "container", "devops"; "auth" -> "authentication", "clerk", "login").
4. **Resilient Fallback & Fast Timeouts:**
   - Reduce the MCP agent timeout from 8s to 2.5s so that if MCP is cold, it gracefully falls back without blocking user requests.

## 5. Files to Touch
- `web/app/api/search/route.ts`: Implement fast-path batch GROQ search and single-hop parent resolution.
- `web/lib/utils/search.ts`: Add query enhancement and synonym expansion helpers.
- `web/test/search-openai.test.ts`: Update/add unit tests for query normalization and fast-path execution.

## 6. Acceptance Criteria
- [ ] Before & After latency measured for `q=Docker` showing drastic reduction (from ~12.3s to < 250ms).
- [ ] Result schema matches `{ lessons: LessonResult[], videoMoments: VideoMomentResult[] }`.
- [ ] Two-stage timestamp resolution (chapters first, then transcript chunks) preserved.
- [ ] All 134+ unit tests across the test suite pass cleanly with 0 failures.
- [ ] `npm run type-check` in `web/` completes with 0 errors.

## 7. Checks to Run
- `npm test` in `web/`
- `npm run type-check` in `web/`
- Before & After Node.js benchmark comparison script for `GET /api/search?q=Docker`.

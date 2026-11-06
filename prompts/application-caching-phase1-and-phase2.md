# Implementation Prompt: Full-Stack Application Caching (Phase 1 & Phase 2)

## 1. Goal
Implement a production-grade, cost-optimized, multi-tier caching architecture across Vertex:
1. **Tier 1: AI Search & MCP Caching (`/api/search`)**:
   - Cache Sanity Context MCP `initial-context` in server memory across requests (as required by `AGENTS.md` Section 12).
   - In-memory LRU/TTL search result cache for repeated and paginated queries (e.g. `?q=react`, `?q=docker`), dropping response times from ~5,000ms to < 5ms and eliminating duplicate LLM API costs.
   - Add `Cache-Control` and `X-Cache` response headers (`HIT` vs `MISS`).
2. **Tier 2: Typeahead Suggestions Caching (`/api/search/suggestions`)**:
   - Server-side LRU memory cache for suggestions with TTL.
   - Client-side in-memory keystroke cache (`useRef<Map<string, SuggestionData>>`) in `SearchInput` and `SearchModal` for instant 0ms backspacing/re-typing.
   - Edge/Browser `Cache-Control: public, s-maxage=1800, stale-while-revalidate=86400` headers.
3. **Tier 3: Next.js ISR & Sanity Content Caching**:
   - Provide a standardized `sanityFetch` helper in `web/sanity/lib/client.ts` with `{ next: { revalidate: 300, tags: [...] } }`.
   - Update `web/app/page.tsx`, `web/app/courses/page.tsx`, `web/app/courses/[slug]/page.tsx`, and `web/app/lessons/[slug]/page.tsx` to use ISR caching (5-minute background revalidation).
   - Add an on-demand revalidation endpoint `web/app/api/revalidate/route.ts` gated by a secret token to purge cache tags on demand.
4. **Automated Unit Tests**:
   - Add `web/test/cache.test.ts` testing cache TTL expiration, capacity eviction, hit/miss tracking, and cache key normalization.
   - Update `web/package.json` test runner and ensure all test suites pass.

---

## 2. Skills Consulted
- **AGENTS.md**:
  - Section 5: Data access is a server-only Sanity client and fetch helper, reading a private dataset with a token.
  - Section 12: "The search route should cache initial context. Once it does, your instruction and prompt changes only take effect after a server restart."
  - Section 13: Checks to run (`npm test`, `npm run build`).
- **sanity-best-practices**:
  - `references/nextjs.md`: Manual `sanityFetch` helper with `revalidate`, `tags`, and Next.js fetch caching rules.
- **Next.js App Router (v16 Turbopack)**:
  - `next: { revalidate, tags }` on fetch queries, `revalidateTag` in route handlers.

---

## 3. Code Inspected
- `web/app/api/search/route.ts`: Currently calls `fetchInitialContext()` and `getMcpClient()` on every request; calls `generateText(openai("gpt-4o"))` with no caching.
- `web/app/api/search/suggestions/route.ts`: Executes GROQ query on every keystroke with no cache headers or server cache.
- `web/components/search/search-input.tsx` & `search-modal.tsx`: Dispatches HTTP fetches on every keystroke debounce without a client cache.
- `web/sanity/lib/client.ts`: Exports `serverClient` with `useCdn: false`. Lacks standard `sanityFetch` ISR wrapper.
- `web/app/page.tsx`, `web/app/courses/page.tsx`, `web/app/courses/[slug]/page.tsx`, `web/app/lessons/[slug]/page.tsx`: Direct uncached `serverClient.fetch` calls.

---

## 4. Decisions and Assumptions
1. **Lightweight In-Memory Cache Utility (`web/lib/cache.ts`)**:
   - Zero-dependency `SimpleMemoryCache<T>` class:
     - Supports `get(key)`, `set(key, value, ttlMs)`, `has(key)`, `delete(key)`, `clear()`.
     - Built-in TTL expiration and LRU/FIFO capacity eviction (`maxEntries`) to prevent memory leaks in serverless/Node environments.
2. **Search API Caching**:
   - Initial context: Cached in memory variable `cachedInitialContext` once fetched.
   - Query results: Cached in `searchCache` with 15-minute TTL and 100-item capacity.
   - Return headers: `X-Cache: HIT` / `X-Cache: MISS` and `Cache-Control: public, s-maxage=300, stale-while-revalidate=600`.
3. **Suggestions API & Client Caching**:
   - Server: `suggestionsCache` with 30-minute TTL and 250-item capacity.
   - Client: `cacheRef = useRef<Map<string, SuggestionData>>(new Map())` in both `SearchInput` and `SearchModal`. When a user types a previously queried term or backspaces, the UI updates instantly without network latency.
4. **Sanity Content Fetching (ISR)**:
   - `sanityFetch` in `web/sanity/lib/client.ts` wraps `serverClient.fetch` with `next: { revalidate: 300, tags: [...] }`.
   - Content pages (`/`, `/courses`, `/courses/[slug]`, `/lessons/[slug]`) receive instant TTFB from Next.js full route / data cache.
5. **On-Demand Revalidation (`/api/revalidate`)**:
   - POST / GET endpoint checking secret authorization token.
   - Calls `revalidateTag(tag, 'max')` or `revalidatePath(...)` to purge content caches when needed.

---

## 5. Files Expected to Touch
- `web/lib/cache.ts` (New): Reusable in-memory cache with TTL and capacity bounds.
- `web/app/api/search/route.ts` (Modify): Cache initial context, cache query results, add `X-Cache` and `Cache-Control` headers.
- `web/app/api/search/suggestions/route.ts` (Modify): Server-side cache and cache headers.
- `web/components/search/search-input.tsx` (Modify): Client-side keystroke cache with instant response on retyped queries.
- `web/components/search/search-modal.tsx` (Modify): Client-side keystroke cache with instant response on retyped queries.
- `web/sanity/lib/client.ts` (Modify): Add `sanityFetch` ISR helper with `next: { revalidate, tags }`.
- `web/app/page.tsx` (Modify): Use `sanityFetch` with tag `"courses"`.
- `web/app/courses/page.tsx` (Modify): Use `sanityFetch` with tags `"courses"`, `"categories"`.
- `web/app/courses/[slug]/page.tsx` (Modify): Use `sanityFetch` with tags `"courses"`, `"course-[slug]"`.
- `web/app/lessons/[slug]/page.tsx` (Modify): Use `sanityFetch` with tags `"lessons"`, `"lesson-[slug]"`.
- `web/app/api/revalidate/route.ts` (New): On-demand webhook / manual cache tag purge endpoint.
- `web/test/cache.test.ts` (New): Unit tests for memory cache TTL, eviction, and hit/miss behavior.
- `web/package.json` (Modify): Add `test/cache.test.ts` to `npm test`.

---

## 6. Requirements & Acceptance Criteria
- [ ] Initial context for MCP search is fetched once and reused across requests.
- [ ] Identical search queries return cached results in < 20ms with `X-Cache: HIT`.
- [ ] Typeahead suggestions are cached both server-side and client-side (instant display when backspacing).
- [ ] Sanity queries on Home, Catalog, Course, and Lesson pages utilize Next.js ISR (`next: { revalidate: 300 }`).
- [ ] On-demand revalidation route `/api/revalidate` allows tag-based invalidation with authorization token.
- [ ] All unit tests pass cleanly (`npm test`).
- [ ] Production build (`npm run build`) passes cleanly with zero errors.

---

## 7. Security Considerations
- Sanity read token remains private on the server.
- The in-memory cache stores only publicly visible query results and Sanity content.
- `/api/revalidate` requires a secret token (`REVALIDATE_SECRET` or `SANITY_REVALIDATE_SECRET`) to prevent unauthorized cache purging.

---

## 8. Checks to Run
- `npm test` in `web/` covering all test files.
- `npm run build` in `web/` to confirm static & dynamic route compilation.
- Browser test: verify search response times, suggestions instant cache on backspace, and page loads.

---

## 9. Manual Test Steps
1. In terminal or browser, search for `react`: observe response generated and cached (`X-Cache: MISS`).
2. Search for `react` again: observe near-instant response (< 10ms) with `X-Cache: HIT`.
3. In search input, type `docker`, see suggestions, backspace to `dock`, retype `docker`: verify suggestions appear immediately without debounce delay.
4. Navigate through Home, All Courses, Course details, and Lesson page: observe instant page rendering backed by Next.js ISR.

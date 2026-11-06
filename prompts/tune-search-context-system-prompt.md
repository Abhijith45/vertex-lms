# Implementation Prompt: Tune Search Context Document and Shape System Prompt

## 1. Goal
Tune Vertex's AI search experience by:
1. **Configuring the Sanity Context Document (`sanity.agentContext`)** using `@agent/skills/dial-your-context`:
   - Set a precise `groqFilter` content scope to exclude drafts and internal system types: `!(_id in path("drafts.**")) && _type in ["course", "lesson", "video", "instructor", "category"]`.
   - Write pure-delta `instructions` covering reverse references, video URL joins, two-stage timestamp resolution (chapters first, transcript fallback), Portable Text matching, and context window protections (fetching only matched chunks).
2. **Shaping the Search System Prompt** in `web/app/api/search/route.ts` using `@agent/skills/shape-your-agent`:
   - Follow the role/voice/boundaries/fallback structure tailored for structured search (not a chatbox).
   - Establish strict grounding guardrails (no hallucinated courses, lessons, or timestamps).
   - Enforce the two-stage timestamp resolution rule in the prompt, as the model follows inline instructions more reliably than remote context.
   - Escape backticks and preserve template literal integrity.
3. **Persisting the Configuration in Sanity and Source Control**:
   - Update `studio/scripts/seed/context.ndjson`.
   - Create and execute `studio/scripts/update-agent-context.ts` to update the live Sanity dataset.
4. **Verifying Search Behavior & Checks**:
   - Verify unit tests and TypeScript compilation.
   - Verify live MCP search integration and fallback query alignment.

---

## 2. Skills Consulted
- **dial-your-context** (`.agents/skills/dial-your-context/SKILL.md`):
  - Pure deltas only: capture what the auto-generated schema doesn't make obvious.
  - Content scope filter: `!(_id in path("drafts.**")) && _type in ["course", "lesson", "video", "instructor", "category"]`.
  - Joins and reverse references: lesson -> course reverse reference (`*[_type == "course" && references(^._id)][0]`), video -> lesson join (`*[_type == "lesson" && videoUrl == ^.url][0]`).
  - Safe projections: never return the whole transcript/chunks array; project only matched items `[0...3]`.
- **shape-your-agent** (`.agents/skills/shape-your-agent/SKILL.md`):
  - Clear role definition: search agent returning structured result cards via `return_search_results`.
  - Boundaries: refuse to fabricate data, refuse to return video documents standalone, refuse conversational prose/markdown.
  - Fallback: when nothing matches, return empty arrays so UI renders empty state.
- **AGENTS.md**: Section 7 (grounded search, provider embed), Section 10 (search config document), Section 11 (search behavior & ranking), Section 12 (critical rules in both prompt and Context doc, escaping backticks), Section 13 (checks).

---

## 3. Code Inspected
- `studio/scripts/seed/context.ndjson`: Existing seed context document with basic instructions.
- `web/app/api/search/route.ts`: Contains the OpenAI `generateText` system prompt, MCP tool integration, and direct GROQ fallback.
- `web/.env.local`: `SANITY_CONTEXT_MCP_URL=https://api.sanity.io/v2026-03-03/context/mcp/lb09hkdy/production/search-context`.

---

## 4. Decisions and Assumptions
1. **Context Document Content Scope (`groqFilter`)**:
   - Set to: `!(_id in path("drafts.**")) && _type in ["course", "lesson", "video", "instructor", "category"]`.
   - Excludes draft documents (`drafts.**`) and non-content documents (like `agentContext` itself or progress records).
2. **Context Document Instructions (`instructions`)**:
   - Format as clean, concise bullet points providing pure deltas:
     - **Reverse References**: `lesson` does not store parent course; query `*[_type == "course" && references(^._id)][0]`.
     - **Video Linking**: `video` documents are internal lookups; link to lesson via `*[_type == "lesson" && videoUrl == ^.url][0]`. Never return ungrounded video records.
     - **Two-Stage Timestamp Resolution**: Match `chapters[label match "*term*"]` first; only fall back to `chunks[text match "*term*"]` if no chapter matches for that video.
     - **Context Window Protection**: Always slice matched chunks/chapters `[0...3]`. Never query or return the entire `chunks[]` array.
     - **Portable Text**: Match plain text projections `pt::text(notes) match "*term*"`.
     - **Token Matching**: Wildcard search terms (`*term*`) and join with `||`. Rank title/chapter matches higher than body/transcript hits.
3. **Shaped System Prompt (`systemPrompt`)**:
   - Structured around:
     - **Role**: AI Search Agent for Vertex Learning Platform.
     - **Task & Output Protocol**: Analyze query -> query Sanity via `groq_query` -> rank results -> call `return_search_results`. No conversational prose.
     - **Grounding Guardrail**: Strictly grounded in Sanity records. Never invent timestamps, durations, or lessons.
     - **Two-Stage Timestamp Policy**: Chapter markers take precedence over transcript speech.
     - **When No Results Found**: Call `return_search_results` with empty arrays `[]`.
4. **Live Synchronization**:
   - Deploy/update the `sanity.agentContext` document in Sanity so the Sanity Context MCP immediately passes the tuned instructions to the agent.

---

## 5. Files to Touch
1. **`studio/scripts/seed/context.ndjson`**:
   - Update with tuned `groqFilter` and pure-delta `instructions`.
2. **`studio/scripts/update-agent-context.ts`** [NEW]:
   - Executable script using `SANITY_API_WRITE_TOKEN` to update `search-agent-context` in Sanity.
3. **`web/app/api/search/route.ts`**:
   - Update `systemPrompt` to match the shaped agent persona and strict search boundaries.
4. **`web/test/search-openai.test.ts`**:
   - Verify tests continue to validate search normalization, GROQ patterns, and structured output.

---

## 6. Security Considerations
- Read tokens remain strictly server-side.
- The `groqFilter` enforces that unauthenticated or external callers cannot inspect draft documents or internal progress records.
- System prompt and context instructions prohibit returning whole transcripts, avoiding token exhaustion and context window overflow.

---

## 7. Acceptance Criteria
- [ ] Context document in Sanity (`search-agent-context`) has `groqFilter` excluding drafts and scoping to content types.
- [ ] Context document `instructions` contain pure deltas for reverse reference, video-to-lesson join, two-stage resolution, and context window protection.
- [ ] System prompt in `route.ts` is structured with role, boundaries, grounding rules, and two-stage timestamp policy.
- [ ] Backticks inside template literals are safely handled without build errors.
- [ ] All unit tests pass (`npm test`).
- [ ] TypeScript check passes (`npx tsc --noEmit`).

---

## 8. Checks to Run
- `npm test` in `web/`
- `npx tsc --noEmit` in `web/`
- Verify Sanity Context document update via script

---

## 9. Manual Test Steps
1. Execute `npx tsx scripts/update-agent-context.ts` in `studio/` to commit the tuned Context document to Sanity.
2. Run `npm test` in `web/` to confirm all test suites pass.
3. Perform a live test query (e.g. `http://localhost:3000/api/search?q=caching`) and verify grounded lessons and video moments are returned.

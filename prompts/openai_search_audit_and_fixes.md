# Implementation Prompt: OpenAI Search Agent Audit, Multi-Step Tool Execution, & Comprehensive Unit Testing

## 1. Goal
Audit, optimize, and unit-test the OpenAI search analyzer (`web/app/api/search/route.ts`) to ensure it reliably processes user search inputs, performs multi-step tool calls with Sanity MCP and fallback mechanisms, accurately returns ranked lessons and video moments, and handles a wide variety of search keywords (e.g. single keywords, multi-word queries, synonyms, and edge cases).

## 2. Skills and References
- `create-agent-with-sanity-context`
- `sanity-best-practices`
- `AGENTS.md` (Sections 5, 6, 7, 11, 12, 13)
- Vercel AI SDK (`generateText`, `@ai-sdk/openai`, `@ai-sdk/mcp`)

## 3. Code Inspected
- `web/app/api/search/route.ts`: OpenAI `generateText` configuration, MCP tool injection, `maxSteps` parameter, `return_search_results` schema, and Sanity fallback query logic.
- `web/.env.local`: `OPENAI_API_KEY`, `SANITY_CONTEXT_MCP_URL`, `SANITY_API_READ_TOKEN`.
- `web/test/search-flow.test.ts`: Existing test suites.

## 4. Decisions and Assumptions
- **AI SDK Multi-Step Execution (`maxSteps`)**: Ensure `generateText` explicitly sets `maxSteps: 8` so the model can call `groq_query` / schema tools, receive data, and then call `return_search_results` with structured output.
- **Robust Schema & Prompt Guardrails**: Update the system prompt to explicitly guide OpenAI on query analysis:
  - Extract core search intents and synonyms.
  - Formulate flexible GROQ token matches (`*keyword*`).
  - Search both `lesson` (title, notes, key points) and `video` (chapters, chunks).
  - Ground all returned items to real Sanity data.
- **Enhanced Sanity Fallback GROQ Search**: Improve the direct Sanity GROQ fallback query with multi-token OR matching and scoring so searches always return relevant matches even if the LLM/MCP encounters network latency.
- **Automated Unit Tests**: Add a dedicated automated test suite (`web/test/search-openai.test.ts`) testing a comprehensive list of keyword scenarios:
  1. Single technical terms (`react`, `nextjs`, `docker`, `typescript`)
  2. Multi-word phrases (`server components`, `state management`, `system design`)
  3. Video moment timestamp resolution
  4. Query normalization and edge-case handling (special characters, whitespace, empty queries)

## 5. Files to Touch
- [MODIFY] `web/app/api/search/route.ts`
- [NEW] `web/test/search-openai.test.ts`
- [MODIFY] `web/package.json` (to include new unit test in `npm test`)

## 6. Security Considerations
- Keep `OPENAI_API_KEY` and `SANITY_API_READ_TOKEN` strictly server-side.
- Ensure inputs are sanitized with `normalizeSearchQuery` to prevent query injection.

## 7. Acceptance Criteria
1. OpenAI search agent successfully executes multi-step tool calls (`groq_query` -> `return_search_results`).
2. Search returns grounded lessons and video moments with start timestamps for relevant keywords.
3. Unit test suite passes with 100% green assertions across all tested keyword categories.

## 8. Checks to Run
- `npm test` in `web` workspace.
- `npm run build` in `web` workspace.

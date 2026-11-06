# Implementation Prompt: Phase 2 — AI Copilot & Smart Features (In-Video Temporal RAG Assistant + Knowledge Checkpoints)

## 1. Goal
Implement Phase 2 of the Vertex enhancement roadmap:
1. **In-Video Contextual AI Copilot**: Streaming conversational assistant grounded in the learner's real-time video playback second.
2. **Temporal Window RAG**: Dynamically slices a 90-second context window of preceding transcript chunks relative to the current playback time.
3. **Interactive Timestamp Citations**: Auto-converts timestamp references (`[MM:SS]`) in AI answers into clickable seek buttons that jump the video player.
4. **Interactive Knowledge Checkpoints**: Micro-quizzes to test concept comprehension with instant feedback.
5. **Zero-Failure Fallback**: Graceful local heuristic fallback if `OPENAI_API_KEY` is not present, guaranteeing flawless recruiter demos.

---

## 2. Inspected Code & Architecture

- **Playback Context** (`web/components/lesson/lesson-playback-context.tsx`): Exposes `currentTime`, `duration`, `seekTo(seconds)`.
- **Lesson Tabs** (`web/components/lesson/lesson-content-tabs.tsx`): Houses "Lesson Content", "Transcript", and "Notes". We will add "Copilot AI".
- **Transcript Data** (`web/components/lesson/interactive-transcript.tsx`): Contains timestamped cues.
- **AI SDK** (`web/node_modules/ai`): Exports `streamText`, `generateText`, and `@ai-sdk/openai`.

---

## 3. Files to Touch / Create

1. **`web/app/api/ai/copilot/route.ts`** *(New)*:
   - Server-side streaming endpoint with temporal transcript window slicing and prompt grounding.
2. **`web/components/lesson/lesson-copilot.tsx`** *(New)*:
   - Interactive streaming chat component with timestamp chip parsing and quick action buttons.
3. **`web/components/lesson/knowledge-checkpoint.tsx`** *(New)*:
   - Interactive micro-quiz widget with instant answer feedback and explanation.
4. **`web/components/lesson/lesson-content-tabs.tsx`** *(Modify)*:
   - Add "Copilot AI" tab and render `<LessonCopilot />`.
5. **`web/test/copilot-rag.test.ts`** *(New)*:
   - Unit tests for temporal window slicing, timestamp parsing, and prompt assembly.

---

## 4. Acceptance Criteria & Checks

1. "Copilot AI" tab renders cleanly alongside "Lesson Content", "Transcript", and "Notes".
2. Current video playback time is reflected in prompt chips (e.g., *"Explain moment at 1:45"*).
3. Clicking prompt triggers streaming answer with temporal grounding.
4. Timestamp references in answers (`[MM:SS]`) are rendered as clickable seek chips.
5. Micro-quiz generates questions with instant right/wrong feedback.
6. TypeScript check (`npm run type-check`) passes with 0 errors.
7. Full test suite (`npm test`) passes.

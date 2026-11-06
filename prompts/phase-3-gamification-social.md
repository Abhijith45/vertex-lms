# Implementation Prompt: Phase 3 — Platform Gamification, Cryptographically Verifiable Certificates & Social Layer

## 1. Goal
Implement Phase 3 of the Vertex SaaS roadmap:
1. **Cryptographically Verifiable Certificates of Completion**: Tamper-proof certificate records signed with HMAC-SHA256, verified on a public `/verify/[id]` page with print/PDF support and LinkedIn sharing.
2. **Timestamped Community Discussions & Q&A**: Context-aware discussion threads anchored to video timestamps with click-to-seek badges, sorting (Newest, Top Voted, Video Timeline), and verified instructor responses.
3. **Streak & Learning Momentum State Machine**: Engagement tracking computing daily active streaks with visual fire badges in the navbar and `/my-learning` dashboard.
4. **Comprehensive Unit & Integration Test Suite**: Dedicated tests for cryptographic verification, discussion timeline ordering, timestamp parsing, and streak transitions.

---

## 2. Inspected Code & Architecture

- **Playback Context** (`web/components/lesson/lesson-playback-context.tsx`): Exposes `currentTime` and `seekTo(seconds)`.
- **Lesson Tabs** (`web/components/lesson/lesson-content-tabs.tsx`): Houses "Lesson Content", "Copilot AI", "Transcript", and "Notes". We will add "Discussions".
- **Navbar** (`web/components/layout/navbar.tsx`): Header controls where the new streak badge will be embedded.
- **My Learning** (`web/app/my-learning/page.tsx` & `web/components/my-learning/completed-course-card.tsx`): Completed courses section where "View Certificate" will be wired.

---

## 3. Files to Touch / Create

1. **`web/lib/certificate.ts`** *(New)*: Cryptographic HMAC-SHA256 certificate signing, timing-safe verification, and registry store.
2. **`web/app/api/certificates/[id]/route.ts`** *(New)*: Public certificate retrieval and verification endpoint.
3. **`web/app/api/certificates/claim/route.ts`** *(New)*: Certificate claim endpoint for course completions.
4. **`web/app/verify/[id]/page.tsx`** *(New)*: Public verifiable certificate page with print/PDF layout and LinkedIn credential sharing.
5. **`web/lib/discussion.ts`** *(New)*: Discussion thread models, initial seeds, and sorting algorithms.
6. **`web/app/api/discussions/route.ts`** *(New)*: REST endpoints for fetching, creating, and upvoting timestamped discussion threads.
7. **`web/components/lesson/lesson-discussion.tsx`** *(New)*: Interactive discussions UI with timestamp seek badges.
8. **`web/components/lesson/lesson-content-tabs.tsx`** *(Modify)*: Add "Discussions" tab.
9. **`web/lib/streak.ts`** *(New)*: Streak calculation state machine.
10. **`web/components/layout/streak-badge.tsx`** *(New)*: Visual fire streak badge component.
11. **`web/components/layout/navbar.tsx`** *(Modify)*: Embed `<StreakBadge />` in header.
12. **`web/components/my-learning/completed-course-card.tsx`** *(Modify)*: Add "View Certificate" button.
13. **`web/test/gamification-social.test.ts`** *(New)*: Unit tests for cryptographic signatures, discussions, and streaks.
14. **`web/package.json`** *(Modify)*: Add test to `test` script.

---

## 4. Acceptance Criteria & Checks

1. `/verify/[id]` serves a verified certificate for completed courses displaying recipient name, course title, and HMAC-SHA256 verification hash.
2. Tampering with certificate parameters (e.g. changing recipient or course title) fails verification check.
3. "View Certificate" button on `/my-learning` navigates directly to the verifiable certificate.
4. "Discussions" tab renders cleanly in `LessonContentTabs`.
5. Creating a discussion with "Tag current video time" embeds a click-to-seek timestamp badge that seeks the player on click.
6. Discussions can be sorted by Top Voted, Newest, and Video Timeline.
7. Streak badge renders in Navbar displaying consecutive learning days.
8. TypeScript check (`npm run type-check`) passes with 0 errors.
9. Full test suite (`npm test`) passes with 100% success rate.

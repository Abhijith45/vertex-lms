# Implementation Prompt: Diagnose and Fix Sanity Data Fetching on Website

## 1. Goal
Diagnose and permanently resolve why Sanity CMS content is not displaying on the Vertex website, provide the exact root-cause failure points verified against the live Sanity API, and execute the dataset import so that courses, lessons, and video moments appear live across the homepage, courses catalog (`/courses`), and lesson player (`/lessons/[slug]`).

---

## 2. Root Cause Analysis (Verified Against Live Sanity API)

### Failure Point 1: The Remote Dataset is Literally Empty (0 Courses, 0 Lessons)
- **Live Inspection**: We probed the remote Sanity database (`projectId: lb09hkdy`, `dataset: production`) with `*[]._type`:
  - `sanity.imageAsset`: 135
  - `progress`: 1
  - `sanity.agentContext`: 1
  - `video`: 1
  - **`course`: 0**
  - **`lesson`: 0**
  - **`category`: 0**
  - **`instructor`: 0**
- **Impact**:
  - On the Homepage (`/`): The query returns `[]`, so the page falls back to the hardcoded `fallbackCourses`.
  - On the Catalog (`/courses`): The query returns `[]`, displaying an empty catalog.
  - On Lesson Pages (`/lessons/[slug]`): The query returns `null`, triggering Next.js `notFound()` (404).

### Failure Point 2: Token Mismatch (`projectUserNotFoundError`)
- **Live Inspection**: We probed the token in `.env.local` against Sanity's `/projects` and `/users/me` endpoints:
  - The token in `.env.local` is associated with user ID `g-YXb3BWf7KdFH`.
  - Sanity API returns: `project user not found for user ID "g-YXb3BWf7KdFH" in project "lb09hkdy"`.
  - In project `lb09hkdy`, a NEW robot member (`p3JNGhfKq`) was created today (2026-11-05 13:30 UTC / 19:00 IST), but the newly generated token secret has not yet been copied into `.env.local`.

### Failure Point 3: Dataset Seeding Has Not Been Executed
- The repository contains 141 curated documents in `studio/scripts/seed/seed.ndjson` (covering Next.js, DevOps, TypeScript, System Design, AI Apps) and `studio/scripts/seed/context.ndjson`.
- These files exist on disk in the repo, but have not yet been imported into the remote Sanity cloud dataset.

---

## 3. Resolution Plan
1. **Provide the Exact Causes**: Clearly explain to the user why the site currently has no data to display (the remote dataset only contains image assets and 0 content documents).
2. **Import Seed Content**:
   - Provide the Sanity CLI import command:
     ```bash
     cd studio
     npx sanity dataset import scripts/seed/seed.ndjson production --replace
     npx sanity dataset import scripts/seed/context.ndjson production --replace
     ```
   - Alternatively, create a Node/TypeScript import script (`studio/scripts/import-seed.ts`) that imports `seed.ndjson` directly using a valid write token.
3. **Update Token in `.env.local`**:
   - Prompt user to paste the new token secret generated today (`p3JNGhfKq`) into `SANITY_API_WRITE_TOKEN`.
4. **Verification**:
   - Verify `*[_type == "course"]` returns 5 courses.
   - Verify `http://localhost:3000/courses` displays all courses.
   - Verify lesson playback loads on `http://localhost:3000/lessons/nextjs-app-router-in-depth-file-system-routing`.

---

## 4. Acceptance Criteria
- [ ] Remote Sanity dataset has all 141 documents imported.
- [ ] Homepage, `/courses`, and `/lessons/[slug]` fetch and display real Sanity CMS data.

# Implementation Prompt: High-Priority Compliance Pages & Dedicated Footer

## Goal
Implement the high-priority legal and compliance web pages (**Privacy Policy**, **Terms of Service**, and **Cookie & Tracking Notice**) tailored for Vertex as an educational/portfolio platform built by developer **Abhijeet Rawat** (`abhijeetrawat45@gmail.com`). In addition, create a cohesive, responsive **Footer** component adhering to Vertex's existing design system (supporting light/dark modes, Playfair/Inter typography, subtle borders, and warm amber/orange accents) and place it directly above the existing ambient bottom artwork (`<BottomGraphic />`) across all main surfaces.

---

## Skills Referenced
- `ui-ux-pro-max` / `ui-styling` (`.agents/skills/ui-ux-pro-max/SKILL.md`): Modern SaaS layout patterns, readable typography hierarchy, responsive padding/margins, dark mode color tokens, and accessible link styling.
- `clerk-nextjs-patterns` (`.agents/skills/clerk-nextjs-patterns/SKILL.md`): Accurate disclosure of Clerk auth tokens and session cookies in compliance documentation.
- `seo-aeo-best-practices` (`.agents/skills/seo-aeo-best-practices/SKILL.md`): Semantic document outline (`<h1>` per page, descriptive `<title>` and `<meta name="description">`), crawlable links, and canonical structure.

---

## Code Inspected
- `web/app/page.tsx`: Home page structure showing the centered 1440px canvas ending with `<BottomGraphic />`.
- `web/app/courses/page.tsx`: Courses catalog page ending with `<BottomGraphic />`.
- `web/app/courses/[slug]/page.tsx`: Course detail page ending with `<BottomGraphic />` and sticky course progress bar.
- `web/app/my-learning/page.tsx`: My Learning dashboard ending with `<BottomGraphic />`.
- `web/app/search/page.tsx`: Search results page ending with `<BottomGraphic />`.
- `web/components/layout/navbar.tsx`: Header component with logo, theme toggle, nav links, and Clerk auth controls.
- `web/components/home/bottom-graphic.tsx`: Ambient orange/amber skyline artwork positioned at the bottom of pages.
- `web/next.config.ts`: Rewrites and image domains configuration for Next.js.

---

## Key Decisions & Assumptions
1. **Educational & Portfolio Scope Disclosure**:
   - The documentation will explicitly declare Vertex as an educational project built for portfolio and demonstration purposes by developer **Abhijeet Rawat**.
   - It will clearly specify that no commercial transactions, fees, or course sales occur on the platform.
2. **Third-Party Video Embedding & DMCA Safe Harbor**:
   - The terms and policies will explicitly state that all video lessons are streamed using official YouTube / third-party embed players (via YouTube's public API / iframe).
   - Vertex does not download, store, re-encode, or re-host original video media files.
   - All intellectual property, trademarks, and copyright remain with the respective content creators.
   - An immediate DMCA / Content Removal contact procedure will be provided via `abhijeetrawat45@gmail.com` with a commitment to unlist or remove references within 24–48 hours upon request.
3. **User Data & Cookie Disclosures**:
   - **Clerk**: Authentication credentials, email, and session cookies (`__session`, `__clerk_db_jwt`).
   - **Sanity**: Learner progress (completed lessons, resume timestamps, and bookmarked courses) stored in Sanity keyed to the user's Clerk user ID.
   - **PostHog**: Privacy-preserving product telemetry (search queries, lesson views, video watch progress).
   - **Local Storage**: `vertex-theme` storing theme preference (light/dark/system).
   - **User Rights (GDPR/CCPA)**: Transparent instructions for users to request data export or account erasure via email to `abhijeetrawat45@gmail.com`.
4. **Footer Placement**:
   - A dedicated `Footer` component will be added directly **above** `<BottomGraphic />` inside the max-w-[1440px] canvas on all main pages (`/`, `/courses`, `/courses/[slug]`, `/my-learning`, `/search`), plus on the new compliance pages.
   - The footer will feature brand summary, developer credits, platform navigation links, compliance links, video disclaimer, and a direct mailto contact.
5. **Route Architecture & Friendly Aliases**:
   - Primary routes:
     - `/privacy-policy` (Privacy Policy)
     - `/terms-of-service` (Terms of Service)
     - `/cookie-policy` (Cookie Policy)
   - Convenient redirects in `next.config.ts` from `/privacy` -> `/privacy-policy`, `/terms` -> `/terms-of-service`, and `/cookies` -> `/cookie-policy` for user convenience.

---

## Files to Touch
1. `web/components/layout/footer.tsx` [NEW] — Reusable SaaS footer component with branding, developer attribution, compliance links, platform navigation, disclaimer, and contact info.
2. `web/app/privacy-policy/page.tsx` [NEW] — Complete Privacy Policy page detailing data collection, storage, third-party processors, user rights, and contact information.
3. `web/app/terms-of-service/page.tsx` [NEW] — Terms of Service page covering portfolio disclaimer, acceptable use, YouTube embed attribution, and DMCA takedown procedure.
4. `web/app/cookie-policy/page.tsx` [NEW] — Cookie & Tracking Notice specifying essential session cookies, local storage tokens, analytics cookies, and opt-out instructions.
5. `web/next.config.ts` — Add redirect rules for `/privacy`, `/terms`, and `/cookies`.
6. `web/app/page.tsx` — Integrate `<Footer />` directly above `<BottomGraphic />`.
7. `web/app/courses/page.tsx` — Integrate `<Footer />` directly above `<BottomGraphic />`.
8. `web/app/courses/[slug]/page.tsx` — Integrate `<Footer />` directly above `<BottomGraphic />`.
9. `web/app/my-learning/page.tsx` — Integrate `<Footer />` directly above `<BottomGraphic />`.
10. `web/app/search/page.tsx` — Integrate `<Footer />` directly above `<BottomGraphic />`.
11. `web/test/compliance-routes.test.ts` [NEW] — Unit tests verifying legal route availability and configuration integrity.

---

## Security & Compliance Considerations
- **No Private Tokens Leaked**: No secret keys (`CLERK_SECRET_KEY`, `SANITY_API_WRITE_TOKEN`, etc.) are exposed on compliance pages.
- **Accurate Privacy Disclosures**: Exactly reflect the third parties in use (Clerk, Sanity, PostHog, YouTube).
- **Responsive & Accessible**: Proper heading levels (`h1`, `h2`, `h3`), sufficient contrast in light and dark mode, accessible focus states on links and contact mailto buttons.

---

## Acceptance Criteria
- [ ] Dedicated `Footer` component displays consistently across Home, Courses, Course Detail, My Learning, Search, and Compliance pages.
- [ ] The `Footer` sits neatly above the bottom skyline graphic (`<BottomGraphic />`), maintaining the existing UI aesthetics in both light and dark themes.
- [ ] `/privacy-policy` loads with comprehensive privacy notice covering Clerk, Sanity, PostHog, YouTube embeds, user rights, and developer contact (`abhijeetrawat45@gmail.com`).
- [ ] `/terms-of-service` loads with portfolio/educational disclaimer, intellectual property terms, YouTube embed compliance, and clear DMCA takedown instructions.
- [ ] `/cookie-policy` loads with breakdown of essential auth cookies (Clerk), analytics cookies (PostHog), local storage (`vertex-theme`), and third-party YouTube player cookies.
- [ ] Friendly shortcuts `/privacy`, `/terms`, and `/cookies` properly redirect to their respective canonical compliance pages.
- [ ] TypeScript type checks (`npm run type-check`) and unit tests (`npm test`) pass cleanly with 0 errors.

---

## Verification Plan & Checks to Run
1. **Type Check**: Run `npm run type-check` in `web/` to confirm zero TypeScript compilation errors.
2. **Unit Tests**: Run `npm test` in `web/` to confirm all test suites pass.
3. **Manual Browser Verification**:
   - Open `http://localhost:3000/` and verify the new Footer renders above `<BottomGraphic />` in both light and dark mode.
   - Click the "Privacy Policy" link in the footer and confirm `/privacy-policy` renders with full styling, typography, and developer details.
   - Click the "Terms of Service" link and confirm `/terms-of-service` renders.
   - Click the "Cookie Policy" link and confirm `/cookie-policy` renders.
   - Verify navigation to `/privacy`, `/terms`, and `/cookies` redirects correctly.
   - Check footer rendering on `/courses`, `/courses/building-ai-apps-with-llms`, `/my-learning`, and `/search`.

# Implementation Prompt: Low & Optional Compliance Pages (Security Notice, User Rights Portal, DPA, Sitemap & Robots)

## Goal
Implement the **Low-Priority & Optional Compliance and Platform Discovery Items** for Vertex built by developer **Abhijeet Rawat** (`abhijeetrawat45@gmail.com`):
1. **Security Notice** (`/security-notice`) — Technical and operational security disclosure covering Clerk authentication architecture, private Sanity datastores, server-only tokens, HTTPS transit encryption, and responsible vulnerability disclosure reporting.
2. **User Rights Portal** (`/user-rights-portal`) — Interactive self-service data-subject request page allowing learners to review their rights (GDPR/CCPA/CPRA), request data export of their learning progress & bookmarks, or submit an account/data erasure request.
3. **Data Processing Agreement (DPA)** (`/data-processing-agreement`) — Demonstration DPA detailing sub-processors (Clerk, Sanity, PostHog), data transfer mechanisms, and compliance standards.
4. **Next.js XML Sitemap** (`web/app/sitemap.ts`) — Automated, crawlable `sitemap.xml` generator indexing all canonical routes.
5. **Next.js Robots Directive** (`web/app/robots.ts`) — Automated `robots.txt` generator permitting crawler indexing on public learning pages and legal notices while protecting internal `/api/*` endpoints.

In addition, update the **Footer** component and **Next.js redirects** to include these resources.

---

## Skills Referenced
- `seo-aeo-best-practices` (`.agents/skills/seo-aeo-best-practices/SKILL.md`): Native App Router `sitemap.ts` and `robots.ts` implementation with proper change frequency, priorities, and XML structure.
- `ui-ux-pro-max` / `ui-styling` (`.agents/skills/ui-ux-pro-max/SKILL.md`): Accessible UI cards, interactive self-service buttons, and responsive grid layouts.

---

## Code Inspected
- `web/components/layout/footer.tsx`: Current footer component with 4-column layout and bottom links.
- `web/next.config.ts`: Configured redirects for compliance shortcuts.
- `web/app/layout.tsx`: Root layout with dark mode script and typography tokens.
- `web/test/compliance-routes.test.ts`: Test suite verifying legal routes and aliases.

---

## Key Decisions & Assumptions
1. **Security Notice (`/security-notice`)**:
   - Outlines zero-trust token isolation (no private Sanity write tokens or Clerk secret keys leaked to browser runtime).
   - Details data encryption in transit (TLS 1.3) and at rest across cloud infrastructure.
   - Provides security vulnerability contact at `abhijeetrawat45@gmail.com` with coordinated disclosure commitment.
2. **User Rights Portal (`/user-rights-portal`)**:
   - Clear tabs/sections for "Data Access & Export" and "Account & Progress Erasure".
   - Provides an interactive "Export My Data (JSON)" trigger for signed-in users (fetching their Sanity progress) and pre-filled mailto buttons for manual deletion requests.
3. **Data Processing Agreement (`/data-processing-agreement`)**:
   - Outlines sub-processor relationships: Clerk Inc. (Auth), Sanity AS (CMS/Data), PostHog Inc. (Telemetry).
   - Clarifies non-commercial educational portfolio context.
4. **Sitemap & Robots**:
   - `web/app/sitemap.ts`: Generates dynamic `MetadataRoute.Sitemap` with all public courses, home, search, my-learning, and compliance pages.
   - `web/app/robots.ts`: Generates `MetadataRoute.Robots` pointing to `/sitemap.xml` and disallowing `/api/`.
5. **Navigation & Redirects**:
   - Footer updated to include Security Notice, User Rights Portal, and DPA.
   - Redirect aliases:
     - `/security` -> `/security-notice`
     - `/user-rights` -> `/user-rights-portal`
     - `/dpa` -> `/data-processing-agreement`

---

## Files to Touch
1. `web/app/security-notice/page.tsx` [NEW] — Security practices and vulnerability reporting page.
2. `web/app/user-rights-portal/page.tsx` [NEW] — Interactive self-service data-subject request portal.
3. `web/app/data-processing-agreement/page.tsx` [NEW] — Demonstration Data Processing Agreement page.
4. `web/app/sitemap.ts` [NEW] — Native Next.js sitemap generator (`/sitemap.xml`).
5. `web/app/robots.ts` [NEW] — Native Next.js robots.txt generator (`/robots.txt`).
6. `web/components/layout/footer.tsx` — Add links for Security, User Rights, and DPA.
7. `web/next.config.ts` — Add redirect aliases.
8. `web/test/compliance-routes.test.ts` — Expand unit test suite with all Low/Optional items.

---

## Security & Compliance Considerations
- **Safe Self-Service**: User rights portal queries user data strictly via authenticated Clerk session and server Sanity client; never exposes another user's progress.
- **Clear Contact Channels**: Direct email to `abhijeetrawat45@gmail.com` for rapid compliance handling.

---

## Acceptance Criteria
- [ ] `/security-notice` renders with architecture security breakdown and disclosure email.
- [ ] `/user-rights-portal` renders with export instructions, GDPR/CCPA rights list, and deletion request action.
- [ ] `/data-processing-agreement` renders with sub-processor details and standard data handling commitments.
- [ ] `http://localhost:3000/sitemap.xml` generates valid XML with all canonical platform URLs.
- [ ] `http://localhost:3000/robots.txt` generates valid crawl rules referencing the sitemap.
- [ ] `Footer` displays updated links cleanly.
- [ ] `npm run type-check`, `npm run lint`, and `npm test` pass with 0 errors.

---

## Verification Plan & Checks to Run
1. **Type Check**: `npm run type-check` in `web/`.
2. **Unit Tests**: `npm test` in `web/`.
3. **Lint**: `npx eslint components/layout/footer.tsx app/security-notice/page.tsx app/user-rights-portal/page.tsx app/data-processing-agreement/page.tsx app/sitemap.ts app/robots.ts` in `web/`.
4. **Browser & Endpoint Verification**:
   - Check `/security-notice`, `/user-rights-portal`, `/data-processing-agreement` pages in browser.
   - Check `/sitemap.xml` and `/robots.txt` in browser.
   - Verify redirect aliases (`/security`, `/user-rights`, `/dpa`).

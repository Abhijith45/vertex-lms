# Implementation Prompt: Medium-Priority Compliance Pages (Accessibility, DMCA, Video-Embedding Policy)

## Goal
Implement the **Medium-Priority Compliance & Trust Web Pages** for the Vertex learning platform built by developer **Abhijeet Rawat** (`abhijeetrawat45@gmail.com`):
1. **Accessibility Statement** (`/accessibility-statement`) — Documenting WCAG 2.1 Level AA conformance, keyboard navigation, screen reader support, dark/light contrast standards, and accessibility feedback channels.
2. **DMCA / Copyright Policy** (`/dmca`) — Dedicated DMCA policy page providing copyright owners with clear instructions, designated agent details, notice requirements, 24–48 hour takedown turnaround, and safe harbor procedures.
3. **Video-Embedding & Fair Use Policy** (`/video-embedding-policy`) — Technical and legal explanation of how Vertex utilizes official third-party embed players (YouTube API, Vimeo, Bunny) without downloading, altering, or re-hosting video media, respecting original creator ownership and view monetization.

In addition, update the **Footer** component and **Next.js redirects** to provide seamless access to these new compliance pages.

---

## Skills Referenced
- `ui-ux-pro-max` / `ui-styling` (`.agents/skills/ui-ux-pro-max/SKILL.md`): Consistent layout typography, responsive breadcrumbs, accessible badges, card containers, and dark mode contrast tokens.
- `seo-aeo-best-practices` (`.agents/skills/seo-aeo-best-practices/SKILL.md`): Metadata configuration (`title`, `description`), structured heading hierarchy, semantic HTML, and crawlable routing.

---

## Code Inspected
- `web/components/layout/footer.tsx`: Existing footer component with brand, navigation, and compliance links.
- `web/app/privacy-policy/page.tsx`, `web/app/terms-of-service/page.tsx`, `web/app/cookie-policy/page.tsx`: Established layout pattern using `Navbar`, `max-w-4xl` main container, breadcrumbs, `Playfair_Display` headings, structured sections, callouts, `Footer`, and `BottomGraphic`.
- `web/next.config.ts`: Configured redirects for compliance shortcuts (`/privacy`, `/terms`, `/cookies`).
- `web/test/compliance-routes.test.ts`: Node unit tests verifying canonical routes, contact email, and cookie definitions.

---

## Key Decisions & Assumptions
1. **Accessibility Statement (`/accessibility-statement`)**:
   - Conformance target: WCAG 2.1 AA.
   - Features highlighted: semantic HTML elements, accessible form labels, keyboard navigation (focus-visible rings), theme contrast ratios in both light and dark mode, and responsive layout scaling.
   - Contact: direct email to `abhijeetrawat45@gmail.com` for accessibility barrier reporting.
2. **DMCA & Copyright Policy (`/dmca`)**:
   - Designated DMCA Agent: **Abhijeet Rawat** (`abhijeetrawat45@gmail.com`).
   - Clear 4-step takedown submission instructions (Identification of work, Vertex URL, ownership statement, contact info).
   - Turnaround commitment: video references and indexing transcripts unlisted/removed within 24–48 hours without dispute.
   - Counter-notification procedure for disputed claims.
3. **Video-Embedding Policy (`/video-embedding-policy`)**:
   - Explicit technical disclosure: video streaming executes client-side via standard `<iframe>` embeds using official player APIs (YouTube, Vimeo, Bunny).
   - Zero re-hosting: Vertex never stores, downloads, encodes, or redistributes underlying video streams.
   - Value for creators: all playback counts, ads, and channel views flow directly to the creator's YouTube channel.
   - Creator opt-out mechanism via email.
4. **Navigation & Redirects**:
   - Update `web/components/layout/footer.tsx` to list all High and Medium priority legal pages cleanly.
   - Add aliases in `web/next.config.ts`:
     - `/accessibility` -> `/accessibility-statement`
     - `/dmca-policy` -> `/dmca`
     - `/video-policy` -> `/video-embedding-policy`
     - `/terms-of-use-for-embed-videos` -> `/video-embedding-policy`

---

## Files to Touch
1. `web/app/accessibility-statement/page.tsx` [NEW] — Accessibility statement page.
2. `web/app/dmca/page.tsx` [NEW] — Dedicated DMCA & copyright takedown page.
3. `web/app/video-embedding-policy/page.tsx` [NEW] — Video embedding and fair-use policy page.
4. `web/components/layout/footer.tsx` — Add links for Accessibility, DMCA, and Video Embedding Policy.
5. `web/next.config.ts` — Add redirect aliases for the new pages.
6. `web/test/compliance-routes.test.ts` — Expand unit tests to validate all High + Medium compliance routes and aliases.

---

## Security & Compliance Considerations
- **No Private Tokens Leaked**: All pages are strictly static/server-rendered with zero private credentials.
- **Clear Contact Channels**: `abhijeetrawat45@gmail.com` provided prominently for prompt DMCA and accessibility response.

---

## Acceptance Criteria
- [ ] `/accessibility-statement` renders with WCAG 2.1 AA conformance details, assistive tech support, and feedback contact.
- [ ] `/dmca` renders with DMCA submission guidelines, designated agent info, 24-48h turnaround, and counter-notice instructions.
- [ ] `/video-embedding-policy` renders with YouTube/Vimeo embed mechanics, creator benefit disclosures, and opt-out instructions.
- [ ] `Footer` component displays the new links in the Compliance & Legal column.
- [ ] Shortcuts `/accessibility`, `/dmca-policy`, `/video-policy`, and `/terms-of-use-for-embed-videos` redirect cleanly.
- [ ] `npm run type-check`, `npm run lint`, and `npm test` pass with 0 errors.

---

## Verification Plan & Checks to Run
1. **Type Check**: `npm run type-check` in `web/`.
2. **Unit Tests**: `npm test` in `web/`.
3. **Lint**: `npx eslint components/layout/footer.tsx app/accessibility-statement/page.tsx app/dmca/page.tsx app/video-embedding-policy/page.tsx` in `web/`.
4. **Browser Verification**:
   - Navigate to `/accessibility-statement`, `/dmca`, and `/video-embedding-policy` to verify visual styling in both light and dark mode.
   - Verify footer links navigate properly to the new pages.
   - Test redirect aliases (`/accessibility`, `/dmca-policy`, `/video-policy`).

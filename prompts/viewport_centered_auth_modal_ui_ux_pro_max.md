# Implementation Prompt: Viewport-Centered Auth Modal with UI/UX Pro Max Enhancements

## Goal
Display the video playback sign-in/sign-up restriction modal strictly in the center of the device viewport (regardless of scroll position or container bounds) and elevate its visual and interaction design according to `ui-ux-pro-max` standards (glassmorphism, radial depth glow, accessible focus rings, touch targets, body scroll lock, and micro-interactions).

---

## Skills Consulted
- `ui-ux-pro-max` (`.agents/skills/ui-ux-pro-max/SKILL.md`):
  - Glassmorphism dark mode specifications: Frosted glass, translucent overlays, backdrop blur (15-20px), layered depth, subtle 1px border.
  - UX guideline: Visible focus ring on every interactive control (`focus:ring-2 focus:ring-[#E05A36]`).
  - Accessibility & interaction: Esc key dismissal, backdrop click dismissal, touch targets >= 44px, screen reader semantics (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`).
  - Viewport-level isolation: React `createPortal` to `document.body` preventing clipping by parent video player containers or transforms.
  - Body scroll lock during modal presentation to eliminate background jump.
- `AGENTS.md`:
  - Preserve server and client boundaries.
  - Clerk auth modal mode (`SignInButton mode="modal"`, `SignUpButton mode="modal"`).
  - Run required checks (`npm test`, `npx tsc --noEmit`).

---

## Code Inspected
- `web/components/lesson/auth-prompt-modal.tsx`: Currently rendered as a `fixed` div inside `VideoEmbed`. Because `VideoEmbed` uses `relative aspect-video overflow-hidden rounded-2xl`, in certain viewport conditions or scrolled states the modal can be constrained or visually offset from the true viewport center.
- `web/components/lesson/video-embed.tsx`: Triggering `AuthPromptModal` when unauthenticated users attempt play.

---

## Decisions & Technical Approach
1. **Hydration-Safe React Portal**:
   - Render `AuthPromptModal` via `createPortal(modalElement, document.body)` with a `mounted` state check.
   - This hoists the modal out of the lesson DOM tree and directly into `document.body`, guaranteeing it covers `100vw` and `100vh` and is centered relative to the **device viewport**, not the video container.
2. **Body Scroll Lock**:
   - When the modal opens, save current body overflow and set `document.body.style.overflow = "hidden"`. Restore previous style on close or unmount.
3. **UI/UX Pro Max Visual Polish**:
   - Multi-layer glassmorphism: `bg-neutral-950/90`, `backdrop-blur-xl`, `border border-white/10`, `shadow-2xl shadow-black/90`.
   - Ambient terracotta lighting: Dual-layer radial gradient glow (`bg-gradient-to-tr from-[#E05A36]/20 via-[#E05A36]/10 to-transparent blur-3xl`).
   - Icon badge: Glowing lock + sparkle badge with smooth gradient border.
   - Benefit cards: 3 micro-cards with highlighted benefit icons (`Play`, `Sparkles`, `Check`), crisp text hierarchy, and subtle hover reaction.
   - Primary & Secondary CTA buttons: High-contrast buttons with tactile press scale (`active:scale-[0.98]`), minimum 44px touch targets, and accessible focus rings.
   - Close button: Enhanced contrast with accessible tooltip and ring.
4. **Accessibility & Usability**:
   - Full keyboard navigation, `Escape` key dismissal, backdrop click dismissal with propagation stop on the card.

---

## Files to Modify
- `web/components/lesson/auth-prompt-modal.tsx` — Implement `createPortal`, body scroll lock, and UI/UX Pro Max design enhancements.

---

## Security Considerations
- Purely presentation and client-side modal layer; utilizes Clerk's secure `<SignInButton mode="modal">` and `<SignUpButton mode="modal">`.
- No sensitive keys or tokens exposed.

---

## Acceptance Criteria
- [x] Modal is rendered at the top level of the DOM via `createPortal` to `document.body`.
- [x] Modal is centered precisely in the center of the device viewport across desktop, tablet, and mobile screens regardless of page scroll.
- [x] Background page scrolling is locked while the modal is visible.
- [x] Glassmorphism, radiant glow, and typography follow `ui-ux-pro-max` guidelines.
- [x] Closing via `Escape` key, backdrop click, or close button works immediately.
- [x] Clerk sign-in and sign-up modals trigger seamlessly without full page reload.
- [x] All unit tests pass and TypeScript check passes with zero errors.

---

## Checks to Run
- `npm test` in `web/`
- `npx tsc --noEmit` in `web/`

---

## Manual Test Steps
1. In an unauthenticated browser window, navigate to a lesson page (e.g. `http://localhost:3000/lessons/foundations-of-modern-full-stack-web-development-101-l1`).
2. Scroll down so the video player is partially or fully offset from the top.
3. Click any video play trigger (or scrubber/controls).
4. Verify the modal opens centered in the device screen viewport.
5. Verify background page scrolling is locked.
6. Verify design aesthetics: ambient terracotta glow, glassmorphism border, benefit list, CTA buttons with focus rings.
7. Test closing with Escape key and backdrop click.

# Implementation Prompt: Logged-in User Notification Module

## 1. Goal
Implement a production-grade, interactive Notification Module for authenticated learners on Vertex:
1. **Interactive Navbar Bell & Popover**: Replace the static `<Bell />` placeholder in `web/components/layout/navbar.tsx` with an interactive, animated notification popover displaying real-time unread count badges, relative timestamps, and action deep-links.
2. **Notification Data Layer (`web/lib/notifications.ts`)**:
   - Structured notification schema supporting course updates, learning streaks, discussion Q&A replies, completion certificates, and billing alerts.
   - In-memory store and helper functions for retrieval, unread counting, creating notifications, and marking individual or all items as read.
   - Default contextual notifications seeded for authenticated learners (e.g. welcome guide, streak momentum reminder, course certificate available).
3. **Notification API Endpoints (`web/app/api/notifications/route.ts`)**:
   - `GET /api/notifications`: Returns the authenticated user's notification list and unread count.
   - `PATCH /api/notifications`: Handles marking single notifications or bulk "Mark all as read" requests.
4. **Comprehensive Automated Tests (`web/test/notifications.test.ts`)**:
   - Unit tests verifying notification retrieval, filtering, unread counting, read status mutations, and API route handling.

---

## 2. Inspected Code & Architecture
- `web/components/layout/navbar.tsx`:
  - Contains lines 70–76 rendering a static button with `<Bell className="h-4.5 w-4.5" />` inside `<Show when="signed-in">`.
  - Currently has no click handler, dropdown state, or unread indicator.
- Authentication context:
  - User identity is managed by Clerk (`@clerk/nextjs`).
  - Server routes use `currentUser()` from `@clerk/nextjs/server` to key state by `userId`.
- Theme & Styling:
  - Dark mode supported via Tailwind CSS (`dark:` classes, `#0F172A` background, `#E05A36` terracotta accents).
  - Lucide icons (`Bell`, `Flame`, `Award`, `MessageSquare`, `BookOpen`, `CheckCheck`, `Check`).

---

## 3. Decisions & Implementation Details

1. **`web/lib/notifications.ts`**:
   - Define TypeScript interface `Notification`:
     - `id: string`
     - `userId: string`
     - `type: "streak" | "course_update" | "discussion" | "certificate" | "system"`
     - `title: string`
     - `message: string`
     - `href: string`
     - `read: boolean`
     - `createdAt: string`
   - Store notifications in a runtime memory store keyed by `userId`.
   - Provide initial personalized seed notifications for any logged-in user so the popover is functional and demonstrable immediately upon login.
   - Implement `getNotificationsForUser(userId)`, `getUnreadNotificationCount(userId)`, `markNotificationAsRead(userId, id)`, and `markAllNotificationsAsRead(userId)`.

2. **`web/app/api/notifications/route.ts`**:
   - Authenticated route via `currentUser()`.
   - `GET`: Returns `{ notifications, unreadCount }`.
   - `PATCH`: Accepts `{ id?: string, all?: boolean }` and returns updated `{ success: true, unreadCount }`.
   - Returns `401 Unauthorized` for unauthenticated requests.

3. **`web/components/layout/notification-popover.tsx`**:
   - Client component with dropdown toggle, click-outside listener, and keyboard `Escape` dismissal.
   - Bell button with unread count badge (pill showing unread count `1`, `2`, `3+`, pulsing terracotta accent dot).
   - Popover panel:
     - Header: "Notifications" title with total unread count + "Mark all as read" button (`CheckCheck` icon).
     - Filter tabs: "All" and "Unread".
     - Notification items:
       - Type-specific icon badge (Flame for streaks, Award for certificates, MessageSquare for Q&A, BookOpen for lessons).
       - Title, relative time (`"Just now"`, `"15m ago"`, `"2h ago"`), description.
       - Blue/Orange unread dot.
       - Click handler marks as read and navigates to `href`.
     - Empty state: clean, accessible illustration with "You're all caught up!".

4. **`web/components/layout/navbar.tsx`**:
   - Replace the static `<button>` with `<NotificationPopover />`.

5. **`web/test/notifications.test.ts`**:
   - Test initial notification seeding and retrieval.
   - Test marking a single notification as read.
   - Test bulk mark-all-as-read.
   - Test unread count calculation.
   - Test relative time formatting helper.

---

## 4. Files to Touch
1. `web/lib/notifications.ts` (New) — Notification schema, store, and business logic.
2. `web/app/api/notifications/route.ts` (New) — API Route Handler for GET & PATCH.
3. `web/components/layout/notification-popover.tsx` (New) — Interactive popover UI component.
4. `web/components/layout/navbar.tsx` (Modified) — Integrate `NotificationPopover`.
5. `web/test/notifications.test.ts` (New) — Unit tests for the notification module.
6. `web/package.json` (Modified) — Include `test/notifications.test.ts` in the test script.

---

## 5. Security & Boundary Considerations
- Notifications are strictly keyed by authenticated Clerk `userId`.
- Users cannot read or mutate another user's notifications.
- Unauthenticated requests to `/api/notifications` are blocked with 401.

---

## 6. Acceptance Criteria
- [ ] Logged-in users see an interactive bell in the navbar with an unread badge indicator.
- [ ] Clicking the bell toggles an accessible, dark/light theme matched dropdown popover.
- [ ] Users can view notifications with relative timestamps, type icons, and deep links.
- [ ] Users can mark individual notifications as read or click "Mark all as read".
- [ ] Clicking outside or pressing `Escape` closes the popover.
- [ ] Filter between "All" and "Unread" notifications works smoothly.
- [ ] All unit tests in `test/notifications.test.ts` pass.
- [ ] Strict TypeScript (`tsc --noEmit`) passes with 0 errors.
- [ ] ESLint (`npm run lint`) passes with 0 errors.
- [ ] Next.js production build (`npm run build`) completes successfully.

---

## 7. Checks to Run
- `npm --prefix web run type-check`
- `npm --prefix web test`
- `npm --prefix web run lint`
- `npm --prefix web run build`

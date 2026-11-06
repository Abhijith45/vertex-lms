# Implementation Prompt: Fix Video Autohide Behavior and Autoplay Toggle Reload Bug

## 1. Goal
Fix two specific video player bugs in `web/components/lesson/video-embed.tsx`:
1. **Autoplay Toggle Video Reload Bug**: Prevent the video player from reloading and restarting from 0:00 whenever the user toggles the "Autoplay next" button.
2. **Controls Autohide Bug**: Ensure video controls reliably fade out after 2 seconds of inactivity during playback, stay visible when the mouse moves, disappear on mouse leave, and remain visible when paused or when menus are open.

## 2. Skills Consulted
- **AGENTS.md**: Section 2 (loop, prompt confirmation, test report), Section 3 (micro-interaction quality), Section 7 (grounded player behavior).
- **ui-ux-pro-max**: Video player interaction standards (timer debouncing using ref-based state decoupling, eliminating timer re-triggering during high-frequency time update re-renders).

## 3. Code Inspected & Root Cause Analysis
- **Bug 1 Root Cause**:
  In `web/components/lesson/video-embed.tsx` (line 164), `autoplayNext` was included in the dependency array of the `useEffect` that initializes and destroys `window.YT.Player`. Toggling `autoplayNext` triggered effect re-execution, calling `playerInstanceRef.current.destroy()` and recreating the iframe player, causing a full reload.
  - *Fix*: Decouple `autoplayNext` from the player instantiation effect using an `autoplayNextRef` ref.
- **Bug 2 Root Cause**:
  The 200ms `currentTime` polling interval was re-rendering the component, which caused callback recreation and dependency thrashing in `useEffect`, resetting the 2-second timer continuously so it never fired.
  - *Fix*: Use a stable ref-based timer architecture (`isPlayingRef`, `isSettingsOpenRef`, `isHoveringVolumeRef`) so the 2-second autohide timer executes cleanly without interference from continuous time state updates.

## 4. Proposed Changes
- **`web/components/lesson/video-embed.tsx`**:
  - Add `autoplayNextRef` to decouple autoplay setting from player lifecycle effect.
  - Re-architect autohide logic using stable ref checks:
    - 2s inactivity countdown during playback.
    - Reset timer on mouse move.
    - Instant hide on `onMouseLeave` if playing.
    - Always visible when paused or settings popover is open.

## 5. Requirements & Acceptance Criteria
- [ ] Toggling "Autoplay next" in the settings popover does NOT reload the video player or interrupt playback.
- [ ] Controls fade out (`opacity-0 pointer-events-none`) after 2s of cursor inactivity while video is playing.
- [ ] Moving the mouse immediately restores controls (`opacity-100 pointer-events-auto`) and restarts the 2s timer.
- [ ] Moving the mouse outside the player container immediately hides controls during playback.
- [ ] When video is paused, controls remain visible at all times.
- [ ] Zero TypeScript errors (`npx tsc --noEmit`) and all unit tests pass (`npm test`).

## 6. Checks to Run
- `npm test`
- `npx tsc --noEmit`
- Browser verification of autohide timer and autoplay toggle without video reload.

## 7. Manual Test Steps
1. Open http://localhost:3000/lessons/nextjs-app-router-in-depth-file-system-routing.
2. Click Play to start video.
3. Open Settings and click "Autoplay next" toggle switch. Verify video continues playing smoothly without reloading or resetting.
4. Leave mouse motionless inside player for 2s. Verify controls smoothly fade out.
5. Move mouse slightly inside player. Verify controls instantly reappear.
6. Move mouse completely outside the player area. Verify controls hide immediately.
7. Pause the video. Verify controls stay visible.

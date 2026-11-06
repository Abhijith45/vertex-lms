# Implementation Prompt: Native Video Controls for Vertex Lesson Player

## 1. Goal
Replace YouTube's native iframe player controls with custom, application-native video player controls matching the design in Screenshot 2 and [design/vertex-lesson.png](file:///c:/Users/Abhijeet Rawat/Desktop/nextJS/vertex/design/vertex-lesson.png):
- Disable YouTube's default UI (`controls=0`, `modestbranding=1`, `disablekb=1`).
- Provide custom application-native controls (central play button, interactive progress scrubber bar, play/pause, 10s rewind/forward, playback speed switcher, formatted elapsed/total timestamp, volume/mute control, and fullscreen toggle).
- Keep styling fully consistent with the existing Vertex application theme (terracotta `#E05A36`, dark neutral glassmorphism, responsive hover states).
- Add and run automated unit tests for video helper utilities (timestamp formatting, seek clamping, speed cycling, and embed URL configuration).

## 2. Skills Consulted
- **AGENTS.md**: Section 2 (prompt approval loop, reporting format), Section 3 (exact UI fidelity, responsive down to mobile), Section 7 (Playback stays on site through provider embed, do not send user away to external provider, start seconds support).
- **sanity-best-practices**: Consistent types, clean component boundaries.

## 3. Code Inspected
- `web/components/lesson/video-embed.tsx`: Currently renders a simple `iframe` with default YouTube controls.
- `web/lib/utils/video.ts`: `parseVideoUrl` currently builds embed URLs without `controls=0`.
- User screenshots:
  - Screenshot 1: Shows default YouTube controls (red YouTube badge, title overlay, native seek bar).
  - Screenshot 2: Shows the target custom player skin:
    - Large center circular play button with white triangle.
    - Full-width scrubber progress bar with progress highlight.
    - Bottom controls bar: Play/Pause, Rewind 10s, Playback Speed (`1x`), Forward 10s, Timestamp (`0:00 / 0:00`), Volume toggle with slider, Fullscreen toggle.
  - `design/vertex-lesson.png`: Confirms the matching custom control bar layout and terracotta styling.

## 4. Decisions and Assumptions
- **YouTube IFrame API Integration**:
  - Load the YouTube IFrame API (`https://www.youtube.com/iframe_api`) in the browser.
  - Initialize the player with `controls: 0` and `enablejsapi: 1` to hide YouTube's default controls while enabling two-way communication.
  - Listen to player state events (`onStateChange`, `onReady`) to track playing, paused, buffering, and ended states.
  - Poll current playback time at 250ms intervals while playing to update the progress scrubber and timestamp display smoothly.
- **Custom Player Controls UI**:
  - **Center Play Button**: Round dark button (`bg-neutral-900/80 hover:bg-neutral-900 hover:scale-105 transition-all text-white`) that toggles play/pause when the player is idle or paused.
  - **Scrubber Bar**:
    - Interactive seek slider with hover preview.
    - Active track styled in terracotta (`#E05A36`).
    - Drag / click to seek immediately via `player.seekTo(seconds, true)`.
  - **Bottom Controls Row**:
    - Play / Pause button (`Play` / `Pause` icons).
    - 10-second Rewind (`RotateCcw` with -10s).
    - 10-second Forward (`RotateCw` with +10s).
    - Playback Speed toggle pill: cycles `[0.75x, 1x, 1.25x, 1.5x, 2x]`.
    - Elapsed / Total timestamp: formatted as `M:SS` or `H:MM:SS` (e.g. `0:15 / 5:50`).
    - Volume button (`Volume2`, `VolumeX`) with hover slider.
    - Fullscreen toggle using the HTML5 Fullscreen API on the player container.
  - **Hover & Inactivity Behavior**:
    - Controls automatically fade out after 3 seconds of inactivity while playing, and reappear smoothly on mouse movement or touch.
    - Controls stay pinned when paused.
- **Unit Testing**:
  - Add unit tests in `web/test/video-controls.test.ts` for:
    - Time formatting (`formatVideoTime`: `45` -> `0:45`, `125` -> `2:05`, `3665` -> `1:01:05`).
    - Embed URL generation with `controls=0` and `enablejsapi=1`.
    - Playback rate cycling (`0.75x` -> `1x` -> `1.25x` -> `1.5x` -> `2x` -> `0.75x`).
    - Seek clamping (`clampSeekTime(time, duration)`).

## 5. Files Expected to Touch
- `web/lib/utils/video.ts` (Modify): Add `controls=0` to YouTube embed URL, add `formatVideoTime`, `getNextPlaybackRate`, `clampSeekTime`.
- `web/components/lesson/video-embed.tsx` (Modify): Implement custom native player controls overlay with YouTube IFrame API integration.
- `web/test/video-controls.test.ts` (New): Automated unit test suite.
- `web/package.json` (Modify): Update `test` script to run all unit tests in `test/`.

## 6. Requirements & Acceptance Criteria
- [ ] YouTube's native controls, title banner, and red YouTube button are hidden (`controls=0`).
- [ ] Large central play button appears when paused or idle.
- [ ] Custom progress scrubber smoothly tracks playback and allows interactive seeking to any timestamp.
- [ ] Rewind 10s and Forward 10s buttons seek the video accurately.
- [ ] Playback speed button cycles speeds (0.75x, 1x, 1.25x, 1.5x, 2x) and applies them to the video.
- [ ] Time indicator accurately displays current elapsed time and total duration in `M:SS` / `H:MM:SS`.
- [ ] Volume button toggles mute and controls audio level.
- [ ] Fullscreen button toggles container fullscreen mode.
- [ ] Styling strictly matches the application theme (terracotta `#E05A36`, dark neutral).
- [ ] All unit tests pass with `npm test`.
- [ ] Zero TypeScript errors (`npx tsc --noEmit`) and successful production build.

## 7. Checks to Run
- `npm test`
- `npx tsc --noEmit`
- `npm run build`
- Browser verification with screenshots.

## 8. Manual Test Steps
1. Navigate to `http://localhost:3000/lessons/nextjs-app-router-in-depth-file-system-routing`.
2. Observe video player has no YouTube native controls.
3. Click central play button or bottom play icon; verify video begins playback.
4. Verify custom scrubber advances and timestamp updates (e.g. `0:05 / 5:50`).
5. Click forward 10s and rewind 10s; verify playback jumps accordingly.
6. Click the progress bar at 50% to seek directly.
7. Click the speed button to switch to 1.5x and verify audio/video accelerates.
8. Click the volume icon to mute and unmute.
9. Click the fullscreen button to expand and contract.

# Implementation Prompt: Vertex Video Player UI/UX Improvements & Native Control Fixes

## 1. Goal
Implement 8 specific UI/UX enhancements to the Vertex lesson video player:
1. Fix timeline/scrubber synchronization so it continuously tracks real video playback time via YouTube IFrame API live polling (200ms).
2. Fix current playback time display so running seconds are accurately displayed (`0:15 / 5:50`) instead of staying stuck at `0:00`.
3. Position the volume slider to the **left** of the volume/speaker icon on hover, keeping the speaker button fixed in position.
4. Add interactive **Settings menu popover**:
   - Quality switcher (Auto, 1080p, 720p, 576p, 480p, 360p, 240p).
   - "Autoplay next video" toggle switch (with automatic navigation to the next lesson when video ends).
5. Fix Caption (CC) toggle on/off by interfacing with YouTube's captions module (`loadModule("captions")` / `unloadModule("captions")`) with active terracotta state styling.
6. Remove the Chapters icon from the player controls.
7. Remove the "Lesson notes" icon from the player controls (retaining the Notes tab below the player for presentation).
8. Implement precise autohide behavior:
   - When mouse is inside player, display controls and autohide after 2s of inactivity while playing.
   - Keep controls visible while mouse is moving.
   - Autohide immediately when mouse leaves the player area while playing.
   - Keep controls pinned when video is paused or when settings popover is open.
9. Execute automated unit tests for updated helper utilities.

## 2. Skills Consulted
- **AGENTS.md**: Section 2 (loop rules, prompt file, interactive question confirmation, report format), Section 3 (exact UI fidelity, responsive down to mobile), Section 7 (Playback stays on site through provider embed, auto-resume, start seconds support).
- **ui-ux-pro-max**: Video player interaction guidelines (micro-interactions, volume slider layout without layout shift, accessible tooltip positioning, 2s debounced inactivity timer, smooth glassmorphism popovers).

## 3. Code Inspected
- `web/components/lesson/video-embed.tsx`: Contains current video embed and player state management.
- `web/lib/utils/video.ts`: Time format and speed cycling helpers.
- `web/components/lesson/lesson-footer-nav.tsx`: Contains next lesson navigation.
- `web/app/lessons/[slug]/page.tsx`: Passes `nextLesson` slug and props.

## 4. Decisions and Assumptions
- **YouTube IFrame API Integration**:
  - Dynamically load `https://www.youtube.com/iframe_api` if `window.YT` is not already available.
  - Instantiate `new window.YT.Player` binding to a dedicated player container.
  - When playing (`playerState === 1`), run a 200ms interval polling `player.getCurrentTime()` and `player.getDuration()` to continuously update the progress scrubber and timestamp display.
  - When video ends (`playerState === 0`) and `autoplayNext` is enabled, automatically navigate to `nextLessonSlug` via Next.js router.
- **Volume Slider Positioning**:
  - Volume container uses `relative flex items-center`.
  - The volume slider is rendered as an absolute floating horizontal slider to the left (`absolute right-full mr-2 bg-neutral-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-neutral-700/60 shadow-xl`), keeping the speaker icon perfectly stationary.
- **Settings Menu**:
  - Floating popover positioned above the settings cog icon (`absolute bottom-full right-0 mb-3 w-56 rounded-xl bg-neutral-900/95 backdrop-blur-md border border-neutral-700/60 p-3 shadow-2xl text-xs z-30`).
  - Quality list with active checkmark.
  - Autoplay toggle switch with terracotta animated pill.
- **Captions Toggle**:
  - Toggles `loadModule("captions")` / `unloadModule("captions")` or `setOption("captions", "track", ...)` with active state highlighted in terracotta `#E05A36`.
- **Autohide Logic**:
  - Controlled by `showControls` state.
  - Mouse move inside player sets `showControls = true` and starts a 2s timer.
  - Mouse leave immediately sets `showControls = false` if playing and popups are closed.
  - Paused state forces `showControls = true`.

## 5. Files Expected to Touch
- `web/components/lesson/video-embed.tsx` (Modify): Complete overhaul with robust YT.Player lifecycle, volume left slider, settings popover, captions toggle, and autohide.
- `web/app/lessons/[slug]/page.tsx` (Modify): Pass `nextLessonSlug` to `VideoEmbed` for autoplay support.
- `web/test/video-controls.test.ts` (Modify/Expand): Add tests for quality selection and autoplay helpers.

## 6. Requirements & Acceptance Criteria
- [ ] Video scrubber/progress bar continuously moves in sync with playing video.
- [ ] Digital timestamp displays live elapsed time (e.g. `0:14 / 5:50`) during playback.
- [ ] Hovering on volume icon displays slider to the left without moving the volume icon.
- [ ] Settings icon opens popover with video quality choices and Autoplay next toggle.
- [ ] If Autoplay is ON and video ends, browser navigates to next lesson.
- [ ] Captions button toggles CC state and reflects active styling.
- [ ] Chapters icon and in-player Lesson notes icon are removed.
- [ ] Autohide hides controls after 2s of inactivity, keeps them visible while moving mouse, and hides when mouse exits during playback.
- [ ] All unit tests pass with `npm test`.
- [ ] Zero TypeScript errors (`npx tsc --noEmit`) and successful production build.

## 7. Checks to Run
- `npm test`
- `npx tsc --noEmit`
- `npm run build`
- Browser verification of player controls, settings menu, and volume slider.

## 8. Manual Test Steps
1. Open `http://localhost:3000/lessons/nextjs-app-router-in-depth-file-system-routing`.
2. Play video; verify the progress bar and running timestamp (e.g. `0:05`, `0:10`) update live.
3. Hover on the speaker icon; verify volume slider opens to the left and speaker icon remains stationary.
4. Click Settings; verify quality selector and Autoplay toggle appear in a glassmorphic popover.
5. Click Captions; verify CC toggle state.
6. Leave mouse idle for 2s during playback; verify controls fade out. Move mouse; verify controls reappear.

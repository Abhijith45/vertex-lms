"use client";

import React, { useState, useRef, useEffect, useCallback, useId } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  Volume1,
  VolumeX,
  Maximize,
  Minimize,
  Subtitles,
  Settings,
  Check,
} from "lucide-react";
import {
  parseVideoUrl,
  formatVideoTime,
  getNextPlaybackRate,
  clampSeekTime,
} from "@/lib/utils/video";
import posthog from "posthog-js";

import { AuthPromptModal } from "./auth-prompt-modal";

interface VideoEmbedProps {
  videoUrl?: string;
  title: string;
  startSeconds?: number;
  nextLessonSlug?: string;
  lessonSlug?: string;
  courseSlug?: string;
  freePreview?: boolean;
}

declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        config: {
          videoId: string;
          playerVars?: Record<string, number | string>;
          events?: Record<string, (event: { data?: number; target?: unknown }) => void>;
        }
      ) => YouTubePlayerInstance;
      PlayerState: { PLAYING: number; PAUSED: number; ENDED: number };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YouTubePlayerInstance {
  playVideo(): void;
  pauseVideo(): void;
  stopVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getPlayerState(): number;
  getCurrentTime(): number;
  getDuration(): number;
  getVolume(): number;
  setVolume(volume: number): void;
  isMuted(): boolean;
  mute(): void;
  unMute(): void;
  setPlaybackRate(rate: number): void;
  setPlaybackQuality(quality: string): void;
  getAvailablePlaybackRates(): number[];
  getAvailableQualityLevels(): string[];
  destroy(): void;
  loadModule?(moduleName: string): void;
  unloadModule?(moduleName: string): void;
  setOption?(module: string, option: string, value: unknown): void;
}

const QUALITY_OPTIONS = [
  { label: "Auto", value: "auto" },
  { label: "1080p", value: "hd1080" },
  { label: "720p", value: "hd720" },
  { label: "576p", value: "large" },
  { label: "480p", value: "medium" },
  { label: "360p", value: "small" },
  { label: "240p", value: "tiny" },
];

export function VideoEmbed({
  videoUrl,
  title,
  startSeconds = 0,
  nextLessonSlug,
  lessonSlug,
  courseSlug,
}: VideoEmbedProps) {
  const router = useRouter();
  const { isSignedIn, isLoaded: isAuthLoaded } = useUser();
  const rawId = useId();
  const playerId = `yt-player-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  // Auth gate state: show auth modal when unauthenticated user attempts play
  const [showLoginOverlay, setShowLoginOverlay] = useState(false);
  const requiresAuth = isAuthLoaded ? !isSignedIn : true;

  const hasStartedPlayingRef = useRef(false);
  const milestonesReachedRef = useRef<Set<number>>(new Set());
  const resumeTrackedRef = useRef(false);
  const hasCompletedRef = useRef(false);

  const lessonSlugRef = useRef(lessonSlug);
  const courseSlugRef = useRef(courseSlug);
  const titleRef = useRef(title);
  const videoUrlRef = useRef(videoUrl);

  useEffect(() => {
    lessonSlugRef.current = lessonSlug;
    courseSlugRef.current = courseSlug;
    titleRef.current = title;
    videoUrlRef.current = videoUrl;
  }, [lessonSlug, courseSlug, title, videoUrl]);

  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const playerInstanceRef = useRef<YouTubePlayerInstance | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hideControlsTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(startSeconds);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [selectedQuality, setSelectedQuality] = useState("auto");
  const [isCaptionsOn, setIsCaptionsOn] = useState(false);
  const [autoplayNext, setAutoplayNext] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isHoveringVolume, setIsHoveringVolume] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);
  const [apiReady, setApiReady] = useState(false);

  // Stable references for state that shouldn't trigger player recreation or timer resets.
  // Assigned in an effect so we don't mutate refs during render.
  const autoplayNextRef = useRef(autoplayNext);
  const nextLessonSlugRef = useRef(nextLessonSlug);
  const isPlayingRef = useRef(isPlaying);
  const isSettingsOpenRef = useRef(isSettingsOpen);
  const isHoveringVolumeRef = useRef(isHoveringVolume);
  const isDraggingProgressRef = useRef(isDraggingProgress);

  useEffect(() => {
    autoplayNextRef.current = autoplayNext;
    nextLessonSlugRef.current = nextLessonSlug;
    isPlayingRef.current = isPlaying;
    isSettingsOpenRef.current = isSettingsOpen;
    isHoveringVolumeRef.current = isHoveringVolume;
    isDraggingProgressRef.current = isDraggingProgress;
  }, [autoplayNext, nextLessonSlug, isPlaying, isSettingsOpen, isHoveringVolume, isDraggingProgress]);

  const parsed = parseVideoUrl(videoUrl, startSeconds);

  // ──────────────────────────────────────────────────────────
  // 1. YouTube IFrame API Initialization
  // ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!parsed || parsed.provider !== "youtube" || !parsed.id) return;

    // Load YouTube API script if not loaded
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        setApiReady(true);
      };
    } else {
      setApiReady(true);
    }
  }, [parsed]);

  // Instantiate YT.Player (Strictly decoupled from autoplayNext state to prevent reloading)
  useEffect(() => {
    if (!apiReady || !parsed || parsed.provider !== "youtube" || !parsed.id) return;

    try {
      if (playerInstanceRef.current) {
        playerInstanceRef.current.destroy?.();
      }

      playerInstanceRef.current = new window.YT.Player(playerId, {
        videoId: parsed.id,
        playerVars: {
          autoplay: 0,
          controls: 0,
          rel: 0,
          modestbranding: 1,
          disablekb: 1,
          playsinline: 1,
          iv_load_policy: 3,
          start: startSeconds > 0 ? Math.floor(startSeconds) : 0,
          enablejsapi: 1,
        },
        events: {
          onReady: (event: any) => {
            const d = event.target.getDuration();
            if (d && d > 0) setDuration(d);
            if (startSeconds > 0) {
              event.target.seekTo(startSeconds, true);
              event.target.pauseVideo?.();
              setCurrentTime(startSeconds);
              setIsPlaying(false);
            }
          },
          onStateChange: (event: any) => {
            // 1: PLAYING, 2: PAUSED, 0: ENDED, 3: BUFFERING
            if (event.data === 1) {
              setIsPlaying(true);
              const isInitial = !hasStartedPlayingRef.current;
              hasStartedPlayingRef.current = true;

              // Track resume used if starting from a positive startSeconds
              if (startSeconds > 0 && !resumeTrackedRef.current) {
                resumeTrackedRef.current = true;
                posthog.capture("resume_used", {
                  lesson_slug: lessonSlugRef.current || "",
                  lesson_title: titleRef.current,
                  course_slug: courseSlugRef.current || "",
                  start_seconds: startSeconds,
                  source: "video_player",
                });
              }

              posthog.capture("video_played", {
                lesson_slug: lessonSlugRef.current || "",
                lesson_title: titleRef.current,
                course_slug: courseSlugRef.current || "",
                video_url: videoUrlRef.current || "",
                current_time: Math.floor(playerInstanceRef.current?.getCurrentTime() || currentTime),
                duration: Math.floor(duration || playerInstanceRef.current?.getDuration() || 0),
                start_seconds: startSeconds,
                is_initial_play: isInitial,
              });
            } else if (event.data === 2) {
              setIsPlaying(false);
              const curr = playerInstanceRef.current?.getCurrentTime() || currentTime;
              const dur = duration || playerInstanceRef.current?.getDuration() || 0;
              posthog.capture("video_paused", {
                lesson_slug: lessonSlugRef.current || "",
                lesson_title: titleRef.current,
                course_slug: courseSlugRef.current || "",
                current_time: Math.floor(curr),
                duration: Math.floor(dur),
                percent_complete: dur > 0 ? Math.round((curr / dur) * 100) : 0,
              });
            } else if (event.data === 0) {
              setIsPlaying(false);
              const dur = duration || playerInstanceRef.current?.getDuration() || 0;
              if (!hasCompletedRef.current) {
                hasCompletedRef.current = true;
                posthog.capture("lesson_completed", {
                  lesson_slug: lessonSlugRef.current || "",
                  lesson_title: titleRef.current,
                  course_slug: courseSlugRef.current || "",
                  duration: Math.floor(dur),
                  source: "video_ended",
                });

                if (lessonSlugRef.current) {
                  fetch("/api/progress", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      lessonSlug: lessonSlugRef.current,
                      courseSlug: courseSlugRef.current,
                      positionSeconds: Math.floor(dur),
                      completed: true,
                    }),
                  }).catch(() => {});
                }
              }

              // Read from ref so autoplay state toggle never triggers player re-init
              if (autoplayNextRef.current && nextLessonSlugRef.current) {
                router.push(`/lessons/${nextLessonSlugRef.current}`);
              }
            }
          },
        },
      });
    } catch (e) {
      console.error("Error initializing YouTube Player:", e);
    }

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (playerInstanceRef.current) {
        try {
          playerInstanceRef.current.destroy?.();
        } catch {}
      }
    };
  }, [apiReady, parsed?.id, playerId, startSeconds, router]);

  // Dynamic seek update when startSeconds prop changes or player is mounted
  useEffect(() => {
    if (startSeconds > 0) {
      setCurrentTime(startSeconds);
      if (playerInstanceRef.current && typeof playerInstanceRef.current.seekTo === "function") {
        try {
          playerInstanceRef.current.seekTo(startSeconds, true);
          if (!isPlayingRef.current) {
            playerInstanceRef.current.pauseVideo?.();
            setIsPlaying(false);
          }
        } catch {}
      }
    }
  }, [startSeconds]);

  // ──────────────────────────────────────────────────────────
  // 2. Continuous 200ms Time & Scrubber Sync Polling
  // ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (isPlaying) {
      pollIntervalRef.current = setInterval(() => {
        if (playerInstanceRef.current && typeof playerInstanceRef.current.getCurrentTime === "function") {
          try {
            const curr = playerInstanceRef.current.getCurrentTime();
            const dur = playerInstanceRef.current.getDuration();
            if (typeof curr === "number" && !isNaN(curr) && !isDraggingProgressRef.current) {
              setCurrentTime(curr);
            }
            if (typeof dur === "number" && dur > 0 && isNaN(duration)) {
              setDuration(dur);
            } else if (typeof dur === "number" && dur > 0 && duration === 0) {
              setDuration(dur);
            }

            // Track watch depth milestones: 25%, 50%, 75%, 90%, 100%
            if (typeof dur === "number" && dur > 0 && typeof curr === "number" && !isNaN(curr)) {
              const percent = Math.floor((curr / dur) * 100);
              const milestones = [25, 50, 75, 90, 100];
              for (const m of milestones) {
                if (percent >= m && !milestonesReachedRef.current.has(m)) {
                  milestonesReachedRef.current.add(m);
                  posthog.capture("video_watch_depth", {
                    lesson_slug: lessonSlugRef.current || "",
                    lesson_title: titleRef.current,
                    course_slug: courseSlugRef.current || "",
                    percent: m,
                    seconds: Math.floor(curr),
                    duration: Math.floor(dur),
                  });

                  if (m === 100 && !hasCompletedRef.current) {
                    hasCompletedRef.current = true;
                    posthog.capture("lesson_completed", {
                      lesson_slug: lessonSlugRef.current || "",
                      lesson_title: titleRef.current,
                      course_slug: courseSlugRef.current || "",
                      duration: Math.floor(dur),
                      source: "video_ended",
                    });
                  }

                  if (lessonSlugRef.current && (m === 25 || m === 50 || m === 75 || m === 90 || m === 100)) {
                    fetch("/api/progress", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        lessonSlug: lessonSlugRef.current,
                        courseSlug: courseSlugRef.current,
                        positionSeconds: Math.floor(curr),
                        completed: m === 100,
                      }),
                    }).catch(() => {});
                  }
                }
              }
            }
          } catch {}
        }
      }, 200);
    } else {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [isPlaying, duration]);

  // ──────────────────────────────────────────────────────────
  // 3. Robust Autohide Controls (2s inactivity, instant on mouseleave)
  // ──────────────────────────────────────────────────────────
  const startHideTimer = useCallback(() => {
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }
    if (
      isPlayingRef.current &&
      !isSettingsOpenRef.current &&
      !isHoveringVolumeRef.current &&
      !isDraggingProgressRef.current
    ) {
      hideControlsTimerRef.current = setTimeout(() => {
        if (
          isPlayingRef.current &&
          !isSettingsOpenRef.current &&
          !isHoveringVolumeRef.current &&
          !isDraggingProgressRef.current
        ) {
          setShowControls(false);
        }
      }, 2000);
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    setShowControls(true);
    startHideTimer();
  }, [startHideTimer]);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    startHideTimer();
  }, [startHideTimer]);

  const handleMouseLeave = useCallback(() => {
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }
    if (
      isPlayingRef.current &&
      !isSettingsOpenRef.current &&
      !isHoveringVolumeRef.current &&
      !isDraggingProgressRef.current
    ) {
      setShowControls(false);
    }
  }, []);

  useEffect(() => {
    if (!isPlaying || isSettingsOpen) {
      setShowControls(true);
      if (hideControlsTimerRef.current) {
        clearTimeout(hideControlsTimerRef.current);
      }
    } else {
      startHideTimer();
    }
  }, [isPlaying, isSettingsOpen, startHideTimer]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // ──────────────────────────────────────────────────────────
  // 4. Player Control Actions
  // ──────────────────────────────────────────────────────────
  const togglePlay = () => {
    // Gate: if auth is required and user is not signed in, show login overlay
    if (requiresAuth && !isPlaying) {
      setShowLoginOverlay(true);
      return;
    }
    if (!playerInstanceRef.current) return;
    try {
      if (isPlaying) {
        playerInstanceRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        playerInstanceRef.current.playVideo();
        setIsPlaying(true);
      }
    } catch {}
    setShowControls(true);
    startHideTimer();
  };

  const handleRewind10 = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!playerInstanceRef.current) return;
    const newTime = clampSeekTime(currentTime - 10, duration);
    setCurrentTime(newTime);
    playerInstanceRef.current.seekTo?.(newTime, true);
    setShowControls(true);
    startHideTimer();
  };

  const handleForward10 = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!playerInstanceRef.current) return;
    const newTime = clampSeekTime(currentTime + 10, duration);
    setCurrentTime(newTime);
    playerInstanceRef.current.seekTo?.(newTime, true);
    setShowControls(true);
    startHideTimer();
  };

  const handleCycleSpeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextRate = getNextPlaybackRate(playbackRate);
    setPlaybackRate(nextRate);
    playerInstanceRef.current?.setPlaybackRate?.(nextRate);
    setShowControls(true);
    startHideTimer();
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!playerInstanceRef.current) return;
    if (isMuted) {
      playerInstanceRef.current.unMute?.();
      setIsMuted(false);
    } else {
      playerInstanceRef.current.mute?.();
      setIsMuted(true);
    }
    setShowControls(true);
    startHideTimer();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseInt(e.target.value, 10);
    setVolume(newVol);
    playerInstanceRef.current?.setVolume?.(newVol);
    if (newVol > 0 && isMuted) {
      playerInstanceRef.current?.unMute?.();
      setIsMuted(false);
    } else if (newVol === 0 && !isMuted) {
      playerInstanceRef.current?.mute?.();
      setIsMuted(true);
    }
  };

  const toggleCaptions = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!playerInstanceRef.current) return;
    try {
      if (isCaptionsOn) {
        playerInstanceRef.current.unloadModule?.("captions");
        setIsCaptionsOn(false);
      } else {
        playerInstanceRef.current.loadModule?.("captions");
        playerInstanceRef.current.setOption?.("captions", "track", { languageCode: "en" });
        setIsCaptionsOn(true);
      }
    } catch {}
    setShowControls(true);
    startHideTimer();
  };

  const handleSelectQuality = (qualityVal: string) => {
    setSelectedQuality(qualityVal);
    try {
      if (qualityVal === "auto") {
        playerInstanceRef.current?.setPlaybackQuality?.("default");
      } else {
        playerInstanceRef.current?.setPlaybackQuality?.(qualityVal);
      }
    } catch {}
  };

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // ──────────────────────────────────────────────────────────
  // 5. Interactive Scrubber Seek & Drag
  // ──────────────────────────────────────────────────────────
  const calculateSeekTime = (e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
    if (!progressBarRef.current) return 0;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = pos / rect.width;
    const totalDuration = duration > 0 ? duration : 350;
    return percentage * totalDuration;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const seekTime = calculateSeekTime(e);
    setCurrentTime(seekTime);
    playerInstanceRef.current?.seekTo?.(seekTime, true);
    setShowControls(true);
    startHideTimer();
  };

  useEffect(() => {
    if (!isDraggingProgress) return;

    const onMouseMove = (e: MouseEvent) => {
      const seekTime = calculateSeekTime(e);
      setCurrentTime(seekTime);
    };

    const onMouseUp = (e: MouseEvent) => {
      setIsDraggingProgress(false);
      const seekTime = calculateSeekTime(e);
      playerInstanceRef.current?.seekTo?.(seekTime, true);
      setShowControls(true);
      startHideTimer();
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDraggingProgress, duration, startHideTimer]);

  if (!parsed || !parsed.embedUrl) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl md:rounded-3xl bg-neutral-950 flex flex-col items-center justify-center text-neutral-400 p-8 text-center border border-neutral-800 shadow-lg">
        <p className="font-medium text-base text-neutral-300">No video source provided</p>
        <p className="text-xs text-neutral-500 mt-1">This lesson does not have a video stream attached.</p>
      </div>
    );
  }

  const effectiveDuration = duration > 0 ? duration : 350;
  const progressPercent = Math.min(100, Math.max(0, (currentTime / effectiveDuration) * 100));

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative aspect-video w-full overflow-hidden rounded-2xl md:rounded-3xl bg-black shadow-xl shadow-black/35 border border-neutral-900 group select-none cursor-default"
    >
      {/* ──────────────────────────────────────────────────────────
         STARTING TIMESTAMP INDICATOR
         ────────────────────────────────────────────────────────── */}
      {startSeconds > 0 && (
        <div className="absolute top-4 left-4 z-40 flex items-center gap-1.5 rounded-full bg-neutral-900/90 border border-neutral-700/80 px-3 py-1 text-xs font-medium text-white shadow-lg backdrop-blur-xs pointer-events-none">
          <span className="h-1.5 w-1.5 rounded-full bg-[#E05A36] animate-pulse" />
          <span>Starting at {formatVideoTime(startSeconds)}</span>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
         AUTH PROMPT MODAL (shown when unauthenticated user attempts play)
         ────────────────────────────────────────────────────────── */}
      <AuthPromptModal
        isOpen={showLoginOverlay && requiresAuth}
        onClose={() => setShowLoginOverlay(false)}
        lessonTitle={title}
      />

      {/* ──────────────────────────────────────────────────────────
         PROVIDER EMBED CONTAINER (YouTube / Vimeo / Bunny)
         ────────────────────────────────────────────────────────── */}
      {parsed.provider === "youtube" ? (
        <>
          <div className="absolute inset-0 h-full w-full pointer-events-none">
            <div id={playerId} className="h-full w-full object-cover" />
          </div>

          {/* CLICK TO TOGGLE PLAY OVERLAY */}
          <div
            onClick={togglePlay}
            className="absolute inset-0 z-10 cursor-pointer"
            aria-label={isPlaying ? "Pause video" : "Play video"}
          />

          {/* CENTER PLAY BUTTON (Only visible when paused/idle) */}
          {!isPlaying && (
            <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                className="pointer-events-auto flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-neutral-900/85 hover:bg-neutral-900 border border-neutral-700/60 text-white shadow-2xl transition-all duration-200 hover:scale-108 cursor-pointer group/center"
                aria-label="Play video"
              >
                <Play className="h-7 w-7 sm:h-9 sm:w-9 fill-white text-white translate-x-0.5 transition-transform group-hover/center:scale-105" />
              </button>
            </div>
          )}

          {/* CUSTOM NATIVE CONTROLS OVERLAY */}
          <div
            className={`absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/95 via-black/75 to-transparent pt-10 pb-3.5 px-4 sm:px-6 transition-opacity duration-300 pointer-events-auto ${
              showControls || !isPlaying || isSettingsOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
        {/* ── Progress Scrubber Bar ── */}
        <div
          ref={progressBarRef}
          onClick={handleSeek}
          onMouseDown={(e) => {
            e.stopPropagation();
            setIsDraggingProgress(true);
          }}
          className="relative h-2.5 w-full cursor-pointer flex items-center group/progress py-1"
        >
          {/* Background Track */}
          <div className="h-1 w-full rounded-full bg-neutral-700/70 group-hover/progress:h-1.5 transition-all overflow-hidden relative">
            {/* Filled Progress Bar (Application Terracotta Theme) */}
            <div
              className="h-full bg-[#E05A36] transition-all relative"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Scrubber Knob Thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-3.5 w-3.5 rounded-full bg-white shadow-md transition-transform scale-0 group-hover/progress:scale-100"
            style={{ left: `${progressPercent}%` }}
          />
        </div>

        {/* ── Control Bar Row ── */}
        <div className="mt-2 flex items-center justify-between gap-3 text-white text-xs sm:text-sm">
          {/* Left Controls Group */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Play/Pause */}
            <button
              type="button"
              onClick={togglePlay}
              className="p-1 text-white/90 hover:text-white hover:scale-110 transition-transform cursor-pointer focus:outline-hidden"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5 fill-white" />
              ) : (
                <Play className="h-5 w-5 fill-white" />
              )}
            </button>

            {/* 10s Rewind */}
            <button
              type="button"
              onClick={handleRewind10}
              className="relative p-1 text-white/80 hover:text-white hover:scale-110 transition-transform cursor-pointer focus:outline-hidden"
              title="Rewind 10 seconds"
              aria-label="Rewind 10 seconds"
            >
              <RotateCcw className="h-4.5 w-4.5" />
              <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold mt-0.5">
                10
              </span>
            </button>

            {/* Playback Speed Switcher */}
            <button
              type="button"
              onClick={handleCycleSpeed}
              className="px-2 py-0.5 rounded-md bg-white/15 hover:bg-white/25 text-[11px] sm:text-xs font-semibold text-white transition-colors cursor-pointer focus:outline-hidden"
              title="Change playback speed"
              aria-label={`Playback speed ${playbackRate}x`}
            >
              {playbackRate}x
            </button>

            {/* 10s Forward */}
            <button
              type="button"
              onClick={handleForward10}
              className="relative p-1 text-white/80 hover:text-white hover:scale-110 transition-transform cursor-pointer focus:outline-hidden"
              title="Forward 10 seconds"
              aria-label="Forward 10 seconds"
            >
              <RotateCw className="h-4.5 w-4.5" />
              <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold mt-0.5">
                10
              </span>
            </button>

            {/* Digital Timestamp Display (Live Updated) */}
            <div className="font-mono text-xs text-white/90 tracking-tight select-none">
              <span>{formatVideoTime(currentTime)}</span>
              <span className="mx-1 text-white/40">/</span>
              <span className="text-white/60">
                {formatVideoTime(effectiveDuration)}
              </span>
            </div>
          </div>

          {/* Right Controls Group */}
          <div className="flex items-center gap-3 sm:gap-4 relative">
            {/* Volume Control with Popout Slider on the LEFT */}
            <div
              className="relative flex items-center"
              onMouseEnter={() => setIsHoveringVolume(true)}
              onMouseLeave={() => setIsHoveringVolume(false)}
            >
              {/* Slider appears to the LEFT of the icon, keeping speaker in fixed position */}
              {isHoveringVolume && (
                <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-neutral-900/95 backdrop-blur-md px-3 py-2 rounded-lg border border-neutral-700/60 shadow-xl flex items-center gap-2 z-40 animate-in fade-in slide-in-from-right-2 duration-150">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 accent-[#E05A36] bg-neutral-700 rounded-full cursor-pointer"
                    aria-label="Volume slider"
                  />
                  <span className="text-[10px] font-mono text-neutral-300 min-w-[24px]">
                    {isMuted ? 0 : volume}%
                  </span>
                </div>
              )}

              {/* Speaker / Mic Button (Fixed Position) */}
              <button
                type="button"
                onClick={toggleMute}
                className="p-1 text-white/80 hover:text-white transition-colors cursor-pointer focus:outline-hidden"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-4.5 w-4.5 text-neutral-400" />
                ) : volume < 50 ? (
                  <Volume1 className="h-4.5 w-4.5" />
                ) : (
                  <Volume2 className="h-4.5 w-4.5" />
                )}
              </button>
            </div>

            {/* Subtitles / CC Toggle */}
            <button
              type="button"
              onClick={toggleCaptions}
              className={`p-1 transition-colors cursor-pointer focus:outline-hidden relative ${
                isCaptionsOn
                  ? "text-[#E05A36]"
                  : "text-white/70 hover:text-white"
              }`}
              title={isCaptionsOn ? "Disable captions" : "Enable captions"}
              aria-label="Captions"
            >
              <Subtitles className="h-4 w-4" />
              {isCaptionsOn && (
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-[#E05A36]" />
              )}
            </button>

            {/* Settings Button & Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSettingsOpen(!isSettingsOpen);
                }}
                className={`p-1 transition-colors cursor-pointer focus:outline-hidden ${
                  isSettingsOpen ? "text-[#E05A36]" : "text-white/70 hover:text-white"
                }`}
                title="Settings"
                aria-label="Settings"
                aria-expanded={isSettingsOpen}
              >
                <Settings className="h-4 w-4" />
              </button>

              {/* Settings Popover Menu */}
              {isSettingsOpen && (
                <div
                  className="absolute bottom-full right-0 mb-3 w-56 rounded-xl bg-neutral-900/95 backdrop-blur-md border border-neutral-700/60 p-3 shadow-2xl text-xs z-50 animate-in fade-in zoom-in-95 duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Quality Section */}
                  <div className="mb-3">
                    <span className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                      Quality
                    </span>
                    <div className="space-y-1">
                      {QUALITY_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleSelectQuality(opt.value)}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition-colors cursor-pointer text-left ${
                            selectedQuality === opt.value
                              ? "bg-[#E05A36]/20 text-[#E05A36] font-semibold"
                              : "text-neutral-300 hover:bg-white/10"
                          }`}
                        >
                          <span>{opt.label}</span>
                          {selectedQuality === opt.value && (
                            <Check className="h-3.5 w-3.5 text-[#E05A36]" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-neutral-800 my-2" />

                  {/* Autoplay Next Section */}
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="block font-medium text-neutral-200">
                        Autoplay next
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        Play next lesson when done
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setAutoplayNext(!autoplayNext)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        autoplayNext ? "bg-[#E05A36]" : "bg-neutral-700"
                      }`}
                      role="switch"
                      aria-checked={autoplayNext}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          autoplayNext ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1 text-white/80 hover:text-white hover:scale-110 transition-transform cursor-pointer focus:outline-hidden"
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              title="Fullscreen"
            >
              {isFullscreen ? (
                <Minimize className="h-4.5 w-4.5" />
              ) : (
                <Maximize className="h-4.5 w-4.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  ) : (
    <div className="absolute inset-0 h-full w-full">
      {requiresAuth && (
        <div
          onClick={() => setShowLoginOverlay(true)}
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-xs cursor-pointer group"
          aria-label="Play video"
        >
          <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-neutral-900/85 group-hover:bg-neutral-900 border border-neutral-700/60 text-white shadow-2xl transition-all duration-200 group-hover:scale-108">
            <Play className="h-7 w-7 sm:h-9 sm:w-9 fill-white text-white translate-x-0.5" />
          </div>
        </div>
      )}
      <iframe
        src={parsed.embedUrl}
        title={title}
        className="h-full w-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )}
</div>
  );
}


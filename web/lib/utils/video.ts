export type VideoProvider = "youtube" | "vimeo" | "bunny" | "unknown";

export interface ParsedVideo {
  provider: VideoProvider;
  id: string;
  embedUrl: string;
}

/**
 * Parse a video URL and construct an embed URL with custom controls enabled.
 * Supported providers: YouTube, Vimeo, Bunny.
 */
export function parseVideoUrl(url?: string, startSeconds: number = 0): ParsedVideo | null {
  if (!url) return null;

  // 1. YouTube
  // Matches:
  // https://www.youtube.com/watch?v=VIDEO_ID
  // https://youtu.be/VIDEO_ID
  // https://www.youtube.com/embed/VIDEO_ID
  const ytMatch =
    url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);

  if (ytMatch && ytMatch[1]) {
    const id = ytMatch[1];
    const startParam = startSeconds > 0 ? `&start=${Math.floor(startSeconds)}` : "";
    return {
      provider: "youtube",
      id,
      // controls=0 disables YouTube's default controls so our native controls can render cleanly
      // enablejsapi=1 allows our native player UI to control playback via the YouTube IFrame API
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}?autoplay=0&rel=0&enablejsapi=1&controls=0&modestbranding=1&disablekb=1&playsinline=1&iv_load_policy=3${startParam}`,
    };
  }

  // 2. Vimeo
  // Matches: https://vimeo.com/123456789
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    const id = vimeoMatch[1];
    const timeParam = startSeconds > 0 ? `#t=${Math.floor(startSeconds)}s` : "";
    return {
      provider: "vimeo",
      id,
      embedUrl: `https://player.vimeo.com/video/${id}${timeParam}`,
    };
  }

  // 3. Bunny
  // Matches: https://iframe.mediadelivery.net/embed/LIBRARY_ID/VIDEO_ID
  const bunnyMatch = url.match(/iframe\.mediadelivery\.net\/embed\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]+)/i);
  if (bunnyMatch && bunnyMatch[1] && bunnyMatch[2]) {
    return {
      provider: "bunny",
      id: bunnyMatch[2],
      embedUrl: url,
    };
  }

  return {
    provider: "unknown",
    id: "",
    embedUrl: url,
  };
}

/**
 * Format raw seconds into digital time display: "M:SS" or "H:MM:SS".
 */
export function formatVideoTime(seconds: number): string {
  if (!seconds || isNaN(seconds) || seconds < 0) {
    return "0:00";
  }

  const total = Math.floor(seconds);
  const hrs = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  const paddedSecs = secs.toString().padStart(2, "0");

  if (hrs > 0) {
    const paddedMins = mins.toString().padStart(2, "0");
    return `${hrs}:${paddedMins}:${paddedSecs}`;
  }

  return `${mins}:${paddedSecs}`;
}

export const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5, 2] as const;

/**
 * Cycle to the next playback rate.
 */
export function getNextPlaybackRate(currentRate: number): number {
  const index = PLAYBACK_RATES.indexOf(currentRate as any);
  if (index === -1 || index === PLAYBACK_RATES.length - 1) {
    return PLAYBACK_RATES[0];
  }
  return PLAYBACK_RATES[index + 1];
}

/**
 * Clamps seek time between 0 and video duration.
 */
export function clampSeekTime(time: number, duration: number): number {
  const max = duration && duration > 0 ? duration : 0;
  return Math.max(0, Math.min(time, max));
}

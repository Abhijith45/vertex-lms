"use client";

import React, { createContext, useContext, useState, useRef, useCallback } from "react";

interface LessonPlaybackContextType {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  seekTo: (seconds: number) => void;
  registerSeekHandler: (handler: (seconds: number) => void) => void;
  updatePlaybackState: (state: { currentTime?: number; duration?: number; isPlaying?: boolean }) => void;
}

const LessonPlaybackContext = createContext<LessonPlaybackContextType | null>(null);

export function LessonPlaybackProvider({ children }: { children: React.ReactNode }) {
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Store the seek implementation registered by the video player
  const seekHandlerRef = useRef<((seconds: number) => void) | null>(null);

  const registerSeekHandler = useCallback((handler: (seconds: number) => void) => {
    seekHandlerRef.current = handler;
  }, []);

  const seekTo = useCallback((seconds: number) => {
    const clamped = Math.max(0, Number.isFinite(seconds) ? seconds : 0);
    setCurrentTime(clamped);
    if (seekHandlerRef.current) {
      seekHandlerRef.current(clamped);
    }
  }, []);

  const updatePlaybackState = useCallback(
    (state: { currentTime?: number; duration?: number; isPlaying?: boolean }) => {
      if (typeof state.currentTime === "number" && !isNaN(state.currentTime)) {
        setCurrentTime(state.currentTime);
      }
      if (typeof state.duration === "number" && !isNaN(state.duration) && state.duration > 0) {
        setDuration(state.duration);
      }
      if (typeof state.isPlaying === "boolean") {
        setIsPlaying(state.isPlaying);
      }
    },
    []
  );

  return (
    <LessonPlaybackContext.Provider
      value={{
        currentTime,
        duration,
        isPlaying,
        seekTo,
        registerSeekHandler,
        updatePlaybackState,
      }}
    >
      {children}
    </LessonPlaybackContext.Provider>
  );
}

export function useLessonPlayback() {
  const context = useContext(LessonPlaybackContext);
  if (!context) {
    // Return a safe fallback if used outside provider
    return {
      currentTime: 0,
      duration: 0,
      isPlaying: false,
      seekTo: () => {},
      registerSeekHandler: () => {},
      updatePlaybackState: () => {},
    };
  }
  return context;
}

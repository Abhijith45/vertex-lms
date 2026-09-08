"use client";

import React, { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Lock, Sparkles, Check, X, Play } from "lucide-react";

const emptySubscribe = () => () => {};

interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonTitle?: string;
}

export function AuthPromptModal({
  isOpen,
  onClose,
  lessonTitle,
}: AuthPromptModalProps) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  // Lock body scroll while modal is active to prevent background jumps
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Handle ESC key press
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-neutral-900/60 dark:bg-black/85 backdrop-blur-sm dark:backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      {/* Modal Dialog Card centered in viewport */}
      <div
        className="relative w-full max-w-md my-auto overflow-hidden rounded-3xl bg-white/95 dark:bg-neutral-950/95 backdrop-blur-2xl border border-neutral-200/90 dark:border-white/10 p-6 sm:p-8 text-neutral-900 dark:text-white shadow-2xl shadow-neutral-900/10 dark:shadow-black/90 ring-1 ring-neutral-900/5 dark:ring-white/5 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow Graphic (Terracotta Accent) */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-52 w-64 rounded-full bg-[#E05A36]/15 dark:bg-[#E05A36]/25 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 right-0 h-44 w-44 rounded-full bg-[#E05A36]/8 dark:bg-[#E05A36]/10 blur-3xl pointer-events-none" />

        {/* Close Button with accessible target and ring */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200/80 dark:bg-white/5 dark:hover:bg-white/10 border border-neutral-200/80 dark:border-white/10 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-all cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-[#E05A36]"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Top Icon Badge */}
          <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E05A36] to-[#C2410C] text-white shadow-xl shadow-[#E05A36]/25 ring-1 ring-white/30 dark:ring-white/20">
            <Lock className="h-7 w-7 stroke-[2.2]" />
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-amber-500 dark:text-amber-400 shadow-xs">
              <Sparkles className="h-3.5 w-3.5 fill-amber-400" />
            </div>
          </div>

          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-[#E05A36]/10 border border-[#E05A36]/25 dark:border-[#E05A36]/30 px-3.5 py-1 text-[11px] font-semibold tracking-wider text-[#E05A36] uppercase mb-2.5 shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E05A36] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E05A36]" />
            </span>
            <span>Members Only Access</span>
          </div>

          {/* Heading */}
          <h2
            id="auth-modal-title"
            className="font-display text-2xl sm:text-[28px] font-bold text-neutral-900 dark:text-white tracking-tight leading-snug mb-2"
          >
            Unlock Full Video Access
          </h2>

          {/* Lesson context badge / quote */}
          {lessonTitle && (
            <div className="max-w-full inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neutral-100 dark:bg-white/5 border border-neutral-200/80 dark:border-white/10 text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-3 truncate">
              <Play className="h-3 w-3 fill-[#E05A36] text-[#E05A36] shrink-0" />
              <span className="truncate">{lessonTitle}</span>
            </div>
          )}

          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-sm mb-5">
            Sign in or create a free account to watch complete lessons, track your progress, and search video transcripts by exact moment.
          </p>

          {/* Feature highlights list (ui-ux-pro-max structured benefit cards) */}
          <div className="w-full rounded-2xl bg-neutral-50/90 dark:bg-white/[0.03] border border-neutral-200/80 dark:border-white/[0.08] divide-y divide-neutral-200/60 dark:divide-white/[0.05] p-1.5 mb-6 text-left">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-neutral-100/70 dark:hover:bg-white/[0.02] transition-colors">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#E05A36]/10 dark:bg-[#E05A36]/15 border border-[#E05A36]/20 dark:border-[#E05A36]/25 text-[#E05A36]">
                <Play className="h-3.5 w-3.5 fill-[#E05A36]" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-xs font-semibold text-neutral-900 dark:text-neutral-200">Full HD Video & Chapters</span>
                <span className="block text-[11px] text-neutral-500 dark:text-neutral-400">Stream high-quality lesson videos with seekable chapters</span>
              </div>
            </div>

            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-neutral-100/70 dark:hover:bg-white/[0.02] transition-colors">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#E05A36]/10 dark:bg-[#E05A36]/15 border border-[#E05A36]/20 dark:border-[#E05A36]/25 text-[#E05A36]">
                <Check className="h-3.5 w-3.5 stroke-[2.5]" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-xs font-semibold text-neutral-900 dark:text-neutral-200">Progress Tracking & Resume</span>
                <span className="block text-[11px] text-neutral-500 dark:text-neutral-400">Never lose your place across courses and modules</span>
              </div>
            </div>

            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-neutral-100/70 dark:hover:bg-white/[0.02] transition-colors">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#E05A36]/10 dark:bg-[#E05A36]/15 border border-[#E05A36]/20 dark:border-[#E05A36]/25 text-[#E05A36]">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-xs font-semibold text-neutral-900 dark:text-neutral-200">AI Moment Search</span>
                <span className="block text-[11px] text-neutral-500 dark:text-neutral-400">Jump directly to the exact second any concept is taught</span>
              </div>
            </div>
          </div>

          {/* Action buttons (Touch target >= 44px, tactile feedback, focus rings) */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
            <SignInButton mode="modal">
              <button
                type="button"
                className="w-full flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#E05A36] to-[#d04e2c] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#E05A36]/25 hover:shadow-[#E05A36]/35 hover:from-[#e86644] hover:to-[#db5734] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-[#E05A36] focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-950"
              >
                Sign In to Watch
              </button>
            </SignInButton>

            <SignUpButton mode="modal">
              <button
                type="button"
                className="w-full flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-300 dark:border-white/15 bg-neutral-50 hover:bg-neutral-100 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] hover:border-neutral-400 dark:hover:border-white/25 px-5 py-3 text-sm font-semibold text-neutral-800 hover:text-neutral-950 dark:text-neutral-200 dark:hover:text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-xs focus:outline-hidden focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-950"
              >
                Create Account
              </button>
            </SignUpButton>
          </div>

          {/* Footer note */}
          <p className="mt-4 text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
            Free forever • Instant setup in under 30 seconds
          </p>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

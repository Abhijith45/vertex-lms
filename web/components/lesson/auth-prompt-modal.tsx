"use client";

import React, { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock, Sparkles, Check, X, Play, CreditCard, RefreshCw } from "lucide-react";
import { buildAuthUrl } from "@/lib/utils/url";

const emptySubscribe = () => () => {};

export type PromptModalMode = "AUTH" | "PAYWALL" | "RENEWAL";

interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonTitle?: string;
  courseSlug?: string;
  mode?: PromptModalMode;
  lessonIndex?: number;
}

export function AuthPromptModal({
  isOpen,
  onClose,
  lessonTitle,
  courseSlug,
  mode = "AUTH",
  lessonIndex,
}: AuthPromptModalProps) {
  const pathname = usePathname();
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

  const isAuthMode = mode === "AUTH";
  const isRenewalMode = mode === "RENEWAL";
  const isPaywallMode = mode === "PAYWALL";

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
        {/* Subtle Ambient Brand Glow */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-48 w-48 rounded-full bg-[#E05A36]/15 blur-3xl dark:bg-[#E05A36]/25" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-orange-400/10 blur-3xl dark:bg-orange-500/20" />

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative flex flex-col items-center text-center">
          {/* Animated Header Icon */}
          <div className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E05A36]/15 to-orange-500/5 dark:from-[#E05A36]/25 dark:to-orange-500/10 border border-[#E05A36]/30 dark:border-[#E05A36]/40 shadow-inner">
            {isAuthMode && <Lock className="h-7 w-7 text-[#E05A36]" />}
            {isPaywallMode && <CreditCard className="h-7 w-7 text-[#E05A36]" />}
            {isRenewalMode && <RefreshCw className="h-7 w-7 text-[#E05A36]" />}
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E05A36] opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-[#E05A36]" />
            </span>
          </div>

          {/* Heading */}
          <h2
            id="auth-modal-title"
            className="font-display text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 mb-2"
          >
            {isAuthMode && "Sign In to Watch Lesson"}
            {isPaywallMode && "Enroll to Continue Learning"}
            {isRenewalMode && "Subscription Renewal Required"}
          </h2>

          {/* Lesson context badge / quote */}
          {lessonTitle && (
            <div className="max-w-full inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neutral-100 dark:bg-white/5 border border-neutral-200/80 dark:border-white/10 text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-3 truncate">
              <Play className="h-3 w-3 fill-[#E05A36] text-[#E05A36] shrink-0" />
              <span className="truncate">
                {typeof lessonIndex === "number" ? `Lesson ${lessonIndex}: ` : ""}
                {lessonTitle}
              </span>
            </div>
          )}

          {/* Body description */}
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-sm mb-5">
            {isAuthMode &&
              "Sign in or create a free account to watch complete lessons, track your progress, and preview the first 2 lessons of every course free."}
            {isPaywallMode &&
              "You've completed the 2 free introductory lessons! Enroll in this course or get an All-Access Pass to unlock all remaining modules and certification."}
            {isRenewalMode &&
              "Your subscription has expired or payment was past due. Update your billing method to resume unrestricted video playback."}
          </p>

          {/* Feature highlights list */}
          <div className="w-full rounded-2xl bg-neutral-50/90 dark:bg-white/[0.03] border border-neutral-200/80 dark:border-white/[0.08] divide-y divide-neutral-200/60 dark:divide-white/[0.05] p-1.5 mb-6 text-left">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-neutral-100/70 dark:hover:bg-white/[0.02] transition-colors">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#E05A36]/10 dark:bg-[#E05A36]/15 border border-[#E05A36]/20 dark:border-[#E05A36]/25 text-[#E05A36]">
                <Play className="h-3.5 w-3.5 fill-[#E05A36]" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-xs font-semibold text-neutral-900 dark:text-neutral-200">
                  {isAuthMode ? "First 2 Lessons Free" : "Full Curriculum Access"}
                </span>
                <span className="block text-[11px] text-neutral-500 dark:text-neutral-400">
                  {isAuthMode
                    ? "Free preview for all registered learners"
                    : "Stream all advanced modules and HD video chapters"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-neutral-100/70 dark:hover:bg-white/[0.02] transition-colors">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#E05A36]/10 dark:bg-[#E05A36]/15 border border-[#E05A36]/20 dark:border-[#E05A36]/25 text-[#E05A36]">
                <Check className="h-3.5 w-3.5 stroke-[2.5]" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-xs font-semibold text-neutral-900 dark:text-neutral-200">
                  Cryptographic Certificate
                </span>
                <span className="block text-[11px] text-neutral-500 dark:text-neutral-400">
                  Earn verifiable proof of skills on completion
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-neutral-100/70 dark:hover:bg-white/[0.02] transition-colors">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#E05A36]/10 dark:bg-[#E05A36]/15 border border-[#E05A36]/20 dark:border-[#E05A36]/25 text-[#E05A36]">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-xs font-semibold text-neutral-900 dark:text-neutral-200">
                  AI Contextual Copilot
                </span>
                <span className="block text-[11px] text-neutral-500 dark:text-neutral-400">
                  Ask questions synced to the exact second in the video
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          {isAuthMode && (
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
              <Link
                href={buildAuthUrl("sign-in", pathname)}
                className="w-full flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#E05A36] to-[#d04e2c] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#E05A36]/25 hover:shadow-[#E05A36]/35 hover:from-[#e86644] hover:to-[#db5734] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-[#E05A36]"
              >
                Sign In to Watch
              </Link>

              <Link
                href={buildAuthUrl("sign-up", pathname)}
                className="w-full flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-300 dark:border-white/15 bg-neutral-50 hover:bg-neutral-100 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] px-5 py-3 text-sm font-semibold text-neutral-800 dark:text-neutral-200 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                Create Account
              </Link>
            </div>
          )}

          {(isPaywallMode || isRenewalMode) && (
            <div className="flex flex-col gap-2.5 w-full">
              <Link
                href={`/courses/${courseSlug || "nextjs-app-router-in-depth"}#pricing`}
                onClick={onClose}
                className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#E05A36] to-[#d04e2c] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#E05A36]/25 hover:from-[#e86644] hover:to-[#db5734] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <CreditCard className="h-4 w-4" />
                <span>
                  {isRenewalMode ? "Update Payment & Renew" : "Enroll Now ($49 or $19/mo)"}
                </span>
              </Link>

              <Link
                href="/courses"
                onClick={onClose}
                className="w-full min-h-[38px] inline-flex items-center justify-center rounded-xl border border-neutral-200 dark:border-white/10 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors"
              >
                Browse All Courses
              </Link>
            </div>
          )}

          {/* Footer note */}
          <p className="mt-4 text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
            {isAuthMode
              ? "Free forever • Instant setup in under 30 seconds"
              : "30-day money-back guarantee • Secure Stripe Checkout"}
          </p>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

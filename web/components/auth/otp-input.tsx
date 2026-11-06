"use client";

import React, { useRef, useEffect, useState, useId } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (code: string) => void;
  onResend?: () => Promise<void> | void;
  resendCooldownSeconds?: number;
  disabled?: boolean;
  error?: string | null;
  targetEmail?: string;
  title?: string;
  description?: string;
}

export function OtpInput({
  length = 6,
  value,
  onChange,
  onComplete,
  onResend,
  resendCooldownSeconds = 60,
  disabled = false,
  error = null,
  targetEmail,
  title = "Check your email",
  description,
}: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [cooldown, setCooldown] = useState(resendCooldownSeconds);
  const [isResending, setIsResending] = useState(false);
  const baseId = useId();

  // Initialize inputRefs array length
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  // Focus the first input or next empty slot on initial mount
  useEffect(() => {
    const firstEmptyIndex = value.length < length ? value.length : 0;
    inputRefs.current[firstEmptyIndex]?.focus();
  }, [length, value.length]);

  // Handle countdown timer for resend code
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleInputChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    // Extract only digits
    const cleanDigit = inputVal.replace(/\D/g, "");

    if (!cleanDigit) {
      // Empty / deleted
      const chars = value.split("");
      chars[index] = "";
      const nextVal = chars.join("");
      onChange(nextVal);
      return;
    }

    // Single digit entry
    const lastChar = cleanDigit[cleanDigit.length - 1];
    const chars = value.split("");
    while (chars.length < length) chars.push("");
    chars[index] = lastChar;
    const nextVal = chars.join("").slice(0, length);
    onChange(nextVal);

    // Auto-advance focus to next input
    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Trigger complete callback when all digits are filled
    if (nextVal.length === length && onComplete) {
      onComplete(nextVal);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!value[index] && index > 0) {
        // Move back and clear previous
        inputRefs.current[index - 1]?.focus();
        const chars = value.split("");
        chars[index - 1] = "";
        onChange(chars.join(""));
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();
    const cleanNumbers = pastedData.replace(/\D/g, "").slice(0, length);
    if (!cleanNumbers) return;

    onChange(cleanNumbers);

    // Focus appropriate field after paste
    const nextIndex = Math.min(cleanNumbers.length, length - 1);
    inputRefs.current[nextIndex]?.focus();

    if (cleanNumbers.length === length && onComplete) {
      onComplete(cleanNumbers);
    }
  };

  const handleResendClick = async () => {
    if (cooldown > 0 || isResending || !onResend) return;
    try {
      setIsResending(true);
      await onResend();
      setCooldown(resendCooldownSeconds);
    } catch {
      // Handled upstream
    } finally {
      setIsResending(false);
    }
  };

  const digits = Array.from({ length }, (_, i) => value[i] || "");

  return (
    <div className="w-full flex flex-col items-center text-center">
      <h3 className="font-display text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 mb-2.5">
        {title}
      </h3>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-8 max-w-sm leading-relaxed">
        {description || (
          <>
            We sent a 6-digit verification code to{" "}
            {targetEmail ? (
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                {targetEmail}
              </span>
            ) : (
              "your email"
            )}
            . Enter it below to continue.
          </>
        )}
      </p>

      {/* 6 Digit Split Box Input */}
      <div className="flex items-center justify-center gap-2.5 sm:gap-3.5 mb-6">
        {digits.map((digit, idx) => (
          <input
            key={`${baseId}-otp-${idx}`}
            ref={(el) => {
              inputRefs.current[idx] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            disabled={disabled}
            onChange={(e) => handleInputChange(idx, e)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onPaste={handlePaste}
            aria-label={`Digit ${idx + 1}`}
            className={[
              "h-14 w-11 sm:h-16 sm:w-13 text-center text-xl sm:text-2xl font-bold rounded-2xl border bg-white dark:bg-neutral-900 shadow-2xs transition-all duration-150 outline-hidden select-none",
              error
                ? "border-red-500/80 text-red-600 dark:text-red-400 focus:ring-2 focus:ring-red-500/20"
                : "border-neutral-300 dark:border-neutral-700/80 text-neutral-900 dark:text-neutral-100 focus:border-[#E05A36] focus:ring-2 focus:ring-[#E05A36]/25",
              disabled ? "opacity-50 cursor-not-allowed" : "cursor-text",
            ].join(" ")}
          />
        ))}
      </div>

      {/* Error Feedback */}
      {error && (
        <div className="mb-5 flex items-center justify-center gap-2 text-xs font-medium text-red-600 dark:text-red-400 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Resend Action */}
      {onResend && (
        <div className="mt-1 flex items-center justify-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
          <span>Didn&apos;t receive the code?</span>
          {cooldown > 0 ? (
            <span className="font-medium text-neutral-600 dark:text-neutral-300">
              Resend in {cooldown}s
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResendClick}
              disabled={isResending || disabled}
              className="inline-flex items-center gap-1.5 font-semibold text-[#E05A36] hover:text-[#C2410C] dark:hover:text-[#F97316] transition-colors cursor-pointer disabled:opacity-50 py-1 px-2 rounded-lg hover:bg-[#E05A36]/5"
            >
              {isResending ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : null}
              <span>Resend code</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

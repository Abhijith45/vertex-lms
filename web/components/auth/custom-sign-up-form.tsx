"use client";

import React, { useState } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";
import { OtpInput } from "./otp-input";
import { SocialAuthButtons } from "./social-auth-buttons";
import { sanitizeRedirectUrl } from "@/lib/utils/url";

export function CustomSignUpForm() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawParam = searchParams.get("redirect_url");

  // Fallback to extract redirect_url from window.location.hash if coming from legacy link
  const [hashRedirect] = useState<string | null>(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      if (window.location.hash.includes("redirect_url=")) {
        const parts = window.location.hash.split("redirect_url=");
        return parts[1] || null;
      }
    }
    return null;
  });

  const redirectUrl = sanitizeRedirectUrl(rawParam || hashRedirect, "/");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [showOtpView, setShowOtpView] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to finalize sign-up session
  const completeSession = async () => {
    try {
      await signUp.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            console.log("Pending session task:", session.currentTask);
          }
          const destination = decorateUrl(redirectUrl);
          if (destination.startsWith("http")) {
            window.location.href = destination;
          } else {
            router.push(destination);
          }
        },
      });
    } catch (err: unknown) {
      const e = err as { message?: string };
      setFormError(e?.message || "Failed to activate new account.");
    }
  };

  // Submit initial registration form
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      // 1. Create user with email and password
      const { error } = await signUp.password({
        emailAddress: email,
        password,
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
      });

      if (error) {
        setFormError(error.message || "Failed to create account. Please check your details.");
        return;
      }

      // 2. Trigger email verification code if requirements missing
      if (
        signUp.status === "missing_requirements" &&
        signUp.unverifiedFields.includes("email_address")
      ) {
        const { error: sendCodeErr } = await signUp.verifications.sendEmailCode();
        if (sendCodeErr) {
          setFormError(sendCodeErr.message || "Failed to dispatch verification code.");
          return;
        }
        setShowOtpView(true);
      } else if (signUp.status === "complete") {
        await completeSession();
      }
    } catch (err: unknown) {
      const e = err as { message?: string };
      setFormError(e?.message || "An unexpected error occurred during sign up.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Verify OTP code
  const handleVerifyOtp = async (codeToVerify?: string) => {
    const code = codeToVerify || otpCode;
    if (code.length < 6) return;
    setFormError(null);
    setIsSubmitting(true);

    try {
      const { error } = await signUp.verifications.verifyEmailCode({ code });

      if (error) {
        setFormError(error.message || "Invalid verification code.");
        return;
      }

      if (signUp.status === "complete") {
        await completeSession();
      }
    } catch (err: unknown) {
      const e = err as { message?: string };
      setFormError(e?.message || "Failed to verify email code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend verification code
  const handleResendCode = async () => {
    await signUp.verifications.sendEmailCode();
  };

  // OTP Verification View
  if (showOtpView) {
    return (
      <div className="space-y-6">
        <OtpInput
          value={otpCode}
          onChange={setOtpCode}
          onComplete={handleVerifyOtp}
          onResend={handleResendCode}
          targetEmail={email}
          disabled={isSubmitting || fetchStatus === "fetching"}
          error={formError || errors?.fields?.code?.message}
          title="Verify your email"
        />

        <div className="pt-3">
          <button
            type="button"
            onClick={() => handleVerifyOtp()}
            disabled={otpCode.length < 6 || isSubmitting}
            className="w-full flex items-center justify-center gap-2.5 h-12 px-5 rounded-xl bg-gradient-to-r from-[#E05A36] to-[#C2410C] hover:from-[#EA580C] hover:to-[#9A3412] text-white text-sm font-semibold shadow-md shadow-[#E05A36]/20 hover:shadow-lg hover:shadow-[#E05A36]/30 active:scale-[0.99] transition-all cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="h-4.5 w-4.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setShowOtpView(false);
              setOtpCode("");
              setFormError(null);
            }}
            className="w-full mt-4 text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors py-1.5 cursor-pointer"
          >
            ← Edit email or registration details
          </button>
        </div>
      </div>
    );
  }

  // Registration Form View
  return (
    <div className="space-y-6">
      {/* Social OAuth Buttons */}
      <SocialAuthButtons mode="sign-up" redirectUrl={redirectUrl} />

      {/* Divider */}
      <div className="relative flex items-center justify-center my-6">
        <div className="w-full border-t border-neutral-200 dark:border-neutral-800" />
        <span className="absolute bg-white dark:bg-[#0F172A] px-3.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          Or register with email
        </span>
      </div>

      {/* Primary Error Alert */}
      {formError && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-3 text-xs text-red-600 dark:text-red-400 animate-in fade-in-50">
          <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{formError}</span>
        </div>
      )}

      {/* Sign Up Form */}
      <form onSubmit={handleSignUpSubmit} className="space-y-5">
        {/* Name Fields (First & Last) - Symmetrical Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
          <div>
            <label
              htmlFor="sign-up-first-name"
              className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2"
            >
              First name
            </label>
            <div className="group relative flex items-center h-12 w-full rounded-xl border border-neutral-300 dark:border-neutral-700/80 bg-white dark:bg-neutral-900 px-4 focus-within:border-[#E05A36] focus-within:ring-2 focus-within:ring-[#E05A36]/20 transition-all shadow-2xs">
              <User className="h-4.5 w-4.5 text-neutral-400 dark:text-neutral-500 shrink-0 group-focus-within:text-[#E05A36] transition-colors pointer-events-none" />
              <input
                id="sign-up-first-name"
                type="text"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Ada"
                className="h-full w-full bg-transparent pl-3 pr-1 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 border-0 outline-hidden focus:outline-hidden focus:ring-0"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="sign-up-last-name"
              className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2"
            >
              Last name
            </label>
            <div className="group relative flex items-center h-12 w-full rounded-xl border border-neutral-300 dark:border-neutral-700/80 bg-white dark:bg-neutral-900 px-4 focus-within:border-[#E05A36] focus-within:ring-2 focus-within:ring-[#E05A36]/20 transition-all shadow-2xs">
              <User className="h-4.5 w-4.5 text-neutral-400 dark:text-neutral-500 shrink-0 group-focus-within:text-[#E05A36] transition-colors pointer-events-none" />
              <input
                id="sign-up-last-name"
                type="text"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Lovelace"
                className="h-full w-full bg-transparent pl-3 pr-1 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 border-0 outline-hidden focus:outline-hidden focus:ring-0"
              />
            </div>
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label
            htmlFor="sign-up-email"
            className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2"
          >
            Email address
          </label>
          <div className="group relative flex items-center h-12 w-full rounded-xl border border-neutral-300 dark:border-neutral-700/80 bg-white dark:bg-neutral-900 px-4 focus-within:border-[#E05A36] focus-within:ring-2 focus-within:ring-[#E05A36]/20 transition-all shadow-2xs">
            <Mail className="h-4.5 w-4.5 text-neutral-400 dark:text-neutral-500 shrink-0 group-focus-within:text-[#E05A36] transition-colors pointer-events-none" />
            <input
              id="sign-up-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="h-full w-full bg-transparent pl-3 pr-1 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 border-0 outline-hidden focus:outline-hidden focus:ring-0"
            />
          </div>
          {errors?.fields?.emailAddress && (
            <p className="mt-1.5 text-xs text-red-500">{errors.fields.emailAddress.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label
            htmlFor="sign-up-password"
            className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2"
          >
            Password
          </label>
          <div className="group relative flex items-center h-12 w-full rounded-xl border border-neutral-300 dark:border-neutral-700/80 bg-white dark:bg-neutral-900 pl-4 pr-2.5 focus-within:border-[#E05A36] focus-within:ring-2 focus-within:ring-[#E05A36]/20 transition-all shadow-2xs">
            <Lock className="h-4.5 w-4.5 text-neutral-400 dark:text-neutral-500 shrink-0 group-focus-within:text-[#E05A36] transition-colors pointer-events-none" />
            <input
              id="sign-up-password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="h-full w-full bg-transparent pl-3 pr-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 border-0 outline-hidden focus:outline-hidden focus:ring-0 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="shrink-0 flex items-center justify-center p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors cursor-pointer rounded-lg focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#E05A36]/40"
            >
              {showPassword ? (
                <EyeOff className="h-4.5 w-4.5" />
              ) : (
                <Eye className="h-4.5 w-4.5" />
              )}
            </button>
          </div>
          {errors?.fields?.password && (
            <p className="mt-1.5 text-xs text-red-500">{errors.fields.password.message}</p>
          )}
        </div>

        {/* Terms notice */}
        <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed pt-1">
          By registering, you agree to our{" "}
          <Link href="/terms-of-service" className="underline hover:text-neutral-800 dark:hover:text-neutral-200 font-medium">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy-policy" className="underline hover:text-neutral-800 dark:hover:text-neutral-200 font-medium">
            Privacy Policy
          </Link>
          .
        </p>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || fetchStatus === "fetching"}
          className="w-full flex items-center justify-center gap-2.5 h-12 px-5 rounded-xl bg-gradient-to-r from-[#E05A36] to-[#C2410C] hover:from-[#EA580C] hover:to-[#9A3412] text-white text-sm font-semibold shadow-md shadow-[#E05A36]/20 hover:shadow-lg hover:shadow-[#E05A36]/30 active:scale-[0.99] transition-all cursor-pointer group disabled:opacity-50"
        >
          {isSubmitting || fetchStatus === "fetching" ? (
            <div className="h-4.5 w-4.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>
      </form>

      {/* Required Clerk Captcha Container */}
      <div id="clerk-captcha" />

      {/* Bottom Switch Link */}
      <div className="text-center pt-3">
        <p className="text-xs text-neutral-600 dark:text-neutral-400">
          Already have an account?{" "}
          <Link
            href={`/sign-in${redirectUrl !== "/" ? `?redirect_url=${encodeURIComponent(redirectUrl)}` : ""}`}
            className="font-semibold text-[#E05A36] hover:text-[#C2410C] transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";
import { OtpInput } from "./otp-input";
import { SocialAuthButtons } from "./social-auth-buttons";
import { sanitizeRedirectUrl } from "@/lib/utils/url";

export function CustomSignInForm() {
  const { signIn, errors, fetchStatus } = useSignIn();
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

  // Mode: "password" | "email_code" | "reset_password"
  const [authMethod, setAuthMethod] = useState<"password" | "email_code">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [showOtpView, setShowOtpView] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to finalize session
  const completeSession = async () => {
    try {
      await signIn.finalize({
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
      setFormError(e?.message || "Failed to finalize session.");
    }
  };

  // Submit password or initiate email code
  const handlePrimarySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      if (authMethod === "password") {
        const { error } = await signIn.password({
          identifier: email,
          password,
        });

        if (error) {
          setFormError(error.message || "Invalid email or password.");
          return;
        }

        if (signIn.status === "complete") {
          await completeSession();
        } else if (
          signIn.status === "needs_second_factor" ||
          signIn.status === "needs_client_trust"
        ) {
          // Trigger MFA / Device trust code
          await signIn.mfa.sendEmailCode();
          setShowOtpView(true);
        }
      } else {
        // Email Code (Passwordless OTP)
        const { error } = await signIn.emailCode.sendCode({
          emailAddress: email,
        });

        if (error) {
          setFormError(error.message || "Failed to send verification code.");
          return;
        }

        setShowOtpView(true);
      }
    } catch (err: unknown) {
      const e = err as { message?: string };
      setFormError(e?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Verify OTP code
  const handleOtpVerify = async (codeToVerify?: string) => {
    const code = codeToVerify || otpCode;
    if (code.length < 6) return;
    setFormError(null);
    setIsSubmitting(true);

    try {
      if (
        signIn.status === "needs_second_factor" ||
        signIn.status === "needs_client_trust"
      ) {
        const { error } = await signIn.mfa.verifyEmailCode({ code });
        if (error) {
          setFormError(error.message || "Invalid verification code.");
          return;
        }
      } else {
        const { error } = await signIn.emailCode.verifyCode({ code });
        if (error) {
          setFormError(error.message || "Invalid verification code.");
          return;
        }
      }

      if (signIn.status === "complete") {
        await completeSession();
      }
    } catch (err: unknown) {
      const e = err as { message?: string };
      setFormError(e?.message || "Failed to verify code. Please check and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend OTP code
  const handleResendCode = async () => {
    if (
      signIn.status === "needs_second_factor" ||
      signIn.status === "needs_client_trust"
    ) {
      await signIn.mfa.sendEmailCode();
    } else {
      await signIn.emailCode.sendCode({ emailAddress: email });
    }
  };

  // If in OTP verification step
  if (showOtpView) {
    return (
      <div className="space-y-6">
        <OtpInput
          value={otpCode}
          onChange={setOtpCode}
          onComplete={handleOtpVerify}
          onResend={handleResendCode}
          targetEmail={email}
          disabled={isSubmitting || fetchStatus === "fetching"}
          error={formError || errors?.fields?.code?.message}
        />

        <div className="pt-3">
          <button
            type="button"
            onClick={() => handleOtpVerify()}
            disabled={otpCode.length < 6 || isSubmitting}
            className="w-full flex items-center justify-center gap-2.5 h-12 px-5 rounded-xl bg-gradient-to-r from-[#E05A36] to-[#C2410C] hover:from-[#EA580C] hover:to-[#9A3412] text-white text-sm font-semibold shadow-md shadow-[#E05A36]/20 hover:shadow-lg hover:shadow-[#E05A36]/30 active:scale-[0.99] transition-all cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="h-4.5 w-4.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Verify & Sign in</span>
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
            ← Back to sign-in options
          </button>
        </div>
      </div>
    );
  }

  // Standard Credentials View
  return (
    <div className="space-y-6">
      {/* OAuth Buttons */}
      <SocialAuthButtons mode="sign-in" redirectUrl={redirectUrl} />

      {/* Divider */}
      <div className="relative flex items-center justify-center my-6">
        <div className="w-full border-t border-neutral-200 dark:border-neutral-800" />
        <span className="absolute bg-white dark:bg-[#0F172A] px-3.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          Or continue with
        </span>
      </div>

      {/* Primary Form Error Alert */}
      {formError && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-3 text-xs text-red-600 dark:text-red-400 animate-in fade-in-50">
          <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{formError}</span>
        </div>
      )}

      {/* Form Inputs */}
      <form onSubmit={handlePrimarySubmit} className="space-y-5">
        {/* Email Field */}
        <div>
          <label
            htmlFor="sign-in-email"
            className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2"
          >
            Email address
          </label>
          <div className="group relative flex items-center h-12 w-full rounded-xl border border-neutral-300 dark:border-neutral-700/80 bg-white dark:bg-neutral-900 px-4 focus-within:border-[#E05A36] focus-within:ring-2 focus-within:ring-[#E05A36]/20 transition-all shadow-2xs">
            <Mail className="h-4.5 w-4.5 text-neutral-400 dark:text-neutral-500 shrink-0 group-focus-within:text-[#E05A36] transition-colors pointer-events-none" />
            <input
              id="sign-in-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="h-full w-full bg-transparent pl-3 pr-1 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 border-0 outline-hidden focus:outline-hidden focus:ring-0"
            />
          </div>
          {errors?.fields?.identifier && (
            <p className="mt-1.5 text-xs text-red-500">{errors.fields.identifier.message}</p>
          )}
        </div>

        {/* Password Field (Only in password mode) */}
        {authMethod === "password" && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="sign-in-password"
                className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setAuthMethod("email_code")}
                className="text-xs text-[#E05A36] hover:text-[#C2410C] font-medium transition-colors cursor-pointer"
              >
                Use email code instead
              </button>
            </div>
            <div className="group relative flex items-center h-12 w-full rounded-xl border border-neutral-300 dark:border-neutral-700/80 bg-white dark:bg-neutral-900 pl-4 pr-2.5 focus-within:border-[#E05A36] focus-within:ring-2 focus-within:ring-[#E05A36]/20 transition-all shadow-2xs">
              <Lock className="h-4.5 w-4.5 text-neutral-400 dark:text-neutral-500 shrink-0 group-focus-within:text-[#E05A36] transition-colors pointer-events-none" />
              <input
                id="sign-in-password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
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
        )}

        {/* Option to switch back to password when in email_code mode */}
        {authMethod === "email_code" && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setAuthMethod("password")}
              className="text-xs text-[#E05A36] hover:text-[#C2410C] font-medium transition-colors cursor-pointer"
            >
              Sign in with password instead
            </button>
          </div>
        )}

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
              <span>{authMethod === "password" ? "Sign in" : "Send one-time code"}</span>
              <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>
      </form>

      {/* Bottom Switch Link */}
      <div className="text-center pt-3">
        <p className="text-xs text-neutral-600 dark:text-neutral-400">
          Don&apos;t have an account?{" "}
          <Link
            href={`/sign-up${redirectUrl !== "/" ? `?redirect_url=${encodeURIComponent(redirectUrl)}` : ""}`}
            className="font-semibold text-[#E05A36] hover:text-[#C2410C] transition-colors"
          >
            Create one now
          </Link>
        </p>
      </div>
    </div>
  );
}

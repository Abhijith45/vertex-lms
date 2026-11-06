"use client";

import React, { useState } from "react";
import { Check, Sparkles, Shield, Zap, Lock, ArrowRight } from "lucide-react";
import { PLATFORM_PRICING, type PricingPlan } from "@/lib/entitlements";
import posthog from "posthog-js";

interface CoursePricingCardProps {
  courseSlug: string;
  courseTitle: string;
}

export function CoursePricingCard({ courseSlug, courseTitle }: CoursePricingCardProps) {
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const handleCheckout = async (tier: "course" | "all-access") => {
    try {
      setLoadingTier(tier);
      posthog.capture("checkout_initiated", {
        course_slug: courseSlug,
        tier,
      });

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseSlug,
          courseTitle,
          tier,
        }),
      });

      if (!res.ok) throw new Error("Checkout request failed");
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Error during checkout:", err);
      alert("Checkout could not be initiated. Please try again.");
    } finally {
      setLoadingTier(null);
    }
  };

  const coursePlan = PLATFORM_PRICING.course;
  const allAccessPlan = PLATFORM_PRICING["all-access"];

  return (
    <div className="my-16">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wider bg-[#E05A36]/10 text-[#E05A36] uppercase mb-3">
          <Zap className="h-3.5 w-3.5 fill-current" />
          <span>Flexible SaaS Enrollment</span>
        </div>
        <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-neutral-900 dark:text-neutral-100 tracking-tight">
          Invest in Production Engineering
        </h2>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Gain unrestricted access to HD interactive lessons, in-video AI Copilot, verifiable certification, and instructor Q&A.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Tier 1: Single Course Lifetime */}
        <div className="rounded-3xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 p-7 sm:p-8 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-neutral-400">
                Single Course
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-semibold">
                Lifetime Access
              </span>
            </div>

            <h3 className="font-display text-xl font-bold text-neutral-900 dark:text-neutral-100">
              {coursePlan.title}
            </h3>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-display text-4xl font-extrabold text-neutral-900 dark:text-neutral-100">
                {coursePlan.priceFormatted}
              </span>
              <span className="text-xs text-neutral-400 font-medium">/ one-time</span>
            </div>

            <ul className="mt-6 space-y-3">
              {coursePlan.features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-neutral-600 dark:text-neutral-300">
                  <Check className="h-4 w-4 text-[#E05A36] shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              disabled={loadingTier !== null}
              onClick={() => handleCheckout("course")}
              className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-white dark:bg-neutral-800 border-2 border-[#E05A36] text-[#E05A36] hover:bg-[#E05A36] hover:text-white transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
            >
              {loadingTier === "course" ? (
                <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
              ) : (
                <>
                  <span>Enroll for {coursePlan.priceFormatted}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tier 2: All-Access Pass (Highlighted) */}
        <div className="relative rounded-3xl border-2 border-[#E05A36] bg-[#FFF9F6] dark:bg-[#121826] p-7 sm:p-8 shadow-md flex flex-col justify-between">
          <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full text-[11px] font-bold font-mono uppercase tracking-wider bg-[#E05A36] text-white shadow-xs flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            <span>Recommended Value</span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-[#E05A36]">
                All-Access Subscription
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#E05A36]/15 text-[#E05A36] font-semibold">
                Annual Pass
              </span>
            </div>

            <h3 className="font-display text-xl font-bold text-neutral-900 dark:text-neutral-100">
              {allAccessPlan.title}
            </h3>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-display text-4xl font-extrabold text-neutral-900 dark:text-neutral-100">
                {allAccessPlan.priceFormatted}
              </span>
              <span className="text-xs text-neutral-400 font-medium">/ year</span>
            </div>

            <ul className="mt-6 space-y-3">
              {allAccessPlan.features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-neutral-700 dark:text-neutral-200 font-medium">
                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 pt-6 border-t border-neutral-200/60 dark:border-neutral-800">
            <button
              type="button"
              disabled={loadingTier !== null}
              onClick={() => handleCheckout("all-access")}
              className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-[#E05A36] hover:bg-[#C2410C] text-white transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-orange-500/20"
            >
              {loadingTier === "all-access" ? (
                <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <>
                  <span>Get All-Access Pass</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Stripe Sandbox / Development Mode Indicator */}
      <div className="mt-8 max-w-4xl mx-auto rounded-2xl border border-dashed border-amber-300 dark:border-amber-700/60 bg-amber-50/60 dark:bg-amber-950/20 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 dark:text-amber-200">
        <div className="flex items-center gap-2.5">
          <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <div className="text-xs">
            <span className="font-bold">Stripe Sandbox / Development Mode:</span> Real cards are never charged.
            <span className="hidden sm:inline"> Test checkout freely using Stripe test card numbers.</span>
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-100 dark:bg-amber-900/40 text-[11px] font-mono font-medium border border-amber-300/60 dark:border-amber-700/40 shrink-0">
          <span>Card: 4242 •••• 4242 4242</span>
        </div>
      </div>
    </div>
  );
}

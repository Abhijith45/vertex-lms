"use client";

import React, { useState } from "react";
import { Check, Sparkles, Shield, Zap, ArrowRight, Calendar } from "lucide-react";
import { PLATFORM_PRICING, type PricingPlan } from "@/lib/entitlements";
import posthog from "posthog-js";

interface CoursePricingCardProps {
  courseSlug: string;
  courseTitle: string;
}

export function CoursePricingCard({ courseSlug, courseTitle }: CoursePricingCardProps) {
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const handleCheckout = async (tier: "course" | "monthly" | "all-access") => {
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
  const monthlyPlan = PLATFORM_PRICING.monthly;
  const allAccessPlan = PLATFORM_PRICING["all-access"];

  return (
    <div id="pricing" className="my-16">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wider bg-[#E05A36]/10 text-[#E05A36] uppercase mb-3">
          <Zap className="h-3.5 w-3.5 fill-current" />
          <span>Flexible SaaS Enrollment</span>
        </div>
        <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-neutral-900 dark:text-neutral-100 tracking-tight">
          Invest in Production Engineering
        </h2>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          First 2 lessons are free for all registered learners. Enroll in this course or get unlimited access to all tracks.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {/* Tier 1: Single Course Lifetime */}
        <div className="rounded-3xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-neutral-400">
                Course Pass
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-semibold">
                Lifetime
              </span>
            </div>

            <h3 className="font-display text-lg font-bold text-neutral-900 dark:text-neutral-100">
              {coursePlan.title}
            </h3>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-display text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-neutral-100">
                {coursePlan.priceFormatted}
              </span>
              <span className="text-xs text-neutral-400 font-medium">/ one-time</span>
            </div>

            <ul className="mt-5 space-y-2.5">
              {coursePlan.features.map((feat) => (
                <li key={feat} className="flex items-start gap-2 text-xs text-neutral-600 dark:text-neutral-300">
                  <Check className="h-3.5 w-3.5 text-[#E05A36] shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 pt-5 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              disabled={loadingTier !== null}
              onClick={() => handleCheckout("course")}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-white dark:bg-neutral-800 border-2 border-[#E05A36] text-[#E05A36] hover:bg-[#E05A36] hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
            >
              {loadingTier === "course" ? (
                <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
              ) : (
                <>
                  <span>Buy Course ({coursePlan.priceFormatted})</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tier 2: Monthly Pass */}
        <div className="rounded-3xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-neutral-400">
                Monthly Pass
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-semibold">
                Flexible
              </span>
            </div>

            <h3 className="font-display text-lg font-bold text-neutral-900 dark:text-neutral-100">
              {monthlyPlan.title}
            </h3>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-display text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-neutral-100">
                {monthlyPlan.priceFormatted}
              </span>
              <span className="text-xs text-neutral-400 font-medium">/ month</span>
            </div>

            <ul className="mt-5 space-y-2.5">
              {monthlyPlan.features.map((feat) => (
                <li key={feat} className="flex items-start gap-2 text-xs text-neutral-600 dark:text-neutral-300">
                  <Check className="h-3.5 w-3.5 text-neutral-700 dark:text-neutral-300 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 pt-5 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              disabled={loadingTier !== null}
              onClick={() => handleCheckout("monthly")}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-neutral-900 hover:bg-black text-white dark:bg-neutral-100 dark:hover:bg-white dark:text-neutral-900 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
            >
              {loadingTier === "monthly" ? (
                <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
              ) : (
                <>
                  <span>Start Monthly ({monthlyPlan.priceFormatted}/mo)</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tier 3: Annual All-Access Pass (Highlighted) */}
        <div className="relative rounded-3xl border-2 border-[#E05A36] bg-[#FFF9F6] dark:bg-[#121826] p-6 sm:p-7 shadow-md flex flex-col justify-between">
          <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full text-[11px] font-bold font-mono uppercase tracking-wider bg-[#E05A36] text-white shadow-xs flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            <span>Best Value</span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-[#E05A36]">
                Yearly Pass
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#E05A36]/15 text-[#E05A36] font-semibold">
                Save 15%
              </span>
            </div>

            <h3 className="font-display text-lg font-bold text-neutral-900 dark:text-neutral-100">
              {allAccessPlan.title}
            </h3>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-display text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-neutral-100">
                {allAccessPlan.priceFormatted}
              </span>
              <span className="text-xs text-neutral-400 font-medium">/ year</span>
            </div>

            <ul className="mt-5 space-y-2.5">
              {allAccessPlan.features.map((feat) => (
                <li key={feat} className="flex items-start gap-2 text-xs text-neutral-700 dark:text-neutral-200 font-medium">
                  <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 pt-5 border-t border-neutral-200/60 dark:border-neutral-800">
            <button
              type="button"
              disabled={loadingTier !== null}
              onClick={() => handleCheckout("all-access")}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#E05A36] hover:bg-[#C2410C] text-white transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20"
            >
              {loadingTier === "all-access" ? (
                <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <>
                  <span>Get Annual Pass ({allAccessPlan.priceFormatted}/yr)</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Stripe Sandbox / Development Mode Indicator */}
      <div className="mt-8 max-w-6xl mx-auto rounded-2xl border border-dashed border-amber-300 dark:border-amber-700/60 bg-amber-50/60 dark:bg-amber-950/20 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 dark:text-amber-200">
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

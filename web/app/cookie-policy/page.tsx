import React from "react";
import Link from "next/link";
import { ChevronRight, Cookie, Shield, Sliders, Mail } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BottomGraphic } from "@/components/home/bottom-graphic";

export const metadata = {
  title: "Cookie Policy | Vertex",
  description: "Understand the cookies, local storage items, and analytics identifiers used across Vertex to deliver authentication, theme preferences, and video playback.",
};

export default function CookiePolicyPage() {
  const lastUpdated = "September 8, 2026";

  return (
    <div className="min-h-screen w-full bg-[#FAF9F6] dark:bg-[#090D16] font-sans text-neutral-900 dark:text-neutral-100 selection:bg-primary-100 selection:text-primary-500 transition-colors duration-200">
      <div className="mx-auto min-h-screen max-w-[1440px] bg-white dark:bg-[#0F172A] border-x border-neutral-200/50 dark:border-neutral-800/80 shadow-xs flex flex-col justify-between transition-colors duration-200">
        <div>
          {/* Top Header */}
          <Navbar activePath="/cookie-policy" />

          <main className="px-6 py-10 sm:px-12 lg:px-16 max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
              <Link href="/" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                Home
              </Link>
              <ChevronRight className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
              <span className="text-neutral-800 dark:text-neutral-200 font-medium" aria-current="page">
                Cookie Policy
              </span>
            </nav>

            {/* Header / Intro */}
            <div className="mb-12 border-b border-neutral-200/80 dark:border-neutral-800/80 pb-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/40 px-3.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400 mb-4">
                <Cookie className="h-3.5 w-3.5" />
                <span>Cookies & Tracking Technologies</span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 mb-3">
                Cookie Policy
              </h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Last updated: <span className="font-medium text-neutral-700 dark:text-neutral-300">{lastUpdated}</span> • Developer: <strong className="text-neutral-800 dark:text-neutral-200">Abhijeet Rawat</strong>
              </p>
            </div>

            {/* Content Body */}
            <div className="space-y-10 text-neutral-700 dark:text-neutral-300 leading-relaxed text-sm sm:text-base">
              {/* Section 1 */}
              <section className="space-y-3">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
                  1. What Are Cookies and Local Storage?
                </h2>
                <p>
                  Cookies are small text files placed on your browser or device when you browse websites. Similar technologies, such as browser <code className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-xs font-mono">localStorage</code>, store key-value data locally on your computer to remember preferences without transmitting them across every HTTP request.
                </p>
              </section>

              {/* Section 2 */}
              <section className="space-y-4">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2.5">
                  <Shield className="h-5 w-5 text-primary-500" />
                  <span>2. How Vertex Uses Cookies & Local Storage</span>
                </h2>
                <p>
                  Vertex uses minimal, privacy-conscious technologies strictly categorized as follows:
                </p>

                <div className="space-y-4 pt-2">
                  {/* Category 1 */}
                  <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 bg-neutral-50/50 dark:bg-neutral-900/40">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="font-bold text-neutral-900 dark:text-white text-base">
                        A. Strictly Necessary / Authentication Cookies
                      </h3>
                      <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                        Essential
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                      Provided by our authentication service, <strong>Clerk</strong>. These cookies (e.g. <code className="px-1 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-xs font-mono">__session</code>, <code className="px-1 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-xs font-mono">__client_uat</code>) verify your identity, prevent cross-site request forgery, and maintain your login state.
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-500">
                      Cannot be disabled without breaking account sign-in functionality.
                    </p>
                  </div>

                  {/* Category 2 */}
                  <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 bg-neutral-50/50 dark:bg-neutral-900/40">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="font-bold text-neutral-900 dark:text-white text-base">
                        B. User Interface & Preferences (Local Storage)
                      </h3>
                      <span className="rounded-full bg-blue-100 dark:bg-blue-950/60 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:text-blue-300">
                        Preferences
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                      We store your chosen color theme in your browser’s <code className="px-1 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-xs font-mono">localStorage.getItem(&apos;vertex-theme&apos;)</code> to immediately display light mode or dark mode on page load without flashing.
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-500">
                      Contains zero personally identifiable information; remains entirely on your local machine.
                    </p>
                  </div>

                  {/* Category 3 */}
                  <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 bg-neutral-50/50 dark:bg-neutral-900/40">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="font-bold text-neutral-900 dark:text-white text-base">
                        C. Analytics & Telemetry (PostHog)
                      </h3>
                      <span className="rounded-full bg-purple-100 dark:bg-purple-950/60 px-2.5 py-0.5 text-xs font-semibold text-purple-800 dark:text-purple-300">
                        Analytics
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                      Utilizes anonymous identifiers to capture feature usage (such as search queries and video playback duration) through PostHog. This helps evaluate the AI search algorithm and UI responsiveness.
                    </p>
                  </div>

                  {/* Category 4 */}
                  <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 bg-neutral-50/50 dark:bg-neutral-900/40">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="font-bold text-neutral-900 dark:text-white text-base">
                        D. Third-Party Video Embed Cookies (YouTube)
                      </h3>
                      <span className="rounded-full bg-orange-100 dark:bg-orange-950/60 px-2.5 py-0.5 text-xs font-semibold text-orange-800 dark:text-orange-300">
                        Third Party
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                      When viewing a video lesson, YouTube&apos;s embedded iframe player may set cookies to record player statistics, store bandwidth preferences, and serve video content according to Google&apos;s standard terms.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 3 */}
              <section className="space-y-3">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2.5">
                  <Sliders className="h-5 w-5 text-primary-500" />
                  <span>3. How to Manage and Disable Cookies</span>
                </h2>
                <p>
                  You can control and delete cookies through your browser settings:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-neutral-600 dark:text-neutral-400">
                  <li><strong>Chrome:</strong> Settings &gt; Privacy and security &gt; Cookies and other site data.</li>
                  <li><strong>Safari:</strong> Settings &gt; Privacy &gt; Manage Website Data.</li>
                  <li><strong>Firefox:</strong> Settings &gt; Privacy &amp; Security &gt; Enhanced Tracking Protection.</li>
                  <li><strong>Edge:</strong> Settings &gt; Cookies and site permissions.</li>
                </ul>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 pt-1">
                  Note that disabling essential authentication cookies will prevent you from signing in to save course progress or bookmarks.
                </p>
              </section>

              {/* Section 4 */}
              <section className="space-y-3">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2.5">
                  <Mail className="h-5 w-5 text-primary-500" />
                  <span>4. Questions Regarding Cookies</span>
                </h2>
                <p>
                  If you have inquiries regarding our cookie or tracking practices:
                </p>
                <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 bg-neutral-50 dark:bg-neutral-900/60 max-w-md">
                  <p className="font-bold text-neutral-900 dark:text-white text-base">Abhijeet Rawat</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    Email: <a href="mailto:abhijeetrawat45@gmail.com" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">abhijeetrawat45@gmail.com</a>
                  </p>
                </div>
              </section>
            </div>
          </main>
        </div>

        {/* Footer above BottomGraphic */}
        <Footer />
        <BottomGraphic />
      </div>
    </div>
  );
}

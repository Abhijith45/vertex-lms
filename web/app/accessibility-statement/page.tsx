import React from "react";
import Link from "next/link";
import { ChevronRight, Accessibility, CheckCircle2, Eye, Keyboard, Monitor, Mail } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BottomGraphic } from "@/components/home/bottom-graphic";

export const metadata = {
  title: "Accessibility Statement | Vertex",
  description: "Learn about Vertex's commitment to web accessibility, WCAG 2.1 Level AA conformance, keyboard navigation, and assistive technology support.",
};

export default function AccessibilityStatementPage() {
  const lastUpdated = "September 8, 2026";

  return (
    <div className="min-h-screen w-full bg-[#FAF9F6] dark:bg-[#090D16] font-sans text-neutral-900 dark:text-neutral-100 selection:bg-primary-100 selection:text-primary-500 transition-colors duration-200">
      <div className="mx-auto min-h-screen max-w-[1440px] bg-white dark:bg-[#0F172A] border-x border-neutral-200/50 dark:border-neutral-800/80 shadow-xs flex flex-col justify-between transition-colors duration-200">
        <div>
          {/* Top Header */}
          <Navbar activePath="/accessibility-statement" />

          <main className="px-6 py-10 sm:px-12 lg:px-16 max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
              <Link href="/" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                Home
              </Link>
              <ChevronRight className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
              <span className="text-neutral-800 dark:text-neutral-200 font-medium" aria-current="page">
                Accessibility Statement
              </span>
            </nav>

            {/* Header / Intro */}
            <div className="mb-12 border-b border-neutral-200/80 dark:border-neutral-800/80 pb-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 dark:border-sky-800/60 bg-sky-50 dark:bg-sky-950/40 px-3.5 py-1 text-xs font-semibold text-sky-700 dark:text-sky-400 mb-4">
                <Accessibility className="h-3.5 w-3.5" />
                <span>Inclusive Design & Accessibility</span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 mb-3">
                Accessibility Statement
              </h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Last updated: <span className="font-medium text-neutral-700 dark:text-neutral-300">{lastUpdated}</span> • Project Lead: <strong className="text-neutral-800 dark:text-neutral-200">Abhijeet Rawat</strong>
              </p>
            </div>

            {/* Commitment Highlight Callout */}
            <div className="mb-10 rounded-xl border border-sky-200 dark:border-sky-500/30 bg-sky-50/50 dark:bg-sky-950/20 p-5 text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed">
              <h2 className="font-bold text-base text-sky-900 dark:text-sky-400 mb-1.5 flex items-center gap-2">
                <span>Our Commitment to Digital Accessibility</span>
              </h2>
              <p>
                At <strong>Vertex</strong>, developer <strong>Abhijeet Rawat</strong> is committed to ensuring that our educational platform is accessible to learners of all abilities. We continuously apply relevant accessibility standards to deliver an inclusive, barrier-free user experience across all devices and assistive technologies.
              </p>
            </div>

            {/* Content Body */}
            <div className="space-y-10 text-neutral-700 dark:text-neutral-300 leading-relaxed text-sm sm:text-base">
              {/* Section 1 */}
              <section className="space-y-3">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-primary-500" />
                  <span>1. Conformance Standards</span>
                </h2>
                <p>
                  Vertex targets adherence to the <strong>Web Content Accessibility Guidelines (WCAG) 2.1 Level AA</strong>. These guidelines outline best practices for making web content accessible to individuals with a wide range of disabilities, including visual, auditory, motor, and cognitive impairments.
                </p>
              </section>

              {/* Section 2 */}
              <section className="space-y-4">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2.5">
                  <Monitor className="h-5 w-5 text-primary-500" />
                  <span>2. Key Accessibility Features Implemented</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 bg-neutral-50/50 dark:bg-neutral-900/40">
                    <div className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white mb-1.5">
                      <Keyboard className="h-4 w-4 text-primary-500" />
                      <h3>Keyboard Navigation</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                      All interactive controls (buttons, links, search inputs, course accordions, video controls) have visible focus indicators and are fully operable using keyboard-only navigation.
                    </p>
                  </div>

                  <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 bg-neutral-50/50 dark:bg-neutral-900/40">
                    <div className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white mb-1.5">
                      <Eye className="h-4 w-4 text-primary-500" />
                      <h3>Contrast & Theme Modes</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                      Both our Light and Dark modes are engineered with high-contrast text ratios compliant with WCAG AA standards for optimal readability under varying lighting conditions.
                    </p>
                  </div>

                  <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 bg-neutral-50/50 dark:bg-neutral-900/40">
                    <div className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white mb-1.5">
                      <Accessibility className="h-4 w-4 text-primary-500" />
                      <h3>Screen Reader Optimization</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                      We utilize semantic HTML5 landmark tags (<code className="px-1 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-xs font-mono">&lt;header&gt;</code>, <code className="px-1 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-xs font-mono">&lt;main&gt;</code>, <code className="px-1 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-xs font-mono">&lt;nav&gt;</code>, <code className="px-1 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-xs font-mono">&lt;footer&gt;</code>) and descriptive ARIA labels.
                    </p>
                  </div>

                  <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 bg-neutral-50/50 dark:bg-neutral-900/40">
                    <div className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white mb-1.5">
                      <Monitor className="h-4 w-4 text-primary-500" />
                      <h3>Responsive Scaling</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                      The layout fluidly adapts to browser zoom levels up to 200% without loss of content structure or functionality.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 3 */}
              <section className="space-y-3">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
                  3. Video Player Captions & Controls
                </h2>
                <p>
                  Lesson videos are streamed using standard, accessible third-party embed players (such as YouTube API). Captions, closed subtitles (CC), playback speed adjustments, and full-screen modes are supported directly through the player interface.
                </p>
              </section>

              {/* Section 4 */}
              <section className="space-y-3">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2.5">
                  <Mail className="h-5 w-5 text-primary-500" />
                  <span>4. Feedback & Accessibility Support</span>
                </h2>
                <p>
                  We welcome feedback on the accessibility of Vertex. If you encounter any accessibility barriers or have suggestions for improvement, please contact developer Abhijeet Rawat directly:
                </p>
                <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 bg-neutral-50 dark:bg-neutral-900/60 max-w-md">
                  <p className="font-bold text-neutral-900 dark:text-white text-base">Abhijeet Rawat</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    Email: <a href="mailto:abhijeetrawat45@gmail.com" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">abhijeetrawat45@gmail.com</a>
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                    We aim to respond to accessibility feedback within 24 to 48 hours.
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

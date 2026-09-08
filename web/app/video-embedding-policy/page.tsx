import React from "react";
import Link from "next/link";
import { ChevronRight, Video, CheckCircle2, Shield, Play, Layers, ExternalLink, Mail } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BottomGraphic } from "@/components/home/bottom-graphic";

export const metadata = {
  title: "Video-Embedding Policy | Vertex",
  description: "Learn how Vertex implements compliant third-party video embedding via official YouTube and video provider APIs, respecting creator ownership and monetization.",
};

export default function VideoEmbeddingPolicyPage() {
  const lastUpdated = "September 8, 2026";

  return (
    <div className="min-h-screen w-full bg-[#FAF9F6] dark:bg-[#090D16] font-sans text-neutral-900 dark:text-neutral-100 selection:bg-primary-100 selection:text-primary-500 transition-colors duration-200">
      <div className="mx-auto min-h-screen max-w-[1440px] bg-white dark:bg-[#0F172A] border-x border-neutral-200/50 dark:border-neutral-800/80 shadow-xs flex flex-col justify-between transition-colors duration-200">
        <div>
          {/* Top Header */}
          <Navbar activePath="/video-embedding-policy" />

          <main className="px-6 py-10 sm:px-12 lg:px-16 max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
              <Link href="/" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                Home
              </Link>
              <ChevronRight className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
              <span className="text-neutral-800 dark:text-neutral-200 font-medium" aria-current="page">
                Video-Embedding Policy
              </span>
            </nav>

            {/* Header / Intro */}
            <div className="mb-12 border-b border-neutral-200/80 dark:border-neutral-800/80 pb-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 dark:border-violet-800/60 bg-violet-50 dark:bg-violet-950/40 px-3.5 py-1 text-xs font-semibold text-violet-700 dark:text-violet-400 mb-4">
                <Video className="h-3.5 w-3.5" />
                <span>Video Streaming & Creator Transparency</span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 mb-3">
                Video-Embedding Policy
              </h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Last updated: <span className="font-medium text-neutral-700 dark:text-neutral-300">{lastUpdated}</span> • Project Lead: <strong className="text-neutral-800 dark:text-neutral-200">Abhijeet Rawat</strong>
              </p>
            </div>

            {/* Fair Use & Non-Hosting Callout */}
            <div className="mb-10 rounded-xl border border-violet-200 dark:border-violet-500/30 bg-violet-50/50 dark:bg-violet-950/20 p-5 text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed">
              <h2 className="font-bold text-base text-violet-900 dark:text-violet-400 mb-1.5 flex items-center gap-2">
                <Play className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                <span>Official Embed Architecture & Creator First Policy</span>
              </h2>
              <p>
                Vertex is an educational demonstration application built by <strong>Abhijeet Rawat</strong> to showcase intelligent multimodal search over engineering curriculum. All video playback on Vertex relies exclusively on <strong>official third-party iframe embed APIs</strong>. Vertex does <em>not</em> download, modify, re-encode, or host any proprietary video files.
              </p>
            </div>

            {/* Content Body */}
            <div className="space-y-10 text-neutral-700 dark:text-neutral-300 leading-relaxed text-sm sm:text-base">
              {/* Section 1 */}
              <section className="space-y-3">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2.5">
                  <Layers className="h-5 w-5 text-primary-500" />
                  <span>1. How Video Delivery Works on Vertex</span>
                </h2>
                <p>
                  When a learner opens a lesson or seeks to a specific timestamp from our AI search, video playback operates as follows:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-neutral-600 dark:text-neutral-400">
                  <li>
                    <strong className="text-neutral-900 dark:text-neutral-100">Standard Embed Players:</strong> The video is loaded through the video provider’s official iframe embed (e.g. <code className="px-1 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 font-mono text-xs">youtube.com/embed/...</code>, Vimeo player, or Bunny CDN embed).
                  </li>
                  <li>
                    <strong className="text-neutral-900 dark:text-neutral-100">Deep-Linking Timestamps:</strong> When search highlights a specific topic moment, Vertex passes the target second directly to the embed player&apos;s native start parameters (e.g. <code className="px-1 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 font-mono text-xs">?start=145</code>), allowing learners to jump directly to the moment the concept is explained.
                  </li>
                  <li>
                    <strong className="text-neutral-900 dark:text-neutral-100">Zero Server-Side Media Storage:</strong> Vertex servers store only curriculum metadata (titles, descriptions, module order, chapter markers, and transcript text snippets). No MP4, WebM, or raw video streams are stored on our servers.
                  </li>
                </ul>
              </section>

              {/* Section 2 */}
              <section className="space-y-4">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2.5">
                  <Shield className="h-5 w-5 text-primary-500" />
                  <span>2. Benefits and Protections for Content Creators</span>
                </h2>
                <p>
                  Our embedding approach is engineered to protect and benefit original creators:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 bg-neutral-50/50 dark:bg-neutral-900/40">
                    <h3 className="font-bold text-neutral-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span>Monetization & Ads</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                      All video ads, sponsor overlays, and creator monetization enabled by the author on YouTube continue to function normally.
                    </p>
                  </div>

                  <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 bg-neutral-50/50 dark:bg-neutral-900/40">
                    <h3 className="font-bold text-neutral-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span>View Counts & Metrics</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                      Views and watch-time generated by Vertex learners register directly with YouTube and the creator’s official channel analytics.
                    </p>
                  </div>

                  <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 bg-neutral-50/50 dark:bg-neutral-900/40">
                    <h3 className="font-bold text-neutral-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span>Direct Attribution</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                      Each lesson displays instructor credits and links back to the original source, driving new audience discovery to educators.
                    </p>
                  </div>

                  <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 bg-neutral-50/50 dark:bg-neutral-900/40">
                    <h3 className="font-bold text-neutral-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span>No Commercial Paywalls</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                      Vertex does not sell courses, gate access behind paid subscriptions, or charge users to view public educational content.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 3 */}
              <section className="space-y-3">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
                  3. Platform Terms of Service Adherence
                </h2>
                <p>
                  Vertex operates in strict compliance with the developer terms of supported video hosting services:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-neutral-600 dark:text-neutral-400">
                  <li>
                    <a href="https://developers.google.com/youtube/terms/api-services-terms-of-service" target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1">
                      <span>YouTube API Services Terms of Service</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                  <li>
                    <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1">
                      <span>YouTube Terms of Service</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                  <li>
                    <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1">
                      <span>Google Privacy Policy</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                </ul>
              </section>

              {/* Section 4 */}
              <section className="space-y-3">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2.5">
                  <Mail className="h-5 w-5 text-primary-500" />
                  <span>4. Creator Opt-Out & Content Inquiries</span>
                </h2>
                <p>
                  If you are a YouTube creator or copyright owner and prefer that your video not be indexed in Vertex’s educational demonstration, please email us:
                </p>
                <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 bg-neutral-50 dark:bg-neutral-900/60 max-w-md">
                  <p className="font-bold text-neutral-900 dark:text-white text-base">Abhijeet Rawat</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    Email: <a href="mailto:abhijeetrawat45@gmail.com" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">abhijeetrawat45@gmail.com</a>
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                    We will promptly unlist or delete any requested video index within 24 to 48 hours.
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

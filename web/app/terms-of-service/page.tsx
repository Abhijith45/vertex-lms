import React from "react";
import Link from "next/link";
import { ChevronRight, FileCheck, AlertTriangle, Video, ShieldAlert, Mail } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BottomGraphic } from "@/components/home/bottom-graphic";

export const metadata = {
  title: "Terms of Service | Vertex",
  description: "Terms and conditions governing your use of Vertex, including educational project disclaimers, video embedding terms, and DMCA takedown procedures.",
};

export default function TermsOfServicePage() {
  const lastUpdated = "September 8, 2026";

  return (
    <div className="min-h-screen w-full bg-[#FAF9F6] dark:bg-[#090D16] font-sans text-neutral-900 dark:text-neutral-100 selection:bg-primary-100 selection:text-primary-500 transition-colors duration-200">
      <div className="mx-auto min-h-screen max-w-[1440px] bg-white dark:bg-[#0F172A] border-x border-neutral-200/50 dark:border-neutral-800/80 shadow-xs flex flex-col justify-between transition-colors duration-200">
        <div>
          {/* Top Header */}
          <Navbar activePath="/terms-of-service" />

          <main className="px-6 py-10 sm:px-12 lg:px-16 max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
              <Link href="/" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                Home
              </Link>
              <ChevronRight className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
              <span className="text-neutral-800 dark:text-neutral-200 font-medium" aria-current="page">
                Terms of Service
              </span>
            </nav>

            {/* Header / Intro */}
            <div className="mb-12 border-b border-neutral-200/80 dark:border-neutral-800/80 pb-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-blue-800/60 bg-blue-50 dark:bg-blue-950/40 px-3.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-400 mb-4">
                <FileCheck className="h-3.5 w-3.5" />
                <span>Terms & Fair Use Documentation</span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 mb-3">
                Terms of Service
              </h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Last updated: <span className="font-medium text-neutral-700 dark:text-neutral-300">{lastUpdated}</span> • Project Lead: <strong className="text-neutral-800 dark:text-neutral-200">Abhijeet Rawat</strong>
              </p>
            </div>

            {/* Non-Commercial Project Callout */}
            <div className="mb-10 rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50/60 dark:bg-amber-950/20 p-5 text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed">
              <h2 className="font-bold text-base text-amber-900 dark:text-amber-400 mb-1.5 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span>Notice of Educational & Portfolio Scope</span>
              </h2>
              <p>
                Vertex is an experimental, non-commercial software engineering application created by <strong>Abhijeet Rawat</strong> to demonstrate state-of-the-art AI search over multimodal course content, Next.js architecture, Clerk authentication, and Sanity CMS. <strong>All content is offered strictly free of charge for demonstration and educational purposes.</strong>
              </p>
            </div>

            {/* Content Body */}
            <div className="space-y-10 text-neutral-700 dark:text-neutral-300 leading-relaxed text-sm sm:text-base">
              {/* Section 1 */}
              <section className="space-y-3">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
                  1. Acceptance of Terms
                </h2>
                <p>
                  By accessing or using Vertex, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, you should discontinue use of the platform.
                </p>
              </section>

              {/* Section 2 */}
              <section className="space-y-3">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2.5">
                  <Video className="h-5 w-5 text-primary-500" />
                  <span>2. Third-Party Video Embeds & Intellectual Property</span>
                </h2>
                <p>
                  Vertex acts as an intelligent indexing layer and educational viewer. Regarding all embedded video content:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-neutral-600 dark:text-neutral-400">
                  <li>
                    <strong className="text-neutral-900 dark:text-neutral-100">Standard Embed Streaming:</strong> All video lessons are streamed directly from YouTube and public hosts using their official, compliant embed iframe players. Vertex does not download, copy, distribute, re-encode, or host video files on its servers.
                  </li>
                  <li>
                    <strong className="text-neutral-900 dark:text-neutral-100">Full Attribution:</strong> All copyrights, trademarks, advertising revenues, channel subscriptions, and intellectual property rights remain the exclusive property of the original content creators and channels.
                  </li>
                  <li>
                    <strong className="text-neutral-900 dark:text-neutral-100">No Endorsement Claim:</strong> The embedding of publicly available educational videos does not imply an endorsement, partnership, or official sponsorship between Vertex and the video creators.
                  </li>
                </ul>
              </section>

              {/* Section 3: DMCA with target ID */}
              <section id="dmca-takedown" className="space-y-3 scroll-mt-24">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2.5">
                  <ShieldAlert className="h-5 w-5 text-primary-500" />
                  <span>3. DMCA & Copyright Takedown Procedure</span>
                </h2>
                <p>
                  We respect the intellectual property rights of all artists and educators. If you are a copyright owner or authorized representative and believe that any embedded video reference or transcript chunk on Vertex infringes your copyright, or if you prefer that your YouTube video not be indexed for this educational project, you may request its immediate removal.
                </p>
                <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 bg-neutral-50 dark:bg-neutral-900/60">
                  <h3 className="font-bold text-neutral-900 dark:text-white mb-2">How to Submit a Removal Notice:</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                    Please send an email to <a href="mailto:abhijeetrawat45@gmail.com" className="text-primary-600 dark:text-primary-400 font-medium underline">abhijeetrawat45@gmail.com</a> with the following details:
                  </p>
                  <ol className="list-decimal pl-5 space-y-1.5 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                    <li>Identification of the copyrighted material (the YouTube URL or title).</li>
                    <li>The exact URL on Vertex where the lesson or video is referenced.</li>
                    <li>A statement confirming your ownership or authorization to act on the owner&apos;s behalf.</li>
                    <li>Your contact information (name and email address).</li>
                  </ol>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-4">
                    Upon receipt, the video reference, indexing transcript, and associated metadata will be promptly unlisted or removed within 24 to 48 hours without dispute.
                  </p>
                </div>
              </section>

              {/* Section 4 */}
              <section className="space-y-3">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
                  4. Acceptable User Conduct
                </h2>
                <p>
                  Users agree not to attempt to disrupt or compromise the platform, reverse engineer private API routes, perform automated scraping or DDoS attacks, or exploit user authentication mechanisms.
                </p>
              </section>

              {/* Section 5 */}
              <section className="space-y-3">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
                  5. Disclaimer of Warranties & Limitation of Liability
                </h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Vertex is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis for educational evaluation. The developer makes no warranties regarding uninterrupted availability, error-free operation, or specific learning results. To the maximum extent permitted by applicable law, the developer shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use this platform.
                </p>
              </section>

              {/* Section 6 */}
              <section className="space-y-3">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2.5">
                  <Mail className="h-5 w-5 text-primary-500" />
                  <span>6. Contact Information</span>
                </h2>
                <p>
                  For inquiries or correspondence regarding these Terms of Service:
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

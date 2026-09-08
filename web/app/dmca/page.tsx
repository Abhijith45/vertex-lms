import React from "react";
import Link from "next/link";
import { ChevronRight, ShieldAlert, FileText, CheckCircle2, Clock, Mail, AlertTriangle } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BottomGraphic } from "@/components/home/bottom-graphic";

export const metadata = {
  title: "DMCA & Copyright Takedown Policy | Vertex",
  description: "Guidelines and procedures for copyright holders to submit DMCA notices or content removal requests for video lessons indexed on Vertex.",
};

export default function DmcaPage() {
  const lastUpdated = "September 8, 2026";

  return (
    <div className="min-h-screen w-full bg-[#FAF9F6] dark:bg-[#090D16] font-sans text-neutral-900 dark:text-neutral-100 selection:bg-primary-100 selection:text-primary-500 transition-colors duration-200">
      <div className="mx-auto min-h-screen max-w-[1440px] bg-white dark:bg-[#0F172A] border-x border-neutral-200/50 dark:border-neutral-800/80 shadow-xs flex flex-col justify-between transition-colors duration-200">
        <div>
          {/* Top Header */}
          <Navbar activePath="/dmca" />

          <main className="px-6 py-10 sm:px-12 lg:px-16 max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
              <Link href="/" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                Home
              </Link>
              <ChevronRight className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
              <span className="text-neutral-800 dark:text-neutral-200 font-medium" aria-current="page">
                DMCA & Copyright Policy
              </span>
            </nav>

            {/* Header / Intro */}
            <div className="mb-12 border-b border-neutral-200/80 dark:border-neutral-800/80 pb-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/40 px-3.5 py-1 text-xs font-semibold text-rose-700 dark:text-rose-400 mb-4">
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>Copyright Protection & Safe Harbor</span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 mb-3">
                DMCA & Copyright Policy
              </h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Last updated: <span className="font-medium text-neutral-700 dark:text-neutral-300">{lastUpdated}</span> • Designated Agent: <strong className="text-neutral-800 dark:text-neutral-200">Abhijeet Rawat</strong>
              </p>
            </div>

            {/* Respect of IP Callout */}
            <div className="mb-10 rounded-xl border border-primary-200 dark:border-primary-500/30 bg-primary-50/50 dark:bg-primary-950/20 p-5 text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed">
              <h2 className="font-bold text-base text-primary-900 dark:text-primary-400 mb-1.5 flex items-center gap-2">
                <span>Commitment to Creators and Intellectual Property</span>
              </h2>
              <p>
                <strong>Vertex</strong> respects the intellectual property rights of all content creators, educators, and publishers. In accordance with the Digital Millennium Copyright Act (DMCA) and global copyright principles, we maintain an expeditious takedown procedure for any content creator who prefers not to have their public YouTube video referenced in our search index.
              </p>
            </div>

            {/* Content Body */}
            <div className="space-y-10 text-neutral-700 dark:text-neutral-300 leading-relaxed text-sm sm:text-base">
              {/* Section 1 */}
              <section className="space-y-3">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2.5">
                  <FileText className="h-5 w-5 text-primary-500" />
                  <span>1. Third-Party Video Embed Streaming Architecture</span>
                </h2>
                <p>
                  Vertex operates as an educational demonstration of AI content search and structured curricula. Please note the following architectural facts regarding video delivery:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-neutral-600 dark:text-neutral-400">
                  <li>
                    <strong className="text-neutral-900 dark:text-neutral-100">Zero Hosting of Video Media:</strong> Vertex does <em>not</em> download, store, re-encode, or host any raw video media files on its servers. All playback occurs client-side using official, public iframe embeds directly provided by YouTube, Vimeo, or third-party providers.
                  </li>
                  <li>
                    <strong className="text-neutral-900 dark:text-neutral-100">Direct Creator Benefits:</strong> When a learner watches a video on Vertex, all view counts, watch time analytics, channel subscriptions, and monetization ads remain 100% credited to the original channel and creator.
                  </li>
                  <li>
                    <strong className="text-neutral-900 dark:text-neutral-100">Non-Commercial Scope:</strong> No course fees, subscription charges, or monetization occur on Vertex.
                  </li>
                </ul>
              </section>

              {/* Section 2 */}
              <section className="space-y-4">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2.5">
                  <AlertTriangle className="h-5 w-5 text-primary-500" />
                  <span>2. How to File a DMCA Notice of Infringement</span>
                </h2>
                <p>
                  If you are a copyright owner or an agent authorized to act on their behalf and wish to request the removal or unlisting of a video reference or transcript from Vertex, please email our Designated Agent with the following information:
                </p>
                <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 bg-neutral-50 dark:bg-neutral-900/60 space-y-3">
                  <h3 className="font-bold text-neutral-900 dark:text-white text-sm">Required Notice Information:</h3>
                  <ol className="list-decimal pl-5 space-y-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                    <li>
                      <strong className="text-neutral-800 dark:text-neutral-200">Identification of Work:</strong> The title and original YouTube URL of the copyrighted material claimed to have been infringed.
                    </li>
                    <li>
                      <strong className="text-neutral-800 dark:text-neutral-200">Location on Vertex:</strong> The exact URL on Vertex where the lesson or video is referenced (e.g. <code className="px-1 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 font-mono">https://.../lessons/lesson-slug</code>).
                    </li>
                    <li>
                      <strong className="text-neutral-800 dark:text-neutral-200">Contact Details:</strong> Your full legal name, email address, and channel name / organization.
                    </li>
                    <li>
                      <strong className="text-neutral-800 dark:text-neutral-200">Good Faith Statement:</strong> A brief statement that you have a good faith belief that the use is not authorized by the copyright owner, its agent, or the law.
                    </li>
                    <li>
                      <strong className="text-neutral-800 dark:text-neutral-200">Accuracy & Signature:</strong> A physical or electronic signature (typing your legal name is sufficient).
                    </li>
                  </ol>
                </div>
              </section>

              {/* Section 3 */}
              <section className="space-y-3">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2.5">
                  <Clock className="h-5 w-5 text-primary-500" />
                  <span>3. Turnaround Commitment</span>
                </h2>
                <p>
                  Upon receiving a valid takedown notice, developer <strong>Abhijeet Rawat</strong> will unlist or completely remove the associated course lesson, search chunks, and video references from the database within <strong className="text-neutral-900 dark:text-white">24 to 48 hours</strong> without unnecessary dispute.
                </p>
              </section>

              {/* Section 4 */}
              <section className="space-y-3">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-primary-500" />
                  <span>4. Counter-Notification Procedure</span>
                </h2>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                  If you believe that a lesson reference was removed in error (e.g. due to mistake or misidentification), you may file a counter-notification by contacting our Designated Agent with your contact details, identification of the removed content, and a consent statement under penalty of perjury.
                </p>
              </section>

              {/* Section 5 */}
              <section className="space-y-3">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2.5">
                  <Mail className="h-5 w-5 text-primary-500" />
                  <span>5. Designated DMCA Agent Contact</span>
                </h2>
                <p>
                  All DMCA notifications, copyright queries, and removal requests should be sent to:
                </p>
                <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 bg-neutral-50 dark:bg-neutral-900/60 max-w-md">
                  <p className="text-xs uppercase tracking-wider text-neutral-500 font-semibold mb-1">Designated DMCA Agent</p>
                  <p className="font-bold text-neutral-900 dark:text-white text-base">Abhijeet Rawat</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    Email: <a href="mailto:abhijeetrawat45@gmail.com" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">abhijeetrawat45@gmail.com</a>
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                    Subject Line: &quot;DMCA Takedown Request - [Course / Lesson Title]&quot;
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

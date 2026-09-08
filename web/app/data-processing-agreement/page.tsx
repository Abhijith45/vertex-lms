import React from "react";
import Link from "next/link";
import { ChevronRight, FileCheck2, Server, Shield, Layers, Mail } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BottomGraphic } from "@/components/home/bottom-graphic";

export const metadata = {
  title: "Data Processing Agreement (DPA) | Vertex",
  description: "Read the demonstration Data Processing Agreement for Vertex, detailing sub-processor relationships, data flows, and GDPR compliance standards.",
};

export default function DataProcessingAgreementPage() {
  const lastUpdated = "September 8, 2026";

  return (
    <div className="min-h-screen w-full bg-[#FAF9F6] dark:bg-[#090D16] font-sans text-neutral-900 dark:text-neutral-100 selection:bg-primary-100 selection:text-primary-500 transition-colors duration-200">
      <div className="mx-auto min-h-screen max-w-[1440px] bg-white dark:bg-[#0F172A] border-x border-neutral-200/50 dark:border-neutral-800/80 shadow-xs flex flex-col justify-between transition-colors duration-200">
        <div>
          {/* Top Header */}
          <Navbar activePath="/data-processing-agreement" />

          <main className="px-6 py-10 sm:px-12 lg:px-16 max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
              <Link href="/" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                Home
              </Link>
              <ChevronRight className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
              <span className="text-neutral-800 dark:text-neutral-200 font-medium" aria-current="page">
                Data Processing Agreement
              </span>
            </nav>

            {/* Header / Intro */}
            <div className="mb-12 border-b border-neutral-200/80 dark:border-neutral-800/80 pb-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50 dark:bg-indigo-950/40 px-3.5 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-400 mb-4">
                <FileCheck2 className="h-3.5 w-3.5" />
                <span>GDPR Article 28 Standard Agreement</span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 mb-3">
                Data Processing Agreement (DPA)
              </h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Last updated: <span className="font-medium text-neutral-700 dark:text-neutral-300">{lastUpdated}</span> • Developer & Controller: <strong className="text-neutral-800 dark:text-neutral-200">Abhijeet Rawat</strong>
              </p>
            </div>

            {/* Scope Callout */}
            <div className="mb-10 rounded-xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-950/20 p-5 text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed">
              <h2 className="font-bold text-base text-indigo-900 dark:text-indigo-400 mb-1.5 flex items-center gap-2">
                <span>Scope of this Agreement</span>
              </h2>
              <p>
                This demonstration Data Processing Agreement (&quot;DPA&quot;) governs the processing of personal data in connection with the <strong>Vertex</strong> educational platform operated by <strong>Abhijeet Rawat</strong>. It reflects the technical and organizational security requirements under Article 28 of the General Data Protection Regulation (GDPR).
              </p>
            </div>

            {/* Content Body */}
            <div className="space-y-10 text-neutral-700 dark:text-neutral-300 leading-relaxed text-sm sm:text-base">
              {/* Section 1 */}
              <section className="space-y-3">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2.5">
                  <Layers className="h-5 w-5 text-primary-500" />
                  <span>1. Subject Matter and Duration</span>
                </h2>
                <p>
                  The processing operations encompass the collection, storage, and retrieval of learner account details, course completion markers, bookmark references, and application telemetry solely for providing the Vertex educational platform. Data is processed for the duration of the learner&apos;s active account.
                </p>
              </section>

              {/* Section 2 */}
              <section className="space-y-4">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2.5">
                  <Server className="h-5 w-5 text-primary-500" />
                  <span>2. Authorized Sub-Processors</span>
                </h2>
                <p>
                  Vertex engages vetted sub-processors for specialized infrastructure capabilities:
                </p>
                <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-neutral-100/75 dark:bg-neutral-800/60 text-neutral-900 dark:text-neutral-100 font-semibold border-b border-neutral-200 dark:border-neutral-800">
                      <tr>
                        <th className="px-4 py-3">Sub-Processor</th>
                        <th className="px-4 py-3">Purpose</th>
                        <th className="px-4 py-3">Location</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 text-neutral-600 dark:text-neutral-400">
                      <tr>
                        <td className="px-4 py-3 font-medium text-neutral-900 dark:text-white">Clerk Inc.</td>
                        <td className="px-4 py-3">User Authentication & Session Security</td>
                        <td className="px-4 py-3">United States (SCCs / DPF)</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium text-neutral-900 dark:text-white">Sanity AS</td>
                        <td className="px-4 py-3">Curriculum CMS & Private Progress Datastore</td>
                        <td className="px-4 py-3">European Union / Norway</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium text-neutral-900 dark:text-white">PostHog Inc.</td>
                        <td className="px-4 py-3">Application Usage Telemetry & Analytics</td>
                        <td className="px-4 py-3">United States (EU Cloud Option)</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium text-neutral-900 dark:text-white">Google / YouTube API</td>
                        <td className="px-4 py-3">Third-Party Video Embed Streaming</td>
                        <td className="px-4 py-3">Global Edge Network</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Section 3 */}
              <section className="space-y-3">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2.5">
                  <Shield className="h-5 w-5 text-primary-500" />
                  <span>3. Technical and Organizational Measures (TOMs)</span>
                </h2>
                <ul className="list-disc pl-5 space-y-1.5 text-neutral-600 dark:text-neutral-400">
                  <li>Enforcement of TLS 1.3 encryption across all client-server communications.</li>
                  <li>Strict isolation of server-only API write tokens from client bundles.</li>
                  <li>Implementation of rate limiting and input validation schemas using Zod.</li>
                  <li>Role-based access controls and principle of least privilege on CMS datasets.</li>
                </ul>
              </section>

              {/* Section 4 */}
              <section className="space-y-3">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2.5">
                  <Mail className="h-5 w-5 text-primary-500" />
                  <span>4. DPA Inquiries & Execution</span>
                </h2>
                <p>
                  For enterprise or portfolio review inquiries regarding this Data Processing Agreement:
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

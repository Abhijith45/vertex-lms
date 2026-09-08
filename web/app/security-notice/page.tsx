import React from "react";
import Link from "next/link";
import { ChevronRight, Shield, Lock, Server, Key, AlertCircle, CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BottomGraphic } from "@/components/home/bottom-graphic";

export const metadata = {
  title: "Security Notice & Practices | Vertex",
  description: "Learn about Vertex's security architecture, token isolation, authentication safeguards, data encryption, and vulnerability disclosure policies.",
};

export default function SecurityNoticePage() {
  const lastUpdated = "September 8, 2026";

  return (
    <div className="min-h-screen w-full bg-[#FAF9F6] dark:bg-[#090D16] font-sans text-neutral-900 dark:text-neutral-100 selection:bg-primary-100 selection:text-primary-500 transition-colors duration-200">
      <div className="mx-auto min-h-screen max-w-[1440px] bg-white dark:bg-[#0F172A] border-x border-neutral-200/50 dark:border-neutral-800/80 shadow-xs flex flex-col justify-between transition-colors duration-200">
        <div>
          {/* Top Header */}
          <Navbar activePath="/security-notice" />

          <main className="px-6 py-10 sm:px-12 lg:px-16 max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
              <Link href="/" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                Home
              </Link>
              <ChevronRight className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
              <span className="text-neutral-800 dark:text-neutral-200 font-medium" aria-current="page">
                Security Notice
              </span>
            </nav>

            {/* Header / Intro */}
            <div className="mb-12 border-b border-neutral-200/80 dark:border-neutral-800/80 pb-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-4">
                <Shield className="h-3.5 w-3.5" />
                <span>Security & Infrastructure Practices</span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 mb-3">
                Security Notice
              </h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Last updated: <span className="font-medium text-neutral-700 dark:text-neutral-300">{lastUpdated}</span> • Project Lead: <strong className="text-neutral-800 dark:text-neutral-200">Abhijeet Rawat</strong>
              </p>
            </div>

            {/* Summary Callout */}
            <div className="mb-10 rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-5 text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed">
              <h2 className="font-bold text-base text-emerald-900 dark:text-emerald-400 mb-1.5 flex items-center gap-2">
                <span>Enterprise-Grade Security by Design</span>
              </h2>
              <p>
                <strong>Vertex</strong> is architected with strict security boundaries to protect user accounts, learning progress, and platform integrity. We follow zero-trust token isolation, modern HTTPS encryption, and industry-standard third-party authentication.
              </p>
            </div>

            {/* Content Body */}
            <div className="space-y-10 text-neutral-700 dark:text-neutral-300 leading-relaxed text-sm sm:text-base">
              {/* Section 1 */}
              <section className="space-y-4">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2.5">
                  <Key className="h-5 w-5 text-primary-500" />
                  <span>1. Token Isolation & Secret Protection</span>
                </h2>
                <p>
                  Vertex strictly segregates public client-side capabilities from server-only secrets:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 bg-neutral-50/50 dark:bg-neutral-900/40">
                    <h3 className="font-bold text-neutral-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span>Zero Client-Side Write Tokens</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                      The browser client never holds Sanity API write tokens or backend secrets. All progress writes and bookmarking mutations execute via server-only route handlers (<code className="px-1 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 font-mono text-xs">/api/progress</code>, <code className="px-1 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 font-mono text-xs">/api/bookmarks</code>).
                    </p>
                  </div>

                  <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 bg-neutral-50/50 dark:bg-neutral-900/40">
                    <h3 className="font-bold text-neutral-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span>Clerk Authentication Security</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                      User authentication is powered by Clerk using short-lived signed JWT session tokens, encrypted cookies, brute-force protection, and CSRF prevention.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 2 */}
              <section className="space-y-3">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2.5">
                  <Lock className="h-5 w-5 text-primary-500" />
                  <span>2. Data Encryption (Transit & Rest)</span>
                </h2>
                <ul className="list-disc pl-5 space-y-2 text-neutral-600 dark:text-neutral-400">
                  <li>
                    <strong className="text-neutral-900 dark:text-neutral-100">Encryption in Transit:</strong> All HTTP traffic to and from Vertex is strictly enforced via TLS 1.3 / HTTPS. Unencrypted HTTP requests are automatically upgraded.
                  </li>
                  <li>
                    <strong className="text-neutral-900 dark:text-neutral-100">Encryption at Rest:</strong> Content and learner progress data stored in Sanity and Clerk datastores are encrypted at rest using AES-256 standards.
                  </li>
                </ul>
              </section>

              {/* Section 3 */}
              <section className="space-y-3">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2.5">
                  <Server className="h-5 w-5 text-primary-500" />
                  <span>3. API Rate Limiting & Input Validation</span>
                </h2>
                <p>
                  All public and authenticated API endpoints enforce server-side rate limiting and strict schema validation with <strong>Zod</strong> to prevent injection attacks, denial of service, and parameter tampering.
                </p>
              </section>

              {/* Section 4 */}
              <section className="space-y-3">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2.5">
                  <AlertCircle className="h-5 w-5 text-primary-500" />
                  <span>4. Vulnerability Disclosure Policy</span>
                </h2>
                <p>
                  We appreciate the work of the security research community. If you discover a potential vulnerability or security flaw in Vertex:
                </p>
                <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 bg-neutral-50 dark:bg-neutral-900/60 max-w-md">
                  <p className="font-bold text-neutral-900 dark:text-white text-base">Security Contact</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    Email: <a href="mailto:abhijeetrawat45@gmail.com" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">abhijeetrawat45@gmail.com</a>
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                    Please provide detailed steps to reproduce. We will acknowledge your report within 24 hours.
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

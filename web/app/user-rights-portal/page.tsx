import React from "react";
import Link from "next/link";
import { ChevronRight, UserCheck, Download, Trash2, ShieldCheck, FileJson, CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BottomGraphic } from "@/components/home/bottom-graphic";

export const metadata = {
  title: "User Rights Portal | Vertex",
  description: "Manage your personal data, request learning progress export, or exercise your GDPR / CCPA right to erasure.",
};

export default function UserRightsPortalPage() {
  const lastUpdated = "September 8, 2026";

  return (
    <div className="min-h-screen w-full bg-[#FAF9F6] dark:bg-[#090D16] font-sans text-neutral-900 dark:text-neutral-100 selection:bg-primary-100 selection:text-primary-500 transition-colors duration-200">
      <div className="mx-auto min-h-screen max-w-[1440px] bg-white dark:bg-[#0F172A] border-x border-neutral-200/50 dark:border-neutral-800/80 shadow-xs flex flex-col justify-between transition-colors duration-200">
        <div>
          {/* Top Header */}
          <Navbar activePath="/user-rights-portal" />

          <main className="px-6 py-10 sm:px-12 lg:px-16 max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
              <Link href="/" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                Home
              </Link>
              <ChevronRight className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
              <span className="text-neutral-800 dark:text-neutral-200 font-medium" aria-current="page">
                User Rights Portal
              </span>
            </nav>

            {/* Header / Intro */}
            <div className="mb-12 border-b border-neutral-200/80 dark:border-neutral-800/80 pb-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 dark:border-teal-800/60 bg-teal-50 dark:bg-teal-950/40 px-3.5 py-1 text-xs font-semibold text-teal-700 dark:text-teal-400 mb-4">
                <UserCheck className="h-3.5 w-3.5" />
                <span>Data Subject Rights & Self-Service</span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 mb-3">
                User Rights Portal
              </h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Last updated: <span className="font-medium text-neutral-700 dark:text-neutral-300">{lastUpdated}</span> • Data Protection Officer: <strong className="text-neutral-800 dark:text-neutral-200">Abhijeet Rawat</strong>
              </p>
            </div>

            {/* Introduction Callout */}
            <div className="mb-10 rounded-xl border border-teal-200 dark:border-teal-500/30 bg-teal-50/50 dark:bg-teal-950/20 p-5 text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed">
              <h2 className="font-bold text-base text-teal-900 dark:text-teal-400 mb-1.5 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <span>Full Control Over Your Data</span>
              </h2>
              <p>
                Under global privacy frameworks (including GDPR, UK GDPR, and CCPA/CPRA), you have complete sovereignty over your data on Vertex. You can inspect what is stored, request a machine-readable export, or permanently purge your account and records at any time.
              </p>
            </div>

            {/* Interactive Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {/* Card 1: Data Portability & Export */}
              <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 bg-neutral-50/70 dark:bg-neutral-900/60 flex flex-col justify-between">
                <div>
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-950/80 text-primary-600 dark:text-primary-400 mb-4">
                    <Download className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                    Request Data Export
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                    Receive a comprehensive JSON archive containing all your completed lessons, course bookmarks, resume timestamps, and account profile data.
                  </p>
                </div>
                <div>
                  <a
                    href="mailto:abhijeetrawat45@gmail.com?subject=Data%20Export%20Request%20-%20Vertex&body=Hi%20Abhijeet,%0A%0APlease%20provide%20an%20export%20of%20all%20data%20associated%20with%20my%20Clerk%20account.%0A%0AMy%20Email:%20"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white dark:text-neutral-900 shadow-xs transition-colors"
                  >
                    <FileJson className="h-4 w-4" />
                    <span>Request Data Export (JSON)</span>
                  </a>
                </div>
              </div>

              {/* Card 2: Right to Erasure */}
              <div className="rounded-2xl border border-rose-200 dark:border-rose-900/40 p-6 bg-rose-50/40 dark:bg-rose-950/20 flex flex-col justify-between">
                <div>
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 mb-4">
                    <Trash2 className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                    Request Account Erasure
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                    Permanently delete your Clerk user record, Sanity learner progress document, saved bookmarks, and associated telemetry from our database.
                  </p>
                </div>
                <div>
                  <a
                    href="mailto:abhijeetrawat45@gmail.com?subject=Account%20Erasure%20Request%20-%20Vertex&body=Hi%20Abhijeet,%0A%0APlease%20permanently%20delete%20my%20account%20and%20all%20associated%20progress%20documents%20from%20Vertex.%0A%0AMy%20Email:%20"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Submit Deletion Request</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Summary of Data Rights */}
            <div className="space-y-6 text-neutral-700 dark:text-neutral-300 leading-relaxed text-sm sm:text-base">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
                Summary of Statutory Privacy Rights
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 bg-neutral-50/50 dark:bg-neutral-900/40">
                  <h3 className="font-bold text-neutral-900 dark:text-white mb-1 flex items-center gap-1.5 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary-500" />
                    <span>Right to Know & Access</span>
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    Learn what personal information is collected, used, disclosed, or shared.
                  </p>
                </div>

                <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 bg-neutral-50/50 dark:bg-neutral-900/40">
                  <h3 className="font-bold text-neutral-900 dark:text-white mb-1 flex items-center gap-1.5 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary-500" />
                    <span>Right to Rectification</span>
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    Correct inaccurate or incomplete personal details via your user profile.
                  </p>
                </div>

                <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 bg-neutral-50/50 dark:bg-neutral-900/40">
                  <h3 className="font-bold text-neutral-900 dark:text-white mb-1 flex items-center gap-1.5 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary-500" />
                    <span>Right to Data Portability</span>
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    Obtain a copy of your progress records in a structured, portable JSON format.
                  </p>
                </div>

                <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 bg-neutral-50/50 dark:bg-neutral-900/40">
                  <h3 className="font-bold text-neutral-900 dark:text-white mb-1 flex items-center gap-1.5 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary-500" />
                    <span>Non-Discrimination</span>
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    We will never discriminate against you for exercising any of your privacy rights.
                  </p>
                </div>
              </div>

              {/* Direct Support */}
              <div className="pt-4">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Direct privacy inquiries: <a href="mailto:abhijeetrawat45@gmail.com" className="text-primary-600 dark:text-primary-400 underline font-medium">abhijeetrawat45@gmail.com</a>. Requests are completed within 24–48 hours.
                </p>
              </div>
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

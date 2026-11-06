import React from "react";
import Link from "next/link";
import { Mail, Shield, FileText, Cookie, GraduationCap, Heart, Accessibility, ShieldAlert, Video, Lock, FileCheck2 } from "lucide-react";
import { VertexLogo } from "@/components/home/vertex-logo";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-neutral-200/80 dark:border-neutral-800/80 bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-xs transition-colors duration-200 mt-auto">
      <div className="px-6 py-12 sm:px-12 lg:px-16">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4 pb-10 border-b border-neutral-200/70 dark:border-neutral-800/70">
          {/* Column 1: Brand & Portfolio Statement */}
          <div className="space-y-4 lg:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-400 rounded-lg group"
              aria-label="Vertex Home"
            >
              <VertexLogo className="h-7 w-7 transition-transform duration-200 group-hover:scale-105" />
              <span className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white font-sans">
                Vertex
              </span>
            </Link>

            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-sm">
              An AI-powered learning platform with intelligent timestamped video search, structured curriculum, and learner progress tracking.
            </p>

            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 px-3 py-1 text-xs text-neutral-600 dark:text-neutral-400">
              <GraduationCap className="h-3.5 w-3.5 text-primary-500 dark:text-primary-400" />
              <span>Educational & Portfolio Project</span>
            </div>
          </div>

          {/* Column 2: Platform Navigation */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-200">
              Platform
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/courses"
                  className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
                >
                  All Courses
                </Link>
              </li>
              <li>
                <Link
                  href="/my-learning"
                  className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
                >
                  My Learning
                </Link>
              </li>
              <li>
                <Link
                  href="/search"
                  className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
                >
                  AI Content Search
                </Link>
              </li>
              <li>
                <Link
                  href="/user-rights-portal"
                  className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
                >
                  User Rights & Data Export
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Trust & Compliance */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-200">
              Compliance & Legal
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link
                  href="/privacy-policy"
                  className="inline-flex items-center gap-1.5 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
                >
                  <Shield className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500" />
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-of-service"
                  className="inline-flex items-center gap-1.5 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
                >
                  <FileText className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500" />
                  <span>Terms of Service</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/cookie-policy"
                  className="inline-flex items-center gap-1.5 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
                >
                  <Cookie className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500" />
                  <span>Cookie Policy</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/security-notice"
                  className="inline-flex items-center gap-1.5 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
                >
                  <Lock className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500" />
                  <span>Security Notice</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/accessibility-statement"
                  className="inline-flex items-center gap-1.5 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
                >
                  <Accessibility className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500" />
                  <span>Accessibility</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/dmca"
                  className="inline-flex items-center gap-1.5 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
                >
                  <ShieldAlert className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500" />
                  <span>DMCA & Copyright</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/video-embedding-policy"
                  className="inline-flex items-center gap-1.5 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
                >
                  <Video className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500" />
                  <span>Video-Embedding Policy</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/data-processing-agreement"
                  className="inline-flex items-center gap-1.5 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
                >
                  <FileCheck2 className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500" />
                  <span>Data Processing Agreement</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Developer & Contact */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-200">
              Developer Contact
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Crafted by <span className="font-semibold text-neutral-800 dark:text-neutral-200">Abhijeet Rawat</span>. For inquiries, feedback, or DMCA takedown requests:
            </p>
            <div>
              <a
                href="mailto:abhijeetrawat45@gmail.com"
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 dark:border-neutral-700/80 bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-800/60 dark:hover:bg-neutral-800 px-3 py-2 text-xs font-medium text-neutral-800 dark:text-neutral-200 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-400"
              >
                <Mail className="h-3.5 w-3.5 text-primary-500 dark:text-primary-400" />
                <span>abhijeetrawat45@gmail.com</span>
              </a>
            </div>
          </div>
        </div>

        {/* Video Embedding & Fair Use Disclaimer */}
        <div className="pt-6 pb-4 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed border-b border-neutral-200/50 dark:border-neutral-800/50">
          <p>
            <strong className="font-semibold text-neutral-700 dark:text-neutral-300">Third-Party Content Disclaimer: </strong>
            Vertex is an educational demonstration application. All video lessons are streamed directly through official third-party embed players (such as YouTube API) without downloading, storing, altering, or re-hosting video media files. All intellectual property, trademarks, and copyright remain the exclusive property of their respective creators.
          </p>
        </div>

        {/* Copyright & Signoff */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-1.5">
            <span>© {currentYear} Vertex. Designed & developed with</span>
            <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" />
            <span>by <strong className="font-medium text-neutral-700 dark:text-neutral-300">Abhijeet Rawat</strong>.</span>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <Link href="/privacy-policy" className="hover:underline">
              Privacy
            </Link>
            <span>•</span>
            <Link href="/terms-of-service" className="hover:underline">
              Terms
            </Link>
            <span>•</span>
            <Link href="/cookie-policy" className="hover:underline">
              Cookies
            </Link>
            <span>•</span>
            <Link href="/security-notice" className="hover:underline">
              Security
            </Link>
            <span>•</span>
            <Link href="/accessibility-statement" className="hover:underline">
              Accessibility
            </Link>
            <span>•</span>
            <Link href="/dmca" className="hover:underline">
              DMCA
            </Link>
            <span>•</span>
            <Link href="/video-embedding-policy" className="hover:underline">
              Video Policy
            </Link>
            <span>•</span>
            <Link href="/user-rights-portal" className="hover:underline">
              User Rights
            </Link>
            <span>•</span>
            <Link href="/data-processing-agreement" className="hover:underline">
              DPA
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

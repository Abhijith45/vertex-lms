import React from "react";
import Link from "next/link";
import { ChevronRight, Compass } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { BottomGraphic } from "@/components/home/bottom-graphic";
import { Footer } from "@/components/layout/footer";

export const metadata = {
  title: "Page not found | Vertex",
};

export default function NotFound() {
  return (
    <div className="min-h-screen w-full bg-[#FAF9F6] dark:bg-[#090D16] font-sans text-neutral-900 dark:text-neutral-100 selection:bg-primary-100 selection:text-primary-500 transition-colors duration-200">
      {/* Centered White Canvas with 1440px viewport width */}
      <div className="mx-auto min-h-screen max-w-[1440px] bg-white dark:bg-[#0F172A] border-x border-neutral-200/50 dark:border-neutral-800/80 shadow-xs flex flex-col justify-between transition-colors duration-200">
        <div>
          {/* Top Header / Navigation */}
          <Navbar />

          {/* Main Content Area */}
          <main className="px-6 sm:px-12 lg:px-16 pt-8 pb-24">
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-950/40">
                <Compass className="h-8 w-8 text-primary-400" strokeWidth={1.75} />
              </div>
              <span className="mb-4 inline-flex rounded-full bg-neutral-100 dark:bg-neutral-800 px-3.5 py-1 text-xs font-bold tracking-widest text-neutral-500 dark:text-neutral-400 uppercase">
                404
              </span>
              <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 mb-3">
                Page not found
              </h1>
              <p className="mb-8 max-w-md text-base text-neutral-500 dark:text-neutral-400 leading-relaxed">
                The page you are looking for does not exist or has moved. Head back home or explore the course catalog.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-full bg-neutral-900 dark:bg-white px-6 py-2.5 text-sm font-semibold text-white dark:text-neutral-900 shadow-2xs transition hover:bg-neutral-800 dark:hover:bg-neutral-100"
                >
                  Back home
                </Link>
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-2 rounded-full border border-primary-100 dark:border-primary-900/50 bg-white dark:bg-neutral-800 px-6 py-2.5 text-sm font-semibold text-primary-500 dark:text-primary-400 shadow-xs transition hover:bg-primary-50 dark:hover:bg-primary-950/50"
                >
                  Browse courses
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </main>
        </div>

        {/* Footer */}
        <Footer />

        {/* Ambient Bottom Skyline Graphic */}
        <BottomGraphic />
      </div>
    </div>
  );
}

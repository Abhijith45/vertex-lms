import React from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

interface AuthCardLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  activePath?: string;
}

export function AuthCardLayout({
  title,
  subtitle,
  children,
  footer,
  activePath,
}: AuthCardLayoutProps) {
  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between bg-[#FAF9F6] dark:bg-[#090D16] text-neutral-900 dark:text-neutral-100 transition-colors duration-200">
      {/* Global Application Navbar */}
      <Navbar activePath={activePath} showSearch={false} />

      {/* Main Centered Auth Container with Balanced 480px Max Width & Generous Padding */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10 sm:py-14 my-auto w-full">
        <div
          className="relative w-full max-w-[480px] mx-auto overflow-hidden rounded-3xl bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-2xl border border-neutral-200/90 dark:border-neutral-800 p-8 sm:p-10 shadow-2xl shadow-neutral-900/10 dark:shadow-black/70 ring-1 ring-neutral-900/5 dark:ring-white/5 transition-all"
          style={{ maxWidth: "480px", width: "100%" }}
        >
          {/* Ambient Top Glow Graphic (Terracotta Accent) */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-56 w-72 rounded-full bg-[#E05A36]/15 dark:bg-[#E05A36]/25 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 right-0 h-48 w-48 rounded-full bg-[#E05A36]/8 dark:bg-[#E05A36]/10 blur-3xl pointer-events-none" />

          {/* Header Title */}
          <div className="relative z-10 text-center mb-8">
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 mb-2.5">
              {title}
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Form Content */}
          <div className="relative z-10">{children}</div>

          {/* Footer Navigation */}
          {footer && (
            <div className="relative z-10 mt-8 pt-6 border-t border-neutral-200/70 dark:border-neutral-800/80 text-center text-xs text-neutral-500 dark:text-neutral-400">
              {footer}
            </div>
          )}
        </div>
      </main>

      {/* Global Application Footer */}
      <Footer />
    </div>
  );
}

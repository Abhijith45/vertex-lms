"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Lightbulb,
  FileText,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import { PortableText, type PortableTextComponents } from "@portabletext/react";

interface Resource {
  _key?: string;
  type?: string;
  title: string;
  description?: string;
  url: string;
}

interface LessonContentTabsProps {
  overviewNotes?: any;
  keyPoints?: string[];
  proTip?: string;
  resources?: Resource[];
}

const portableTextComponents: PortableTextComponents = {
  block: {
    h2: ({ children }) => (
      <h3 className="font-display text-xl font-bold text-neutral-900 mt-6 mb-3">
        {children}
      </h3>
    ),
    normal: ({ children }) => (
      <p className="text-neutral-600 text-base leading-relaxed mb-4">
        {children}
      </p>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc pl-5 space-y-2 text-neutral-600 text-base mb-4">
        {children}
      </ul>
    ),
  },
};

export function LessonContentTabs({
  overviewNotes,
  keyPoints = [],
  proTip,
  resources = [],
}: LessonContentTabsProps) {
  const [activeTab, setActiveTab] = useState<"content" | "notes">("content");

  // Fallback key points if not provided
  const points =
    keyPoints && keyPoints.length > 0
      ? keyPoints
      : [
          "Understand the different data fetching methods in Next.js",
          "Learn how caching works in Server Components",
          "Implement revalidation and cache control",
          "Optimize performance with advanced caching strategies",
        ];

  // Fallback resources if not provided
  const resourceList: Resource[] =
    resources && resources.length > 0
      ? resources
      : [
          {
            title: "Next.js Data Fetching Documentation",
            description: "Official Next.js docs on data fetching methods.",
            url: "https://nextjs.org/docs",
            type: "doc",
          },
          {
            title: "Caching and Revalidation Guide",
            description: "Deep dive into Next.js caching strategies.",
            url: "https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating",
            type: "doc",
          },
          {
            title: "Example Repository",
            description: "Explore the source code for this lesson.",
            url: "https://github.com/vercel/next.js",
            type: "github",
          },
        ];

  return (
    <div className="mt-8 space-y-10">
      {/* ──────────────────────────────────────────────────────────
         TABS NAVIGATION
         ────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-8 border-b border-neutral-200/80">
        <button
          type="button"
          onClick={() => setActiveTab("content")}
          className={`pb-3.5 text-sm font-semibold transition-all relative cursor-pointer ${
            activeTab === "content"
              ? "text-[#E05A36]"
              : "text-neutral-500 hover:text-neutral-900"
          }`}
        >
          Lesson Content
          {activeTab === "content" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E05A36] rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("notes")}
          className={`pb-3.5 text-sm font-semibold transition-all relative cursor-pointer ${
            activeTab === "notes"
              ? "text-[#E05A36]"
              : "text-neutral-500 hover:text-neutral-900"
          }`}
        >
          Notes
          {activeTab === "notes" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E05A36] rounded-full" />
          )}
        </button>
      </div>

      {activeTab === "content" ? (
        <div className="space-y-10">
          {/* ──────────────────────────────────────────────────────────
             OVERVIEW SECTION
             ────────────────────────────────────────────────────────── */}
          <section>
            <h2 className="font-display text-2xl font-bold text-neutral-900 tracking-tight mb-4">
              Overview
            </h2>

            {overviewNotes && Array.isArray(overviewNotes) && overviewNotes.length > 0 ? (
              <div className="prose prose-neutral max-w-none text-neutral-600 leading-relaxed">
                <PortableText value={overviewNotes} components={portableTextComponents} />
              </div>
            ) : (
              <p className="text-neutral-600 text-base leading-relaxed">
                In this lesson, you&apos;ll learn how Next.js handles data fetching and caching in both Server and Client Components. We&apos;ll explore different caching strategies and revalidation techniques to build fast and scalable applications.
              </p>
            )}
          </section>

          {/* ──────────────────────────────────────────────────────────
             IN THIS LESSON YOU WILL
             ────────────────────────────────────────────────────────── */}
          <section>
            <h3 className="text-base font-semibold text-neutral-900 mb-4">
              In this lesson you will:
            </h3>

            <div className="space-y-3.5">
              {points.map((pt, idx) => (
                <div key={idx} className="flex items-start gap-3.5 text-sm sm:text-base text-neutral-700">
                  <CheckCircle2 className="h-5 w-5 text-[#E05A36] shrink-0 mt-0.5" strokeWidth={1.75} />
                  <span>{pt}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ──────────────────────────────────────────────────────────
             PRO TIP CALLOUT
             ────────────────────────────────────────────────────────── */}
          {proTip && (
            <section className="rounded-2xl border border-[#FFEDD5] bg-[#FFF8F6] p-6 sm:p-7 flex items-start gap-4 shadow-2xs">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FFEDD5]/60 text-[#E05A36]">
                <Lightbulb className="h-5 w-5" strokeWidth={2} />
              </div>
              <div>
                <h4 className="font-sans font-bold text-neutral-900 text-base mb-1">
                  Pro Tip
                </h4>
                <p className="text-neutral-600 text-sm leading-relaxed">
                  {proTip}
                </p>
              </div>
            </section>
          )}

          {/* ──────────────────────────────────────────────────────────
             RESOURCES SECTION
             ────────────────────────────────────────────────────────── */}
          {resourceList.length > 0 && (
            <section>
              <h2 className="font-display text-2xl font-bold text-neutral-900 tracking-tight mb-5">
                Resources
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {resourceList.map((res, idx) => (
                  <a
                    key={res._key || idx}
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group rounded-xl border border-neutral-200/80 bg-white p-5 flex flex-col justify-between hover:border-neutral-300 hover:shadow-xs transition-all duration-200"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700">
                          {res.type === "github" ? (
                            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                          ) : (
                            <FileText className="h-4 w-4" />
                          )}
                        </div>
                        <ExternalLink className="h-4 w-4 text-neutral-400 group-hover:text-primary-500 transition-colors" />
                      </div>

                      <h4 className="font-sans font-semibold text-neutral-900 text-sm leading-snug group-hover:text-primary-600 transition-colors">
                        {res.title}
                      </h4>

                      {res.description && (
                        <p className="mt-1 text-xs text-neutral-500 leading-relaxed line-clamp-2">
                          {res.description}
                        </p>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        /* ──────────────────────────────────────────────────────────
           NOTES TAB
           ────────────────────────────────────────────────────────── */
        <section className="bg-neutral-50/60 rounded-2xl p-8 border border-neutral-200/80">
          <h3 className="font-display text-xl font-bold text-neutral-900 mb-3">
            Personal Notes
          </h3>
          <p className="text-neutral-500 text-sm leading-relaxed mb-4">
            Take notes while watching this lesson. Notes are saved automatically to your workspace profile.
          </p>
          <textarea
            placeholder="Type your notes here..."
            rows={6}
            className="w-full rounded-xl border border-neutral-200 bg-white p-4 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-primary-400 focus:outline-hidden focus:ring-2 focus:ring-primary-100 resize-none shadow-2xs"
          />
        </section>
      )}
    </div>
  );
}

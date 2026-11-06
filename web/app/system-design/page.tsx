"use client";

import { notFound } from "next/navigation";

// Dev-only reference page — not accessible in production
if (process.env.NODE_ENV === "production") {
  notFound();
}

import {
  Bell,
  Search,
  Play,
  Monitor,
  FileText,
  Bookmark,
  BarChart3,
  Clock,
  Smile,
  ArrowRight,
  User,
} from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Select } from "@/components/ui/input";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatusIndicator } from "@/components/ui/status-indicator";
import {
  CourseCard,
  LessonVideoCard,
  LessonCard,
  ResourceCard,
} from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Breadcrumb } from "@/components/ui/breadcrumb";

/* ──────────────────────────────────────────────────────────
   HELPERS
   ────────────────────────────────────────────────────────── */

function SectionLabel({
  number,
  title,
}: {
  number: string;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-6">
      <span className="text-sm font-bold text-primary-500">{number}</span>
      <span className="text-sm font-bold uppercase tracking-wider text-neutral-900">
        {title}
      </span>
    </div>
  );
}

function Swatch({
  name,
  hex,
}: {
  name: string;
  hex: string;
}) {
  return (
    <div className="flex flex-col items-start gap-1.5">
      <div
        className="h-16 w-full rounded-[var(--radius-sm)] border border-neutral-100"
        style={{ backgroundColor: hex }}
      />
      <span className="text-small font-medium text-neutral-900">{name}</span>
      <span className="text-small text-neutral-500">{hex}</span>
    </div>
  );
}

function SpacingBlock({ px, rem }: { px: number; rem: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="rounded-[var(--radius-xs)] bg-primary-300"
        style={{ width: `${px}px`, height: `${px}px` }}
      />
      <span className="text-small font-medium text-neutral-900">{px}</span>
      <span className="text-small text-neutral-500">({rem})</span>
    </div>
  );
}

function RadiusDemo({ px, label }: { px: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="h-14 w-14 border-2 border-neutral-300 bg-neutral-50"
        style={{ borderRadius: px === "full" ? "9999px" : px }}
      />
      <span className="text-small font-medium text-neutral-900">{px}</span>
      <span className="text-small text-neutral-500">({label})</span>
    </div>
  );
}

function ShadowDemo({ label, shadow }: { label: string; shadow: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className="h-20 rounded-[var(--radius-md)] border border-neutral-100 bg-white"
        style={{ boxShadow: shadow }}
      />
      <span className="text-small font-bold text-neutral-900">{label}</span>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   PAGE
   ────────────────────────────────────────────────────────── */

export default function DesignSystem() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {/* ─── Header ─── */}
        <header className="mb-16 flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-4">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="6" fill="#F97316" />
              <path d="M10 24L16 8L22 24" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 20H20" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <span className="text-heading-2 text-neutral-900 font-bold">Vertex</span>
          </div>
          <h1 className="text-display-1 text-neutral-900">Design System</h1>
          <p className="text-body-lg text-neutral-500 max-w-md mt-2">
            A unified design language for Vertex learning platform. Clean, modern and focused on clarity, consistency and intuitive learning experiences.
          </p>
          <p className="text-small text-neutral-500 mt-4 uppercase tracking-wider">Version 1.0 · May 2025</p>
        </header>

        {/* ─── 01 Colors ─── */}
        <section className="mb-16">
          <SectionLabel number="01" title="Colors" />

          <h4 className="text-body font-semibold text-neutral-900 mb-3">Primary</h4>
          <div className="grid grid-cols-5 gap-4 mb-8">
            <Swatch name="Primary 500" hex="#F97316" />
            <Swatch name="Primary 400" hex="#FB923C" />
            <Swatch name="Primary 300" hex="#FDBA74" />
            <Swatch name="Primary 200" hex="#FED7AA" />
            <Swatch name="Primary 100" hex="#FFEEE5" />
          </div>

          <h4 className="text-body font-semibold text-neutral-900 mb-3">Neutral</h4>
          <div className="grid grid-cols-4 gap-4 sm:grid-cols-8">
            <Swatch name="Neutral 900" hex="#0F172A" />
            <Swatch name="Neutral 700" hex="#334155" />
            <Swatch name="Neutral 500" hex="#64748B" />
            <Swatch name="Neutral 300" hex="#CBD5E1" />
            <Swatch name="Neutral 200" hex="#E2E8F0" />
            <Swatch name="Neutral 100" hex="#F1F5F9" />
            <Swatch name="Neutral 50" hex="#FAFAFC" />
            <Swatch name="White" hex="#FFFFFF" />
          </div>
        </section>

        {/* ─── 02 Typography ─── */}
        <section className="mb-16">
          <SectionLabel number="02" title="Typography" />
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            <div className="flex items-center gap-6">
              <span className="text-display-1 text-neutral-900">Ag</span>
              <div>
                <p className="text-heading-3 text-neutral-900">Playfair Display</p>
                <p className="text-body text-neutral-500">Elegant · Readable · Timeless</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-display-1 text-neutral-900" style={{ fontFamily: "var(--font-sans)" }}>Ag</span>
              <div>
                <p className="text-heading-3 text-neutral-900">Inter</p>
                <p className="text-body text-neutral-500">Clean · Modern · Highly legible</p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 03 Type Scale ─── */}
        <section className="mb-16">
          <SectionLabel number="03" title="Type Scale" />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-body">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="py-3 pr-4 font-semibold text-neutral-900">Style</th>
                  <th className="py-3 pr-4 font-semibold text-neutral-900">Font</th>
                  <th className="py-3 pr-4 font-semibold text-neutral-900">Size / Line Height</th>
                  <th className="py-3 pr-4 font-semibold text-neutral-900">Weight</th>
                  <th className="py-3 font-semibold text-neutral-900">Use</th>
                </tr>
              </thead>
              <tbody className="text-neutral-700">
                {[
                  ["Display 1", "Playfair Display", "48 / 56", "Bold", "Page titles"],
                  ["Display 2", "Playfair Display", "36 / 44", "Bold", "Section titles"],
                  ["Heading 1", "Inter", "28 / 36", "Semi Bold", "Card titles"],
                  ["Heading 2", "Inter", "22 / 30", "Semi Bold", "Sub section"],
                  ["Heading 3", "Inter", "18 / 26", "Medium", "Small titles"],
                  ["Body Large", "Inter", "16 / 24", "Regular", "Body copy"],
                  ["Body", "Inter", "14 / 20", "Regular", "Supporting text"],
                  ["Small", "Inter", "12 / 16", "Regular", "Captions, meta"],
                ].map(([style, font, size, weight, use]) => (
                  <tr key={style} className="border-b border-neutral-100">
                    <td className="py-3 pr-4 font-medium text-neutral-900">{style}</td>
                    <td className="py-3 pr-4">{font}</td>
                    <td className="py-3 pr-4">{size}</td>
                    <td className="py-3 pr-4">{weight}</td>
                    <td className="py-3">{use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ─── 04 Spacing + 05 Radius & Shadows ─── */}
        <div className="grid grid-cols-1 gap-16 mb-16 lg:grid-cols-2">
          <section>
            <SectionLabel number="04" title="Spacing System" />
            <p className="text-body text-neutral-500 mb-4">Base unit: 4px</p>
            <div className="flex flex-wrap items-end gap-6">
              {[
                { px: 4, rem: "0.25rem" },
                { px: 8, rem: "0.5rem" },
                { px: 12, rem: "0.75rem" },
                { px: 16, rem: "1rem" },
                { px: 24, rem: "1.5rem" },
                { px: 32, rem: "2rem" },
                { px: 40, rem: "2.5rem" },
                { px: 48, rem: "3rem" },
                { px: 64, rem: "4rem" },
              ].map((s) => (
                <SpacingBlock key={s.px} {...s} />
              ))}
            </div>
          </section>

          <section>
            <SectionLabel number="05" title="Radius & Shadows" />

            <h4 className="text-body font-semibold text-neutral-900 mb-3">Radius</h4>
            <div className="flex flex-wrap gap-4 mb-8">
              <RadiusDemo px="4px" label="xs" />
              <RadiusDemo px="8px" label="sm" />
              <RadiusDemo px="12px" label="md" />
              <RadiusDemo px="16px" label="lg" />
              <RadiusDemo px="24px" label="xl" />
              <RadiusDemo px="full" label="circle" />
            </div>

            <h4 className="text-body font-semibold text-neutral-900 mb-3">Shadows</h4>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <ShadowDemo label="Sm" shadow="0 1px 2px 0 rgba(15,23,42,0.05)" />
              <ShadowDemo label="Md" shadow="0 4px 12px -2px rgba(15,23,42,0.08)" />
              <ShadowDemo label="Lg" shadow="0 12px 24px -4px rgba(15,23,42,0.10)" />
              <ShadowDemo label="Xl" shadow="0 20px 40px -8px rgba(15,23,42,0.12)" />
            </div>
          </section>
        </div>

        {/* ─── 06 Icons ─── */}
        <section className="mb-16">
          <SectionLabel number="06" title="Icons" />
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <h4 className="text-body font-semibold text-neutral-900 mb-3">Outline Style</h4>
              <div className="flex flex-wrap gap-4">
                {[Bell, Search, Play, FileText, Monitor, Bookmark, BarChart3, Clock, Smile, ArrowRight].map(
                  (IconComp, i) => (
                    <div key={i} className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] border border-neutral-200">
                      <Icon icon={IconComp} size={20} variant="outline" className="text-neutral-700" />
                    </div>
                  )
                )}
              </div>
            </div>
            <div>
              <h4 className="text-body font-semibold text-neutral-900 mb-3">Filled Style</h4>
              <div className="flex flex-wrap gap-4">
                {[Bell, Search, Play, FileText, Monitor, Bookmark, BarChart3, Clock, Smile, User].map(
                  (IconComp, i) => (
                    <div key={i} className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] border border-neutral-200">
                      <Icon icon={IconComp} size={20} variant="filled" className="text-neutral-700" />
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
          <div className="mt-4 text-body text-neutral-500">
            <p className="font-medium text-neutral-900 mb-1">Icon Specs</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>24×24px grid</li>
              <li>2px stroke width (outline)</li>
              <li>Rounded line caps</li>
              <li>Consistent optical balance</li>
            </ul>
          </div>
        </section>

        {/* ─── 07 Buttons ─── */}
        <section className="mb-16">
          <SectionLabel number="07" title="Buttons" />
          <div className="overflow-x-auto">
            <table className="text-body text-left">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="py-3 pr-8 font-semibold text-neutral-900 w-24"></th>
                  <th className="py-3 pr-8 font-semibold text-neutral-900">Primary</th>
                  <th className="py-3 pr-8 font-semibold text-neutral-900">Secondary</th>
                  <th className="py-3 pr-8 font-semibold text-neutral-900">Tertiary</th>
                  <th className="py-3 font-semibold text-neutral-900">Text</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-neutral-100">
                  <td className="py-4 pr-8 text-neutral-700">Default</td>
                  <td className="py-4 pr-8"><Button variant="primary">Get Started</Button></td>
                  <td className="py-4 pr-8"><Button variant="secondary">Explore Courses</Button></td>
                  <td className="py-4 pr-8"><Button variant="tertiary">View Lesson</Button></td>
                  <td className="py-4"><Button variant="text">Watch Video</Button></td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="py-4 pr-8 text-neutral-700">Disabled</td>
                  <td className="py-4 pr-8"><Button variant="primary" disabled>Get Started</Button></td>
                  <td className="py-4 pr-8"><Button variant="secondary" disabled>Explore Courses</Button></td>
                  <td className="py-4 pr-8"><Button variant="tertiary" disabled>View Lesson</Button></td>
                  <td className="py-4"><Button variant="text" disabled>Watch Video</Button></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-body text-neutral-500">
            <p className="font-medium text-neutral-900 mb-1">Button Specs</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Height: 44px (default)</li>
              <li>Padding: 0 16px (lg), 0 12px (md)</li>
              <li>Radius: 12px</li>
              <li>Font: Inter Medium (14–16px)</li>
            </ul>
          </div>
        </section>

        {/* ─── 08 Inputs ─── */}
        <section className="mb-16">
          <SectionLabel number="08" title="Inputs" />
          <div className="grid grid-cols-1 gap-8 max-w-2xl md:grid-cols-2">
            <div>
              <h4 className="text-body font-semibold text-neutral-900 mb-3">Search / Text Input</h4>
              <Input isSearch placeholder="Search anything..." />
            </div>
            <div>
              <h4 className="text-body font-semibold text-neutral-900 mb-3">Select</h4>
              <Select
                options={[
                  { value: "relevant", label: "Most Relevant" },
                  { value: "newest", label: "Newest" },
                  { value: "popular", label: "Most Popular" },
                ]}
              />
            </div>
          </div>
          <div className="mt-4 text-body text-neutral-500">
            <p className="font-medium text-neutral-900 mb-1">Field Specs</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Height: 44px</li>
              <li>Radius: 12px</li>
              <li>Border: 1px solid #E2E8F0</li>
              <li>Padding: 0 16px</li>
              <li>Focus: Border color #FB923C</li>
            </ul>
          </div>
        </section>

        {/* ─── 09 Badges ─── */}
        <section className="mb-16">
          <SectionLabel number="09" title="Badges / Tags" />
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex flex-col items-start gap-2">
              <span className="text-small text-neutral-500">Video</span>
              <Badge type="video" />
            </div>
            <div className="flex flex-col items-start gap-2">
              <span className="text-small text-neutral-500">Lesson</span>
              <Badge type="lesson" />
            </div>
            <div className="flex flex-col items-start gap-2">
              <span className="text-small text-neutral-500">Popular</span>
              <Badge type="popular" />
            </div>
          </div>
        </section>

        {/* ─── 10 Status + 11 Progress ─── */}
        <div className="grid grid-cols-1 gap-16 mb-16 lg:grid-cols-2">
          <section>
            <SectionLabel number="10" title="Status / Indicators" />
            <div className="flex flex-wrap gap-6">
              <StatusIndicator status="in-progress" />
              <StatusIndicator status="completed" />
              <StatusIndicator status="now-playing" />
              <StatusIndicator status="locked" />
            </div>
          </section>
          <section>
            <SectionLabel number="11" title="Progress Bar" />
            <ProgressBar value={35} />
          </section>
        </div>

        {/* ─── 12 Cards ─── */}
        <section className="mb-16">
          <SectionLabel number="12" title="Cards" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <p className="text-small text-neutral-500 mb-3">Course Card</p>
              <CourseCard
                icon="N"
                title="Next.js for Production"
                description="Build scalable, high-performance web applications with Next.js."
                level="Intermediate"
                duration="18h 24m"
                modules={12}
              />
            </div>
            <div>
              <p className="text-small text-neutral-500 mb-3">Lesson Card (Video)</p>
              <LessonVideoCard
                title="Data Fetching in Server Components"
                description="Learn how to fetch data on the server using async/await and Next.js best practices."
                lessonLabel="Lesson 5.1"
                duration="12:45"
                timestamp="12:45"
              />
            </div>
            <div>
              <p className="text-small text-neutral-500 mb-3">Lesson Card (Lesson)</p>
              <LessonCard
                title="Data Fetching & Caching"
                description="Explore different data fetching methods in Next.js and how to cache and revalidate data for optimal performance."
                moduleLabel="Module 5"
              />
            </div>
            <div>
              <p className="text-small text-neutral-500 mb-3">Resource Card</p>
              <ResourceCard
                title="Caching and Revalidation Guide"
                description="Deep dive into Next.js caching strategies."
                fileType="PDF"
                fileSize="1.2 MB"
              />
            </div>
          </div>
        </section>

        {/* ─── 13 Navigation ─── */}
        <section className="mb-16">
          <SectionLabel number="13" title="Navigation" />
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
            {/* Nav links */}
            <div>
              <h4 className="text-body font-semibold text-neutral-900 mb-3">Navigation</h4>
              <nav className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                    <rect width="32" height="32" rx="6" fill="#F97316" />
                    <path d="M10 24L16 8L22 24" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 20H20" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                  <span className="font-bold text-neutral-900">Vertex</span>
                </div>
                <a href="#" className="text-sm font-medium text-primary-500">Courses</a>
                <a href="#" className="text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors">My Learning</a>
              </nav>
            </div>

            {/* Breadcrumb */}
            <div>
              <h4 className="text-body font-semibold text-neutral-900 mb-3">Breadcrumbs</h4>
              <Breadcrumb
                items={[
                  { label: "All Courses" },
                  { label: "Next.js for Production" },
                  { label: "Data Fetching and Caching" },
                ]}
              />
            </div>

            {/* Pagination */}
            <div>
              <h4 className="text-body font-semibold text-neutral-900 mb-3">Pagination</h4>
              <Pagination currentPage={1} totalPages={8} />
            </div>
          </div>
        </section>

        {/* ─── 14 Principles ─── */}
        <section className="border-t border-neutral-200 pt-12">
          <SectionLabel number="14" title="Principles" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Clarity First",
                description: "Every element should communicate clearly.",
              },
              {
                title: "Consistency",
                description: "Use components and patterns consistently across the platform.",
              },
              {
                title: "Focus & Calm",
                description: "Remove noise and help learners focus on what matters.",
              },
              {
                title: "Accessible",
                description: "Design with accessibility and inclusivity in mind.",
              },
            ].map((p) => (
              <div key={p.title} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="8" cy="8" r="2.5" fill="currentColor" />
                  </svg>
                </div>
                <div>
                  <p className="text-body font-semibold text-neutral-900">{p.title}</p>
                  <p className="text-small text-neutral-500">{p.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

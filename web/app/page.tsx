import React from "react";
import Link from "next/link";
import { Bell, ArrowRight, Star } from "lucide-react";
import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import { VertexLogo } from "@/components/home/vertex-logo";
import { HeroSearch } from "@/components/home/hero-search";
import { HomeCourseCard } from "@/components/home/home-course-card";
import {
  NextJsIcon,
  DockerIcon,
  TypeScriptIcon,
} from "@/components/home/course-icons";
import { BottomGraphic } from "@/components/home/bottom-graphic";

export default function HomePage() {
  return (
    <div className="min-h-screen w-full bg-white font-sans text-neutral-900 selection:bg-primary-100 selection:text-primary-500">
      {/* Centered White Canvas with 1440px viewport width */}
      <div className="mx-auto min-h-screen max-w-[1440px] bg-white shadow-xs flex flex-col justify-between">
        <div>
          {/* ──────────────────────────────────────────────────────────
             TOP HEADER / NAVIGATION
             ────────────────────────────────────────────────────────── */}
          <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-neutral-100/90 bg-white/95 px-6 sm:px-12 lg:px-16 backdrop-blur-md">
            {/* Left: Brand & Navigation */}
            <div className="flex items-center gap-8 sm:gap-10">
              <Link
                href="/"
                className="flex items-center gap-2.5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-400 rounded-md"
                aria-label="Vertex Home"
              >
                <VertexLogo className="h-7 w-7" />
                <span className="text-xl font-bold tracking-tight text-neutral-900 font-sans">
                  Vertex
                </span>
              </Link>

              {/* Navigation Links */}
              <nav className="flex items-center gap-7 text-sm font-medium">
                <Link
                  href="/courses"
                  className="text-neutral-700 transition-colors hover:text-neutral-900"
                >
                  Courses
                </Link>
                <Link
                  href="/my-learning"
                  className="text-neutral-700 transition-colors hover:text-neutral-900"
                >
                  My Learning
                </Link>
              </nav>
            </div>

            {/* Right: Auth Controls */}
            <div className="flex items-center gap-4 sm:gap-5">
              <Show when="signed-in">
                <button
                  type="button"
                  className="relative flex h-9 w-9 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-400 cursor-pointer"
                  aria-label="View notifications"
                >
                  <Bell className="h-5 w-5" strokeWidth={1.75} />
                </button>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "h-9 w-9",
                    },
                  }}
                />
              </Show>

              <Show when="signed-out">
                <SignInButton>
                  <button
                    type="button"
                    className="text-sm font-medium text-neutral-700 transition-colors hover:text-neutral-900 cursor-pointer"
                  >
                    Sign in
                  </button>
                </SignInButton>
                <SignUpButton>
                  <button
                    type="button"
                    className="inline-flex items-center rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 cursor-pointer"
                  >
                    Get started
                  </button>
                </SignUpButton>
              </Show>
            </div>
          </header>

          {/* ──────────────────────────────────────────────────────────
             HERO SECTION
             ────────────────────────────────────────────────────────── */}
          <section className="px-6 pt-16 pb-14 text-center sm:px-12 lg:px-16 md:pt-20 md:pb-16">
            {/* Intelligent Learning Pill */}
            <div className="inline-flex items-center rounded-full border border-[#FED7AA] bg-[#FFF5EE] px-4 py-1.5 text-[11px] font-bold tracking-widest text-[#EA580C] uppercase shadow-2xs mb-7 select-none">
              INTELLIGENT LEARNING
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl md:text-[62px] leading-[1.14] max-w-4xl mx-auto">
              Search your learning <br className="hidden sm:inline" />
              in plain English.
            </h1>

            {/* Subtitle */}
            <p className="mt-5 text-base sm:text-lg text-neutral-500 max-w-xl mx-auto leading-relaxed">
              Vertex understands what you want to learn and finds the exact
              lessons across all your courses.
            </p>

            {/* Explore Courses Button */}
            <div className="mt-8 flex justify-center">
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-7 py-3.5 text-base font-medium text-white shadow-md shadow-orange-500/25 transition-all duration-200 hover:bg-[#EA580C] hover:shadow-lg hover:shadow-orange-500/30 active:scale-[0.99] cursor-pointer"
              >
                <span>Explore Courses</span>
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Link>
            </div>

            {/* Interactive Search Bar */}
            <HeroSearch />
          </section>

          {/* ──────────────────────────────────────────────────────────
             ALL COURSES SECTION
             ────────────────────────────────────────────────────────── */}
          <section className="px-6 py-8 sm:px-12 lg:px-16">
            {/* Section Title & Link */}
            <div className="flex items-center justify-between mb-7">
              <h2 className="font-display text-2xl sm:text-[28px] font-bold text-neutral-900 tracking-tight">
                All Courses
              </h2>
              <Link
                href="/courses"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-500 transition-colors hover:text-[#EA580C] group"
              >
                <span>View all courses</span>
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  strokeWidth={2}
                />
              </Link>
            </div>

            {/* Course Cards Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <HomeCourseCard
                href="/courses/nextjs-for-production"
                icon={<NextJsIcon />}
                title="Next.js for Production"
                description="Build scalable, high-performance web applications with Next.js."
                level="Intermediate"
                duration="18h 24m"
                modules={12}
              />

              <HomeCourseCard
                href="/courses/docker-essentials"
                icon={<DockerIcon />}
                title="Docker Essentials"
                description="Containerize applications and streamline your development workflow."
                level="Beginner"
                duration="10h 12m"
                modules={8}
              />

              <HomeCourseCard
                href="/courses/typescript-deep-dive"
                icon={<TypeScriptIcon />}
                title="TypeScript Deep Dive"
                description="Go beyond the basics and write safer, more expressive code."
                level="Intermediate"
                duration="14h 36m"
                modules={10}
              />
            </div>

            {/* ──────────────────────────────────────────────────────────
               WEEKLY UPDATES DIVIDER
               ────────────────────────────────────────────────────────── */}
            <div className="relative my-16 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-neutral-200/80" />
              </div>
              <div className="relative flex items-center gap-2 bg-white px-5 text-sm text-neutral-600 font-normal">
                <Star
                  className="h-4 w-4 text-primary-500 fill-transparent"
                  strokeWidth={1.75}
                />
                <span>New courses and lessons added every week.</span>
              </div>
            </div>
          </section>
        </div>

        {/* ──────────────────────────────────────────────────────────
           BOTTOM SKYLINE ARTWORK
           ────────────────────────────────────────────────────────── */}
        <BottomGraphic />
      </div>
    </div>
  );
}

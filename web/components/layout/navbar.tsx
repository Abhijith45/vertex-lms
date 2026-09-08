import React from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import { VertexLogo } from "@/components/home/vertex-logo";
import { SearchInput } from "@/components/search/search-input";
import { ThemeToggle } from "@/components/theme/theme-toggle";

interface NavbarProps {
  activePath?: string;
  showSearch?: boolean;
}

export function Navbar({ activePath, showSearch = true }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-neutral-200/70 dark:border-neutral-800/80 bg-white/90 dark:bg-[#0F172A]/90 px-6 sm:px-12 lg:px-16 backdrop-blur-md transition-colors duration-200">
      {/* Left: Brand & Navigation */}
      <div className="flex items-center gap-7 sm:gap-9">
        <Link
          href="/"
          className="flex items-center gap-2.5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-400 rounded-lg group"
          aria-label="Vertex Home"
        >
          <VertexLogo className="h-7 w-7 transition-transform duration-200 group-hover:scale-105" />
          <span className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white font-sans">
            Vertex
          </span>
        </Link>

        {/* Navigation Links with SaaS Pill States */}
        <nav className="flex items-center gap-1.5 sm:gap-2 text-sm font-medium">
          <Link
            href="/courses"
            className={`px-3 py-1.5 rounded-lg transition-all duration-150 ${
              activePath === "/courses"
                ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold shadow-2xs"
                : "text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
            }`}
          >
            Courses
          </Link>
          <Link
            href="/my-learning"
            className={`px-3 py-1.5 rounded-lg transition-all duration-150 ${
              activePath === "/my-learning"
                ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold shadow-2xs"
                : "text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
            }`}
          >
            My Learning
          </Link>
        </nav>
      </div>

      {/* Middle: Search (hidden when showSearch === false) */}
      {showSearch && (
        <div className="hidden flex-1 px-8 md:flex lg:px-12 max-w-xl mx-auto">
          <SearchInput />
        </div>
      )}

      {/* Right: Theme Toggle & Auth Controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        <ThemeToggle />

        <Show when="signed-in">
          <button
            type="button"
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-neutral-600 dark:text-neutral-300 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-400 cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="h-4.5 w-4.5" strokeWidth={1.75} />
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
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300 transition-colors hover:text-neutral-900 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer"
            >
              Sign in
            </button>
          </SignInButton>
          <SignUpButton>
            <button
              type="button"
              className="inline-flex items-center rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 px-4 py-2 text-sm font-medium text-white dark:text-neutral-900 transition-all shadow-xs hover:shadow-sm cursor-pointer"
            >
              Get started
            </button>
          </SignUpButton>
        </Show>
      </div>
    </header>
  );
}

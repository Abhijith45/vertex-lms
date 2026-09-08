"use client";

import React, { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { SearchModal } from "@/components/search/search-modal";

export function HeroSearch() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsModalOpen(true);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <div
        onClick={handleOpenModal}
        className="w-full max-w-[680px] mx-auto mt-8 relative cursor-pointer group"
        role="search"
      >
        <div className="relative flex items-center w-full h-[56px] rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 px-5 shadow-xs transition-all duration-200 hover:border-primary-300 dark:hover:border-primary-600 group-hover:shadow-md focus-within:border-primary-400 focus-within:ring-4 focus-within:ring-primary-400/15">
          <Search
            className="h-5 w-5 text-neutral-400 dark:text-neutral-500 shrink-0 mr-3.5 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors"
            strokeWidth={2}
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            type="text"
            readOnly
            onFocus={handleOpenModal}
            onClick={handleOpenModal}
            placeholder="Ask anything about your learning..."
            className="w-full bg-transparent text-[15px] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 outline-none font-normal cursor-pointer"
            aria-label="Search learning content"
          />
          <div className="flex items-center shrink-0 ml-3">
            <kbd className="inline-flex items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-100/80 dark:bg-neutral-800/80 px-2 py-0.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400 font-mono shadow-2xs select-none">
              ⌘ K
            </kbd>
          </div>
        </div>
      </div>

      {/* Interactive Search Modal */}
      <SearchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

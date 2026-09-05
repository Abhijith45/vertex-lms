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
        className="w-full max-w-[720px] mx-auto mt-9 relative cursor-pointer group"
        role="search"
      >
        <div className="relative flex items-center w-full h-[58px] rounded-2xl border border-neutral-200/90 bg-white px-5 shadow-2xs transition-all duration-200 hover:border-neutral-300 group-hover:shadow-sm focus-within:border-primary-400 focus-within:ring-4 focus-within:ring-primary-400/15">
          <Search
            className="h-5 w-5 text-neutral-400 shrink-0 mr-3.5 group-hover:text-neutral-600 transition-colors"
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
            className="w-full bg-transparent text-[15px] text-neutral-900 placeholder:text-neutral-400 outline-none font-normal cursor-pointer"
            aria-label="Search learning content"
          />
          <div className="flex items-center shrink-0 ml-3">
            <kbd className="inline-flex items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-medium text-neutral-500 font-mono shadow-2xs select-none">
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

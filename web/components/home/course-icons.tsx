import React from "react";

export function DockerIcon({ className = "w-14 h-14" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-start ${className}`} aria-label="Docker logo">
      <svg
        viewBox="0 0 72 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-contain"
      >
        {/* Containers row 1 */}
        <rect x="23" y="10" width="5.5" height="5.5" fill="#1D63ED" rx="0.75" />
        <rect x="30" y="10" width="5.5" height="5.5" fill="#2496ED" rx="0.75" />
        <rect x="37" y="10" width="5.5" height="5.5" fill="#2496ED" rx="0.75" />

        {/* Containers row 2 */}
        <rect x="16" y="17" width="5.5" height="5.5" fill="#2496ED" rx="0.75" />
        <rect x="23" y="17" width="5.5" height="5.5" fill="#2496ED" rx="0.75" />
        <rect x="30" y="17" width="5.5" height="5.5" fill="#1D63ED" rx="0.75" />
        <rect x="37" y="17" width="5.5" height="5.5" fill="#2496ED" rx="0.75" />
        <rect x="44" y="17" width="5.5" height="5.5" fill="#2496ED" rx="0.75" />

        {/* Whale body */}
        <path
          d="M58 28C54.5 24.5 49 24.5 46.5 24.5H9C5.5 24.5 3.5 27 3.5 30.5C3.5 38 11.5 45 24 45C41 45 53.5 39 58 28Z"
          fill="#2496ED"
        />
        {/* Eye */}
        <circle cx="13" cy="32" r="1.5" fill="#0B3C68" />
        {/* Whale tail */}
        <path
          d="M57.5 28C62 25.5 64.5 20.5 63 18C59 20.5 57.5 24.5 57.5 28Z"
          fill="#2496ED"
        />
        <path
          d="M63 18C65.5 15.5 68 15.5 69 14.5C68 17 66.5 19 64 20.5C65.5 22.5 66.5 24 68.5 25C66 25 63.5 22.5 63 20"
          fill="#2496ED"
        />
        {/* Water spout hint */}
        <path
          d="M26 6C26 3 28 2 30 2"
          stroke="#2496ED"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export function NextJsIcon({ className = "w-14 h-14" }: { className?: string }) {
  return (
    <div
      className={`rounded-[14px] bg-black flex items-center justify-center text-white shadow-xs ${className}`}
      aria-label="Next.js logo"
    >
      <svg width="28" height="28" viewBox="0 0 180 180" fill="none">
        <mask
          id="mask0_next"
          style={{ maskType: "alpha" }}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="180"
          height="180"
        >
          <circle cx="90" cy="90" r="90" fill="black" />
        </mask>
        <g mask="url(#mask0_next)">
          <path
            d="M149.508 157.52L69.142 54H54V125.97H66.1136V69.3836L139.999 164.845C143.333 162.614 146.509 160.165 149.508 157.52Z"
            fill="white"
          />
          <rect x="115" y="54" width="12" height="72" fill="white" />
        </g>
      </svg>
    </div>
  );
}

export function TypeScriptIcon({ className = "w-14 h-14" }: { className?: string }) {
  return (
    <div
      className={`rounded-[14px] bg-[#3178C6] flex items-center justify-center text-white shadow-xs ${className}`}
      aria-label="TypeScript logo"
    >
      <span className="font-bold text-2xl tracking-tighter select-none font-sans pl-0.5">
        TS
      </span>
    </div>
  );
}

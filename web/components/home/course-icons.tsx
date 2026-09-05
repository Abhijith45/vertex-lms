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

export function ReactIcon({ className = "w-14 h-14" }: { className?: string }) {
  return (
    <div
      className={`rounded-[14px] bg-[#23272F] flex items-center justify-center text-[#149ECA] shadow-xs ${className}`}
      aria-label="React logo"
    >
      <svg width="32" height="32" viewBox="-11.5 -10.23174 23 20.46348" fill="none">
        <circle cx="0" cy="0" r="2.05" fill="#149ECA" />
        <g stroke="#149ECA" strokeWidth="1" fill="none">
          <ellipse rx="11" ry="4.2" />
          <ellipse rx="11" ry="4.2" transform="rotate(60)" />
          <ellipse rx="11" ry="4.2" transform="rotate(120)" />
        </g>
      </svg>
    </div>
  );
}

export function PythonIcon({ className = "w-14 h-14" }: { className?: string }) {
  return (
    <div
      className={`rounded-[14px] bg-[#1E293B] flex items-center justify-center shadow-xs p-2.5 ${className}`}
      aria-label="Python logo"
    >
      <svg viewBox="0 0 110 110" fill="none" className="w-full h-full">
        <path
          d="M54.5 11C28 11 29.5 22.5 29.5 22.5L29.6 34.4H55V38H19.2C19.2 38 7 36.6 7 63.3C7 90 17.8 89 17.8 89H25V77.7C25 64.8 35.8 64.9 35.8 64.9H60.5C72 64.9 72.8 54.2 72.8 54.2V22.5C72.8 22.5 74.4 11 54.5 11ZM41.8 19.3C44.7 19.3 47 21.6 47 24.5C47 27.4 44.7 29.7 41.8 29.7C38.9 29.7 36.6 27.4 36.6 24.5C36.6 21.6 38.9 19.3 41.8 19.3Z"
          fill="#3776AB"
        />
        <path
          d="M55.5 99C82 99 80.5 87.5 80.5 87.5L80.4 75.6H55V72H90.8C90.8 72 103 73.4 103 46.7C103 20 92.2 21 92.2 21H85V32.3C85 45.2 74.2 45.1 74.2 45.1H49.5C38 45.1 37.2 55.8 37.2 55.8V87.5C37.2 87.5 35.6 99 55.5 99ZM68.2 90.7C65.3 90.7 63 88.4 63 85.5C63 82.6 65.3 80.3 68.2 80.3C71.1 80.3 73.4 82.6 73.4 85.5C73.4 88.4 71.1 90.7 68.2 90.7Z"
          fill="#FFD43B"
        />
      </svg>
    </div>
  );
}

export function PostgreSqlIcon({ className = "w-14 h-14" }: { className?: string }) {
  return (
    <div
      className={`rounded-[14px] bg-[#336791] flex items-center justify-center text-white shadow-xs ${className}`}
      aria-label="PostgreSQL logo"
    >
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5V19A9 3 0 0 0 21 19V5" />
        <path d="M3 12A9 3 0 0 0 21 12" />
      </svg>
    </div>
  );
}

export function AiLlmIcon({ className = "w-14 h-14" }: { className?: string }) {
  return (
    <div
      className={`rounded-[14px] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-xs ${className}`}
      aria-label="AI Engineering logo"
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        <path d="M5 3v4" />
        <path d="M19 17v4" />
        <path d="M3 5h4" />
        <path d="M17 19h4" />
      </svg>
    </div>
  );
}

export function SystemDesignIcon({ className = "w-14 h-14" }: { className?: string }) {
  return (
    <div
      className={`rounded-[14px] bg-[#0F172A] flex items-center justify-center text-emerald-400 shadow-xs ${className}`}
      aria-label="System Design logo"
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="7" height="7" x="14" y="3" rx="1" />
        <path d="M10 21V8a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H3" />
      </svg>
    </div>
  );
}

export function SecurityIcon({ className = "w-14 h-14" }: { className?: string }) {
  return (
    <div
      className={`rounded-[14px] bg-[#991B1B] flex items-center justify-center text-white shadow-xs ${className}`}
      aria-label="Security logo"
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    </div>
  );
}

export function CourseIcon({
  slug,
  title,
  className = "w-14 h-14",
}: {
  slug?: string;
  title?: string;
  className?: string;
}) {
  const s = (slug || "").toLowerCase();
  const t = (title || "").toLowerCase();

  if (s.includes("nextjs") || s.includes("next-js") || t.includes("next.js")) {
    return <NextJsIcon className={className} />;
  }
  if (s.includes("docker") || s.includes("kubernetes") || s.includes("devops") || t.includes("docker")) {
    return <DockerIcon className={className} />;
  }
  if (s.includes("typescript") || t.includes("typescript")) {
    return <TypeScriptIcon className={className} />;
  }
  if (s.includes("react") || t.includes("react")) {
    return <ReactIcon className={className} />;
  }
  if (s.includes("python") || t.includes("python") || s.includes("pandas")) {
    return <PythonIcon className={className} />;
  }
  if (s.includes("postgres") || s.includes("database") || t.includes("postgresql")) {
    return <PostgreSqlIcon className={className} />;
  }
  if (s.includes("ai") || s.includes("llm") || s.includes("rag") || t.includes("ai") || t.includes("llm")) {
    return <AiLlmIcon className={className} />;
  }
  if (s.includes("system-design") || t.includes("system design")) {
    return <SystemDesignIcon className={className} />;
  }
  if (s.includes("security") || t.includes("security")) {
    return <SecurityIcon className={className} />;
  }

  // Fallback icon
  return (
    <div
      className={`rounded-[14px] bg-neutral-900 flex items-center justify-center text-white font-bold text-xl font-display shadow-xs ${className}`}
    >
      {(title || "V").charAt(0)}
    </div>
  );
}

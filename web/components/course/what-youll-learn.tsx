import React from "react";

interface LearningOutcome {
  _key?: string;
  icon?: string;
  title: string;
  description: string;
}

interface WhatYoullLearnProps {
  outcomes?: LearningOutcome[];
}

/** Custom Terracotta Outline Icons matching vertex-course.png */
function LayersOutlineIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M18 4L4 11L18 18L32 11L18 4Z" />
      <path d="M4 18L18 25L32 18" />
      <path d="M4 25L18 32L32 25" />
    </svg>
  );
}

function DatabaseOutlineIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <ellipse cx="18" cy="9" rx="13" ry="5" />
      <path d="M5 9V18C5 20.76 10.82 23 18 23C25.18 23 31 20.76 31 18V9" />
      <path d="M5 18V27C5 29.76 10.82 32 18 32C25.18 32 31 29.76 31 27V18" />
    </svg>
  );
}

function GaugeOutlineIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M30.73 24A14 14 0 1 0 5.27 24" />
      <path d="M18 18L14 12" />
      <circle cx="18" cy="18" r="2" fill="currentColor" />
      <path d="M8.5 14L10 15" />
      <path d="M18 8V6" />
      <path d="M27.5 14L26 15" />
    </svg>
  );
}

function CloudOutlineIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M26.5 28H10A7 7 0 0 1 10 14C10.5 14 11 14.1 11.5 14.2A9.5 9.5 0 0 1 30 17.5C31.7 18.5 32.5 20.2 32.5 22A6 6 0 0 1 26.5 28Z" />
    </svg>
  );
}

function OutcomeIcon({ iconType, index }: { iconType?: string; index: number }) {
  const iconClass = "h-9 w-9 text-[#E05A36] shrink-0";

  switch (iconType?.toLowerCase()) {
    case "layers":
      return <LayersOutlineIcon className={iconClass} />;
    case "database":
    case "cylinder":
    case "workflow":
      return <DatabaseOutlineIcon className={iconClass} />;
    case "gauge":
    case "speedometer":
    case "performance":
      return <GaugeOutlineIcon className={iconClass} />;
    case "cloud":
    case "rocket":
    case "deployment":
      return <CloudOutlineIcon className={iconClass} />;
    default: {
      // Rotate between the 4 iconic design patterns if unspecified
      const icons = [
        <LayersOutlineIcon key="l" className={iconClass} />,
        <DatabaseOutlineIcon key="d" className={iconClass} />,
        <GaugeOutlineIcon key="g" className={iconClass} />,
        <CloudOutlineIcon key="c" className={iconClass} />,
      ];
      return icons[index % icons.length];
    }
  }
}

// Default outcomes fallback matching the Next.js production design spec
const defaultOutcomes: LearningOutcome[] = [
  {
    title: "App Router Foundations",
    description:
      "Master the App Router, layouts, loading states, and nested routing.",
    icon: "layers",
  },
  {
    title: "Data Fetching & Caching",
    description:
      "Fetch data efficiently and leverage caching for better performance.",
    icon: "database",
  },
  {
    title: "Performance Optimization",
    description:
      "Optimize rendering, assets, and bundle size for faster apps.",
    icon: "gauge",
  },
  {
    title: "Deployment & Scaling",
    description:
      "Deploy with confidence and scale your Next.js applications.",
    icon: "cloud",
  },
];

export function WhatYoullLearn({ outcomes }: WhatYoullLearnProps) {
  const list = outcomes && outcomes.length > 0 ? outcomes : defaultOutcomes;

  return (
    <section className="mb-14 rounded-2xl sm:rounded-3xl border border-neutral-200/80 bg-white/70 backdrop-blur-xs p-6 sm:p-8 lg:p-10 shadow-2xs">
      <h2 className="font-display text-2xl sm:text-[28px] font-bold text-neutral-900 tracking-tight mb-7">
        What you&apos;ll learn
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {list.map((outcome, idx) => (
          <div
            key={outcome._key || idx}
            className="rounded-xl border border-neutral-200/70 bg-white p-6 flex items-start gap-5 shadow-2xs hover:border-neutral-300 hover:shadow-xs transition-all duration-150"
          >
            <OutcomeIcon iconType={outcome.icon} index={idx} />
            <div>
              <h3 className="font-sans font-semibold text-neutral-900 text-base mb-1.5 leading-snug">
                {outcome.title}
              </h3>
              <p className="text-neutral-500 text-sm leading-relaxed">
                {outcome.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

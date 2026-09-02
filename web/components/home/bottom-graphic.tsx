import React from "react";

export function BottomGraphic() {
  const bars = [
    { height: "42%", opacity: 0.35 },
    { height: "62%", opacity: 0.45 },
    { height: "80%", opacity: 0.60 },
    { height: "96%", opacity: 0.75 },
    { height: "70%", opacity: 0.50 },
    { height: "48%", opacity: 0.38 },
    { height: "65%", opacity: 0.48 },
    { height: "86%", opacity: 0.68 },
    { height: "55%", opacity: 0.42 },
    { height: "45%", opacity: 0.36 },
    { height: "72%", opacity: 0.54 },
    { height: "90%", opacity: 0.70 },
    { height: "98%", opacity: 0.78 },
    { height: "82%", opacity: 0.62 },
    { height: "64%", opacity: 0.48 },
    { height: "50%", opacity: 0.38 },
  ];

  return (
    <div
      className="relative w-full h-48 sm:h-64 overflow-hidden pointer-events-none mt-12 select-none"
      aria-hidden="true"
    >
      {/* Bars container */}
      <div className="absolute inset-x-0 bottom-0 h-full flex items-end justify-between px-4 sm:px-8 gap-2">
        {bars.map((bar, idx) => (
          <div
            key={idx}
            className="flex-1 rounded-t-xs"
            style={{
              height: bar.height,
              background: `linear-gradient(to top, rgba(249, 115, 22, ${bar.opacity}) 0%, rgba(251, 146, 60, ${bar.opacity * 0.7}) 45%, rgba(254, 215, 170, 0.1) 85%, transparent 100%)`,
            }}
          />
        ))}
      </div>

      {/* Atmospheric ambient soft glow */}
      <div
        className="absolute inset-x-0 bottom-0 h-28 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(249, 115, 22, 0.35) 0%, rgba(251, 146, 60, 0.15) 50%, transparent 100%)",
          filter: "blur(24px)",
        }}
      />
    </div>
  );
}

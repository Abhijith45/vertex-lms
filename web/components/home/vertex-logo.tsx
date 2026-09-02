import React from "react";

export function VertexLogo({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Orange Vertex icon matching design system and home page */}
      <path
        d="M4 6L16 27L28 6H21.5L16 16.5L10.5 6H4Z"
        fill="#F97316"
      />
      <path
        d="M16 27L28 6H22L16 17.5L16 27Z"
        fill="#EA580C"
      />
    </svg>
  );
}

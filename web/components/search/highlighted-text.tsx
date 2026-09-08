import React from "react";

interface HighlightedTextProps {
  text?: string;
  query?: string;
  className?: string;
}

export function HighlightedText({ text, query, className = "" }: HighlightedTextProps) {
  if (!text) return null;
  if (!query || !query.trim()) {
    return <span className={className}>{text}</span>;
  }

  // Extract individual keywords/tokens (alphanumeric words >= 1 chars)
  const tokens = query
    .trim()
    .split(/\s+/)
    .map((t) => t.replace(/[^\w\s-]/g, "").trim())
    .filter((t) => t.length > 0);

  if (tokens.length === 0) {
    return <span className={className}>{text}</span>;
  }

  // Escape regex special characters
  const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regexPattern = new RegExp(`(${tokens.map(escapeRegExp).join("|")})`, "gi");

  const parts = text.split(regexPattern);

  return (
    <span className={className}>
      {parts.map((part, idx) => {
        const isMatch = tokens.some((t) => t.toLowerCase() === part.toLowerCase());
        return isMatch ? (
          <mark
            key={idx}
            className="bg-amber-100 text-neutral-900 font-semibold px-0.5 rounded-xs"
          >
            {part}
          </mark>
        ) : (
          <React.Fragment key={idx}>{part}</React.Fragment>
        );
      })}
    </span>
  );
}

/**
 * URL Utilities for Production Authentication & Safe Navigation
 * Adheres to OWASP / CWE-601 Open Redirect Prevention Standards.
 */

/**
 * Sanitizes and normalizes redirect targets to prevent Open Redirect vulnerabilities.
 * Guarantees that the returned path is a safe, relative application path starting with '/'
 * and never a protocol-relative URL (e.g. '//evil.com') or external scheme ('javascript:', 'data:').
 *
 * Also safely unpacks legacy hash-based fragments (e.g. '#/?redirect_url=...') if passed.
 */
export function sanitizeRedirectUrl(url?: string | null, fallback = "/"): string {
  if (!url || typeof url !== "string") return fallback;

  let target = url.trim();
  if (!target) return fallback;

  // 1. Decode URI components safely
  try {
    target = decodeURIComponent(target);
  } catch {
    // Malformed URI string
    return fallback;
  }

  // 2. Extract redirect_url from legacy hash query if present (e.g., #/?redirect_url=...)
  if (target.includes("#/?redirect_url=")) {
    const parts = target.split("#/?redirect_url=");
    if (parts[1]) {
      return sanitizeRedirectUrl(parts[1], fallback);
    }
  }

  // 3. Strip any trailing or intermediate hash fragment artifacts
  if (target.startsWith("#")) {
    return fallback;
  }

  // 4. If an absolute URL was provided, verify it belongs to same site or extract safe relative path
  if (target.startsWith("http://") || target.startsWith("https://")) {
    try {
      const parsed = new URL(target);
      const allowedHosts = new Set([
        "localhost",
        "127.0.0.1",
        ...(process.env.NEXT_PUBLIC_SITE_URL
          ? [new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname]
          : []),
      ]);

      if (typeof window !== "undefined") {
        allowedHosts.add(window.location.hostname);
      }

      // If host is external/unrecognized, reject immediately to prevent open redirect
      if (!allowedHosts.has(parsed.hostname)) {
        return fallback;
      }

      // Safe same-origin URL: extract pathname + search
      target = parsed.pathname + parsed.search;
    } catch {
      return fallback;
    }
  }

  // 5. Block protocol-relative URLs (e.g. "//evil.com") which browsers interpret as external schemes
  if (target.startsWith("//") || target.startsWith("/\\") || target.startsWith("\\")) {
    return fallback;
  }

  // 6. Block malicious pseudo-protocols like javascript: or data:
  const lower = target.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:")
  ) {
    return fallback;
  }

  // 7. Enforce that the path starts with a single '/'
  if (!target.startsWith("/")) {
    target = `/${target}`;
  }

  // 8. Prevent redirecting back to authentication pages to avoid redirection loops
  if (target.startsWith("/sign-in") || target.startsWith("/sign-up")) {
    return fallback;
  }

  return target;
}

/**
 * Builds a clean, production-standard authentication URL with a relative redirect path.
 * Example: buildAuthUrl("sign-in", "/courses") -> "/sign-in?redirect_url=%2Fcourses"
 */
export function buildAuthUrl(
  type: "sign-in" | "sign-up",
  currentPath?: string | null
): string {
  const safePath = sanitizeRedirectUrl(currentPath, "/");

  // If redirect is root '/', omit parameter for cleaner, shorter URLs
  if (safePath === "/") {
    return `/${type}`;
  }

  return `/${type}?redirect_url=${encodeURIComponent(safePath)}`;
}

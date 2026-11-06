import { describe, it } from "node:test";
import assert from "node:assert";
import { sanitizeRedirectUrl, buildAuthUrl } from "../lib/utils/url.ts";

describe("URL Redirect Management & Open Redirect Security", () => {
  describe("sanitizeRedirectUrl", () => {
    it("returns relative path for standard paths", () => {
      assert.strictEqual(sanitizeRedirectUrl("/courses"), "/courses");
      assert.strictEqual(
        sanitizeRedirectUrl("/lessons/nextjs-in-depth?t=45"),
        "/lessons/nextjs-in-depth?t=45"
      );
    });

    it("unpacks legacy Clerk hash fragment URLs (#/?redirect_url=...)", () => {
      const legacyUrl =
        "http://localhost:3000/sign-in#/?redirect_url=http%3A%2F%2Flocalhost%3A3000%2Fcourses";
      assert.strictEqual(sanitizeRedirectUrl(legacyUrl), "/courses");
    });

    it("normalizes same-origin absolute localhost URLs into relative paths", () => {
      assert.strictEqual(
        sanitizeRedirectUrl("http://localhost:3000/my-learning"),
        "/my-learning"
      );
      assert.strictEqual(
        sanitizeRedirectUrl("http://localhost:3000/courses?filter=popular"),
        "/courses?filter=popular"
      );
    });

    it("blocks Open Redirect attacks to external domains", () => {
      // Protocol-relative attempt (//evil.com)
      assert.strictEqual(sanitizeRedirectUrl("//evil.com"), "/");
      assert.strictEqual(sanitizeRedirectUrl("//evil.com/phishing"), "/");

      // Backslash evasion attempt
      assert.strictEqual(sanitizeRedirectUrl("\\evil.com"), "/");
      assert.strictEqual(sanitizeRedirectUrl("/\\evil.com"), "/");

      // External HTTP/HTTPS domains
      assert.strictEqual(sanitizeRedirectUrl("https://attacker.com"), "/");
      assert.strictEqual(sanitizeRedirectUrl("http://malicious-site.org/hack"), "/");

      // Pseudo-protocols
      assert.strictEqual(sanitizeRedirectUrl("javascript:alert(1)"), "/");
      assert.strictEqual(sanitizeRedirectUrl("data:text/html,bad"), "/");
    });

    it("prevents redirect loops back to auth pages", () => {
      assert.strictEqual(sanitizeRedirectUrl("/sign-in"), "/");
      assert.strictEqual(sanitizeRedirectUrl("/sign-up"), "/");
      assert.strictEqual(sanitizeRedirectUrl("/sign-in?redirect_url=/courses"), "/");
    });

    it("falls back to custom fallback if provided", () => {
      assert.strictEqual(sanitizeRedirectUrl("", "/my-learning"), "/my-learning");
      assert.strictEqual(sanitizeRedirectUrl(null, "/courses"), "/courses");
      assert.strictEqual(sanitizeRedirectUrl("https://evil.com", "/courses"), "/courses");
    });
  });

  describe("buildAuthUrl", () => {
    it("builds clean query parameter for non-root paths", () => {
      assert.strictEqual(
        buildAuthUrl("sign-in", "/courses"),
        "/sign-in?redirect_url=%2Fcourses"
      );
      assert.strictEqual(
        buildAuthUrl("sign-up", "/lessons/react-hooks"),
        "/sign-up?redirect_url=%2Flessons%2Freact-hooks"
      );
    });

    it("omits parameter when redirect path is root '/'", () => {
      assert.strictEqual(buildAuthUrl("sign-in", "/"), "/sign-in");
      assert.strictEqual(buildAuthUrl("sign-up", null), "/sign-up");
      assert.strictEqual(buildAuthUrl("sign-in", ""), "/sign-in");
    });

    it("sanitizes untrusted current paths before building auth URL", () => {
      assert.strictEqual(buildAuthUrl("sign-in", "//evil.com"), "/sign-in");
      assert.strictEqual(buildAuthUrl("sign-in", "https://attacker.com"), "/sign-in");
    });
  });
});

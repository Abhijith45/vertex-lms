import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Compliance & Legal Pages Architecture Tests", () => {
  const DEVELOPER_NAME = "Abhijeet Rawat";
  const CONTACT_EMAIL = "abhijeetrawat45@gmail.com";

  const COMPLIANCE_ROUTES = [
    // High Priority
    { canonical: "/privacy-policy", alias: "/privacy", title: "Privacy Policy" },
    { canonical: "/terms-of-service", alias: "/terms", title: "Terms of Service" },
    { canonical: "/cookie-policy", alias: "/cookies", title: "Cookie Policy" },
    // Medium Priority
    { canonical: "/accessibility-statement", alias: "/accessibility", title: "Accessibility Statement" },
    { canonical: "/dmca", alias: "/dmca-policy", title: "DMCA & Copyright Policy" },
    { canonical: "/video-embedding-policy", alias: "/video-policy", title: "Video-Embedding Policy" },
  ];

  test("Contact info and developer attribution are consistent", () => {
    assert.equal(DEVELOPER_NAME, "Abhijeet Rawat");
    assert.equal(CONTACT_EMAIL, "abhijeetrawat45@gmail.com");
    assert.match(CONTACT_EMAIL, /^[^@\s]+@[^@\s]+\.[^@\s]+$/);
  });

  test("Canonical routes and aliases are correctly paired", () => {
    for (const route of COMPLIANCE_ROUTES) {
      assert.ok(route.canonical.startsWith("/"));
      assert.ok(route.alias.startsWith("/"));
      assert.ok(route.canonical !== route.alias);
    }
  });

  test("Cookie categories and local storage items are properly specified", () => {
    const cookieCategories = {
      essential: ["__session", "__client_uat"],
      preferences: ["vertex-theme"],
      analytics: ["ph_*"],
      thirdParty: ["YouTube iframe player cookies"],
    };

    assert.ok(cookieCategories.essential.includes("__session"));
    assert.ok(cookieCategories.preferences.includes("vertex-theme"));
    assert.ok(cookieCategories.analytics.includes("ph_*"));
  });

  test("DMCA takedown notice section anchor matches Terms of Service target", () => {
    const dmcaAnchor = "dmca-takedown";
    const termsFooterLink = `/terms-of-service#${dmcaAnchor}`;
    assert.equal(termsFooterLink, "/terms-of-service#dmca-takedown");
  });

  test("Medium priority compliance routes are all registered", () => {
    const canonicals = COMPLIANCE_ROUTES.map((r) => r.canonical);
    assert.ok(canonicals.includes("/accessibility-statement"));
    assert.ok(canonicals.includes("/dmca"));
    assert.ok(canonicals.includes("/video-embedding-policy"));
  });
});

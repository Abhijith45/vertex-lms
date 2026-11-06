import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vertex.example.com";
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    // Main App Surfaces
    {
      url: `${baseUrl}`,
      lastModified,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/courses`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/search`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/my-learning`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    },

    // High Priority Compliance
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/cookie-policy`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },

    // Medium Priority Compliance
    {
      url: `${baseUrl}/accessibility-statement`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/dmca`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/video-embedding-policy`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.4,
    },

    // Low & Optional Priority Compliance
    {
      url: `${baseUrl}/security-notice`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/user-rights-portal`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/data-processing-agreement`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  return staticRoutes;
}

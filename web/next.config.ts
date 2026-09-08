import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/array/:path*",
        destination: "https://us-assets.i.posthog.com/array/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/privacy",
        destination: "/privacy-policy",
        permanent: true,
      },
      {
        source: "/terms",
        destination: "/terms-of-service",
        permanent: true,
      },
      {
        source: "/cookies",
        destination: "/cookie-policy",
        permanent: true,
      },
      {
        source: "/accessibility",
        destination: "/accessibility-statement",
        permanent: true,
      },
      {
        source: "/dmca-policy",
        destination: "/dmca",
        permanent: true,
      },
      {
        source: "/video-policy",
        destination: "/video-embedding-policy",
        permanent: true,
      },
      {
        source: "/terms-of-use-for-embed-videos",
        destination: "/video-embedding-policy",
        permanent: true,
      },
      {
        source: "/security",
        destination: "/security-notice",
        permanent: true,
      },
      {
        source: "/user-rights",
        destination: "/user-rights-portal",
        permanent: true,
      },
      {
        source: "/dpa",
        destination: "/data-processing-agreement",
        permanent: true,
      },
    ];
  },
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
    ],
  },
};

export default nextConfig;

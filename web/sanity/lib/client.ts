import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../env'

// Public client (if needed, but mostly we use the private server client)
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // private dataset, avoid CDN cache issues for authenticated reads
})

// Server-only client with token for private dataset
export const serverClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN?.trim() || undefined,
  perspective: 'published',
})

/**
 * Cached fetch helper for Sanity data using Next.js ISR (Incremental Static Regeneration).
 * Configured with default 5-minute (300s) revalidation and tag-based cache invalidation.
 * Gracefully falls back to unauthenticated public client if token is expired or unauthorized (401).
 */
export async function sanityFetch<T = unknown>({
  query,
  params = {},
  revalidate = 300,
  tags = [],
}: {
  query: string;
  params?: Record<string, unknown>;
  revalidate?: number | false;
  tags?: string[];
}): Promise<T> {
  try {
    return await serverClient.fetch(query, params, {
      next: {
        revalidate,
        tags,
      },
    });
  } catch (err: unknown) {
    const error = err as { statusCode?: number; message?: string };
    // If the token is invalid, expired, or project-mismatched, attempt unauthenticated read for public content
    if (
      error?.statusCode === 401 ||
      error?.statusCode === 404 ||
      error?.message?.includes("401") ||
      error?.message?.includes("Session not found") ||
      error?.message?.includes("project user not found") ||
      error?.message?.includes("Unauthorized")
    ) {
      try {
        return await client.fetch(query, params, {
          next: {
            revalidate,
            tags,
          },
        });
      } catch (fallbackErr) {
        console.warn("Public dataset fetch returned no content:", fallbackErr);
        return [] as unknown as T;
      }
    }
    throw err;
  }
}

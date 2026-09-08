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
  token: process.env.SANITY_API_READ_TOKEN,
  perspective: 'published',
})

/**
 * Cached fetch helper for Sanity data using Next.js ISR (Incremental Static Regeneration).
 * Configured with default 5-minute (300s) revalidation and tag-based cache invalidation.
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
  return serverClient.fetch(query, params, {
    next: {
      revalidate,
      tags,
    },
  });
}

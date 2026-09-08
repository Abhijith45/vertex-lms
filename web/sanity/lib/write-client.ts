import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../env'

// Server-only client with WRITE token for private dataset mutations
export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Must be false for writes
  token: process.env.SANITY_API_WRITE_TOKEN,
  perspective: 'published',
})

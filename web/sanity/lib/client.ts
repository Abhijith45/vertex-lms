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

import { createClient } from '@sanity/client';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'lb09hkdy';
const dataset = process.env.SANITY_STUDIO_DATASET || 'production';
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!token) {
  console.error('Missing SANITY_API_WRITE_TOKEN in environment variables.');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  useCdn: false,
  apiVersion: '2024-01-01',
  token,
});

interface EnrichedVideo {
  videoId: string;
  url: string;
  chapters: { _key: string; startSeconds: number; label: string }[];
  chunks: { _key: string; startSeconds: number; text: string }[];
}

const VIDEO_DATA: Record<string, { chapters: { startSeconds: number; label: string }[]; chunks: { startSeconds: number; text: string }[] }> = {
  // Next.js File-system routing
  '9602Yzvd7ik': {
    chapters: [
      { startSeconds: 0, label: 'Introduction to Next.js App Router' },
      { startSeconds: 65, label: 'Special File Conventions: page, layout, template' },
      { startSeconds: 150, label: 'Nested Folders and Routing Hierarchy' },
      { startSeconds: 240, label: 'Route Groups and Private Folders' },
    ],
    chunks: [
      { startSeconds: 10, text: 'Welcome to this lesson on Next.js file-system routing conventions in the App Router.' },
      { startSeconds: 85, text: 'In Next.js, every folder inside the app directory defines a route segment mapping to a URL path.' },
      { startSeconds: 180, text: 'Layouts preserve state across route transitions, whereas templates mount fresh DOM nodes each time.' },
      { startSeconds: 290, text: 'Route groups wrapped in parentheses allow organizing routes without altering the URL pathname.' },
    ],
  },

  // Caching and Revalidation
  'VBlSe8tvg4U': {
    chapters: [
      { startSeconds: 0, label: 'Mental Model: Four Caching Layers in Next.js' },
      { startSeconds: 120, label: 'Request Memoization in fetch()' },
      { startSeconds: 310, label: 'Data Cache and Tag-Based Revalidation' },
      { startSeconds: 520, label: 'Full Route Cache on the Server' },
      { startSeconds: 780, label: 'Router Cache on the Client' },
    ],
    chunks: [
      { startSeconds: 20, text: 'Next.js features an integrated multi-tier caching architecture to maximize performance.' },
      { startSeconds: 160, text: 'Request memoization automatically deduplicates identical GET requests within a single render pass.' },
      { startSeconds: 360, text: 'Using revalidateTag and revalidatePath allows on-demand cache invalidation when content changes.' },
      { startSeconds: 600, text: 'The Full Route Cache stores the rendered HTML and React Server Component payload at build time.' },
    ],
  },

  // Server Actions Basics
  'O94ESaJtHtM': {
    chapters: [
      { startSeconds: 0, label: 'What are React Server Actions?' },
      { startSeconds: 95, label: 'Form Submissions with "use server"' },
      { startSeconds: 210, label: 'Server-Side Validation with Zod' },
      { startSeconds: 340, label: 'Optimistic UI and useActionState' },
    ],
    chunks: [
      { startSeconds: 15, text: 'Server Actions are asynchronous functions that execute directly on the server without manual API routes.' },
      { startSeconds: 120, text: 'You can pass a Server Action directly to form action attributes for progressive enhancement.' },
      { startSeconds: 250, text: 'Always validate incoming FormData on the server with Zod schemas to ensure type-safe boundaries.' },
      { startSeconds: 380, text: 'Pairing server actions with useOptimistic gives immediate client feedback before network resolution.' },
    ],
  },

  // React Server Components
  'rGPpQdbDbwo': {
    chapters: [
      { startSeconds: 0, label: 'Client vs Server Components Overview' },
      { startSeconds: 140, label: 'Zero Bundle Size Impact of Server Components' },
      { startSeconds: 320, label: 'Direct Database and File System Access' },
      { startSeconds: 510, label: 'The "use client" Directive Boundary' },
    ],
    chunks: [
      { startSeconds: 25, text: 'React Server Components fundamentally alter how we think about code delivery to web browsers.' },
      { startSeconds: 180, text: 'Server components never ship their JavaScript dependencies to the client bundle, saving kilobytes.' },
      { startSeconds: 360, text: 'You can query your database or headless CMS directly inside async React components without extra endpoints.' },
      { startSeconds: 580, text: 'Mark client interactivity with use client at the leaves of your component tree.' },
    ],
  },

  // Dynamic Routes
  'j3QJ1Rhxxbw': {
    chapters: [
      { startSeconds: 0, label: 'Dynamic Route Segments [slug]' },
      { startSeconds: 110, label: 'generateStaticParams for Static Export' },
      { startSeconds: 240, label: 'Catch-all and Optional Catch-all Routes' },
    ],
    chunks: [
      { startSeconds: 30, text: 'Square brackets in folder names define dynamic segments, accessible via params in your page component.' },
      { startSeconds: 150, text: 'generateStaticParams instructs Next.js which paths to pre-render statically at build time.' },
      { startSeconds: 280, text: 'Double square brackets define optional catch-all route segments matching zero or more URL subpaths.' },
    ],
  },

  // React Memo & Performance
  'Yh2eH4fXgbU': {
    chapters: [
      { startSeconds: 0, label: 'When React.memo Prevents Re-renders' },
      { startSeconds: 130, label: 'Measuring Render Cost with DevTools Profiler' },
      { startSeconds: 260, label: 'Common Pitfalls with Object and Function Props' },
    ],
    chunks: [
      { startSeconds: 10, text: 'React.memo is a higher order component that skips rendering when incoming props are shallowly equal.' },
      { startSeconds: 160, text: 'Only wrap components in React.memo when profiling proves that re-rendering is computationally heavy.' },
      { startSeconds: 300, text: 'Passing inline callbacks or new object literals breaks memoization on every single parent render.' },
    ],
  },

  // Caching Layers and Invalidation (System Design)
  'wh98s0XhMmQ': {
    chapters: [
      { startSeconds: 0, label: 'Cache Aside vs Read-Through Strategies' },
      { startSeconds: 145, label: 'Cache Invalidation and TTL Policies' },
      { startSeconds: 290, label: 'Redis and Memcached Architectural Trade-offs' },
      { startSeconds: 430, label: 'Thundering Herd and Cache Stampede Mitigation' },
    ],
    chunks: [
      { startSeconds: 20, text: 'Caching is the single most effective tool in system design to reduce database latency.' },
      { startSeconds: 180, text: 'In cache-aside, the application code queries the cache first, falling back to the database on miss.' },
      { startSeconds: 320, text: 'Redis provides persistent in-memory data structures, while Memcached excels at simple multithreaded key-value storage.' },
      { startSeconds: 460, text: 'Use distributed locks or probabilistic early recomputation to stop cache stampedes during traffic spikes.' },
    ],
  },

  // Rate Limiting (System Design)
  'YXkOdWBwqaA': {
    chapters: [
      { startSeconds: 0, label: 'Rate Limiting Algorithms Overview' },
      { startSeconds: 85, label: 'Token Bucket vs Leaky Bucket' },
      { startSeconds: 190, label: 'Sliding Window Counter with Redis' },
      { startSeconds: 310, label: 'Handling 429 Too Many Requests and Retry-After' },
    ],
    chunks: [
      { startSeconds: 15, text: 'Rate limiting protects your distributed services from Denial of Service attacks and abusive clients.' },
      { startSeconds: 110, text: 'The token bucket algorithm allows short bursty traffic while enforcing a steady long-term rate.' },
      { startSeconds: 220, text: 'Sliding window log counters prevent boundary exploits where requests double around the window cutoff.' },
      { startSeconds: 340, text: 'Return HTTP 429 status codes with a Retry-After header so well-behaved clients know when to retry.' },
    ],
  },

  // TypeScript Conditional Types
  'KcDzkOJpCaI': {
    chapters: [
      { startSeconds: 0, label: 'T extends U ? X : Y Syntax' },
      { startSeconds: 90, label: 'The infer Keyword in ReturnType and Parameters' },
      { startSeconds: 200, label: 'Distributive Conditional Types over Unions' },
    ],
    chunks: [
      { startSeconds: 12, text: 'Conditional types allow type-level branching logic based on type relationships.' },
      { startSeconds: 115, text: 'The infer keyword allows declaring a type variable within the true branch of a conditional type.' },
      { startSeconds: 230, text: 'When naked type parameters encounter unions, conditional types distribute automatically across each member.' },
    ],
  },

  // RAG Chunking Strategies
  'pIGRwMjhMaQ': {
    chapters: [
      { startSeconds: 0, label: 'Why Chunk Size and Overlap Matter in RAG' },
      { startSeconds: 110, label: 'Fixed Character vs Recursive Token Splitting' },
      { startSeconds: 240, label: 'Semantic and Markdown Hierarchy Chunking' },
    ],
    chunks: [
      { startSeconds: 18, text: 'Chunking determines how much context is retrieved and whether semantic boundaries are preserved.' },
      { startSeconds: 140, text: 'Recursive chunking splits text on paragraphs first, then sentences, and finally words to avoid slicing thoughts.' },
      { startSeconds: 270, text: 'Chunk overlap ensures that key phrases spanning chunk boundaries are not lost during vector similarity search.' },
    ],
  },
};

async function enrichVideos() {
  console.log(`Starting video enrichment for project: ${projectId}, dataset: ${dataset}`);

  // Fetch all existing video documents
  const existingVideos: any[] = await client.fetch('*[_type == "video"]{ _id, videoId, url }');
  console.log(`Found ${existingVideos.length} video documents in Sanity.`);

  let updatedCount = 0;

  for (const v of existingVideos) {
    const rawId = v.videoId;
    const match = VIDEO_DATA[rawId];
    if (match) {
      const chaptersWithKeys = match.chapters.map((ch, idx) => ({
        _key: `ch-${idx}`,
        startSeconds: ch.startSeconds,
        label: ch.label,
      }));

      const chunksWithKeys = match.chunks.map((ck, idx) => ({
        _key: `ck-${idx}`,
        startSeconds: ck.startSeconds,
        text: ck.text,
      }));

      console.log(`Updating video [${rawId}] with ${chaptersWithKeys.length} chapters and ${chunksWithKeys.length} chunks...`);
      await client
        .patch(v._id)
        .set({
          chapters: chaptersWithKeys,
          chunks: chunksWithKeys,
        })
        .commit();

      updatedCount++;
    }
  }

  // Also check if any VIDEO_DATA keys don't exist as video documents yet and create them
  for (const [vidId, data] of Object.entries(VIDEO_DATA)) {
    const exists = existingVideos.some((ev) => ev.videoId === vidId);
    if (!exists) {
      const docId = `video-${vidId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
      console.log(`Creating new video document [${docId}] for video ID ${vidId}...`);
      await client.createOrReplace({
        _type: 'video',
        _id: docId,
        videoId: vidId,
        url: `https://www.youtube.com/watch?v=${vidId}`,
        chapters: data.chapters.map((ch, idx) => ({
          _key: `ch-${idx}`,
          startSeconds: ch.startSeconds,
          label: ch.label,
        })),
        chunks: data.chunks.map((ck, idx) => ({
          _key: `ck-${idx}`,
          startSeconds: ck.startSeconds,
          text: ck.text,
        })),
      });
      updatedCount++;
    }
  }

  console.log(`Enrichment complete! Updated or created ${updatedCount} video documents.`);
}

enrichVideos().catch((err) => {
  console.error('Enrichment error:', err);
  process.exit(1);
});

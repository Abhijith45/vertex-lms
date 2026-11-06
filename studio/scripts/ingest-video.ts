import { createClient } from '@sanity/client';
import { YoutubeTranscript } from 'youtube-transcript';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

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

// Parse args
const args = process.argv.slice(2);
let url = '';
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--url' || args[i] === '-u') {
    url = args[i + 1];
    break;
  } else if (args[i].startsWith('--url=')) {
    url = args[i].substring(6);
    break;
  }
}

// Remove surrounding quotes if present (common in powershell)
url = url.replace(/^['"]|['"]$/g, '');

if (!url) {
  console.error('Usage: npm run ingest -- --url="<youtube-url>"');
  process.exit(1);
}

function extractYouTubeId(urlStr: string): string | null {
  try {
    const urlObj = new URL(urlStr);
    if (urlObj.hostname.includes('youtube.com')) {
      return urlObj.searchParams.get('v');
    } else if (urlObj.hostname.includes('youtu.be')) {
      return urlObj.pathname.slice(1);
    }
  } catch (e) {
    // fallback to regex if invalid URL constructor
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = urlStr.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }
  return null;
}

const videoId = extractYouTubeId(url);
if (!videoId) {
  console.error('Could not extract YouTube video ID from URL.');
  process.exit(1);
}

async function run() {
  console.log(`Fetching transcript for YouTube video: ${videoId}`);
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    
    // Group into roughly 30s chunks
    const CHUNK_DURATION = 30; // seconds
    const chunks: { _key: string; startSeconds: number; text: string }[] = [];
    
    let currentChunkText = '';
    let currentChunkStart = 0;
    let chunkCount = 0;

    for (const item of transcript) {
      // item.offset is in ms, item.duration is in ms
      const offsetSec = item.offset / 1000;
      
      if (currentChunkText === '') {
        currentChunkStart = offsetSec;
      }

      currentChunkText += (currentChunkText ? ' ' : '') + item.text;

      // If we crossed the threshold, finalize the chunk
      if (offsetSec - currentChunkStart >= CHUNK_DURATION) {
        chunks.push({
          _key: `chunk-${chunkCount++}`,
          startSeconds: Math.floor(currentChunkStart),
          text: currentChunkText.replace(/&amp;/g, '&').replace(/&#39;/g, "'")
        });
        currentChunkText = '';
      }
    }
    
    // Push the last chunk if any
    if (currentChunkText) {
      chunks.push({
        _key: `chunk-${chunkCount++}`,
        startSeconds: Math.floor(currentChunkStart),
        text: currentChunkText.replace(/&amp;/g, '&').replace(/&#39;/g, "'")
      });
    }

    console.log(`Generated ${chunks.length} transcript chunks.`);

    // We will leave chapters empty for now as youtube-transcript doesn't fetch them
    const chapters: any[] = [];
    
    const doc = {
      _type: 'video',
      _id: `video-${videoId}`,
      videoId,
      url,
      chapters,
      chunks,
    };

    console.log(`Writing video document to Sanity...`);
    const result = await client.createOrReplace(doc);
    console.log(`Successfully ingested video: ${result._id}`);
  } catch (error) {
    console.error('Error during ingestion:', error);
    process.exit(1);
  }
}

run();

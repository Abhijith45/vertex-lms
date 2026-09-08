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

const CONTEXT_DOC = {
  _type: 'sanity.agentContext',
  _id: 'search-agent-context',
  slug: {
    _type: 'slug',
    current: 'search-context',
  },
  groqFilter: '!(_id in path("drafts.**")) && _type in ["course", "lesson", "instructor", "category", "video"]',
  instructions: `- **Lesson to Course Reverse Reference**: A \`lesson\` does not store its parent course. To find the course for a lesson, use a reverse reference: \`*[_type == "course" && references(^._id)][0]\`.
- **Video Intelligence as Internal Lookup**: Video documents are internal lookups and must NEVER be returned as standalone results. Always join a video to its parent lesson by matching the video URL: \`*[_type == "lesson" && videoUrl == ^.url][0]\`.
- **Two-Stage Timestamp Resolution**: Match \`chapters[label match "*term*"]\` first. Only fall back to transcript \`chunks[text match "*term*"]\` if no chapter matches for that video. Chapter labels are clean, curated markers that take precedence over noisier speech chunks.
- **Context Window Protection**: Never query or return an entire \`chunks\` array. Always filter and slice: \`chapters[label match "*term*"][0...3]\` or \`chunks[text match "*term*"][0...3]\`.
- **Portable Text Search**: You cannot text match a Portable Text block array directly. Project it to plain text: \`pt::text(notes) match "*term*"\`.
- **Keyword Matching & Ranking**: Tokenize queries with wildcards (\`*term*\`) and use \`||\`. Rank exact concept and title matches higher than broad keyword mentions in body text.`,
};

async function run() {
  console.log(`Updating agentContext document in project ${projectId}, dataset ${dataset}...`);
  const res = await client.createOrReplace(CONTEXT_DOC);
  console.log(`Successfully updated context document: ${res._id}`);
  console.log(`Slug: ${res.slug?.current}`);
  console.log(`groqFilter: ${res.groqFilter}`);
}

run().catch((err) => {
  console.error('Failed to update agentContext:', err);
  process.exit(1);
});

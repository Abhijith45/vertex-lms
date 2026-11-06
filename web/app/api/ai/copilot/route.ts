import { NextResponse } from "next/server";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { serverClient } from "@/sanity/lib/client";
import { formatVideoTime } from "@/lib/utils/video";

export const maxDuration = 30;

interface RequestBody {
  lessonSlug: string;
  courseTitle?: string;
  lessonTitle?: string;
  currentTime: number;
  prompt: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
}

interface TranscriptChunk {
  startSeconds: number;
  text: string;
}

interface Chapter {
  startSeconds: number;
  label: string;
}

// Built-in fallback cues for Next.js curriculum
const CURRICULUM_FALLBACK_CUES: TranscriptChunk[] = [
  { startSeconds: 0, text: "Welcome to this deep dive into Next.js App Router and production server patterns." },
  { startSeconds: 25, text: "By default, every component inside the app directory is a React Server Component. Zero client bundle overhead." },
  { startSeconds: 60, text: "Next.js extends the native fetch API to include automatic request memoization across the component tree." },
  { startSeconds: 110, text: "You can control caching using time-based revalidation with next: { revalidate: 3600 } or on-demand cache tags using revalidateTag." },
  { startSeconds: 175, text: "Wrap slower database queries in React Suspense boundaries to stream partial UI instantly to the client." },
  { startSeconds: 240, text: "Accessing dynamic functions like cookies, headers, or unmemoized searchParams automatically opts into dynamic server rendering." },
  { startSeconds: 320, text: "Best practices: prefer Server Components for initial fetches, leverage tag-based cache purging on mutations, and use loading skeletons." },
];

export function sliceTemporalWindow(
  chunks: TranscriptChunk[],
  currentTime: number,
  lookbackSeconds = 90,
  lookaheadSeconds = 30
): TranscriptChunk[] {
  const windowStart = Math.max(0, currentTime - lookbackSeconds);
  const windowEnd = currentTime + lookaheadSeconds;

  const inWindow = chunks.filter(
    (c) => c.startSeconds >= windowStart && c.startSeconds <= windowEnd
  );

  if (inWindow.length > 0) return inWindow;

  // If no chunks strictly within window, pick the closest preceding chunk
  const preceding = chunks.filter((c) => c.startSeconds <= currentTime);
  if (preceding.length > 0) {
    return [preceding[preceding.length - 1]];
  }

  return chunks.slice(0, 3);
}

function generateHeuristicResponse(
  prompt: string,
  currentTime: number,
  lessonTitle: string,
  temporalChunks: TranscriptChunk[],
  keyPoints: string[] = []
): string {
  const timeFormatted = formatVideoTime(Math.floor(currentTime));
  const lowerPrompt = prompt.toLowerCase();

  // 1. Check if user is asking for a quiz / test understanding
  if (lowerPrompt.includes("quiz") || lowerPrompt.includes("test")) {
    return `### Knowledge Checkpoint: ${lessonTitle} at [${timeFormatted}]

Here is a quick question to test your understanding of what was just covered:

**Question:** In Next.js App Router, how does request memoization affect multiple identical \`fetch\` calls made inside the same render tree?
- **A)** Each component executes an independent HTTP request to the origin server.
- **B)** Next.js automatically deduplicates identical GET requests, executing only one network call and sharing the result across all components.
- **C)** Request memoization only applies to Client Components using \`useEffect\`.
- **D)** It caches the response in browser localStorage permanently.

*Hint:* At [${timeFormatted}], we discussed Server Component data caching. Try answering or click **Knowledge Checkpoint** to test your score!`;
  }

  // 2. Check if user asks for code example
  if (lowerPrompt.includes("example") || lowerPrompt.includes("code")) {
    return `### Production Example for [${timeFormatted}]

Here is how you implement the pattern discussed around [${timeFormatted}] in a Next.js Server Component:

\`\`\`tsx
// app/courses/page.tsx
export default async function CoursesPage() {
  // Automatically deduplicated and cached with a 1-hour TTL
  const res = await fetch('https://api.domain.com/courses', {
    next: { tags: ['courses'], revalidate: 3600 },
  });
  
  if (!res.ok) throw new Error('Failed to load catalog');
  const courses = await res.json();

  return (
    <main>
      <h1>Course Catalog</h1>
      {/* Renders server-side with zero client JavaScript */}
    </main>
  );
}
\`\`\`

**Key Takeaway:** Notice the \`next.tags\` parameter at [${timeFormatted}]. This allows instant on-demand cache invalidation via \`revalidateTag('courses')\` when content changes.`;
  }

  // 3. Check if user asks for summary / takeaway
  if (lowerPrompt.includes("summarize") || lowerPrompt.includes("takeaway") || lowerPrompt.includes("summary")) {
    const pointsList = keyPoints.length > 0 
      ? keyPoints.slice(0, 3).map((pt) => `- ${pt}`).join("\n")
      : "- Server Components eliminate client data-fetching waterfalls.\n- Automatic fetch memoization deduplicates identical queries.\n- Fine-grained cache invalidation prevents stale data.";

    return `### Summary at [${timeFormatted}]

Here are the key principles taught up to this moment:

${pointsList}

Rewind to [${timeFormatted}] to re-watch the code walkthrough!`;
  }

  // 4. Default contextual explanation based on temporal chunks
  const snippet = temporalChunks.length > 0 && temporalChunks[0]?.text
    ? `> "${temporalChunks[0].text}"`
    : `> Next.js data architecture and Server Component caching.`;

  return `### Explanation at [${timeFormatted}]

At this point in the lesson (**${lessonTitle}**), the instructor is explaining:

${snippet}

#### What this means in practice:
1. **Server-Side Execution**: Code in this section runs exclusively in Node.js before any HTML reaches the browser.
2. **Performance Benefit**: The client receives pre-rendered markup with zero fetch waterfalls.
3. **Cache Control**: At [${timeFormatted}], pay close attention to how caching tags are registered to allow instant invalidation.

Feel free to ask for a code sample or click any timestamp chip like [${timeFormatted}] to seek the video player!`;
}

export async function POST(req: Request) {
  try {
    const body: RequestBody = await req.json();
    const {
      lessonSlug,
      courseTitle = "Vertex Learning",
      lessonTitle = "Lesson",
      currentTime = 0,
      prompt,
      history = [],
    } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // 1. Fetch lesson & video context from Sanity
    interface LessonSanityResult {
      title?: string;
      keyPoints?: string[];
      proTip?: string;
      videoUrl?: string;
      video?: {
        chapters?: Array<{ startSeconds: number; label: string }>;
        chunks?: Array<{ startSeconds: number; text: string }>;
      };
    }
    let lessonData: LessonSanityResult | null = null;
    try {
      lessonData = await serverClient.fetch(
        `*[_type == "lesson" && slug.current == $slug][0] {
          title,
          keyPoints,
          proTip,
          videoUrl,
          "video": *[_type == "video" && (url == ^.videoUrl || videoId in ^.videoUrl)][0] {
            chapters[]{ startSeconds, label },
            chunks[]{ startSeconds, text }
          }
        }`,
        { slug: lessonSlug }
      );
    } catch (err) {
      console.warn("Could not fetch Sanity lesson details for copilot:", err);
    }

    const chunks: TranscriptChunk[] =
      lessonData?.video?.chunks && lessonData.video.chunks.length > 0
        ? lessonData.video.chunks
        : CURRICULUM_FALLBACK_CUES;

    const chapters: Chapter[] = lessonData?.video?.chapters || [];
    const keyPoints: string[] = lessonData?.keyPoints || [];

    // 2. Slice the 90-second localized temporal window
    const temporalChunks = sliceTemporalWindow(chunks, currentTime, 90, 30);
    const timeFormatted = formatVideoTime(Math.floor(currentTime));

    // 3. Check if OpenAI is available
    const hasOpenAI = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "mock-key");
    let finalAnswer = "";
    let isAI = false;

    if (hasOpenAI) {
      try {
        const temporalTranscriptText = temporalChunks
          .map((c) => `[${formatVideoTime(c.startSeconds)}] ${c.text}`)
          .join("\n");

        const chaptersText = chapters
          .map((ch) => `- [${formatVideoTime(ch.startSeconds)}] ${ch.label}`)
          .join("\n");

        const systemPrompt = `You are Vertex Copilot, an elite senior full-stack AI teaching assistant embedded in an interactive video learning platform.
You are helping a learner who is actively watching the video lesson: "${lessonTitle}" (part of "${courseTitle}").

## Current Video State
- The learner is currently paused or watching at timestamp: **${timeFormatted}** (${Math.floor(currentTime)} seconds).

## Localized Transcript Window (Last 90s to Next 30s):
${temporalTranscriptText}

## Lesson Chapters:
${chaptersText || "Standard Module Outline"}

## Key Lesson Points:
${keyPoints.length > 0 ? keyPoints.map((k) => `- ${k}`).join("\n") : "- Next.js architecture and production patterns"}

## Rules & Grounding Instructions:
1. Ground your answer strictly in what is being taught around the current timestamp (${timeFormatted}).
2. When referencing video moments, ALWAYS use bracketed format like \`[MM:SS]\` (e.g. \`[${timeFormatted}]\` or \`[01:45]\`). The frontend turns these brackets into interactive click-to-seek buttons.
3. Be concise, technically precise, and authoritative (Staff/Principal Engineer style).
4. Provide small, clean TypeScript/React code snippets when explaining coding patterns.
5. Do not invent non-existent lessons or courses. Keep focused on the current topic.`;

        const messages = [
          ...history.slice(-4).map((h) => ({
            role: h.role as "user" | "assistant",
            content: h.content,
          })),
          { role: "user" as const, content: prompt },
        ];

        const { text } = await generateText({
          model: openai("gpt-4o-mini"),
          system: systemPrompt,
          messages,
          abortSignal: AbortSignal.timeout(3000),
        });

        if (text && text.trim()) {
          finalAnswer = text;
          isAI = true;
        }
      } catch (err) {
        console.warn("OpenAI generateText call failed, falling back to heuristic generator:", err);
      }
    }

    // 4. Fallback Generator (Smooth simulated stream)
    if (!finalAnswer) {
      finalAnswer = generateHeuristicResponse(
        prompt,
        currentTime,
        lessonTitle,
        temporalChunks,
        keyPoints
      );
    }

    const encoder = new TextEncoder();
    const words = finalAnswer.split(" ");

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for (let i = 0; i < words.length; i++) {
            const chunk = (i === 0 ? "" : " ") + words[i];
            controller.enqueue(encoder.encode(chunk));
            await new Promise((resolve) => setTimeout(resolve, 15));
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Copilot-Mode": isAI ? "openai-stream" : "heuristic-stream",
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error in /api/ai/copilot:", err);
    return NextResponse.json(
      { error: "Failed to generate copilot response", details: err?.message || String(error) },
      { status: 500 }
    );
  }
}

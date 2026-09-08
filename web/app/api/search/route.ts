import { NextResponse } from "next/server";
import { generateText, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { createMCPClient } from "@ai-sdk/mcp";
import { z } from "zod";

import { auth } from "@clerk/nextjs/server";
import { getPostHogClient } from "@/lib/posthog-server";
import { checkRateLimit } from "@/lib/rate-limit";
import { SimpleMemoryCache } from "@/lib/cache";
import {
  normalizeSearchQuery,
  resolveVideoMomentsTwoStage,
  tokenizeSearchQuery,
  buildGroqOrMatch,
} from "@/lib/utils/search";

export const maxDuration = 60; // Allow enough time for multi-step MCP tool calls

interface LessonResult {
  title: string;
  slug: string;
  description: string;
  courseTitle: string;
  moduleLabel?: string;
  keyPoints?: string[];
}

interface VideoMomentResult {
  lessonTitle: string;
  lessonSlug: string;
  courseTitle: string;
  courseIcon?: string;
  description: string;
  startSeconds: number;
  thumbnailUrl?: string;
  clipLength?: string;
}

interface SearchResults {
  lessons: LessonResult[];
  videoMoments: VideoMomentResult[];
}

// In-memory search result cache: 100 entries, 15-minute TTL
const searchResultCache = new SimpleMemoryCache<SearchResults>({
  maxEntries: 100,
  defaultTtlMs: 15 * 60 * 1000,
});

function trackSearchServer(
  userId: string | null,
  query: string,
  results: SearchResults,
  isCached: boolean,
  source: string = "server_api"
) {
  try {
    const posthog = getPostHogClient();
    const totalResults = (results.lessons?.length || 0) + (results.videoMoments?.length || 0);
    posthog.capture({
      distinctId: userId || "anonymous",
      event: "search_performed",
      properties: {
        query,
        query_length: query.length,
        results_count: totalResults,
        lessons_count: results.lessons?.length || 0,
        video_moments_count: results.videoMoments?.length || 0,
        has_results: totalResults > 0,
        is_cached: isCached,
        is_cold_start: source === "cold_start_fallback",
        source,
      },
    });
  } catch (err) {
    console.error("PostHog server search tracking error:", err);
  }
}

// Cached initial context singleton (Section 12 of AGENTS.md)
let cachedInitialContext: unknown = null;
let initialContextPromise: Promise<unknown> | null = null;

// Initialize MCP Client
async function getMcpClient() {
  if (!process.env.SANITY_CONTEXT_MCP_URL || !process.env.SANITY_API_READ_TOKEN) {
    throw new Error("Missing Sanity MCP environment variables");
  }

  return createMCPClient({
    transport: {
      type: "http",
      url: process.env.SANITY_CONTEXT_MCP_URL,
      headers: {
        Authorization: `Bearer ${process.env.SANITY_API_READ_TOKEN}`,
      },
    },
  });
}

// Fetch Initial Context (Schema) with caching
async function getCachedInitialContext() {
  if (cachedInitialContext) return cachedInitialContext;
  if (!initialContextPromise) {
    initialContextPromise = (async () => {
      try {
        const res = await fetch(`${process.env.SANITY_CONTEXT_MCP_URL}/initial-context`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.SANITY_API_READ_TOKEN}`,
          },
        });
        const data = await res.json();
        cachedInitialContext = data;
        return data;
      } catch (err) {
        console.error("Error fetching initial context:", err);
        initialContextPromise = null;
        return null;
      }
    })();
  }
  return initialContextPromise;
}

export async function GET(req: Request) {
  // Apply search rate limit: 20 requests/minute per IP
  const rateLimit = checkRateLimit(req, 20, 60 * 1000, "search");
  if (!rateLimit.success && rateLimit.response) {
    return rateLimit.response;
  }

  const { searchParams } = new URL(req.url);
  const rawQuery = searchParams.get("q") || "";
  const query = normalizeSearchQuery(rawQuery);

  let userId: string | null = null;
  try {
    const authData = await auth();
    userId = authData?.userId || null;
  } catch {
    // Guest or unauthenticated request
  }

  if (!query) {
    return NextResponse.json({ lessons: [], videoMoments: [] });
  }

  // 1. Check in-memory search result cache
  const cacheKey = query.toLowerCase();
  const cachedData = searchResultCache.get(cacheKey);
  if (cachedData) {
    trackSearchServer(userId, query, cachedData, true, "cache");
    return NextResponse.json(cachedData, {
      headers: {
        "X-Cache": "HIT",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  }

  try {
    const [mcpClient, _initialContext] = await Promise.all([
      getMcpClient(),
      getCachedInitialContext(),
    ]);

    const allMcpTools = await mcpClient.tools();

    const systemPrompt = `
You are the search agent for Vertex, a production AI learning platform.
Your sole responsibility is to analyze learner search queries, retrieve matching content from the Sanity dataset using GROQ, and return structured result cards. You are not a conversational chatbot; communicate exclusively through structured tool calls.

## Role & Search Protocol
1. Query Analysis: Break the user query into core keywords, synonyms, and concepts.
2. GROQ Execution: Formulate precise GROQ queries using token wildcards (*term*) and OR (||) logic. Project Portable Text notes to plain text via \`pt::text(notes)\`.
3. Two-Way Search:
   - Match lessons on topic (title, \`pt::text(notes)\`, and keyPoints).
   - Match video moments using Two-Stage Timestamp Resolution:
     * Stage 1 (Chapters First): Search the chapters array for matching labels (\`chapters[label match "*term*"]\`). If any chapter matches for that video, use its startSeconds and label.
     * Stage 2 (Transcript Fallback): ONLY if NO chapters match for that video, search the transcript chunks (\`chunks[text match "*term*"]\`) and use the matched chunk's startSeconds and snippet.
4. Join & Grounding: Every video moment MUST be joined to its parent lesson referencing \`videoUrl\`. Never return a raw video document or ungrounded timestamps.
5. Final Action: Call the \`return_search_results\` tool with ranked lessons and video moments. Never return conversational markdown or explanatory prose.

## Boundaries
- Grounding: Report ONLY verified data returned by Sanity. Never extrapolate, hallucinate, or fabricate courses, lessons, timestamps, or clip lengths.
- Internal Video Documents: Video intelligence documents are an internal lookup only. Never return them directly as independent search results.
- Context Window Safety: Never query or fetch the entire transcript \`chunks\` array. Always filter and slice (\`[0...3]\`) to preserve context limits.
- Non-conversational: Do not engage in chit-chat, conversational prose, greetings, or markdown responses. Always invoke \`return_search_results\`.

## When No Results Are Found
- If no lessons or video moments match the query in the database, call \`return_search_results\` with empty arrays (\`{ lessons: [], videoMoments: [] }\`). Never invent fallback content.
`;

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(new Error("WAKING_UP")), 8000);

    const { toolCalls } = await generateText({
      abortSignal: abortController.signal,
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: `Analyze this user search query and find matching content in Sanity: "${query}"`,
      tools: {
        ...allMcpTools,
        return_search_results: tool({
          description: "Return the final structured search results to the UI. Call this tool when you have finished querying the CMS.",
          inputSchema: z.object({
            lessons: z.array(
              z.object({
                title: z.string(),
                slug: z.string(),
                description: z.string(),
                courseTitle: z.string(),
                moduleLabel: z.string().optional(),
                keyPoints: z.array(z.string()).optional(),
              })
            ),
            videoMoments: z.array(
              z.object({
                lessonTitle: z.string(),
                lessonSlug: z.string(),
                courseTitle: z.string(),
                courseIcon: z.string().optional(),
                description: z.string(),
                startSeconds: z.number(),
                thumbnailUrl: z.string().optional(),
                clipLength: z.string().optional(),
              })
            ),
          }),
          execute: async (input) => input as SearchResults,
        }),
      },
      stopWhen: (options) => {
        // Stop if max 8 steps or if return_search_results tool was called in latest step
        if (options.steps.length >= 8) return true;
        const lastStep = options.steps[options.steps.length - 1];
        if (lastStep?.toolCalls.some((tc) => tc.toolName === "return_search_results")) {
          return true;
        }
        return false;
      },
    });

    clearTimeout(timeoutId);

    const resultToolCall = toolCalls.find(
      (tc) => tc.toolName === "return_search_results"
    );

    let finalResults: SearchResults;
    if (resultToolCall) {
      const tc = resultToolCall as { input?: SearchResults; args?: SearchResults };
      const output = tc.input ?? tc.args;
      finalResults = {
        lessons: output?.lessons ?? [],
        videoMoments: output?.videoMoments ?? [],
      };
    } else {
      finalResults = { lessons: [], videoMoments: [] };
    }

    // If MCP returned results, cache and return
    if (finalResults.lessons.length > 0 || finalResults.videoMoments.length > 0) {
      searchResultCache.set(cacheKey, finalResults);
      trackSearchServer(userId, query, finalResults, false);
      return NextResponse.json(finalResults, {
        headers: {
          "X-Cache": "MISS",
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      });
    }

    // Otherwise fall through to Sanity GROQ search for maximum recall
    throw new Error("No MCP results returned, executing direct Sanity search");
  } catch (error: any) {
    const isColdStart =
      error?.message === "WAKING_UP" ||
      error?.name === "AbortError" ||
      error?.cause?.message === "WAKING_UP";

    if (!isColdStart) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.warn("Search LLM/MCP error or fallback triggered:", errMsg);
    }

    // Direct Sanity GROQ search fallback. This runs for the cold-start abort too,
    // because it queries Sanity directly and does not depend on the LLM/MCP backend
    // that is still warming up — so the user gets grounded results instead of a
    // skeleton that keeps polling.
    try {
      const { serverClient } = await import("@/sanity/lib/client");
      const cleanWords = tokenizeSearchQuery(query);

      let fallbackResults: SearchResults = { lessons: [], videoMoments: [] };

      if (cleanWords.length > 0) {
        // 1. Match Lessons: any word in title, notes, or key points.
        const lessonsQuery = `*[_type == "lesson" && (
          ${buildGroqOrMatch("title", cleanWords)} ||
          ${buildGroqOrMatch("pt::text(notes)", cleanWords)} ||
          count(keyPoints[${buildGroqOrMatch("@", cleanWords)}]) > 0
        )][0...15] {
          title,
          "slug": slug.current,
          "description": coalesce(pt::text(notes), title),
          "courseTitle": *[_type == "course" && references(^._id)][0].title,
          "moduleLabel": "Lesson Match",
          keyPoints
        }`;

        // 2. Match Video Moments: any word in chapter labels or transcript chunks.
        // The filter and the projection must use the same expression so the
        // "has a match" count agrees with the chapters/chunks actually returned.
        const labelMatch = buildGroqOrMatch("label", cleanWords);
        const textMatch = buildGroqOrMatch("text", cleanWords);
        const videosQuery = `*[_type == "video" && (
          count(chapters[${labelMatch}]) > 0 ||
          count(chunks[${textMatch}]) > 0
        )][0...15] {
          url,
          "matchedChapters": chapters[${labelMatch}][0...3],
          "matchedChunks": chunks[${textMatch}][0...3]
        }`;

        const [matchedLessons, matchedVideos] = await Promise.all([
          serverClient.fetch(lessonsQuery),
          serverClient.fetch(videosQuery),
        ]);

        const videoMoments: any[] = [];
        for (const v of matchedVideos) {
          // Resolve lesson using this video URL
          const lesson = await serverClient.fetch(
            `*[_type == "lesson" && videoUrl == "${v.url}"][0]{
              title,
              "slug": slug.current,
              "posterUrl": poster.asset->url,
              "courseTitle": *[_type == "course" && references(^._id)][0].title
            }`
          );

          if (!lesson || !lesson.slug || !lesson.courseTitle) continue;

          const moments = resolveVideoMomentsTwoStage(v.matchedChapters, v.matchedChunks, 3);
          for (const m of moments) {
            videoMoments.push({
              lessonTitle: lesson.title || "Lesson Video",
              lessonSlug: lesson.slug,
              courseTitle: lesson.courseTitle,
              description: m.description,
              startSeconds: m.startSeconds,
              thumbnailUrl: lesson.posterUrl,
              clipLength: m.clipLength,
            });
          }
        }

        fallbackResults = {
          lessons: (matchedLessons as LessonResult[]).filter((l) => l.courseTitle && l.slug),
          videoMoments,
        };
      }

      const hasResults =
        fallbackResults.lessons.length > 0 || fallbackResults.videoMoments.length > 0;

      // Never cache an empty result: a warm retry could return real matches.
      if (hasResults) {
        searchResultCache.set(cacheKey, fallbackResults);
      }
      trackSearchServer(
        userId,
        query,
        fallbackResults,
        false,
        isColdStart ? "cold_start_fallback" : "llm_fallback"
      );
      return NextResponse.json(fallbackResults, {
        headers: {
          "X-Cache": "MISS",
          "Cache-Control": hasResults
            ? "public, s-maxage=300, stale-while-revalidate=600"
            : "no-store",
        },
      });
    } catch (fallbackError: unknown) {
      const errMsg = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
      console.error("Direct search fallback error:", fallbackError);
      // On a cold start, keep the polling contract so the client retries once the
      // backend is warm; otherwise surface the failure.
      if (isColdStart) {
        return NextResponse.json(
          { status: "waking_up", message: "Content is loading..." },
          { status: 503 }
        );
      }
      return NextResponse.json({ error: errMsg }, { status: 500 });
    }
  }
}

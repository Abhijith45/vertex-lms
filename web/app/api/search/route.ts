import { NextResponse } from "next/server";
import { generateText, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { createMCPClient } from "@ai-sdk/mcp";
import { z } from "zod";

import { checkRateLimit } from "@/lib/rate-limit";
import { SimpleMemoryCache } from "@/lib/cache";
import { normalizeSearchQuery } from "@/lib/utils/search";

export const maxDuration = 60; // Allow enough time for multi-step MCP tool calls

// In-memory search result cache: 100 entries, 15-minute TTL
const searchResultCache = new SimpleMemoryCache<{ lessons: any[]; videoMoments: any[] }>({
  maxEntries: 100,
  defaultTtlMs: 15 * 60 * 1000,
});

// Cached initial context singleton (Section 12 of AGENTS.md)
let cachedInitialContext: any = null;
let initialContextPromise: Promise<any> | null = null;

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

  if (!query) {
    return NextResponse.json({ lessons: [], videoMoments: [] });
  }

  // 1. Check in-memory search result cache
  const cacheKey = query.toLowerCase();
  const cachedData = searchResultCache.get(cacheKey);
  if (cachedData) {
    return NextResponse.json(cachedData, {
      headers: {
        "X-Cache": "HIT",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  }

  try {
    const [mcpClient, initialContext] = await Promise.all([
      getMcpClient(),
      getCachedInitialContext(),
    ]);

    const allMcpTools = await mcpClient.tools();

    const systemPrompt = `
You are the intelligent search agent for the Vertex Learning platform.
Your job is to search the Sanity CMS database using the \`groq_query\` tool to find lessons and video moments that match the user's query.

IMPORTANT RULES:
1. First, call \`initial_context\` or \`schema_explorer\` to understand the schema if you need to.
2. Search is grounded. Say only what the data returns. Never invent a course, lesson, timestamp, or count.
3. For a query, search BOTH ways and merge: 
   - Match lessons on their topic (title and notes)
   - Match video moments (chapters first, then transcript fallback)
4. Text match is token based, so wildcard your keywords (e.g., \`*query*\`) and OR multiple words.
5. You cannot text match a Portable Text field directly. Use \`pt::text()\` to search inside Portable Text blocks.
6. To find a course for a lesson, use a reverse reference: \`*[_type == "course" && references(^._id)][0]\`.
7. A video document is NOT directly referenced by a lesson. A lesson links to it by URL: \`*[_type == "lesson" && videoUrl == ^.url][0]\`.

When you have gathered all relevant lesson matches and video moment matches via \`groq_query\`, you MUST call the \`return_search_results\` tool with the structured results. DO NOT return conversational text. Just call the tool.
`;

    const { toolCalls } = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: `Find content matching this search query: "${query}"`,
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
          execute: async (input: any) => input,
        }),
      },
      stopWhen: (options) => {
        // Stop if max 7 steps or if return_search_results tool was called in latest step
        if (options.steps.length >= 7) return true;
        const lastStep = options.steps[options.steps.length - 1];
        if (lastStep?.toolCalls.some((tc) => tc.toolName === "return_search_results")) {
          return true;
        }
        return false;
      },
    });

    const resultToolCall = toolCalls.find(
      (tc) => tc.toolName === "return_search_results"
    );

    let finalResults: { lessons: any[]; videoMoments: any[] };
    if (resultToolCall) {
      const output = (resultToolCall as any).input || (resultToolCall as any).args;
      finalResults = {
        lessons: output.lessons || [],
        videoMoments: output.videoMoments || [],
      };
    } else {
      finalResults = { lessons: [], videoMoments: [] };
    }

    searchResultCache.set(cacheKey, finalResults);
    return NextResponse.json(finalResults, {
      headers: {
        "X-Cache": "MISS",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error: any) {
    console.warn("Search LLM/MCP error, falling back to direct Sanity search:", error.message);
    
    // Direct Sanity GROQ Search Fallback
    try {
      const { serverClient } = await import("@/sanity/lib/client");
      const cleanWords = query.trim().split(/\s+/).filter(Boolean);
      const queryPattern = `*${cleanWords.join("*")}*`;

      // 1. Match Lessons
      const lessonsQuery = `*[_type == "lesson" && (
        title match "${queryPattern}" ||
        pt::text(notes) match "${queryPattern}" ||
        count(keyPoints[@ match "${queryPattern}"]) > 0
      )][0...10] {
        title,
        "slug": slug.current,
        "description": coalesce(pt::text(notes), title),
        "courseTitle": *[_type == "course" && references(^._id)][0].title,
        "moduleLabel": "Lesson Match",
        keyPoints
      }`;

      // 2. Match Video Moments (chapters and chunks)
      const videosQuery = `*[_type == "video" && (
        count(chapters[label match "${queryPattern}"]) > 0 ||
        count(chunks[text match "${queryPattern}"]) > 0
      )][0...10] {
        url,
        "matchedChapters": chapters[label match "${queryPattern}"][0...3],
        "matchedChunks": chunks[text match "${queryPattern}"][0...3]
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

        if (!lesson) continue;

        if (v.matchedChapters?.length > 0) {
          for (const ch of v.matchedChapters) {
            videoMoments.push({
              lessonTitle: lesson.title || "Lesson Video",
              lessonSlug: lesson.slug || "",
              courseTitle: lesson.courseTitle || "Course",
              description: ch.label,
              startSeconds: ch.startSeconds || 0,
              thumbnailUrl: lesson.posterUrl,
              clipLength: "2-5 mins",
            });
          }
        } else if (v.matchedChunks?.length > 0) {
          for (const ck of v.matchedChunks) {
            videoMoments.push({
              lessonTitle: lesson.title || "Lesson Video",
              lessonSlug: lesson.slug || "",
              courseTitle: lesson.courseTitle || "Course",
              description: ck.text?.slice(0, 120) + "...",
              startSeconds: ck.startSeconds || 0,
              thumbnailUrl: lesson.posterUrl,
              clipLength: "1-2 mins",
            });
          }
        }
      }

      const fallbackResults = {
        lessons: matchedLessons.filter((l: any) => l.courseTitle),
        videoMoments,
      };

      searchResultCache.set(cacheKey, fallbackResults);
      return NextResponse.json(fallbackResults, {
        headers: {
          "X-Cache": "MISS",
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      });
    } catch (fallbackError: any) {
      console.error("Direct search fallback error:", fallbackError);
      return NextResponse.json({ error: fallbackError.message }, { status: 500 });
    }
  }
}

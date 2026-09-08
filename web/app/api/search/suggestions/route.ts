import { NextResponse } from "next/server";
import { serverClient } from "@/sanity/lib/client";
import { checkRateLimit } from "@/lib/rate-limit";
import { SimpleMemoryCache } from "@/lib/cache";
import { normalizeSearchQuery } from "@/lib/utils/search";

export const maxDuration = 10;

interface SuggestionPayload {
  keywords: string[];
  courses: Array<{ title: string; slug: string; category: string }>;
  trending: string[];
}

// In-memory cache for suggestions: 250 queries, 30-minute TTL
const suggestionsCache = new SimpleMemoryCache<SuggestionPayload>({
  maxEntries: 250,
  defaultTtlMs: 30 * 60 * 1000,
});

const DEFAULT_TRENDING = [
  "Next.js",
  "Docker",
  "TypeScript",
  "System Design",
  "Server Components",
  "AI Engineering",
  "PostgreSQL",
  "Web Security",
];

export async function GET(req: Request) {
  // Rate limit: 60 requests / minute per IP for suggestions
  const rateLimit = checkRateLimit(req, 60, 60 * 1000, "suggestions");
  if (!rateLimit.success && rateLimit.response) {
    return rateLimit.response;
  }

  const { searchParams } = new URL(req.url);
  const rawQuery = searchParams.get("q") || "";
  const query = normalizeSearchQuery(rawQuery);

  // If query is empty or 1 character, return default trending topics
  if (!query || query.length < 2) {
    return NextResponse.json(
      {
        keywords: [],
        courses: [],
        trending: DEFAULT_TRENDING,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  }

  const cacheKey = query.toLowerCase();
  const cached = suggestionsCache.get(cacheKey);
  if (cached) {
    return NextResponse.json(cached, {
      headers: {
        "X-Cache": "HIT",
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=86400",
      },
    });
  }

  try {
    const cleanWord = query.replace(/[^\w\s]/gi, "").trim();
    const queryPattern = `*${cleanWord}*`;

    // Fetch verified suggestions from Sanity:
    // 1. Matching courses (title, slug, category)
    // 2. Matching lessons that have a valid parent course
    // 3. Matching categories that have courses
    // 4. Matching video chapters
    const groq = `{
      "courses": *[_type == "course" && title match "${queryPattern}"][0...5]{
        title,
        "slug": slug.current,
        "category": category->title
      },
      "lessons": *[_type == "lesson" && title match "${queryPattern}" && count(*[_type == "course" && references(^._id)]) > 0][0...6]{
        title,
        "courseTitle": *[_type == "course" && references(^._id)][0].title
      },
      "categories": *[_type == "category" && title match "${queryPattern}" && count(*[_type == "course" && references(^._id)]) > 0][0...4].title,
      "chapters": *[_type == "video" && count(chapters[label match "${queryPattern}"]) > 0][0...4].chapters[label match "${queryPattern}"].label
    }`;

    const data = await serverClient.fetch(groq);

    // Collect and prioritize keywords (lessons, categories, chapters)
    const keywordSet = new Set<string>();

    if (Array.isArray(data.categories)) {
      data.categories.forEach((cat: string) => cat && keywordSet.add(cat.trim()));
    }
    if (Array.isArray(data.lessons)) {
      data.lessons.forEach((l: { title?: string }) => l?.title && keywordSet.add(l.title.trim()));
    }
    if (Array.isArray(data.chapters)) {
      data.chapters.flat().forEach((ch: string) => ch && keywordSet.add(ch.trim()));
    }

    // Sort keywords: prefix matches first, then shorter titles
    const lowerQuery = query.toLowerCase();
    const sortedKeywords = Array.from(keywordSet)
      .sort((a, b) => {
        const aLower = a.toLowerCase();
        const bLower = b.toLowerCase();
        const aStarts = aLower.startsWith(lowerQuery);
        const bStarts = bLower.startsWith(lowerQuery);

        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return a.length - b.length;
      })
      .slice(0, 5);

    // Format verified courses
    const verifiedCourses = (data.courses || []).map((c: { title: string; slug: string; category?: string }) => ({
      title: c.title,
      slug: c.slug,
      category: c.category || "Course",
    }));

    const payload: SuggestionPayload = {
      keywords: sortedKeywords,
      courses: verifiedCourses,
      trending: DEFAULT_TRENDING,
    };

    suggestionsCache.set(cacheKey, payload);

    return NextResponse.json(payload, {
      headers: {
        "X-Cache": "MISS",
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=86400",
      },
    });
  } catch (error: unknown) {
    console.error("Error fetching search suggestions:", error);
    const errMsg = error instanceof Error ? error.message : undefined;
    return NextResponse.json(
      {
        keywords: [],
        courses: [],
        trending: DEFAULT_TRENDING,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}

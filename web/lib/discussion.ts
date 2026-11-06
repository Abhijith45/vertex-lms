export interface DiscussionReply {
  id: string;
  author: {
    name: string;
    avatar?: string;
    role?: "learner" | "instructor" | "staff";
  };
  createdAt: string;
  content: string;
  upvotes: number;
}

export interface DiscussionThread {
  id: string;
  lessonSlug: string;
  courseSlug?: string;
  author: {
    name: string;
    avatar?: string;
    role?: "learner" | "instructor" | "staff";
  };
  title: string;
  content: string;
  timestampSeconds?: number;
  upvotes: number;
  userUpvoted?: boolean;
  isVerifiedAnswer?: boolean;
  createdAt: string;
  replies: DiscussionReply[];
}

export type DiscussionSort = "top" | "newest" | "timeline";

// Pre-seeded high quality technical Q&A threads
const INITIAL_THREADS: DiscussionThread[] = [
  {
    id: "disc-1",
    lessonSlug: "nextjs-app-router-in-depth-caching-and-revalidation",
    author: {
      name: "Marcus Vance",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      role: "learner",
    },
    title: "How does request memoization differ from the Next.js Data Cache?",
    content:
      "At this point in the lesson, the instructor mentioned request memoization. Is memoization shared between different users or is it strictly scoped to a single HTTP request render pass?",
    timestampSeconds: 60,
    upvotes: 14,
    userUpvoted: false,
    isVerifiedAnswer: true,
    createdAt: "2026-11-04T10:15:00.000Z",
    replies: [
      {
        id: "reply-1-1",
        author: {
          name: "Guillermo Rauch",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
          role: "instructor",
        },
        content:
          "Great question Marcus! Request memoization is an in-memory React per-request cache. It only lives for the duration of a single request tree render and is NEVER shared between users. The Data Cache, on the other hand, is persistent across requests and deployments.",
        createdAt: "2026-11-04T11:00:00.000Z",
        upvotes: 22,
      },
    ],
  },
  {
    id: "disc-2",
    lessonSlug: "nextjs-app-router-in-depth-caching-and-revalidation",
    author: {
      name: "Elena Rostova",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
      role: "learner",
    },
    title: "Why use revalidateTag instead of revalidatePath after mutations?",
    content:
      "When invalidating cache tags in Server Actions, what are the architectural trade-offs between path-based and tag-based purging?",
    timestampSeconds: 120,
    upvotes: 9,
    userUpvoted: false,
    isVerifiedAnswer: true,
    createdAt: "2026-11-05T08:30:00.000Z",
    replies: [
      {
        id: "reply-2-1",
        author: {
          name: "Vertex Technical Staff",
          avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
          role: "staff",
        },
        content:
          "`revalidatePath` purges every cached fetch query associated with that route URL. `revalidateTag` is much more granular: it only purges queries stamped with that explicit tag, preserving other cached data on the page.",
        createdAt: "2026-11-05T09:12:00.000Z",
        upvotes: 11,
      },
    ],
  },
  {
    id: "disc-3",
    lessonSlug: "nextjs-app-router-in-depth-caching-and-revalidation",
    author: {
      name: "Devon Clark",
      avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80",
      role: "learner",
    },
    title: "Streaming Suspense boundaries and initial time-to-first-byte",
    content:
      "Wrapping components in Suspense at this second allowed immediate streaming of the header skeleton while the database query resolved. Highly recommended pattern for production apps!",
    timestampSeconds: 175,
    upvotes: 6,
    userUpvoted: false,
    isVerifiedAnswer: false,
    createdAt: "2026-11-05T14:20:00.000Z",
    replies: [],
  },
];

// Runtime thread memory store
const threadsStore: DiscussionThread[] = [...INITIAL_THREADS];

/**
 * Retrieve discussion threads for a lesson, filtered and sorted.
 */
export function getDiscussionsForLesson(
  lessonSlug: string,
  sortBy: DiscussionSort = "top"
): DiscussionThread[] {
  // If no threads exist for this lesson yet, clone defaults or match by slug
  let threads = threadsStore.filter(
    (t) => t.lessonSlug === lessonSlug || lessonSlug === "current-lesson"
  );

  if (threads.length === 0) {
    // Provide general fallback threads adapted to this lesson
    threads = threadsStore.slice(0, 2).map((t) => ({
      ...t,
      lessonSlug,
    }));
  }

  // Sort logic
  const sorted = [...threads].sort((a, b) => {
    if (sortBy === "top") {
      return b.upvotes - a.upvotes;
    }
    if (sortBy === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === "timeline") {
      const aTime = a.timestampSeconds ?? -1;
      const bTime = b.timestampSeconds ?? -1;
      return aTime - bTime;
    }
    return 0;
  });

  return sorted;
}

/**
 * Create a new discussion thread.
 */
export function createDiscussion(data: {
  lessonSlug: string;
  courseSlug?: string;
  authorName: string;
  authorAvatar?: string;
  authorRole?: "learner" | "instructor" | "staff";
  title: string;
  content: string;
  timestampSeconds?: number;
}): DiscussionThread {
  const newThread: DiscussionThread = {
    id: `disc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    lessonSlug: data.lessonSlug,
    courseSlug: data.courseSlug,
    author: {
      name: data.authorName || "Learner",
      avatar:
        data.authorAvatar ||
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
      role: data.authorRole || "learner",
    },
    title: data.title,
    content: data.content,
    timestampSeconds: data.timestampSeconds,
    upvotes: 1,
    userUpvoted: true,
    isVerifiedAnswer: false,
    createdAt: new Date().toISOString(),
    replies: [],
  };

  threadsStore.unshift(newThread);
  return newThread;
}

/**
 * Toggle an upvote on a discussion thread.
 */
export function toggleThreadUpvote(threadId: string): {
  upvotes: number;
  userUpvoted: boolean;
} | null {
  const thread = threadsStore.find((t) => t.id === threadId);
  if (!thread) return null;

  if (thread.userUpvoted) {
    thread.upvotes = Math.max(0, thread.upvotes - 1);
    thread.userUpvoted = false;
  } else {
    thread.upvotes += 1;
    thread.userUpvoted = true;
  }

  return { upvotes: thread.upvotes, userUpvoted: thread.userUpvoted };
}

/**
 * Add a reply to an existing discussion thread.
 */
export function addReply(
  threadId: string,
  data: {
    authorName: string;
    authorAvatar?: string;
    authorRole?: "learner" | "instructor" | "staff";
    content: string;
  }
): DiscussionReply | null {
  const thread = threadsStore.find((t) => t.id === threadId);
  if (!thread) return null;

  const newReply: DiscussionReply = {
    id: `reply-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    author: {
      name: data.authorName || "Learner",
      avatar:
        data.authorAvatar ||
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
      role: data.authorRole || "learner",
    },
    content: data.content,
    createdAt: new Date().toISOString(),
    upvotes: 0,
  };

  thread.replies.push(newReply);
  return newReply;
}

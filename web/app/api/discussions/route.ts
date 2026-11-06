import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import {
  getDiscussionsForLesson,
  createDiscussion,
  toggleThreadUpvote,
  addReply,
  type DiscussionSort,
} from "@/lib/discussion";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lessonSlug = searchParams.get("lessonSlug") || "current-lesson";
    const sort = (searchParams.get("sort") as DiscussionSort) || "top";

    const threads = getDiscussionsForLesson(lessonSlug, sort);
    return NextResponse.json({ threads });
  } catch (err: unknown) {
    console.error("Error fetching discussions:", err);
    return NextResponse.json({ error: "Failed to fetch discussions" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    const authorName =
      user?.fullName ||
      (user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : null) ||
      "Learner";
    const authorAvatar = user?.imageUrl;

    const body = await req.json();
    const { action } = body;

    // 1. Upvote Action
    if (action === "upvote") {
      const { threadId } = body;
      if (!threadId) {
        return NextResponse.json({ error: "threadId is required" }, { status: 400 });
      }
      const result = toggleThreadUpvote(threadId);
      if (!result) {
        return NextResponse.json({ error: "Thread not found" }, { status: 404 });
      }
      return NextResponse.json(result);
    }

    // 2. Reply Action
    if (action === "reply") {
      const { threadId, content } = body;
      if (!threadId || !content?.trim()) {
        return NextResponse.json(
          { error: "threadId and content are required" },
          { status: 400 }
        );
      }
      const reply = addReply(threadId, {
        authorName,
        authorAvatar,
        content: content.trim(),
      });
      return NextResponse.json({ reply });
    }

    // 3. Create Thread Action
    const { lessonSlug, courseSlug, title, content, timestampSeconds } = body;
    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    const thread = createDiscussion({
      lessonSlug: lessonSlug || "current-lesson",
      courseSlug,
      authorName,
      authorAvatar,
      title: title.trim(),
      content: content.trim(),
      timestampSeconds: typeof timestampSeconds === "number" ? timestampSeconds : undefined,
    });

    return NextResponse.json({ thread }, { status: 201 });
  } catch (err: unknown) {
    console.error("Error processing discussion action:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  MessageSquare,
  ThumbsUp,
  Play,
  CheckCircle2,
  Clock,
  Sparkles,
  Send,
  PlusCircle,
  ChevronDown,
  ChevronUp,
  Filter,
  User,
} from "lucide-react";
import posthog from "posthog-js";
import { useLessonPlayback } from "./lesson-playback-context";
import { formatVideoTime } from "@/lib/utils/video";
import type { DiscussionThread, DiscussionSort } from "@/lib/discussion";

interface LessonDiscussionProps {
  lessonSlug?: string;
  courseSlug?: string;
  lessonTitle?: string;
}

export function LessonDiscussion({
  lessonSlug = "current-lesson",
  courseSlug,
  lessonTitle = "Lesson",
}: LessonDiscussionProps) {
  const { currentTime, seekTo } = useLessonPlayback();
  const [threads, setThreads] = useState<DiscussionThread[]>([]);
  const [sortBy, setSortBy] = useState<DiscussionSort>("top");
  const [isLoading, setIsLoading] = useState(true);
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagTimestamp, setTagTimestamp] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active reply composer threadId
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  const fetchThreads = useCallback(async (sort: DiscussionSort) => {
    let isMounted = true;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/discussions?lessonSlug=${lessonSlug}&sort=${sort}`);
      if (!res.ok) throw new Error("Failed to fetch discussions");
      const data = await res.json();
      if (isMounted) {
        setThreads(data.threads || []);
      }
    } catch (err) {
      console.error("Error loading discussions:", err);
    } finally {
      if (isMounted) {
        setIsLoading(false);
      }
    }
  }, [lessonSlug]);

  useEffect(() => {
    fetchThreads(sortBy);
  }, [fetchThreads, sortBy]);

  const handleSortChange = (newSort: DiscussionSort) => {
    setSortBy(newSort);
  };

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const timestampToTag = tagTimestamp ? Math.floor(currentTime) : undefined;

    try {
      const res = await fetch("/api/discussions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          lessonSlug,
          courseSlug,
          title: title.trim(),
          content: content.trim(),
          timestampSeconds: timestampToTag,
        }),
      });

      if (!res.ok) throw new Error("Failed to create thread");
      const { thread } = await res.json();

      setThreads((prev) => [thread, ...prev]);
      setTitle("");
      setContent("");
      setIsComposerOpen(false);

      posthog.capture("discussion_thread_created", {
        lesson_slug: lessonSlug,
        timestamp_seconds: timestampToTag,
      });
    } catch (err) {
      console.error("Error posting question:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvote = async (threadId: string) => {
    // Optimistic UI update
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === threadId) {
          const nextUpvoted = !t.userUpvoted;
          return {
            ...t,
            userUpvoted: nextUpvoted,
            upvotes: nextUpvoted ? t.upvotes + 1 : Math.max(0, t.upvotes - 1),
          };
        }
        return t;
      })
    );

    try {
      await fetch("/api/discussions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "upvote", threadId }),
      });

      posthog.capture("discussion_upvoted", {
        thread_id: threadId,
        lesson_slug: lessonSlug,
      });
    } catch (err) {
      console.error("Upvote failed:", err);
      // Revert if network error
      fetchThreads(sortBy);
    }
  };

  const handleAddReply = async (threadId: string) => {
    if (!replyContent.trim() || isReplying) return;

    setIsReplying(true);
    try {
      const res = await fetch("/api/discussions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reply",
          threadId,
          content: replyContent.trim(),
        }),
      });

      if (!res.ok) throw new Error("Failed to post reply");
      const { reply } = await res.json();

      setThreads((prev) =>
        prev.map((t) => (t.id === threadId ? { ...t, replies: [...t.replies, reply] } : t))
      );
      setReplyContent("");
      setActiveReplyId(null);
    } catch (err) {
      console.error("Error submitting reply:", err);
    } finally {
      setIsReplying(false);
    }
  };

  const formattedCurrentTime = formatVideoTime(Math.floor(currentTime));

  return (
    <div className="space-y-6">
      {/* ──────────────────────────────────────────────────────────
         HEADER & CONTROLS
         ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200/80 dark:border-neutral-800">
        <div>
          <h3 className="font-display text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-[#E05A36]" />
            <span>Lesson Community Q&A</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-mono font-medium">
              {threads.length}
            </span>
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Discuss architectural patterns, clarify concepts, and ask timestamped questions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Sorting Pills */}
          <div className="flex items-center p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200/60 dark:border-neutral-700/60 text-xs font-semibold">
            <button
              type="button"
              onClick={() => handleSortChange("top")}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                sortBy === "top"
                  ? "bg-white dark:bg-neutral-900 text-[#E05A36] shadow-xs"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
              }`}
            >
              Top
            </button>
            <button
              type="button"
              onClick={() => handleSortChange("newest")}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                sortBy === "newest"
                  ? "bg-white dark:bg-neutral-900 text-[#E05A36] shadow-xs"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
              }`}
            >
              Newest
            </button>
            <button
              type="button"
              onClick={() => handleSortChange("timeline")}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                sortBy === "timeline"
                  ? "bg-white dark:bg-neutral-900 text-[#E05A36] shadow-xs"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
              }`}
            >
              <Clock className="h-3 w-3" />
              <span>Timeline</span>
            </button>
          </div>

          {/* Ask Question Toggle */}
          <button
            type="button"
            onClick={() => setIsComposerOpen(!isComposerOpen)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#E05A36] hover:bg-[#C2410C] text-white transition-colors cursor-pointer shadow-xs shrink-0"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Ask Question</span>
          </button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
         NEW QUESTION COMPOSER (COLLAPSIBLE)
         ────────────────────────────────────────────────────────── */}
      {isComposerOpen && (
        <form
          onSubmit={handleCreateThread}
          className="rounded-2xl border border-[#E05A36]/30 bg-[#FFF9F6] dark:bg-neutral-900 p-5 shadow-xs space-y-4 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Ask a question about {lessonTitle}
            </h4>
            <button
              type="button"
              onClick={() => setIsComposerOpen(false)}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 text-xs"
            >
              Cancel
            </button>
          </div>

          <div>
            <label htmlFor="discussion-question-title" className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Question Title
            </label>
            <input
              id="discussion-question-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              aria-label="Question Title"
              placeholder="e.g. Why does request memoization not apply to POST requests?"
              className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#E05A36]/40 focus:border-[#E05A36] text-neutral-900 dark:text-neutral-100"
            />
          </div>

          <div>
            <label htmlFor="discussion-question-details" className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Details & Context
            </label>
            <textarea
              id="discussion-question-details"
              required
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              aria-label="Details & Context"
              placeholder="Explain what you are trying to understand or what behavior you observed..."
              className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#E05A36]/40 focus:border-[#E05A36] text-neutral-900 dark:text-neutral-100"
            />
          </div>

          {/* Timestamp Attachment Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-neutral-700 dark:text-neutral-300">
              <input
                type="checkbox"
                checked={tagTimestamp}
                onChange={(e) => setTagTimestamp(e.target.checked)}
                className="rounded border-neutral-300 text-[#E05A36] focus:ring-[#E05A36]"
              />
              <span>
                Anchor to current video timestamp:{" "}
                <span className="font-mono font-semibold text-[#E05A36]">
                  [{formattedCurrentTime}]
                </span>
              </span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !content.trim()}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#E05A36] hover:bg-[#C2410C] text-white disabled:opacity-50 transition-colors cursor-pointer self-end sm:self-auto"
            >
              {isSubmitting ? "Posting..." : "Post Question"}
            </button>
          </div>
        </form>
      )}

      {/* ──────────────────────────────────────────────────────────
         THREADS LIST
         ────────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-neutral-400">
          Loading discussion threads...
        </div>
      ) : threads.length === 0 ? (
        <div className="py-12 text-center rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 p-8">
          <MessageSquare className="h-8 w-8 text-neutral-300 dark:text-neutral-600 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            No questions yet for this lesson
          </h4>
          <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
            Be the first to start a discussion or ask a question about what the instructor is teaching.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {threads.map((thread) => {
            const hasTimestamp = typeof thread.timestampSeconds === "number";
            const formattedTs = hasTimestamp
              ? formatVideoTime(thread.timestampSeconds!)
              : null;

            return (
              <div
                key={thread.id}
                className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-xs transition-shadow hover:shadow-sm"
              >
                {/* Author & Timestamp Header */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center overflow-hidden shrink-0">
                      {thread.author?.avatar ? (
                        <img
                          src={thread.author.avatar}
                          alt={thread.author.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-4 w-4 text-neutral-500" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                          {thread.author?.name}
                        </span>
                        {thread.author?.role === "instructor" && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#E05A36]/10 text-[#E05A36] uppercase tracking-wider">
                            Instructor
                          </span>
                        )}
                        {thread.author?.role === "staff" && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                            Staff
                          </span>
                        )}
                        {thread.isVerifiedAnswer && (
                          <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Verified Answer</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-neutral-400">
                        {new Date(thread.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Click-to-Seek Video Timestamp Badge */}
                  {hasTimestamp && formattedTs && (
                    <button
                      type="button"
                      onClick={() => {
                        seekTo(thread.timestampSeconds!);
                        posthog.capture("discussion_timestamp_clicked", {
                          thread_id: thread.id,
                          timestamp_seconds: thread.timestampSeconds,
                        });
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-[#E05A36]/10 text-[#E05A36] hover:bg-[#E05A36] hover:text-white transition-all cursor-pointer shadow-2xs shrink-0"
                      title={`Seek video to ${formattedTs}`}
                    >
                      <Play className="h-3 w-3 fill-current" />
                      <span>{formattedTs}</span>
                    </button>
                  )}
                </div>

                {/* Question Title & Content */}
                <h4 className="font-display text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                  {thread.title}
                </h4>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  {thread.content}
                </p>

                {/* Footer Actions: Upvote & Reply */}
                <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleUpvote(thread.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                        thread.userUpvoted
                          ? "bg-[#E05A36] text-white"
                          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
                      }`}
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                      <span>{thread.upvotes}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setActiveReplyId(activeReplyId === thread.id ? null : thread.id)
                      }
                      className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 font-medium transition-colors cursor-pointer"
                    >
                      {thread.replies.length > 0
                        ? `${thread.replies.length} ${
                            thread.replies.length === 1 ? "reply" : "replies"
                          }`
                        : "Reply"}
                    </button>
                  </div>
                </div>

                {/* Replies Area */}
                {thread.replies && thread.replies.length > 0 && (
                  <div className="mt-3.5 space-y-2.5 pl-3 sm:pl-4 border-l-2 border-neutral-200 dark:border-neutral-800">
                    {thread.replies.map((reply) => (
                      <div
                        key={reply.id}
                        className="rounded-xl bg-neutral-50 dark:bg-neutral-800/60 p-3 text-xs leading-relaxed"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-neutral-900 dark:text-neutral-100">
                            {reply.author?.name}
                          </span>
                          {reply.author?.role === "instructor" && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#E05A36]/10 text-[#E05A36] uppercase">
                              Instructor
                            </span>
                          )}
                          <span className="text-[10px] text-neutral-400">
                            {new Date(reply.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-neutral-600 dark:text-neutral-300">
                          {reply.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Inline Reply Composer */}
                {activeReplyId === thread.id && (
                  <div className="mt-3.5 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-2">
                    <input
                      type="text"
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      aria-label="Write a helpful reply"
                      placeholder="Write a helpful reply..."
                      className="flex-1 px-3.5 py-2 rounded-xl text-xs bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-[#E05A36]"
                    />
                    <button
                      type="button"
                      disabled={isReplying || !replyContent.trim()}
                      onClick={() => handleAddReply(thread.id)}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#E05A36] hover:bg-[#C2410C] text-white disabled:opacity-50 transition-colors cursor-pointer shrink-0"
                    >
                      {isReplying ? "Sending..." : "Reply"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  Play,
  RotateCcw,
  Code2,
  ListFilter,
  HelpCircle,
  Clock,
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import posthog from "posthog-js";
import { useLessonPlayback } from "./lesson-playback-context";
import { formatVideoTime, parseTimestampToSeconds } from "@/lib/utils/video";
import { KnowledgeCheckpoint } from "./knowledge-checkpoint";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: number;
}

interface LessonCopilotProps {
  lessonSlug?: string;
  lessonTitle?: string;
  courseTitle?: string;
}

export function LessonCopilot({
  lessonSlug = "current-lesson",
  lessonTitle = "Lesson Overview",
  courseTitle = "Vertex Course",
}: LessonCopilotProps) {
  const { currentTime, duration, seekTo } = useLessonPlayback();
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "welcome",
      role: "assistant",
      content: `👋 **Welcome to your Vertex AI Copilot!**

I am actively synchronized with your video playback second in real-time. Whenever you're curious about a concept or want an explanation of what the instructor just presented, ask away!

**Things you can try right now:**
- Click **"Explain moment at [${formatVideoTime(Math.floor(currentTime))}]"** to unpack the active concept.
- Ask for production code examples or architecture trade-offs.
- Click any **timestamp citation** (like \`[00:45]\`) to seek the video player immediately.
- Open the **Knowledge Checkpoint** below to test your concept mastery!`,
      timestamp: currentTime,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCheckpoint, setShowCheckpoint] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleCopyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || isLoading) return;

    setInput("");
    const userMsgId = `user-${Date.now()}`;
    const assistantMsgId = `assistant-${Date.now()}`;
    const captureTime = currentTime;

    const updatedMessages: ChatMessage[] = [
      ...messages,
      { id: userMsgId, role: "user", content: textToSend, timestamp: captureTime },
      { id: assistantMsgId, role: "assistant", content: "", timestamp: captureTime },
    ];

    setMessages(updatedMessages);
    setIsLoading(true);

    posthog.capture("copilot_prompt_sent", {
      lesson_slug: lessonSlug,
      current_time: captureTime,
      prompt: textToSend,
    });

    try {
      const historyPayload = messages
        .filter((m) => m.id !== "welcome")
        .slice(-4)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/ai/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonSlug,
          lessonTitle,
          courseTitle,
          currentTime: captureTime,
          prompt: textToSend,
          history: historyPayload,
        }),
      });

      if (!res.ok) throw new Error(`Copilot request failed: ${res.statusText}`);
      if (!res.body) throw new Error("No response body received");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        accumulatedText += decoder.decode(value, { stream: true });

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId ? { ...msg, content: accumulatedText } : msg
          )
        );
      }
    } catch (err) {
      console.error("Copilot streaming failed:", err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                content:
                  "⚠️ We were unable to stream a response right now. Please check your network connection and try again.",
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        content: `Conversation reset. I am currently synchronized to **[${formatVideoTime(Math.floor(currentTime))}]**. How can I help you learn today?`,
        timestamp: currentTime,
      },
    ]);
  };

  // Render assistant text with interactive timestamps and markdown styling
  const renderMessageContent = (content: string, msgId: string) => {
    // Split text by markdown code blocks ```...```
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, pIdx) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        // Extract language and code
        const lines = part.slice(3, -3).trim().split("\n");
        const firstLine = lines[0].trim();
        const hasLang = /^[a-zA-Z0-9_-]+$/.test(firstLine);
        const lang = hasLang ? firstLine : "code";
        const code = hasLang ? lines.slice(1).join("\n") : lines.join("\n");
        const blockId = `${msgId}-code-${pIdx}`;

        return (
          <div
            key={pIdx}
            className="my-3 rounded-xl overflow-hidden border border-neutral-800 bg-[#0F172A] text-neutral-100 text-xs shadow-md"
          >
            <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#1E293B] border-b border-neutral-800 text-neutral-400 font-mono text-[11px]">
              <span className="uppercase tracking-wider font-semibold text-[#E05A36]">
                {lang}
              </span>
              <button
                type="button"
                onClick={() => handleCopyCode(code, blockId)}
                className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                title="Copy code"
              >
                {copiedId === blockId ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span className="text-emerald-400 text-[10px]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span className="text-[10px]">Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3.5 overflow-x-auto font-mono text-xs leading-relaxed text-neutral-200">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      // Render regular text paragraphs and parse [MM:SS] timestamps
      const lines = part.split("\n");
      return (
        <div key={pIdx} className="space-y-2">
          {lines.map((line, lIdx) => {
            if (!line.trim()) return <div key={lIdx} className="h-2" />;

            // Headings
            if (line.startsWith("### ")) {
              return (
                <h4
                  key={lIdx}
                  className="font-display font-bold text-sm text-neutral-900 dark:text-neutral-100 mt-2 mb-1"
                >
                  {renderLineWithTimestamps(line.slice(4))}
                </h4>
              );
            }
            if (line.startsWith("## ")) {
              return (
                <h3
                  key={lIdx}
                  className="font-display font-bold text-base text-neutral-900 dark:text-neutral-100 mt-3 mb-1"
                >
                  {renderLineWithTimestamps(line.slice(3))}
                </h3>
              );
            }

            // Bullet items
            if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
              return (
                <div key={lIdx} className="flex items-start gap-2 text-xs leading-relaxed pl-1">
                  <span className="text-[#E05A36] font-bold mt-0.5">•</span>
                  <div className="flex-1">{renderLineWithTimestamps(line.replace(/^[-*]\s*/, ""))}</div>
                </div>
              );
            }

            return (
              <p key={lIdx} className="text-xs leading-relaxed">
                {renderLineWithTimestamps(line)}
              </p>
            );
          })}
        </div>
      );
    });
  };

  // Helper to parse bold text **bold** and [MM:SS] timestamp citations
  const renderLineWithTimestamps = (text: string) => {
    // Regex splits by both [MM:SS] timestamps and **bold** markdown
    const tokens = text.split(/(\[\d{1,2}:\d{2}(?::\d{2})?\]|\*\*[^*]+\*\*)/g);

    return tokens.map((token) => {
      // Check timestamp: [01:23] or [1:23]
      const tsMatch = token.match(/^\[(\d{1,2}:\d{2}(?::\d{2})?)\]$/);
      if (tsMatch) {
        const rawTs = tsMatch[1];
        const secs = parseTimestampToSeconds(rawTs);

        return (
          <button
            key={`ts-${rawTs}`}
            type="button"
            onClick={() => {
              seekTo(secs);
              posthog.capture("copilot_timestamp_clicked", {
                lesson_slug: lessonSlug,
                timestamp: rawTs,
                seconds: secs,
              });
            }}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-1 my-0.5 rounded-md font-mono text-[11px] font-semibold bg-[#E05A36]/10 text-[#E05A36] hover:bg-[#E05A36] hover:text-white transition-all cursor-pointer align-baseline shadow-xs"
            title={`Jump video to ${rawTs}`}
            aria-label={`Jump video to ${rawTs}`}
          >
            <Play className="h-2.5 w-2.5 fill-current" />
            <span>{rawTs}</span>
          </button>
        );
      }

      // Check bold
      if (token.startsWith("**") && token.endsWith("**")) {
        const boldText = token.slice(2, -2);
        return (
          <strong key={`b-${boldText}`} className="font-semibold text-neutral-900 dark:text-neutral-100">
            {boldText}
          </strong>
        );
      }

      return <span key={`t-${token}`}>{token}</span>;
    });
  };

  return (
    <div className="flex flex-col h-[650px] max-h-[85vh] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden">
      {/* ──────────────────────────────────────────────────────────
         HEADER BAR
         ────────────────────────────────────────────────────────── */}
      <div className="px-5 py-3.5 border-b border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/80 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-8 w-8 rounded-xl bg-[#E05A36]/10 flex items-center justify-center shrink-0">
            <Sparkles className="h-4 w-4 text-[#E05A36]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate">
                Vertex In-Video Copilot
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40 shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                SYNCED {formatVideoTime(Math.floor(currentTime))}
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
              {lessonTitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowCheckpoint(!showCheckpoint)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              showCheckpoint
                ? "bg-[#E05A36] text-white"
                : "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:border-[#E05A36]"
            }`}
            title="Toggle Concept Checkpoint Quiz"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Checkpoint</span>
            {showCheckpoint ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </button>

          <button
            type="button"
            onClick={handleResetChat}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Reset conversation"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
         COLLAPSIBLE KNOWLEDGE CHECKPOINT SECTION
         ────────────────────────────────────────────────────────── */}
      {showCheckpoint && (
        <div className="border-b border-neutral-200 dark:border-neutral-800 max-h-[340px] overflow-y-auto bg-neutral-50 dark:bg-neutral-950 p-4">
          <KnowledgeCheckpoint lessonTitle={lessonTitle} />
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
         MESSAGES SCROLL AREA
         ────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === "user";

          return (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs leading-relaxed ${
                isUser ? "justify-end" : "justify-start"
              }`}
            >
              {!isUser && (
                <div className="h-7 w-7 rounded-lg bg-[#E05A36]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="h-3.5 w-3.5 text-[#E05A36]" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 py-3 shadow-xs ${
                  isUser
                    ? "bg-[#E05A36] text-white rounded-br-xs font-medium"
                    : "bg-neutral-100/90 dark:bg-neutral-800/80 text-neutral-800 dark:text-neutral-200 rounded-bl-xs border border-neutral-200/50 dark:border-neutral-700/50"
                }`}
              >
                {isUser ? (
                  <div>{msg.content}</div>
                ) : (
                  <div>
                    {msg.content ? (
                      renderMessageContent(msg.content, msg.id)
                    ) : (
                      <div className="flex items-center gap-1.5 py-1 text-neutral-500 dark:text-neutral-400">
                        <span className="h-2 w-2 rounded-full bg-[#E05A36] animate-pulse" />
                        <span className="italic text-xs">Analyzing current lesson second...</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* ──────────────────────────────────────────────────────────
         QUICK ACTION PROMPT CHIPS
         ────────────────────────────────────────────────────────── */}
      <div className="px-4 py-2 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
        <button
          type="button"
          onClick={() =>
            handleSend(
              `Explain what is happening right now in the lesson at [${formatVideoTime(
                Math.floor(currentTime)
              )}].`
            )
          }
          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-[#E05A36] text-neutral-700 dark:text-neutral-300 hover:text-[#E05A36] transition-colors cursor-pointer shrink-0"
        >
          <Clock className="h-3 w-3 text-[#E05A36]" />
          <span>Explain moment at {formatVideoTime(Math.floor(currentTime))}</span>
        </button>

        <button
          type="button"
          onClick={() =>
            handleSend("Can you provide a realistic production code example of this pattern?")
          }
          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-[#E05A36] text-neutral-700 dark:text-neutral-300 hover:text-[#E05A36] transition-colors cursor-pointer shrink-0"
        >
          <Code2 className="h-3 w-3 text-indigo-500" />
          <span>Code example</span>
        </button>

        <button
          type="button"
          onClick={() =>
            handleSend("Summarize the key architectural takeaways covered up to this point.")
          }
          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-[#E05A36] text-neutral-700 dark:text-neutral-300 hover:text-[#E05A36] transition-colors cursor-pointer shrink-0"
        >
          <ListFilter className="h-3 w-3 text-amber-500" />
          <span>Summarize takeaways</span>
        </button>

        <button
          type="button"
          onClick={() => setShowCheckpoint(true)}
          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-[#E05A36] text-neutral-700 dark:text-neutral-300 hover:text-[#E05A36] transition-colors cursor-pointer shrink-0"
        >
          <HelpCircle className="h-3 w-3 text-emerald-500" />
          <span>Open Micro-Quiz</span>
        </button>
      </div>

      {/* ──────────────────────────────────────────────────────────
         INPUT BAR
         ────────────────────────────────────────────────────────── */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 sm:p-4 border-t border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center gap-2 shrink-0"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask about what's taught at ${formatVideoTime(Math.floor(currentTime))}...`}
          disabled={isLoading}
          className="flex-1 px-4 py-2.5 rounded-xl text-xs sm:text-sm bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#E05A36]/40 focus:border-[#E05A36] disabled:opacity-60 transition-all"
        />

        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="px-4 py-2.5 rounded-xl bg-[#E05A36] hover:bg-[#C2410C] text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50 transition-colors cursor-pointer shrink-0"
        >
          {isLoading ? (
            <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">Ask</span>
        </button>
      </form>
    </div>
  );
}

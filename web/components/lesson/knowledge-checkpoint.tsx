"use client";

import React, { useState } from "react";
import { CheckCircle2, XCircle, HelpCircle, RotateCcw, Sparkles, Award } from "lucide-react";
import { useLessonPlayback } from "./lesson-playback-context";
import { formatVideoTime } from "@/lib/utils/video";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  timestamp?: number;
}

interface KnowledgeCheckpointProps {
  questions?: QuizQuestion[];
  lessonTitle?: string;
}

const DEFAULT_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    question: "Why does Next.js App Router render Server Components by default without increasing client JavaScript bundle size?",
    options: [
      "Server Components are compiled to WebAssembly on the client.",
      "Server Components execute solely on the server and stream serialized HTML/RSC payload without shipping their component dependencies to the browser.",
      "The browser strips unused JavaScript functions using service workers.",
      "Server Components only support static HTML without any dynamic server capabilities.",
    ],
    correctIndex: 1,
    explanation: "Server Components run exclusively in the Node.js environment during build or request time. Their dependencies (like database drivers and markdown parsers) remain on the server, resulting in 0kb client bundle addition.",
    timestamp: 45,
  },
  {
    id: "q2",
    question: "How does Next.js handle identical fetch('https://api.domain.com/data') calls executed across multiple nested Server Components in a single request?",
    options: [
      "It triggers multiple parallel HTTP requests to the upstream server.",
      "It throws a duplicate request warning in the terminal.",
      "It automatically deduplicates GET requests using an in-memory per-request cache so the network call executes only once.",
      "It queues the requests sequentially in a microtask queue.",
    ],
    correctIndex: 2,
    explanation: "Next.js monkey-patches the native fetch API to provide automatic request memoization. The first fetch call caches the promise in the React render pass, sharing the result with subsequent identical calls.",
    timestamp: 85,
  },
  {
    id: "q3",
    question: "When should you use on-demand revalidation (revalidateTag) over time-based revalidation (revalidate: 3600)?",
    options: [
      "When content updates infrequently and on an unpredictable schedule, such as CMS publish webhooks or user mutations.",
      "Only when building static marketing landing pages.",
      "When you want the page to re-render on every client mouse movement.",
      "When using WebSockets for live video streaming.",
    ],
    correctIndex: 0,
    explanation: "revalidateTag is ideal for event-driven workflows: content stays cached indefinitely until a mutation or webhook explicitly purges that tag, providing maximum cache hit ratio with zero stale data.",
    timestamp: 140,
  },
];

export function KnowledgeCheckpoint({
  questions = DEFAULT_QUIZ_QUESTIONS,
  lessonTitle = "Lesson Checkpoint",
}: KnowledgeCheckpointProps) {
  const { seekTo } = useLessonPlayback();
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submittedQuestions, setSubmittedQuestions] = useState<Record<string, boolean>>({});

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (submittedQuestions[questionId]) return; // locked after submission
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleCheckAnswer = (questionId: string) => {
    if (selectedAnswers[questionId] === undefined) return;
    setSubmittedQuestions((prev) => ({ ...prev, [questionId]: true }));
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setSubmittedQuestions({});
  };

  // Calculate score
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(submittedQuestions).length;
  const correctCount = questions.filter(
    (q) => submittedQuestions[q.id] && selectedAnswers[q.id] === q.correctIndex
  ).length;

  const isAllAnswered = answeredCount === totalQuestions && totalQuestions > 0;

  return (
    <div className="rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-xs">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#FFF5EE] dark:bg-[#E05A36]/15 text-[#E05A36]">
            <Award className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Interactive Knowledge Checkpoint
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Test your understanding of the concepts covered in this lesson.
            </p>
          </div>
        </div>

        {answeredCount > 0 && (
          <button
            type="button"
            onClick={handleResetQuiz}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Questions List */}
      <div className="p-4 sm:p-6 space-y-6">
        {questions.map((q, idx) => {
          const selected = selectedAnswers[q.id];
          const isSubmitted = submittedQuestions[q.id];
          const isCorrect = isSubmitted && selected === q.correctIndex;
          const isWrong = isSubmitted && selected !== q.correctIndex;

          return (
            <div
              key={q.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                isCorrect
                  ? "border-green-200 dark:border-green-900/50 bg-green-50/30 dark:bg-green-950/10"
                  : isWrong
                  ? "border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-950/10"
                  : "border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-900/40"
              }`}
            >
              {/* Question Header */}
              <div className="flex items-start justify-between gap-3 mb-3.5">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Question {idx + 1} of {totalQuestions}
                </span>
                {q.timestamp !== undefined && (
                  <button
                    type="button"
                    onClick={() => seekTo(q.timestamp!)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium text-[#E05A36] bg-[#FFF5EE] dark:bg-[#E05A36]/10 hover:bg-[#E05A36] hover:text-white transition-colors cursor-pointer"
                    title={`Review topic at ${formatVideoTime(q.timestamp)}`}
                  >
                    <span>Review at {formatVideoTime(q.timestamp)}</span>
                  </button>
                )}
              </div>

              <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-4 leading-relaxed">
                {q.question}
              </h4>

              {/* Options */}
              <div className="space-y-2.5">
                {q.options.map((option, optIdx) => {
                  const isSelected = selected === optIdx;
                  const isThisCorrect = isSubmitted && optIdx === q.correctIndex;
                  const isThisWrong = isSubmitted && isSelected && optIdx !== q.correctIndex;

                  let optionClasses =
                    "border-neutral-200 dark:border-neutral-700/80 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:border-neutral-300 dark:hover:border-neutral-600";

                  if (isSelected && !isSubmitted) {
                    optionClasses =
                      "border-[#E05A36] bg-[#FFF5EE] dark:bg-[#E05A36]/10 text-[#E05A36] font-medium";
                  } else if (isThisCorrect) {
                    optionClasses =
                      "border-green-500 bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-300 font-medium";
                  } else if (isThisWrong) {
                    optionClasses =
                      "border-red-500 bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 line-through";
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={isSubmitted}
                      onClick={() => handleSelectOption(q.id, optIdx)}
                      className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm flex items-start gap-3 transition-all cursor-pointer disabled:cursor-default ${optionClasses}`}
                    >
                      <span className="shrink-0 flex items-center justify-center h-5 w-5 rounded-full border text-[11px] font-semibold">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="flex-1 leading-relaxed">{option}</span>
                      {isThisCorrect && <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />}
                      {isThisWrong && <XCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>

              {/* Action Button & Explanation */}
              <div className="mt-4 pt-3 flex items-center justify-between gap-3">
                {!isSubmitted ? (
                  <button
                    type="button"
                    disabled={selected === undefined}
                    onClick={() => handleCheckAnswer(q.id)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#E05A36] hover:bg-[#C2410C] text-white disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    Check Answer
                  </button>
                ) : (
                  <div className="w-full p-3 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/80 text-xs leading-relaxed text-neutral-600 dark:text-neutral-300">
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {isCorrect ? "Correct! " : "Explanation: "}
                    </span>
                    {q.explanation}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion Banner */}
      {isAllAnswered && (
        <div className="p-5 border-t border-neutral-200 dark:border-neutral-800 bg-[#FFF5EE] dark:bg-neutral-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center justify-center sm:justify-start gap-1.5">
              <Sparkles className="h-4 w-4 text-[#E05A36]" />
              <span>Checkpoint Completed!</span>
            </h4>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
              You scored {correctCount} of {totalQuestions} correct ({Math.round((correctCount / totalQuestions) * 100)}%).
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetQuiz}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#E05A36] text-white hover:bg-[#C2410C] transition-colors cursor-pointer self-center sm:self-auto"
          >
            Retake Checkpoint
          </button>
        </div>
      )}
    </div>
  );
}

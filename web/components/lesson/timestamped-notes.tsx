"use client";

import React, { useState, useEffect, useCallback, useId } from "react";
import {
  Clock,
  Plus,
  Trash2,
  Edit2,
  Download,
  Check,
  FileText,
  CornerDownLeft,
  Sparkles,
} from "lucide-react";
import { useLessonPlayback } from "./lesson-playback-context";
import { formatVideoTime } from "@/lib/utils/video";

export interface LessonNote {
  id: string;
  timestamp: number;
  content: string;
  createdAt: number;
  updatedAt: number;
}

interface TimestampedNotesProps {
  lessonSlug: string;
  lessonTitle?: string;
  courseTitle?: string;
}

export function TimestampedNotes({
  lessonSlug,
  lessonTitle = "Lesson Notes",
  courseTitle = "Vertex Learning",
}: TimestampedNotesProps) {
  const { currentTime, seekTo } = useLessonPlayback();
  const [notes, setNotes] = useState<LessonNote[]>([]);
  const [isEditingId, setIsEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [newNoteText, setNewNoteText] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const [capturedTimestamp, setCapturedTimestamp] = useState<number>(0);
  const [copiedExport, setCopiedExport] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const storageKey = `vertex_notes_${lessonSlug}`;

  // 1. Load notes from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setNotes(parsed);
        }
      }
    } catch (e) {
      console.warn("Could not load notes from localStorage:", e);
    } finally {
      setIsLoaded(true);
    }
  }, [storageKey]);

  // 2. Persist notes to localStorage
  const saveNotes = useCallback(
    (updated: LessonNote[]) => {
      setNotes(updated);
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (e) {
        console.warn("Could not save notes to localStorage:", e);
      }
    },
    [storageKey]
  );

  // 3. Start composing a new note at current time
  const handleStartCapture = useCallback(() => {
    const time = Math.floor(currentTime);
    setCapturedTimestamp(time);
    setIsComposing(true);
    setIsEditingId(null);
  }, [currentTime]);

  // 4. Global keyboard shortcut: Alt+N captures a note
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === "n" || e.key === "N")) {
        e.preventDefault();
        handleStartCapture();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleStartCapture]);

  // 5. Submit new note
  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newNoteText.trim();
    if (!trimmed) return;

    const newNote: LessonNote = {
      id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: capturedTimestamp,
      content: trimmed,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const updated = [...notes, newNote].sort((a, b) => a.timestamp - b.timestamp);
    saveNotes(updated);
    setNewNoteText("");
    setIsComposing(false);
  };

  // 6. Delete note
  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = notes.filter((n) => n.id !== id);
    saveNotes(updated);
    if (isEditingId === id) setIsEditingId(null);
  };

  // 7. Start editing existing note
  const handleStartEdit = (note: LessonNote, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingId(note.id);
    setEditText(note.content);
    setIsComposing(false);
  };

  // 8. Save edited note
  const handleSaveEdit = (id: string, e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = editText.trim();
    if (!trimmed) return;

    const updated = notes.map((n) =>
      n.id === id ? { ...n, content: trimmed, updatedAt: Date.now() } : n
    );
    saveNotes(updated);
    setIsEditingId(null);
  };

  // 9. Export notes as Markdown file download
  const handleExportMarkdown = () => {
    if (notes.length === 0) return;

    const dateStr = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    let md = `# ${lessonTitle} — Notes\n`;
    md += `*Course:* ${courseTitle}\n`;
    md += `*Exported on:* ${dateStr}\n\n`;
    md += `---\n\n`;
    md += `## Table of Contents\n`;

    notes.forEach((n, idx) => {
      md += `${idx + 1}. [${formatVideoTime(n.timestamp)}](#timestamp-${n.timestamp}s)\n`;
    });

    md += `\n---\n\n`;
    md += `## Timestamped Notes\n\n`;

    notes.forEach((n) => {
      md += `### Timestamp: ${formatVideoTime(n.timestamp)}\n`;
      md += `${n.content}\n\n`;
    });

    // Create browser file download
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${lessonSlug}-notes.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2000);
  };

  if (!isLoaded) {
    return <div className="p-8 text-center text-xs text-neutral-400">Loading notes...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-neutral-50/80 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800">
        <div>
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <span>Timestamped Notebook</span>
            <span className="text-[11px] font-normal text-neutral-500 dark:text-neutral-400">
              ({notes.length} {notes.length === 1 ? "note" : "notes"})
            </span>
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Capture thoughts linked to video moments. Press{" "}
            <kbd className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-[10px] font-mono">
              Alt+N
            </kbd>{" "}
            anytime.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {notes.length > 0 && (
            <button
              type="button"
              onClick={handleExportMarkdown}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors cursor-pointer shadow-2xs"
            >
              {copiedExport ? (
                <>
                  <Check className="h-3.5 w-3.5 text-green-500" />
                  <span>Exported!</span>
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5" />
                  <span>Export (.md)</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={handleStartCapture}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#E05A36] to-[#C2410C] hover:from-[#EA580C] hover:to-[#9A3412] text-white shadow-md shadow-[#E05A36]/20 transition-all cursor-pointer active:scale-[0.98]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Capture at {formatVideoTime(Math.floor(currentTime))}</span>
          </button>
        </div>
      </div>

      {/* Composing New Note Panel */}
      {isComposing && (
        <form
          onSubmit={handleCreateNote}
          className="p-4 sm:p-5 rounded-2xl border-2 border-[#E05A36]/40 bg-white dark:bg-neutral-900 shadow-md animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FFF5EE] dark:bg-[#E05A36]/15 text-[#E05A36] text-xs font-mono font-semibold">
              <Clock className="h-3.5 w-3.5" />
              <span>Timestamp: {formatVideoTime(capturedTimestamp)}</span>
            </div>
            <span className="text-[11px] text-neutral-400">Press Ctrl+Enter or click Save</span>
          </div>

          <textarea
            autoFocus
            rows={4}
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                handleCreateNote(e);
              }
            }}
            aria-label="New note content"
            placeholder="Type key takeaway, code concept, or question for this moment..."
            className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 p-3 text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-hidden focus:border-[#E05A36] focus:bg-white dark:focus:bg-neutral-800 transition-all resize-none"
          />

          <div className="flex items-center justify-end gap-2 mt-3">
            <button
              type="button"
              onClick={() => {
                setIsComposing(false);
                setNewNoteText("");
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newNoteText.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#E05A36] text-white hover:bg-[#C2410C] disabled:opacity-50 cursor-pointer transition-colors"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Save Note</span>
            </button>
          </div>
        </form>
      )}

      {/* Notes List */}
      {notes.length === 0 && !isComposing ? (
        <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30">
          <FileText className="h-8 w-8 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
            No timestamped notes yet
          </h4>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto mb-4 leading-relaxed">
            Take notes while watching this lesson. Your notes are anchored to specific seconds in the video and saved automatically.
          </p>
          <button
            type="button"
            onClick={handleStartCapture}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Capture first note at {formatVideoTime(Math.floor(currentTime))}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {notes.map((note) => {
            const isEditing = isEditingId === note.id;

            return (
              <div
                key={note.id}
                className="group p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all shadow-2xs"
              >
                {/* Note Header */}
                <div className="flex items-center justify-between gap-3 mb-2.5">
                  <button
                    type="button"
                    onClick={() => seekTo(note.timestamp)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FFF5EE] dark:bg-[#E05A36]/15 hover:bg-[#E05A36] text-[#E05A36] hover:text-white text-xs font-mono font-semibold transition-colors cursor-pointer"
                    title={`Seek video to ${formatVideoTime(note.timestamp)}`}
                  >
                    <Clock className="h-3 w-3" />
                    <span>{formatVideoTime(note.timestamp)}</span>
                    <CornerDownLeft className="h-2.5 w-2.5 opacity-60" />
                  </button>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => handleStartEdit(note, e)}
                      className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                      title="Edit note"
                      aria-label="Edit note"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteNote(note.id, e)}
                      className="p-1.5 rounded-md text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                      title="Delete note"
                      aria-label="Delete note"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Note Content / Edit Form */}
                {isEditing ? (
                  <form onSubmit={(e) => handleSaveEdit(note.id, e)} className="mt-2 space-y-2">
                    <textarea
                      rows={3}
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      aria-label="Edit note content"
                      className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 p-2.5 text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-[#E05A36]"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingId(null)}
                        className="px-2.5 py-1 text-xs text-neutral-500 hover:text-neutral-800 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 bg-[#E05A36] text-white rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                ) : (
                  <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-200 leading-relaxed whitespace-pre-wrap">
                    {note.content}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

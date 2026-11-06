import { describe, it } from "node:test";
import assert from "node:assert";
import { formatVideoTime, clampSeekTime } from "../lib/utils/video.ts";

interface TranscriptCueTest {
  start: number;
  end: number;
  text: string;
  chapter?: string;
}

const sampleCues: TranscriptCueTest[] = [
  { start: 0, end: 30, text: "Welcome to this deep dive into Next.js App Router.", chapter: "Intro" },
  { start: 30, end: 75, text: "Server Components execute strictly on the server.", chapter: "Server Components" },
  { start: 75, end: 120, text: "Data cache and request memoization eliminate duplicate calls.", chapter: "Caching" },
  { start: 120, end: 180, text: "Use revalidateTag to purge cached data on mutations.", chapter: "Revalidation" },
];

function resolveActiveCueIndex(cues: TranscriptCueTest[], currentTime: number): number {
  if (cues.length === 0) return -1;
  for (let i = 0; i < cues.length; i++) {
    const cue = cues[i];
    const nextCue = cues[i + 1];
    const cueEnd = cue.end ?? (nextCue ? nextCue.start : Infinity);
    if (currentTime >= cue.start && currentTime < cueEnd) {
      return i;
    }
  }
  if (currentTime >= cues[cues.length - 1].start) {
    return cues.length - 1;
  }
  return 0;
}

function filterTranscript(cues: TranscriptCueTest[], query: string): TranscriptCueTest[] {
  const q = query.trim().toLowerCase();
  if (!q) return cues;
  return cues.filter(
    (c) =>
      c.text.toLowerCase().includes(q) ||
      (c.chapter && c.chapter.toLowerCase().includes(q))
  );
}

interface NoteItem {
  id: string;
  timestamp: number;
  content: string;
}

function serializeNotesToMarkdown(
  lessonTitle: string,
  courseTitle: string,
  notes: NoteItem[]
): string {
  const sorted = [...notes].sort((a, b) => a.timestamp - b.timestamp);
  let md = `# ${lessonTitle} — Notes\n*Course:* ${courseTitle}\n\n## Table of Contents\n`;
  sorted.forEach((n, idx) => {
    md += `${idx + 1}. [${formatVideoTime(n.timestamp)}](#timestamp-${n.timestamp}s)\n`;
  });
  md += `\n---\n\n## Timestamped Notes\n\n`;
  sorted.forEach((n) => {
    md += `### Timestamp: ${formatVideoTime(n.timestamp)}\n${n.content}\n\n`;
  });
  return md;
}

describe("Interactive Media Engine — Transcript & Notes", () => {
  describe("Transcript Cue Resolution", () => {
    it("identifies active cue at start of video (0s)", () => {
      const idx = resolveActiveCueIndex(sampleCues, 0);
      assert.strictEqual(idx, 0);
      assert.strictEqual(sampleCues[idx].chapter, "Intro");
    });

    it("identifies active cue midway through playback (45s)", () => {
      const idx = resolveActiveCueIndex(sampleCues, 45);
      assert.strictEqual(idx, 1);
      assert.strictEqual(sampleCues[idx].chapter, "Server Components");
    });

    it("identifies active cue right at cue boundary (75s)", () => {
      const idx = resolveActiveCueIndex(sampleCues, 75);
      assert.strictEqual(idx, 2);
      assert.strictEqual(sampleCues[idx].chapter, "Caching");
    });

    it("identifies last cue when playback exceeds last cue start", () => {
      const idx = resolveActiveCueIndex(sampleCues, 250);
      assert.strictEqual(idx, 3);
      assert.strictEqual(sampleCues[idx].chapter, "Revalidation");
    });

    it("returns -1 for empty cues array", () => {
      const idx = resolveActiveCueIndex([], 50);
      assert.strictEqual(idx, -1);
    });
  });

  describe("Transcript Keyword Filtering", () => {
    it("returns all cues when search query is empty", () => {
      const res = filterTranscript(sampleCues, "");
      assert.strictEqual(res.length, sampleCues.length);
    });

    it("filters cues matching body text case-insensitively", () => {
      const res = filterTranscript(sampleCues, "memoization");
      assert.strictEqual(res.length, 1);
      assert.strictEqual(res[0].chapter, "Caching");
    });

    it("filters cues matching chapter label", () => {
      const res = filterTranscript(sampleCues, "revalidation");
      assert.strictEqual(res.length, 1);
      assert.strictEqual(res[0].chapter, "Revalidation");
    });

    it("returns empty array when query has no matches", () => {
      const res = filterTranscript(sampleCues, "kubernetes deployment");
      assert.strictEqual(res.length, 0);
    });
  });

  describe("Timestamped Notes Serialization & Markdown Export", () => {
    const rawNotes: NoteItem[] = [
      { id: "note-2", timestamp: 135, content: "Crucial to use revalidateTag in Server Actions." },
      { id: "note-1", timestamp: 15, content: "Intro notes on app router architecture." },
      { id: "note-3", timestamp: 80, content: "Deduplication works for fetch() but not raw DB queries." },
    ];

    it("sorts notes chronologically by timestamp in exported markdown", () => {
      const md = serializeNotesToMarkdown(
        "Data Fetching in Next.js",
        "Next.js for Production",
        rawNotes
      );

      // Verify title and headers
      assert.ok(md.includes("# Data Fetching in Next.js — Notes"));
      assert.ok(md.includes("*Course:* Next.js for Production"));
      assert.ok(md.includes("## Table of Contents"));

      // Verify ordering: note at 15s (0:15) should precede 80s (1:20) and 135s (2:15)
      const pos15 = md.indexOf("0:15");
      const pos80 = md.indexOf("1:20");
      const pos135 = md.indexOf("2:15");

      assert.ok(pos15 < pos80, "0:15 must appear before 1:20");
      assert.ok(pos80 < pos135, "1:20 must appear before 2:15");
    });

    it("clamps seek time safely for note jump triggers", () => {
      assert.strictEqual(clampSeekTime(-10, 300), 0);
      assert.strictEqual(clampSeekTime(350, 300), 300);
      assert.strictEqual(clampSeekTime(150, 300), 150);
    });
  });
});

import { describe, it } from "node:test";
import assert from "node:assert";

// Temporal window chunk definition
interface TranscriptChunk {
  startSeconds: number;
  text: string;
}

export function sliceTemporalWindow(
  chunks: TranscriptChunk[],
  currentTime: number,
  lookbackSeconds = 90,
  lookaheadSeconds = 30
): TranscriptChunk[] {
  const windowStart = Math.max(0, currentTime - lookbackSeconds);
  const windowEnd = currentTime + lookaheadSeconds;

  const inWindow = chunks.filter(
    (c) => c.startSeconds >= windowStart && c.startSeconds <= windowEnd
  );

  if (inWindow.length > 0) return inWindow;

  const preceding = chunks.filter((c) => c.startSeconds <= currentTime);
  if (preceding.length > 0) {
    return [preceding[preceding.length - 1]];
  }

  return chunks.slice(0, 3);
}

export function parseTimestampToSeconds(ts: string): number {
  const clean = ts.replace(/[[\]]/g, "").trim();
  const parts = clean.split(":").map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return 0;
}

export function extractTimestampCitations(text: string): string[] {
  const matches = text.match(/\[(\d{1,2}:\d{2}(?::\d{2})?)\]/g);
  if (!matches) return [];
  return matches.map((m) => m.replace(/[[\]]/g, ""));
}

describe("Phase 2: In-Video AI Copilot Temporal RAG & Parsing", () => {
  const testChunks: TranscriptChunk[] = [
    { startSeconds: 0, text: "Introduction to Server Components and architecture." },
    { startSeconds: 35, text: "Understanding the RSC payload stream." },
    { startSeconds: 80, text: "Request memoization and native fetch caching." },
    { startSeconds: 140, text: "Time-based revalidation with next: { revalidate: 60 }." },
    { startSeconds: 210, text: "On-demand cache purging with revalidateTag." },
    { startSeconds: 300, text: "React Suspense streaming boundaries." },
  ];

  describe("sliceTemporalWindow", () => {
    it("slices chunks within [currentTime - 90s, currentTime + 30s]", () => {
      // currentTime = 100s -> window [10s, 130s]
      // Should include chunk at 35s and 80s
      const result = sliceTemporalWindow(testChunks, 100, 90, 30);
      assert.strictEqual(result.length, 2);
      assert.strictEqual(result[0].startSeconds, 35);
      assert.strictEqual(result[1].startSeconds, 80);
    });

    it("clamps start window to 0 when near beginning of video", () => {
      // currentTime = 20s -> window [0, 50s]
      // Should include chunk at 0s and 35s
      const result = sliceTemporalWindow(testChunks, 20, 90, 30);
      assert.strictEqual(result.length, 2);
      assert.strictEqual(result[0].startSeconds, 0);
      assert.strictEqual(result[1].startSeconds, 35);
    });

    it("returns closest preceding chunk if window has no exact matches", () => {
      // Empty gap scenario: currentTime = 500s (way past end)
      const result = sliceTemporalWindow(testChunks, 500, 10, 10);
      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].startSeconds, 300);
    });

    it("handles empty chunk list without crashing", () => {
      const result = sliceTemporalWindow([], 60);
      assert.deepStrictEqual(result, []);
    });
  });

  describe("parseTimestampToSeconds", () => {
    it("parses MM:SS with brackets", () => {
      assert.strictEqual(parseTimestampToSeconds("[01:30]"), 90);
      assert.strictEqual(parseTimestampToSeconds("[00:45]"), 45);
      assert.strictEqual(parseTimestampToSeconds("[00:00]"), 0);
      assert.strictEqual(parseTimestampToSeconds("[10:15]"), 615);
    });

    it("parses M:SS single digit minutes", () => {
      assert.strictEqual(parseTimestampToSeconds("[1:45]"), 105);
      assert.strictEqual(parseTimestampToSeconds("3:20"), 200);
    });

    it("parses H:MM:SS format", () => {
      assert.strictEqual(parseTimestampToSeconds("[01:05:30]"), 3930);
      assert.strictEqual(parseTimestampToSeconds("1:00:00"), 3600);
    });

    it("handles invalid format gracefully", () => {
      assert.strictEqual(parseTimestampToSeconds("invalid"), 0);
    });
  });

  describe("extractTimestampCitations", () => {
    it("extracts all [MM:SS] timestamps from response text", () => {
      const response =
        "At [00:35] the instructor explains Server Components, then at [01:20] covers caching, and wraps up at [02:50].";
      const citations = extractTimestampCitations(response);

      assert.deepStrictEqual(citations, ["00:35", "01:20", "02:50"]);
      assert.strictEqual(citations.length, 3);
    });

    it("returns empty array if no citations exist", () => {
      const response = "This response has no timestamp markers.";
      const citations = extractTimestampCitations(response);
      assert.deepStrictEqual(citations, []);
    });
  });

  describe("Knowledge Checkpoint Scoring", () => {
    it("accurately computes checkpoint quiz score and percentage", () => {
      const answers: Record<string, number> = {
        q1: 1, // correct
        q2: 2, // correct
        q3: 0, // incorrect (correct is 1)
      };

      const questions = [
        { id: "q1", correctIndex: 1 },
        { id: "q2", correctIndex: 2 },
        { id: "q3", correctIndex: 1 },
      ];

      const correctCount = questions.reduce((acc, q) => {
        return acc + (answers[q.id] === q.correctIndex ? 1 : 0);
      }, 0);

      const percentage = Math.round((correctCount / questions.length) * 100);

      assert.strictEqual(correctCount, 2);
      assert.strictEqual(percentage, 67);
    });
  });
});

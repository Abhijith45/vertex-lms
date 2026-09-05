import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  formatVideoTime,
  getNextPlaybackRate,
  clampSeekTime,
  parseVideoUrl,
} from "../lib/utils/video.ts";

describe("formatVideoTime", () => {
  test("formats 0 seconds as 0:00", () => {
    assert.equal(formatVideoTime(0), "0:00");
  });

  test("formats negative or NaN gracefully as 0:00", () => {
    assert.equal(formatVideoTime(-10), "0:00");
    assert.equal(formatVideoTime(NaN), "0:00");
  });

  test("formats seconds under a minute with leading zero", () => {
    assert.equal(formatVideoTime(5), "0:05");
    assert.equal(formatVideoTime(45), "0:45");
  });

  test("formats minutes and seconds", () => {
    assert.equal(formatVideoTime(65), "1:05");
    assert.equal(formatVideoTime(125), "2:05");
    assert.equal(formatVideoTime(599), "9:59");
  });

  test("formats hours, minutes and seconds", () => {
    assert.equal(formatVideoTime(3600), "1:00:00");
    assert.equal(formatVideoTime(3665), "1:01:05");
    assert.equal(formatVideoTime(5280), "1:28:00");
  });
});

describe("getNextPlaybackRate", () => {
  test("cycles through standard playback speeds", () => {
    assert.equal(getNextPlaybackRate(0.75), 1);
    assert.equal(getNextPlaybackRate(1), 1.25);
    assert.equal(getNextPlaybackRate(1.25), 1.5);
    assert.equal(getNextPlaybackRate(1.5), 2);
    assert.equal(getNextPlaybackRate(2), 0.75);
  });

  test("falls back to initial rate if unknown rate is provided", () => {
    assert.equal(getNextPlaybackRate(3), 0.75);
  });
});

describe("clampSeekTime", () => {
  test("clamps negative seek time to 0", () => {
    assert.equal(clampSeekTime(-5, 100), 0);
  });

  test("clamps seek time beyond duration to duration", () => {
    assert.equal(clampSeekTime(150, 100), 100);
  });

  test("leaves valid time unchanged", () => {
    assert.equal(clampSeekTime(45, 100), 45);
  });
});

describe("parseVideoUrl with controls=0", () => {
  test("embedUrl contains controls=0 and enablejsapi=1", () => {
    const parsed = parseVideoUrl("https://www.youtube.com/watch?v=9602Yzvd7ik", 30);
    assert.ok(parsed);
    assert.ok(parsed.embedUrl.includes("controls=0"));
    assert.ok(parsed.embedUrl.includes("enablejsapi=1"));
    assert.ok(parsed.embedUrl.includes("&start=30"));
  });
});

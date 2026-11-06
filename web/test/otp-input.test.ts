import { describe, it } from "node:test";
import assert from "node:assert";

/**
 * Pure helper tests for OTP input logic:
 * - Digit sanitization
 * - Auto-advancement index calculation
 * - Cooldown formatting
 */
function sanitizeOtpInput(raw: string, length = 6): string {
  return raw.replace(/\D/g, "").slice(0, length);
}

function calculateNextFocusIndex(currentVal: string, length = 6): number {
  if (currentVal.length >= length) return length - 1;
  return currentVal.length;
}

function distributePastedCode(pasted: string, length = 6): string[] {
  const clean = sanitizeOtpInput(pasted, length);
  return Array.from({ length }, (_, i) => clean[i] || "");
}

describe("OTP Input Logic & Processing", () => {
  it("strips non-numeric characters and clamps to length", () => {
    assert.strictEqual(sanitizeOtpInput("12a-34b5"), "12345");
    assert.strictEqual(sanitizeOtpInput("987654321", 6), "987654");
    assert.strictEqual(sanitizeOtpInput(""), "");
  });

  it("calculates next focus index correctly", () => {
    assert.strictEqual(calculateNextFocusIndex(""), 0);
    assert.strictEqual(calculateNextFocusIndex("123"), 3);
    assert.strictEqual(calculateNextFocusIndex("123456", 6), 5);
  });

  it("distributes pasted 6-digit codes cleanly across cells", () => {
    const cells = distributePastedCode(" 842-190 ");
    assert.deepStrictEqual(cells, ["8", "4", "2", "1", "9", "0"]);
  });

  it("handles partial paste gracefully", () => {
    const cells = distributePastedCode("735");
    assert.deepStrictEqual(cells, ["7", "3", "5", "", "", ""]);
  });
});

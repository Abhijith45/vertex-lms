import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isSessionExistsError } from "../lib/utils/sign-in.ts";

describe("isSessionExistsError", () => {
  it("detects a top-level session_exists code", () => {
    assert.equal(isSessionExistsError({ code: "session_exists" }), true);
  });

  it("detects session_exists inside an API response error list", () => {
    const error = {
      code: "api_response_error",
      errors: [{ code: "form_code_incorrect" }, { code: "session_exists" }],
    };
    assert.equal(isSessionExistsError(error), true);
  });

  it("ignores other verification errors", () => {
    assert.equal(isSessionExistsError({ code: "form_code_incorrect" }), false);
    assert.equal(isSessionExistsError({ errors: [{ code: "verification_expired" }] }), false);
  });

  it("ignores empty and non-object values", () => {
    assert.equal(isSessionExistsError(null), false);
    assert.equal(isSessionExistsError(undefined), false);
    assert.equal(isSessionExistsError("session_exists"), false);
    assert.equal(isSessionExistsError({ errors: [null] }), false);
  });
});

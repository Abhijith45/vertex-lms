import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  THEME_STORAGE_KEY,
  DEFAULT_THEME,
  isValidTheme,
  resolveTheme,
  getNextTheme,
  type Theme,
  type ResolvedTheme,
} from "../lib/utils/theme.ts";

describe("Theme System & Utilities", () => {
  describe("THEME_STORAGE_KEY & DEFAULT_THEME", () => {
    test("uses consistent storage key for localStorage", () => {
      assert.equal(THEME_STORAGE_KEY, "vertex-theme");
    });

    test("defaults application theme to 'light'", () => {
      assert.equal(DEFAULT_THEME, "light");
    });
  });

  describe("isValidTheme", () => {
    test("accepts valid theme values", () => {
      assert.equal(isValidTheme("light"), true);
      assert.equal(isValidTheme("dark"), true);
      assert.equal(isValidTheme("system"), true);
    });

    test("rejects invalid or unknown theme strings", () => {
      assert.equal(isValidTheme("blue"), false);
      assert.equal(isValidTheme(""), false);
      assert.equal(isValidTheme(null), false);
      assert.equal(isValidTheme(undefined), false);
      assert.equal(isValidTheme(123), false);
      assert.equal(isValidTheme({}), false);
    });
  });

  describe("resolveTheme", () => {
    test("explicit 'light' theme always resolves to 'light' regardless of OS preference", () => {
      assert.equal(resolveTheme("light", false), "light");
      assert.equal(resolveTheme("light", true), "light");
    });

    test("explicit 'dark' theme always resolves to 'dark' regardless of OS preference", () => {
      assert.equal(resolveTheme("dark", false), "dark");
      assert.equal(resolveTheme("dark", true), "dark");
    });

    test("'system' theme follows system OS dark mode preference", () => {
      assert.equal(resolveTheme("system", false), "light");
      assert.equal(resolveTheme("system", true), "dark");
    });
  });

  describe("getNextTheme", () => {
    test("switches from 'light' to 'dark'", () => {
      const next = getNextTheme("light");
      assert.equal(next, "dark");
    });

    test("switches from 'dark' to 'light'", () => {
      const next = getNextTheme("dark");
      assert.equal(next, "light");
    });

    test("toggling twice returns to the original theme", () => {
      const initial: ResolvedTheme = "light";
      const toggledOnce = getNextTheme(initial);
      const toggledTwice = getNextTheme(toggledOnce);
      assert.equal(toggledTwice, initial);
    });
  });

  describe("Theme State Machine Simulation", () => {
    test("user cycles through theme toggle actions correctly starting from default light theme", () => {
      let activeTheme: Theme = DEFAULT_THEME;
      const systemPrefersDark = true; // Even if OS prefers dark, default light theme stays light!

      // Initial state: default light mode
      let resolved = resolveTheme(activeTheme, systemPrefersDark);
      assert.equal(resolved, "light");

      // User clicks theme toggle button -> toggles from resolved 'light' to 'dark'
      activeTheme = getNextTheme(resolved);
      assert.equal(activeTheme, "dark");
      resolved = resolveTheme(activeTheme, systemPrefersDark);
      assert.equal(resolved, "dark");

      // User clicks theme toggle button again -> toggles from resolved 'dark' to 'light'
      activeTheme = getNextTheme(resolved);
      assert.equal(activeTheme, "light");
      resolved = resolveTheme(activeTheme, systemPrefersDark);
      assert.equal(resolved, "light");
    });

    test("system preference change dynamically reflects when theme is 'system'", () => {
      const activeTheme: Theme = "system";

      // OS switches to dark mode
      assert.equal(resolveTheme(activeTheme, true), "dark");

      // OS switches to light mode
      assert.equal(resolveTheme(activeTheme, false), "light");
    });
  });
});

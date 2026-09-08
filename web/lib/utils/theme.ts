export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "vertex-theme";
export const DEFAULT_THEME: Theme = "light";

/**
 * Validates if a given value is a supported Theme string.
 */
export function isValidTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark" || value === "system";
}

/**
 * Resolves the active theme ("light" | "dark") from user choice and system preference.
 * Defaults to "light" unless explicitly "dark" or set to "system" with dark preference.
 */
export function resolveTheme(
  theme: Theme,
  systemPrefersDark: boolean
): ResolvedTheme {
  if (theme === "dark") return "dark";
  if (theme === "system") return systemPrefersDark ? "dark" : "light";
  return "light";
}

/**
 * Computes the next toggle theme given the currently resolved theme.
 */
export function getNextTheme(currentResolved: ResolvedTheme): ResolvedTheme {
  return currentResolved === "dark" ? "light" : "dark";
}

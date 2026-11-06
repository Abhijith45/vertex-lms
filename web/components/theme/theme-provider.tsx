"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import {
  type Theme,
  type ResolvedTheme,
  THEME_STORAGE_KEY,
  DEFAULT_THEME,
  isValidTheme,
  resolveTheme,
  getNextTheme,
} from "@/lib/utils/theme";

export type { Theme, ResolvedTheme };

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return DEFAULT_THEME;
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (isValidTheme(saved)) {
      return saved;
    }
  } catch {}
  return DEFAULT_THEME;
}

function getInitialResolvedTheme(theme: Theme): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return resolveTheme(theme, prefersDark);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    getInitialResolvedTheme(getInitialTheme())
  );

  // Synchronize DOM classes and listen to system preference changes
  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function applyDomTheme(resolved: ResolvedTheme) {
      if (resolved === "dark") {
        root.classList.add("dark");
        root.classList.remove("light");
        root.style.colorScheme = "dark";
      } else {
        root.classList.remove("dark");
        root.classList.add("light");
        root.style.colorScheme = "light";
      }
    }

    applyDomTheme(resolvedTheme);

    const handleSystemChange = (e: MediaQueryListEvent) => {
      if (theme === "system") {
        const nextResolved: ResolvedTheme = e.matches ? "dark" : "light";
        setResolvedTheme(nextResolved);
        applyDomTheme(nextResolved);
      }
    };

    mediaQuery.addEventListener("change", handleSystemChange);
    return () => mediaQuery.removeEventListener("change", handleSystemChange);
  }, [theme, resolvedTheme]);

  const setTheme = React.useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {}

    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const nextResolved = resolveTheme(newTheme, prefersDark);
    setResolvedTheme(nextResolved);

    if (typeof document !== "undefined") {
      const root = document.documentElement;
      if (nextResolved === "dark") {
        root.classList.add("dark");
        root.classList.remove("light");
        root.style.colorScheme = "dark";
      } else {
        root.classList.remove("dark");
        root.classList.add("light");
        root.style.colorScheme = "light";
      }
    }
  }, []);

  const toggleTheme = React.useCallback(() => {
    const next = getNextTheme(resolvedTheme);
    setTheme(next);
  }, [resolvedTheme, setTheme]);

  const contextValue = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      toggleTheme,
    }),
    [theme, resolvedTheme, setTheme, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

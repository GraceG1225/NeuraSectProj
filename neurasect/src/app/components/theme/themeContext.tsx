'use client';

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type PageKey = "home" | "explainability" | "datasets" | "datasetDetail";

export type ThemeId = "sky" | "lavender" | "mint" | "peach" | "sunrise";

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  description: string;
  background: string;
  headingGradient: string;
  buttonGradient: string;
  bubbleColors: [string, string, string];
}

const THEME_PRESETS: Record<ThemeId, ThemeDefinition> = {
  sky: {
    id: "sky",
    name: "Sky Breeze",
    description: "Blue and lilac pastel gradient",
    background: "linear-gradient(135deg, #e0f2fe 0%, #eef2ff 40%, #f3e8ff 100%)",
    headingGradient: "linear-gradient(90deg, #2563eb, #8b5cf6)",
    buttonGradient: "linear-gradient(90deg, #3b82f6, #9333ea)",
    bubbleColors: ["rgba(191, 219, 254, 0.6)", "rgba(216, 180, 254, 0.55)", "rgba(244, 231, 255, 0.55)"],
  },
  lavender: {
    id: "lavender",
    name: "Lavender Haze",
    description: "Soft purple with blush undertones",
    background: "linear-gradient(135deg, #f4f0ff 0%, #fdf4ff 45%, #ffe4f3 100%)",
    headingGradient: "linear-gradient(90deg, #a855f7, #ec4899)",
    buttonGradient: "linear-gradient(90deg, #8b5cf6, #f472b6)",
    bubbleColors: ["rgba(212, 180, 252, 0.5)", "rgba(251, 207, 232, 0.55)", "rgba(233, 213, 255, 0.55)"],
  },
  mint: {
    id: "mint",
    name: "Fresh Mint",
    description: "Minty greens with a cool teal finish",
    background: "linear-gradient(135deg, #ecfeff 0%, #d1fae5 45%, #dbeafe 100%)",
    headingGradient: "linear-gradient(90deg, #14b8a6, #22c55e)",
    buttonGradient: "linear-gradient(90deg, #0ea5e9, #22c55e)",
    bubbleColors: ["rgba(167, 243, 208, 0.55)", "rgba(125, 211, 252, 0.5)", "rgba(187, 247, 208, 0.55)"],
  },
  peach: {
    id: "peach",
    name: "Peach Sorbet",
    description: "Warm peach with soft coral",
    background: "linear-gradient(135deg, #fff7ed 0%, #ffe4e6 45%, #fff1f2 100%)",
    headingGradient: "linear-gradient(90deg, #fb923c, #f97316)",
    buttonGradient: "linear-gradient(90deg, #f97316, #ec4899)",
    bubbleColors: ["rgba(254, 215, 170, 0.55)", "rgba(255, 228, 230, 0.6)", "rgba(254, 202, 202, 0.55)"],
  },
  sunrise: {
    id: "sunrise",
    name: "Sunrise Glow",
    description: "Soft yellow to pink sunrise hues",
    background: "linear-gradient(135deg, #fef3c7 0%, #ffe4e6 50%, #e0f2fe 100%)",
    headingGradient: "linear-gradient(90deg, #fbbf24, #f472b6)",
    buttonGradient: "linear-gradient(90deg, #f59e0b, #ec4899)",
    bubbleColors: ["rgba(253, 230, 138, 0.6)", "rgba(255, 214, 170, 0.5)", "rgba(254, 215, 170, 0.6)"],
  },
};

const STORAGE_KEY = "neurasect:page-themes";

const DEFAULT_PAGE_THEMES: Record<PageKey, ThemeId> = {
  home: "sky",
  explainability: "lavender",
  datasets: "mint",
  datasetDetail: "sky",
};

type ThemeContextValue = {
  pageThemes: Record<PageKey, ThemeId>;
  setThemeForPage: (page: PageKey, themeId: ThemeId) => void;
  presets: Record<ThemeId, ThemeDefinition>;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [pageThemes, setPageThemes] = useState<Record<PageKey, ThemeId>>(DEFAULT_PAGE_THEMES);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as Partial<Record<PageKey, ThemeId>>;
      setPageThemes((prev) => ({ ...prev, ...parsed }));
    } catch (error) {
      console.warn("Unable to parse saved themes, using defaults.", error);
    }
  }, []);

  const setThemeForPage = (page: PageKey, themeId: ThemeId) => {
    setPageThemes((prev) => {
      const next = { ...prev, [page]: themeId };
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      }
      return next;
    });
  };

  const value = useMemo(
    () => ({
      pageThemes,
      setThemeForPage,
      presets: THEME_PRESETS,
    }),
    [pageThemes],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(page: PageKey) {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  const themeId = ctx.pageThemes[page] ?? DEFAULT_PAGE_THEMES[page];
  const theme = ctx.presets[themeId] ?? ctx.presets[DEFAULT_PAGE_THEMES[page]];

  return {
    theme,
    themeId,
    setThemeForPage: ctx.setThemeForPage,
    presets: ctx.presets,
  };
}

export function useThemeConfig() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useThemeConfig must be used within a ThemeProvider");
  }
  return ctx;
}


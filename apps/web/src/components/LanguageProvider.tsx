"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Lang } from "@/lib/i18n/types";
import { LANG_STORAGE_KEY } from "@/lib/i18n/types";

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readStoredLang(): Lang {
  if (typeof window === "undefined") return "en";
  try {
    const stored = localStorage.getItem(LANG_STORAGE_KEY);
    return stored === "bn" ? "bn" : "en";
  } catch {
    return "en";
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLangState(readStoredLang());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = lang === "bn" ? "bn" : "en";
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
  }, [lang, ready]);

  const setLang = useCallback((next: Lang) => setLangState(next), []);

  const toggleLang = useCallback(() => {
    setLangState((current) => (current === "en" ? "bn" : "en"));
  }, []);

  const value = useMemo(
    () => ({ lang, setLang, toggleLang }),
    [lang, setLang, toggleLang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return ctx;
}

export function useLanguageOptional() {
  return useContext(LanguageContext);
}

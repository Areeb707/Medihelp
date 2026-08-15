"use client";
import { useState, useEffect, useCallback } from "react";
import { translations, Language } from "@/lib/i18n";

/**
 * Global translation hook.
 * - Reads persisted language from localStorage("medhelp_language")
 * - Listens for "medhelp_language_changed" custom events & window "storage" events
 * - Falls back to English when a key is missing in the selected language
 */
export function useTranslation() {
  const [lang, setLang] = useState<Language>("en");

  useEffect(() => {
    const sync = () => {
      if (typeof window === "undefined") return;
      const saved = (localStorage.getItem("medhelp_language") as Language) || "en";
      setLang(saved);
    };
    sync();
    window.addEventListener("medhelp_language_changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("medhelp_language_changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const t = useCallback(
    (key: string): string =>
      translations[lang]?.[key] || translations["en"]?.[key] || key,
    [lang],
  );

  return { t, lang };
}

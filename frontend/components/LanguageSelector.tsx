"use client";
import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { Language } from "@/lib/i18n";
import { IconGlobe, IconCheck } from "@/components/Icons";

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ta", label: "தமிழ் (Tamil)", flag: "🇮🇳" },
  { code: "hi", label: "हिन्दी (Hindi)", flag: "🇮🇳" },
];

export default function LanguageSelector() {
  const { lang } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLangObj = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeLanguage = (newLang: Language) => {
    localStorage.setItem("medhelp_language", newLang);
    window.dispatchEvent(new Event("medhelp_language_changed"));
    window.dispatchEvent(new CustomEvent("medhelp_language_changed", { detail: newLang }));
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left z-50 pointer-events-auto" ref={dropdownRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="px-3.5 py-2 rounded-xl bg-[#0c1120] border border-line/60 hover:border-teal/50 text-ink-soft hover:text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm relative z-50 pointer-events-auto"
        title="Select Language"
      >
        <IconGlobe size={15} className="text-teal" />
        <span>{currentLangObj.label}</span>
        <span className="text-[10px] text-ink-muted ml-0.5">▼</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#0c1120] border border-[#1a2436] shadow-2xl z-50 py-1.5 overflow-hidden animate-fade-in pointer-events-auto">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                changeLanguage(l.code);
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                changeLanguage(l.code);
              }}
              className={`w-full px-3.5 py-2.5 text-left text-xs font-medium flex items-center justify-between transition-colors hover:bg-teal/10 cursor-pointer ${
                lang === l.code ? "text-teal bg-teal/10 font-bold" : "text-ink-soft hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-sm">{l.flag}</span>
                <span>{l.label}</span>
              </div>
              {lang === l.code && <IconCheck size={14} className="text-teal" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

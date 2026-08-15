"use client";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import AmbientBackground from "@/components/AmbientBackground";
import LanguageSelector from "@/components/LanguageSelector";
import {
  IconBrain, IconDatabase, IconActivity, IconZap, IconShield,
  IconCheck, IconLock
} from "@/components/Icons";

export default function LandingPage() {
  const { t } = useTranslation();

  const FEATURES = [
    { Icon: IconDatabase, color: "#00d4a0", bg: "#001f17", title: t("feat_memory_title"), desc: t("feat_memory_desc") },
    { Icon: IconActivity, color: "#8b7ff5", bg: "#130f2e", title: t("feat_reasoning_title"), desc: t("feat_reasoning_desc") },
    { Icon: IconZap,      color: "#f0a030", bg: "#1e1200", title: t("feat_briefs_title"),    desc: t("feat_briefs_desc") },
    { Icon: IconShield,   color: "#4090e0", bg: "#041525", title: t("feat_privacy_title"),   desc: t("feat_privacy_desc") },
  ];

  const HIGHLIGHTS = [
    t("highlight_1"),
    t("highlight_2"),
    t("highlight_3"),
    t("highlight_4"),
  ];

  return (
    <div className="min-h-screen bg-[#030710] text-white flex flex-col font-sans relative overflow-x-hidden">
      {/* ── SIMPLE AMBIENT GREEN LIGHT BACKGROUND ── */}
      <AmbientBackground />

      {/* ── NAVBAR (SCALED LOGO LOCKUP) ─────────────────────── */}
      <header className="w-[92vw] max-w-[1520px] mx-auto py-6 flex items-center justify-between z-30 relative pointer-events-auto border-b border-line/40">
        {/* Large Logo Lockup Matching Reference */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br from-teal to-emerald-700 flex items-center justify-center flex-shrink-0 shadow-[0_0_30px_rgba(0,212,160,0.35)] border border-teal/40">
            <IconBrain size={38} className="text-white lg:hidden" />
            <IconBrain size={44} className="text-white hidden lg:block" />
          </div>
          <div>
            <div className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-none">
              Medhelp AI
            </div>
            <div className="text-xs lg:text-sm text-ink-muted mt-1.5 font-medium">
              Powered by Cognee Cloud
            </div>
          </div>
        </div>

        {/* Auth Action Buttons with Language Selector */}
        <div className="flex items-center gap-3">
          <LanguageSelector />
          <Link
            href="/login"
            className="px-5 py-2.5 rounded-xl border border-teal/40 text-teal hover:border-teal hover:bg-teal/10 text-[13px] font-bold transition-all"
          >
            {t("nav_login")}
          </Link>
          <Link
            href="/signup"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal to-sky-500 text-[#06080f] text-[13px] font-extrabold shadow-lg shadow-teal/20 hover:opacity-90 transition-all"
          >
            {t("nav_signup")}
          </Link>
        </div>
      </header>

      {/* ── MAIN LANDING CONTENT (WIDE RESPONSIVE CONTAINER) ── */}
      <main className="flex-1 w-[92vw] max-w-[1520px] mx-auto pt-10 lg:pt-14 pb-16 flex flex-col z-10">
        
        {/* Badge */}
        <div className="self-start mb-7 inline-flex items-center gap-2 border border-teal/30 rounded-full px-4 py-1.5 bg-teal-dark/40">
          <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
          <span className="text-[10px] font-extrabold tracking-widest uppercase text-teal">
            {t("login_badge")}
          </span>
        </div>

        {/* Hero Headline */}
        <div className="mb-5 max-w-4xl">
          <h1 className="text-4xl md:text-5xl lg:text-[56px] font-black leading-[1.08] tracking-tight text-white mb-1.5">
            {t("login_welcome_title")}{" "}
            <span className="text-white">{t("login_welcome_where")}</span>
          </h1>
          <h1 className="text-4xl md:text-5xl lg:text-[56px] font-black leading-[1.08] tracking-tight bg-gradient-to-r from-teal via-sky-400 to-indigo-400 bg-clip-text text-transparent">
            {t("login_welcome_never_ends")}
          </h1>
        </div>

        {/* Subtext */}
        <p className="text-base lg:text-lg text-ink-soft leading-relaxed max-w-3xl mb-10 border-l-2 border-teal/40 pl-4 font-normal">
          {t("login_subtext")}
        </p>

        {/* Key Metrics / Stats Row (Full Container Width) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-bg-card/90 backdrop-blur-md border border-line rounded-2xl p-6 mb-10 shadow-xl w-full">
          {[
            { v: "∞", l: t("stat_memory") },
            { v: "<5s", l: t("stat_brief") },
            { v: "0", l: t("stat_forgotten") },
            { v: "100%", l: t("stat_recall") },
          ].map((s, i) => (
            <div
              key={s.l}
              className={`p-2 lg:p-4 ${i < 3 ? "lg:border-r border-line/60" : ""}`}
            >
              <div className="text-3xl lg:text-4xl font-black text-teal tracking-tight">{s.v}</div>
              <div className="text-xs font-bold text-ink-muted uppercase tracking-wider mt-1.5">
                {s.l}
              </div>
            </div>
          ))}
        </div>

        {/* Feature Cards Grid (2 Equal Columns - Full Container Width) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 w-full">
          {FEATURES.map(({ Icon, color, bg, title, desc }) => (
            <div
              key={title}
              className="bg-bg-card/90 backdrop-blur-md border border-line rounded-2xl p-6 lg:p-7 flex gap-5 items-start hover:border-teal/40 transition-all shadow-md w-full"
              style={{ backgroundColor: bg }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${color}20` }}
              >
                <Icon size={22} color={color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-base font-bold mb-1.5" style={{ color }}>
                  {title}
                </div>
                <div className="text-xs lg:text-sm text-ink-soft leading-relaxed">
                  {desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Highlight Checklist Grid (2 Equal Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12 w-full">
          {HIGHLIGHTS.map((h, i) => (
            <div
              key={i}
              className="bg-bg-card/90 backdrop-blur-md border border-line rounded-xl p-4 flex items-center gap-3.5"
            >
              <div className="w-6 h-6 rounded-full bg-teal-dark border border-teal/40 flex items-center justify-center flex-shrink-0">
                <IconCheck size={13} color="#00d4a0" />
              </div>
              <span className="text-xs lg:text-sm text-ink-soft font-medium leading-snug">
                {h}
              </span>
            </div>
          ))}
        </div>

        {/* Call to Action Banner (Full Container Width) */}
        <div className="bg-gradient-to-r from-teal-dark/60 via-bg-card/90 to-bg-card/90 backdrop-blur-md border border-teal/40 rounded-2xl p-7 lg:p-8 flex flex-col md:flex-row items-center justify-between gap-6 mb-10 shadow-2xl w-full">
          <div>
            <h3 className="text-xl font-bold text-white mb-1.5">
              {t("cta_title")}
            </h3>
            <p className="text-xs lg:text-sm text-ink-soft max-w-2xl">
              {t("cta_subtext")}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              href="/signup"
              className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-teal to-sky-500 text-[#06080f] text-xs lg:text-sm font-extrabold shadow-lg shadow-teal/20 hover:opacity-90 transition-all whitespace-nowrap"
            >
              {t("cta_button")}
            </Link>
          </div>
        </div>
      </main>

      {/* ── FOOTER (WIDE CONTAINER) ─────────────────────────── */}
      <footer className="w-[92vw] max-w-[1520px] mx-auto py-6 border-t border-line/40 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-ink-muted z-10">
        <div className="flex items-center gap-2">
          <IconLock size={12} />
          <span>{t("login_footer_privacy")}</span>
        </div>
        <div>
          © {new Date().getFullYear()} Medhelp AI · Powered by Cognee Cloud
        </div>
      </footer>
    </div>
  );
}

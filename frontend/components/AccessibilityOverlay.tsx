"use client";
import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Language } from "@/lib/i18n";
import { useTranslation } from "@/hooks/useTranslation";
import { api } from "@/lib/api";
import {
  IconBrain, IconVolume2, IconHelpCircle, IconX,
  IconChevronRight, IconChevronLeft, IconCheckCircle, IconAlertTriangle
} from "./Icons";

export default function AccessibilityOverlay() {
  const pathname = usePathname();
  const router = useRouter();
  const { t, lang } = useTranslation();
  const [showHelp, setShowHelp] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioObj, setAudioObj] = useState<HTMLAudioElement | null>(null);
  const [audioError, setAudioError] = useState("");
  const [pageExplanation, setPageExplanation] = useState<{ title?: string; en?: string; ta?: string; hi?: string } | null>(null);

  useEffect(() => {
    // Check if first-time user tour has been completed
    const tourDone = localStorage.getItem("medhelp_tour_completed");
    if (!tourDone) {
      setShowTour(true);
    }

    const handleOpenHelp = () => openHelpModal();
    const handleOpenTour = () => { setShowTour(true); setTourStep(0); };

    window.addEventListener("medhelp_open_help", handleOpenHelp);
    window.addEventListener("medhelp_open_tour", handleOpenTour);

    return () => {
      window.removeEventListener("medhelp_open_help", handleOpenHelp);
      window.removeEventListener("medhelp_open_tour", handleOpenTour);
    };
  }, [pathname]);

  const changeLanguage = (newLang: Language) => {
    localStorage.setItem("medhelp_language", newLang);
    window.dispatchEvent(new Event("medhelp_language_changed"));
  };

  const handlePlayAudio = async (textToSpeak: string) => {
    if (audioObj) {
      audioObj.pause();
      setAudioObj(null);
    }
    setAudioError("");
    setAudioLoading(true);

    try {
      const res = await api.tts(textToSpeak);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ detail: "Voice service unavailable" }));
        throw new Error(errData.detail || "Audio playback failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      setAudioObj(audio);
      audio.play();
      audio.onended = () => setAudioObj(null);
    } catch (err: any) {
      console.warn("TTS failed:", err.message);
      setAudioError(err.message || "Voice playback unavailable.");
    } finally {
      setAudioLoading(false);
    }
  };

  const stopAudio = () => {
    if (audioObj) {
      audioObj.pause();
      setAudioObj(null);
    }
  };

  const openHelpModal = async () => {
    setShowHelp(true);
    try {
      const res = await api.explainPage(pathname);
      setPageExplanation(res);
    } catch {
      setPageExplanation({
        title: "Page Assistance",
        en: "This page provides patient information and tools to manage clinical memory.",
        ta: "இந்தப் பக்கம் நோயாளி தகவல் மற்றும் மருத்துவ நினைவகத்தை நிர்வகிக்கும் கருவிகளை வழங்குகிறது.",
        hi: "यह पृष्ठ रोगी की जानकारी और नैदानिक स्मृति को प्रबंधित करने के उपकरण प्रदान करता है।"
      });
    }
  };

  const TOUR_STEPS = [
    { title: t("guide_step_1_title"), desc: t("guide_step_1_desc") },
    { title: t("guide_step_2_title"), desc: t("guide_step_2_desc") },
    { title: t("guide_step_3_title"), desc: t("guide_step_3_desc") },
    { title: t("guide_step_4_title"), desc: t("guide_step_4_desc") },
    { title: t("guide_step_5_title"), desc: t("guide_step_5_desc") },
    { title: t("guide_step_6_title"), desc: t("guide_step_6_desc") },
  ];

  const completeTour = () => {
    setShowTour(false);
    localStorage.setItem("medhelp_tour_completed", "true");
  };

  const currentExplanation = pageExplanation
    ? (lang === "hi" ? (pageExplanation.hi || pageExplanation.en) : lang === "ta" ? (pageExplanation.ta || pageExplanation.en) : pageExplanation.en)
    : "";

  return (
    <>

      {/* ── Need Help Modal ── */}
      {showHelp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,.75)", backdropFilter: "blur(4px)" }}
          onClick={() => setShowHelp(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 border border-teal/30 shadow-2xl animate-scale-in"
            style={{ background: "#0c1018" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-dark border border-teal/30 flex items-center justify-center text-teal">
                  <IconHelpCircle size={18} />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-white">
                    {pageExplanation?.title || t("need_help")}
                  </h3>
                  <p className="text-[10px] text-ink-muted">{t("contextual_assistance")}</p>
                </div>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-bg-hover text-ink-muted text-white"
              >
                <IconX size={16} />
              </button>
            </div>

            {/* Explanation card */}
            <div className="bg-bg-input border border-line rounded-xl p-4 mb-4">
              <div className="text-[11px] font-semibold text-teal uppercase tracking-widest mb-1">
                {t("explain_this_page")}
              </div>
              <p className="text-[13px] text-white leading-relaxed">
                {currentExplanation || t("loading")}
              </p>
            </div>

            {/* Quick Action Options */}
            <div className="space-y-2">
              <div className="text-[10px] uppercase font-bold tracking-widest text-ink-muted mb-1">{t("support_actions")}</div>
              <button
                onClick={() => {
                  setShowHelp(false);
                  router.push("/faq");
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl bg-bg-card border border-line hover:border-teal/40 text-[12px] font-medium text-white flex items-center justify-between transition-all"
              >
                <span>📖 {t("open_faq")}</span>
                <IconChevronRight size={14} className="text-ink-muted" />
              </button>

              <button
                onClick={() => alert("To report an issue or contact support, please notify your facility manager or clinic administrator.")}
                className="w-full text-left px-3 py-2.5 rounded-xl bg-bg-card border border-line hover:border-teal/40 text-[12px] font-medium text-white flex items-center justify-between transition-all"
              >
                <span>📞 {t("contact_support")}</span>
                <IconChevronRight size={14} className="text-ink-muted" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Guided Experience Tour Modal ── */}
      {showTour && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,.85)", backdropFilter: "blur(6px)" }}
        >
          <div
            className="w-full max-w-lg rounded-2xl p-6 border border-teal/40 shadow-2xl animate-scale-in"
            style={{ background: "#0b1019" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <IconBrain size={20} className="text-teal" />
                <span className="text-[14px] font-bold text-white">{t("guide_title")}</span>
              </div>
              <span className="text-[11px] font-bold text-teal bg-teal-dark px-2.5 py-1 rounded-full border border-teal/30">
                Step {tourStep + 1} of {TOUR_STEPS.length}
              </span>
            </div>

            <div className="my-6 p-5 rounded-2xl bg-bg-card border border-teal/20">
              <h4 className="text-[16px] font-bold text-teal mb-2">
                {TOUR_STEPS[tourStep].title}
              </h4>
              <p className="text-[13px] text-ink-muted leading-relaxed">
                {TOUR_STEPS[tourStep].desc}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={completeTour}
                className="text-[12px] text-ink-muted hover:text-white px-2 py-1"
              >
                {t("skip")}
              </button>

              <div className="flex items-center gap-2">
                {tourStep > 0 && (
                  <button
                    onClick={() => setTourStep((prev) => prev - 1)}
                    className="btn-secondary py-2 text-[12px] flex items-center gap-1"
                  >
                    <IconChevronLeft size={14} />
                    {t("previous")}
                  </button>
                )}

                {tourStep < TOUR_STEPS.length - 1 ? (
                  <button
                    onClick={() => setTourStep((prev) => prev + 1)}
                    className="btn-primary py-2 text-[12px] flex items-center gap-1"
                  >
                    {t("next")}
                    <IconChevronRight size={14} />
                  </button>
                ) : (
                  <button
                    onClick={completeTour}
                    className="btn-primary py-2 text-[12px] flex items-center gap-1 bg-teal"
                  >
                    <IconCheckCircle size={14} />
                    {t("confirm")}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

"use client";
import { useState, useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import { useTranslation } from "@/hooks/useTranslation";
import { FAQ_DATA, FAQItem } from "@/lib/faqData";
import { api } from "@/lib/api";
import {
  IconSearch, IconVolume2, IconCheckCircle, IconX,
  IconAlertTriangle, IconChevronRight, IconHelpCircle,
  IconShield, IconUser, IconHeart, IconMessageSquare, IconActivity
} from "@/components/Icons";

export default function FAQPage() {
  const { t, lang } = useTranslation();

  // Search & Category State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Accordion open state (map of item.id -> boolean)
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    doc_1: true,
    pat_1: true,
    ai_3: true,
  });

  // Audio state
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioObj, setAudioObj] = useState<HTMLAudioElement | null>(null);
  const [audioLoadingId, setAudioLoadingId] = useState<string | null>(null);

  // Feedback state (map of item.id -> "yes" | "no")
  const [feedback, setFeedback] = useState<Record<string, "yes" | "no">>({});

  // Detailed negative feedback selection (map of item.id -> selected option)
  const [negOption, setNegOption] = useState<Record<string, string>>({});

  // Report modal state
  const [reportModalItem, setReportModalItem] = useState<FAQItem | null>(null);
  const [reportCategory, setReportCategory] = useState("incorrect");
  const [reportDesc, setReportDesc] = useState("");
  const [reportSuccess, setReportSuccess] = useState(false);

  // Category definitions
  const CATEGORIES = [
    { id: "all", label: t("faq_cat_all") },
    { id: "doctors", label: t("faq_cat_doctors") },
    { id: "patients", label: t("faq_cat_patients") },
    { id: "health_workers", label: t("faq_cat_workers") },
    { id: "ai", label: t("faq_cat_ai") },
    { id: "privacy", label: t("faq_cat_privacy") },
    { id: "accessibility", label: t("faq_cat_access") },
  ];

  // Toggle Accordion item
  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filtered FAQ Items based on Search Query & Selected Category
  const filteredFAQs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return FAQ_DATA.filter((item) => {
      // Category match
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
      }
      // Query match
      if (q) {
        const questionText = (item.question[lang] || item.question.en).toLowerCase();
        const answerText = (item.answer[lang] || item.answer.en).toLowerCase();
        const techNoteText = (item.technicalNote?.[lang] || item.technicalNote?.en || "").toLowerCase();
        return questionText.includes(q) || answerText.includes(q) || techNoteText.includes(q);
      }
      return true;
    });
  }, [searchQuery, selectedCategory, lang]);

  // Audio Playback handler using ElevenLabs Multilingual V2 with Web Speech fallback
  const playAudioAnswer = async (item: FAQItem) => {
    // If clicking the currently playing item, stop audio
    if (playingId === item.id) {
      if (audioObj) audioObj.pause();
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setAudioObj(null);
      setPlayingId(null);
      return;
    }

    // Stop any existing playback
    if (audioObj) audioObj.pause();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setAudioObj(null);
    setPlayingId(null);

    const textToSpeak = item.answer[lang] || item.answer.en;
    setAudioLoadingId(item.id);

    try {
      // 1. Primary: Server-side ElevenLabs Multilingual V2 TTS
      const res = await api.tts(textToSpeak);
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({ detail: "ElevenLabs API unavailable" }));
        throw new Error(errJson.detail || "ElevenLabs TTS failed");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      setAudioObj(audio);
      setPlayingId(item.id);
      
      audio.play();
      audio.onended = () => {
        setPlayingId(null);
        setAudioObj(null);
      };
      audio.onerror = () => {
        setPlayingId(null);
        setAudioObj(null);
      };
    } catch (err: any) {
      console.warn("ElevenLabs TTS notice, falling back to Web Speech API:", err.message);
      
      // 2. Fallback: Browser Web Speech API for offline/unreachable states
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const utter = new SpeechSynthesisUtterance(textToSpeak);
        utter.lang = lang === "hi" ? "hi-IN" : lang === "ta" ? "ta-IN" : "en-US";
        utter.rate = 0.95;
        
        setPlayingId(item.id);
        utter.onend = () => setPlayingId(null);
        utter.onerror = () => setPlayingId(null);
        window.speechSynthesis.speak(utter);
      } else {
        alert(`Voice playback unavailable: ${err.message}`);
      }
    } finally {
      setAudioLoadingId(null);
    }
  };

  // Feedback action handlers
  const handleFeedback = (itemId: string, choice: "yes" | "no") => {
    setFeedback((prev) => ({ ...prev, [itemId]: choice }));
  };

  // Submit Issue Report Modal
  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportModalItem) return;

    // Save report to local storage log safely
    try {
      const existing = JSON.parse(localStorage.getItem("medhelp_faq_reports") || "[]");
      existing.push({
        id: Date.now(),
        faq_id: reportModalItem.id,
        question: reportModalItem.question.en,
        category: reportCategory,
        description: reportDesc,
        created_at: new Date().toISOString(),
      });
      localStorage.setItem("medhelp_faq_reports", JSON.stringify(existing));
    } catch (e) {
      console.error("Failed to store feedback report", e);
    }

    setReportSuccess(true);
    setTimeout(() => {
      setReportSuccess(false);
      setReportModalItem(null);
      setReportDesc("");
    }, 2000);
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-area overflow-y-auto h-screen p-4 md:p-6 pb-24">
        {/* Header */}
        <div className="card mb-5 bg-gradient-to-r from-teal-dark/50 via-bg-card to-bg-card border-teal/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-teal bg-teal/10 px-2.5 py-1 rounded-full border border-teal/30">
                Explainability & Product Guide
              </span>
              <h1 className="text-[22px] font-extrabold text-white mt-2">
                {t("faq_header_title")}
              </h1>
              <p className="text-[13px] text-ink-muted mt-1 max-w-2xl">
                {t("faq_header_subtitle")}
              </p>
            </div>
          </div>

          {/* Real-time Search Input Bar */}
          <div className="mt-4 relative">
            <div className="flex items-center gap-3 bg-bg-input border border-teal/40 rounded-xl px-4 py-3 focus-within:border-teal transition-all">
              <IconSearch size={18} className="text-teal flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("faq_search_placeholder")}
                className="w-full bg-transparent text-[14px] text-white outline-none placeholder:text-ink-muted font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-ink-muted hover:text-white text-[12px] font-semibold"
                >
                  <IconX size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Chips inside Header Card */}
          <div className="mt-4 pt-3 border-t border-line/40 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar relative z-10">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`text-[12px] font-semibold px-4 py-2 rounded-full border whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-teal text-bg-base border-teal shadow-md"
                    : "bg-bg-base/80 border-line text-ink-muted hover:border-teal/40 hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Accordion List */}
        {filteredFAQs.length === 0 ? (
          <div className="card text-center py-16">
            <div className="w-12 h-12 bg-bg-input border border-line rounded-2xl flex items-center justify-center mx-auto mb-3 text-teal">
              <IconSearch size={22} />
            </div>
            <h3 className="text-[15px] font-bold text-white mb-1">{t("faq_no_results")}</h3>
            <p className="text-[12px] text-ink-muted max-w-sm mx-auto mb-4">
              {t("faq_try_another")}
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="btn-secondary text-[12px]"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="max-h-[580px] overflow-y-auto pr-3 mb-6 space-y-3 custom-faq-scroll">
            {filteredFAQs.map((item) => {
              const isOpen = !!openItems[item.id];
              const qText = item.question[lang] || item.question.en;
              const aText = item.answer[lang] || item.answer.en;
              const noteText = item.technicalNote?.[lang] || item.technicalNote?.en;
              const isAudioPlaying = playingId === item.id;
              const isAudioLoading = audioLoadingId === item.id;
              const userFb = feedback[item.id];

              return (
                <div
                  key={item.id}
                  className={`card transition-all border ${
                    isOpen ? "border-teal/40 bg-bg-card" : "border-line hover:border-line-strong"
                  }`}
                >
                  {/* Accordion Question Bar */}
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="w-full text-left flex items-start justify-between gap-4 focus:outline-none"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-[14px] font-extrabold text-teal mt-0.5">Q.</span>
                      <h3 className="text-[14px] font-bold text-white leading-snug">
                        {qText}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-ink-muted px-2 py-0.5 rounded border border-line bg-bg-base/40">
                        {item.category.replace("_", " ")}
                      </span>
                      <IconChevronRight
                        size={16}
                        className={`text-teal transition-transform duration-200 ${
                          isOpen ? "rotate-90" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {/* Accordion Answer Content */}
                  {isOpen && (
                    <div className="mt-4 pt-3 border-t border-line/60 animate-fade-in space-y-4">
                      {/* Answer Text */}
                      <p className="text-[13px] text-ink-soft leading-relaxed pl-7">
                        {aText}
                      </p>

                      {/* Technical Detail (if applicable) */}
                      {noteText && (
                        <div className="ml-7 p-3 rounded-xl bg-teal-dark/30 border border-teal/35 text-[12px] flex items-start gap-2.5 shadow-sm">
                          <IconShield size={15} className="text-teal flex-shrink-0 mt-0.5" />
                          <div className="leading-relaxed text-sky-300 font-normal">
                            <span className="text-teal font-normal mr-1">Technical detail:</span>
                            {noteText.replace(/^Technical detail:\s*/i, "")}
                          </div>
                        </div>
                      )}

                      {/* Controls: Voice Playback + Feedback */}
                      <div className="ml-7 pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-line/40">
                        {/* Audio TTS Button */}
                        <button
                          onClick={() => playAudioAnswer(item)}
                          disabled={isAudioLoading}
                          className="btn-secondary text-[11px] py-1.5 px-3 flex items-center gap-1.5 hover:border-teal/50"
                        >
                          <IconVolume2
                            size={14}
                            className={isAudioPlaying ? "text-teal animate-bounce" : "text-ink-muted"}
                          />
                          <span>
                            {isAudioLoading
                              ? t("loading")
                              : isAudioPlaying
                              ? t("stop_audio")
                              : t("listen")}
                          </span>
                        </button>

                        {/* Explainability Feedback Section */}
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-ink-muted font-medium">
                            {t("faq_helpful_question")}
                          </span>

                          {!userFb ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleFeedback(item.id, "yes")}
                                className="px-2.5 py-1 rounded-lg bg-teal/10 hover:bg-teal/20 text-teal border border-teal/30 text-[11px] font-bold transition-all"
                              >
                                {t("faq_helpful_yes")}
                              </button>
                              <button
                                onClick={() => handleFeedback(item.id, "no")}
                                className="px-2.5 py-1 rounded-lg bg-rose/10 hover:bg-rose/20 text-rose border border-rose/30 text-[11px] font-bold transition-all"
                              >
                                {t("faq_helpful_no")}
                              </button>
                            </div>
                          ) : userFb === "yes" ? (
                            <span className="text-[11px] font-semibold text-teal flex items-center gap-1 bg-teal/10 px-2.5 py-1 rounded-lg border border-teal/30">
                              <IconCheckCircle size={13} /> {t("faq_thanks_helpful")}
                            </span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-semibold text-amber">
                                {t("faq_thanks_feedback")}
                              </span>
                              <button
                                onClick={() => setReportModalItem(item)}
                                className="text-[11px] font-bold text-teal hover:underline flex items-center gap-1"
                              >
                                <IconAlertTriangle size={12} /> {t("faq_report_issue_btn")}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Negative Feedback Options Bar (unfolds when No is clicked) */}
                      {userFb === "no" && (
                        <div className="ml-7 p-3 rounded-xl bg-amber-dark/10 border border-amber/30 text-[11px] text-ink-soft space-y-2">
                          <div className="font-semibold text-amber">{t("faq_unclear_prompt")}</div>
                          <div className="flex flex-wrap gap-2">
                            {[
                              t("faq_opt_too_difficult"),
                              t("faq_opt_incorrect"),
                              t("faq_opt_missing"),
                              t("faq_opt_other"),
                            ].map((opt) => (
                              <button
                                key={opt}
                                onClick={() =>
                                  setNegOption((prev) => ({ ...prev, [item.id]: opt }))
                                }
                                className={`px-2.5 py-1 rounded-lg border text-[10px] font-medium transition-all ${
                                  negOption[item.id] === opt
                                    ? "bg-amber text-bg-base border-amber font-bold"
                                    : "bg-bg-card border-line text-ink-muted hover:border-amber/40"
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Support Section Footer */}
        <div className="card bg-bg-card border-line flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal/15 border border-teal/30 flex items-center justify-center text-teal flex-shrink-0">
              <IconHelpCircle size={20} />
            </div>
            <div>
              <h4 className="text-[14px] font-bold text-white">{t("faq_need_more_help")}</h4>
              <p className="text-[12px] text-ink-muted">{t("faq_cant_find")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setReportModalItem(filteredFAQs[0] || FAQ_DATA[0])}
              className="btn-secondary text-[12px] py-2 px-4"
            >
              {t("faq_report_issue_btn")}
            </button>
          </div>
        </div>

        {/* Global Disclaimer */}
        <div className="mt-6 bg-bg-input border border-line rounded-xl p-4 text-[12px] text-ink-muted leading-relaxed flex items-start gap-2.5">
          <IconShield size={16} className="text-teal flex-shrink-0 mt-0.5" />
          <p>{t("disclaimer")}</p>
        </div>

        {/* Report an Issue Modal */}
        {reportModalItem && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="card max-w-md w-full bg-bg-card border border-teal/40 animate-fade-up">
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-line">
                <div className="flex items-center gap-2">
                  <IconAlertTriangle size={18} className="text-amber" />
                  <h3 className="text-[15px] font-bold text-white">
                    {t("faq_report_modal_title")}
                  </h3>
                </div>
                <button
                  onClick={() => setReportModalItem(null)}
                  className="text-ink-muted hover:text-white"
                >
                  <IconX size={18} />
                </button>
              </div>

              {reportSuccess ? (
                <div className="py-8 text-center space-y-2">
                  <IconCheckCircle size={32} className="text-teal mx-auto" />
                  <div className="text-[14px] font-bold text-white">{t("faq_report_success")}</div>
                </div>
              ) : (
                <form onSubmit={handleSubmitReport} className="space-y-4">
                  <p className="text-[11px] text-ink-muted">
                    {t("faq_report_modal_desc")}
                  </p>

                  <div className="p-2.5 rounded-lg bg-bg-base border border-line text-[11px] text-teal font-medium">
                    Q: {reportModalItem.question[lang] || reportModalItem.question.en}
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-wider text-ink-muted block mb-1">
                      {t("faq_report_cat_label")}
                    </label>
                    <select
                      value={reportCategory}
                      onChange={(e) => setReportCategory(e.target.value)}
                      className="w-full bg-bg-input border border-line text-white text-[12px] rounded-xl px-3 py-2.5 outline-none focus:border-teal"
                    >
                      <option value="incorrect">{t("faq_opt_incorrect")}</option>
                      <option value="unclear">{t("faq_opt_too_difficult")}</option>
                      <option value="missing">{t("faq_opt_missing")}</option>
                      <option value="other">{t("faq_opt_other")}</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-wider text-ink-muted block mb-1">
                      {t("faq_report_desc_label")}
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={reportDesc}
                      onChange={(e) => setReportDesc(e.target.value)}
                      placeholder="Enter specific feedback or details..."
                      className="w-full bg-bg-input border border-line text-white text-[12px] rounded-xl p-3 outline-none focus:border-teal placeholder:text-ink-muted"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setReportModalItem(null)}
                      className="btn-secondary text-[11px]"
                    >
                      {t("cancel")}
                    </button>
                    <button type="submit" className="btn-primary text-[11px]">
                      {t("faq_report_submit_btn")}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

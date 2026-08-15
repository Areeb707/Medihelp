"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { useTranslation } from "@/hooks/useTranslation";
import { IconSend, IconDatabase, IconFileText, IconStethoscope } from "@/components/Icons";
import { api } from "@/lib/api";
import ExplainabilityPanel from "@/components/ExplainabilityPanel";

type Msg = { from: "doc" | "ai"; text: string; sources?: string[]; explainability?: any };

function formatMessage(text: string): string {
  return text.trim();
}

// Render message with clean paragraph spacing and bullet list formatting
function MessageText({ text }: { text: string }) {
  const paragraphs = (text || "").split(/\n\n+/);

  return (
    <div className="flex flex-col gap-3 text-[13px] leading-relaxed text-[#2dd4bf]">
      {paragraphs.map((para, pIdx) => {
        const lines = para.split("\n");
        return (
          <div key={pIdx} className="flex flex-col gap-1">
            {lines.map((line, lIdx) => {
              const trimmed = line.trim();
              if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
                return (
                  <div key={lIdx} className="pl-2 flex items-start gap-1.5">
                    <span className="text-teal font-bold">•</span>
                    <span>{trimmed.substring(2)}</span>
                  </div>
                );
              }
              return <div key={lIdx}>{line}</div>;
            })}
          </div>
        );
      })}
    </div>
  );
}

export default function ChatPage() {
  const router = useRouter();
  const { t, lang } = useTranslation();
  const [patient, setPatient] = useState<any>(null);
  const [msgs,    setMsgs]    = useState<Msg[]>([]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const QUICK = [
    t("quick_q_ibuprofen"),
    t("quick_q_meds"),
    t("quick_q_conflicts"),
    t("quick_q_summary"),
  ];

  useEffect(() => {
    const init = async () => {
      try {
        const doc = localStorage.getItem("medhelp_doctor");
        let saved = localStorage.getItem("medhelp_active_patient");
        let p = saved ? JSON.parse(saved) : null;

        if (p && doc) {
          const docObj = JSON.parse(doc);
          const docName = (docObj?.name || "").trim().toLowerCase();
          const patDoc  = (p?.doctor || "").trim().toLowerCase();
          if (docName && patDoc && patDoc !== docName) {
            p = null;
            localStorage.removeItem("medhelp_active_patient");
          }
        }

        if (!p) {
          const listRes = await api.listPatients();
          const list = listRes.patients || [];
          if (list.length > 0) {
            p = list[0];
            localStorage.setItem("medhelp_active_patient", JSON.stringify(p));
            window.dispatchEvent(new Event("medhelp_patient_changed"));
          }
        }

        if (p) {
          setPatient(p);
          const history = localStorage.getItem(`chat_${p.id}`);
          if (history) setMsgs(JSON.parse(history));
          
          api.getPatient(p.id).then(updated => {
            setPatient(updated);
            localStorage.setItem("medhelp_active_patient", JSON.stringify(updated));
          }).catch(() => {
            localStorage.removeItem("medhelp_active_patient");
            setPatient(null);
          });
        }
      } catch {}
    };
    init();
  }, []);

  // Save to localStorage whenever msgs change
  useEffect(() => {
    if (patient && msgs.length > 0) {
      localStorage.setItem(`chat_${patient.id}`, JSON.stringify(msgs));
    }
  }, [msgs, patient]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, loading]);

  const send = async (question?: string) => {
    const q = (question || input).trim();
    if (!q || !patient || loading) return;
    setInput("");
    setError("");
    setMsgs(m => [...m, { from: "doc", text: q }]);
    setLoading(true);

    try {
      // Append language context if not English so AI responds in selected language
      const queryWithLang = lang !== "en"
        ? `[Please respond in ${lang === "hi" ? "Hindi (हिन्दी)" : "Tamil (தமிழ்)"}] ${q}`
        : q;

      const data = await api.chat(patient.id, queryWithLang);
      setMsgs(m => [...m, {
        from:    "ai",
        text:    data.answer,
        sources: data.sources,
        explainability: data.explainability,
      }]);
    } catch (e: any) {
      setError(e.message || "Chat failed");
      setMsgs(m => [...m, {
        from: "ai",
        text: "Sorry, I couldn't process that. Please try again.",
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    if (!patient) return;
    setMsgs([]);
    localStorage.removeItem(`chat_${patient.id}`);
  };

  const displayPatient = patient || { id: "", name: "Patient", age: "35", gender: "Male", docs: [] };
  const initials = displayPatient.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() || "PT";
  const doctorInitials = (() => {
    try { return JSON.parse(localStorage.getItem("medhelp_doctor") || "{}").initials || "DR"; }
    catch { return "DR"; }
  })();

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-area overflow-hidden">

        {/* Header */}
        <div className="page-header">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-dark border border-teal/30 flex items-center justify-center flex-shrink-0">
              <span className="text-[12px] font-bold text-teal">{initials}</span>
            </div>
            <div>
              <div className="text-[14px] font-semibold text-white">{displayPatient.name} — {t("ai_doctor_chat_title")}</div>
              <div className="text-[10px] text-ink-muted">{displayPatient.age} yrs · {displayPatient.gender}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-teal-dark border border-teal/25 rounded-lg px-3 py-1.5">
              <span className="w-2 h-2 rounded-full bg-teal animate-pulse flex-shrink-0" />
              <span className="text-[11px] font-medium text-teal">
                {t("cognee_memory_active_docs")} · {displayPatient.docs?.length || 0} {t("stat_documents")}
              </span>
            </div>
            {msgs.length > 0 && (
              <button onClick={clearHistory}
                className="btn-ghost text-[11px] px-3 py-1.5 text-ink-muted hover:text-rose">
                {t("clear_chat_history")}
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mx-5 mt-3 bg-rose-dark border border-rose/30 rounded-xl px-4 py-2 text-[12px] text-rose">
            {error}
          </div>
        )}

        {(displayPatient.docs?.length || 0) === 0 && (
          <div className="mx-5 mt-3 bg-amber-dark border border-amber/30 rounded-xl px-4 py-3 text-[12px] text-amber">
            {t("no_docs_uploaded_warning")}
          </div>
        )}

        <div className="flex flex-1 overflow-hidden">

          {/* Chat area */}
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">

              {msgs.length === 0 && (
                <div className="text-center py-16 text-ink-muted">
                  <div className="text-[14px] mb-2 text-white">{t("ask_anything_about_patient")} {displayPatient.name}</div>
                  <div className="text-[12px]">{t("powered_by_cognee_kg")}</div>
                </div>
              )}

              {msgs.map((msg, i) => (
                <div key={i} className={`flex gap-2.5 animate-fade-in ${msg.from === "doc" ? "flex-row-reverse" : "flex-row"}`}>

                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 self-end"
                    style={{
                      background: msg.from === "doc" ? "#1a2436" : "#001f17",
                      border:     msg.from === "doc" ? "1px solid #243044" : "1px solid #00d4a040",
                      color:      msg.from === "doc" ? "#8a9ab8" : "#00d4a0",
                    }}>
                    {msg.from === "doc" ? doctorInitials : "AI"}
                  </div>

                  {/* Bubble */}
                  <div style={{ maxWidth:"78%" }}>
                    {msg.from === "doc" ? (
                      /* Doctor message — RIGHT side, blue card */
                      <div style={{
                        background: "#1a2d4a",
                        border: "1px solid #283a54",
                        borderRadius: "14px 14px 4px 14px",
                        padding: "10px 14px",
                        color: "#e2eaf4",
                        fontSize: "13px",
                      }}>
                        {msg.text}
                      </div>
                    ) : (
                      /* AI message — LEFT side, dark green card */
                      <>
                        <div style={{
                          background: "#05261b",
                          border: "1px solid rgba(0, 212, 160, 0.25)",
                          borderRadius: "4px 14px 14px 14px",
                          padding: "14px 18px",
                          color: "#2dd4bf",
                        }}>
                          <MessageText text={msg.text} />
                        </div>
                        <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-teal/80 bg-[#001f17] border border-teal/20 rounded px-2.5 py-1 w-fit">
                          <IconDatabase size={10} className="text-teal flex-shrink-0" />
                          <span>{t("source_graph_label")}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div className="flex gap-2.5 items-end flex-row animate-fade-in">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                    style={{ background:"#001f17", border:"1px solid #00d4a040", color:"#00d4a0" }}>
                    AI
                  </div>
                  <div style={{
                    background: "#001f17",
                    border: "1px solid rgba(0,212,160,0.2)",
                    borderRadius: "4px 16px 16px 16px",
                    padding: "14px 18px",
                  }}>
                    <div className="flex gap-1.5">
                      {[0,1,2].map(d => (
                        <div key={d} className="w-2 h-2 rounded-full bg-teal"
                          style={{ animation:`bounce 1.2s ${d*0.2}s ease-in-out infinite` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick chips */}
            <div className="px-5 py-2 flex gap-2 flex-wrap border-t border-line">
              {QUICK.map(q => (
                <button key={q} onClick={() => send(q)}
                  className="text-[11px] text-ink-soft bg-bg-input border border-line-strong rounded-full px-3 py-1.5 cursor-pointer hover:border-teal/40 hover:text-teal transition-all">
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="px-5 py-3 border-t border-line flex gap-3">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && send()}
                placeholder={`${t("ask_about_health")}`}
                disabled={loading}
                className="flex-1 bg-bg-input border border-line-strong rounded-xl px-4 py-2.5 text-[13px] text-white placeholder:text-ink-muted outline-none focus:border-teal/40 transition-all"
              />
              <button onClick={() => send()} disabled={loading} className="btn-primary px-4">
                <IconSend size={15} />
              </button>
            </div>
          </div>

          {/* Right panel — docs */}
          <div className="w-[180px] bg-bg-input border-l border-line flex flex-col flex-shrink-0 overflow-y-auto">
            <div className="px-3 pt-3 pb-2 border-b border-line">
              <div className="text-[9px] font-bold text-ink-muted uppercase tracking-widest">{t("patient_docs_sidebar")}</div>
            </div>
            <div className="px-3 py-2 flex flex-col gap-1.5">
              {(displayPatient.docs?.length || 0) > 0 ? displayPatient.docs.map((doc: any, i: number) => (
                <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-bg-card border border-line">
                  <IconFileText size={14} color="#00d4a0" className="flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[11px] font-medium text-white leading-tight" style={{ wordBreak:"break-all" }}>
                      {doc.name?.slice(0, 20)}{doc.name?.length > 20 ? "..." : ""}
                    </div>
                    <div className="text-[10px] text-ink-muted mt-0.5">{doc.chunks} {t("stat_chunks")}</div>
                  </div>
                </div>
              )) : (
                <div className="text-[11px] text-ink-muted text-center py-4">{t("no_docs_yet_sidebar")}</div>
              )}
            </div>
          </div>
        </div>

        <style>{`
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
        `}</style>
      </main>
    </div>
  );
}

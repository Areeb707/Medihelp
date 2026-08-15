"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { useTranslation } from "@/hooks/useTranslation";
import { IconRefresh, IconDatabase, IconMessageCircle, IconSparkles } from "@/components/Icons";
import Link from "next/link";
import { api } from "@/lib/api";

export default function BriefPage() {
  const router = useRouter();
  const { t }    = useTranslation();
  const [patient,     setPatient]     = useState<any>(null);
  const [brief,       setBrief]       = useState<any>(null);
  const [loading,     setLoading]     = useState(false);
  const [refreshing,  setRefreshing]  = useState(false);
  const [error,       setError]       = useState("");

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

          api.getPatient(p.id).then(updated => {
            setPatient(updated);
            localStorage.setItem("medhelp_active_patient", JSON.stringify(updated));
          }).catch(() => {
            localStorage.removeItem("medhelp_active_patient");
            setPatient(null);
          });

          const cached = localStorage.getItem(`brief_${p.id}`);
          if (cached) {
            try { setBrief(JSON.parse(cached)); } catch {}
          }
        }
      } catch {}
    };
    init();
  }, []);

  const generateBrief = async (isRefresh = false) => {
    if (!patient) return;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError("");

    try {
      const data = await api.getBrief(patient.id);
      setBrief(data.brief);
      localStorage.setItem(`brief_${patient.id}`, JSON.stringify(data.brief));
    } catch (e: any) {
      setError(e.message || "Failed to generate brief. Upload documents first.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const COLORS: Record<number, { color: string; bg: string }> = {
    1: { color:"#00d4a0", bg:"#001f17" },
    2: { color:"#4090e0", bg:"#041525" },
    3: { color:"#e05a3a", bg:"#280e06" },
    4: { color:"#f0a030", bg:"#1e1200" },
    5: { color:"#8b7ff5", bg:"#130f2e" },
  };

  const riskColor = brief?.risk_level === "High" ? "#e05a3a"
                  : brief?.risk_level === "Low"  ? "#00d4a0"
                  : "#f0a030";

  const displayPatient = patient || { id: "", name: "Patient", age: "—", gender: "—", docs: [] };

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-area">
        <div className="page-header">
          <div>
            <div className="text-[17px] font-bold text-white">{t("pre_visit_brief_title")}</div>
            <div className="text-[11px] text-ink-muted mt-0.5">
              {t("ai_generated_summary_subtitle")} · {displayPatient.name}
            </div>
          </div>
          <div className="flex gap-2 items-center">
            {/* Refreshing indicator */}
            {refreshing && (
              <div className="flex items-center gap-2 text-[11px] text-ink-muted">
                <span className="w-3 h-3 rounded-full border-2 border-teal/20 border-t-teal animate-spin-slow"/>
                {t("updating_brief")}
              </div>
            )}
            {brief && (
              <button onClick={() => generateBrief(true)}
                disabled={loading || refreshing}
                className="btn-secondary">
                <IconRefresh size={13}
                  className={refreshing ? "animate-spin-slow" : ""}/>
                {t("regenerate_btn")}
              </button>
            )}
          </div>
        </div>

        <div className="page-content">
          {error && (
            <div className="bg-rose-dark border border-rose/30 rounded-xl px-4 py-3 text-[12px] text-rose mb-4">
              {error}
            </div>
          )}

          {/* First time loading — show spinner */}
          {loading && !brief && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 rounded-full border-2 border-teal/20 border-t-teal animate-spin-slow"/>
              <div className="text-[13px] text-ink-muted">
                {t("recalling_patient_memory")}
              </div>
            </div>
          )}

          {/* No brief yet — show generate button */}
          {!loading && !brief && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-teal-dark border border-teal/30 flex items-center justify-center">
                <IconDatabase size={28} className="text-teal"/>
              </div>
              <div className="text-center">
                <div className="text-[16px] font-semibold text-white mb-2">
                  {t("no_brief_generated_yet")}
                </div>
                <div className="text-[12px] text-ink-muted mb-6">
                  {t("click_below_generate_summary")}
                </div>
              </div>
              {!displayPatient.docs?.length ? (
                <div className="text-center">
                  <div className="text-[12px] text-rose mb-3">
                    {t("no_docs_uploaded_yet")}
                  </div>
                  <Link href="/patients/upload">
                    <button className="btn-primary">{t("upload_documents_first")}</button>
                  </Link>
                </div>
              ) : (
                <button onClick={() => generateBrief(false)}
                  className="btn-primary px-8 py-3 text-[14px]">
                  <IconDatabase size={16}/> {t("generate_previsit_brief_btn")}
                </button>
              )}
            </div>
          )}

          {/* Brief content */}
          {brief && (
            <div className="grid grid-cols-[1fr_1.3fr] gap-4">

              {/* LEFT */}
              <div className="flex flex-col gap-4">
                <div className="card">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-11 h-11 rounded-xl bg-teal-dark border border-teal/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-[13px] font-bold text-teal">
                        {patient.name?.split(" ").map((n:string)=>n[0]).join("").slice(0,2)}
                      </span>
                    </div>
                    <div>
                      <div className="text-[14px] font-semibold text-white">{t("patient_summary_card_title")}</div>
                      <div className="text-[11px] text-ink-muted">
                        {patient.name} · {patient.age} yrs · {patient.gender}
                      </div>
                      <div className="text-[10px] text-teal mt-0.5">
                        {refreshing ? t("updating_brief") : t("cached_label")}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="text-[10px] text-ink-muted mb-2 uppercase tracking-widest">
                        {t("risk_level_label")}
                      </div>
                      <div style={{
                        width:80, height:80, borderRadius:"50%",
                        border:`3px solid ${riskColor}`,
                        background:`${riskColor}18`,
                        display:"flex", flexDirection:"column",
                        alignItems:"center", justifyContent:"center",
                        flexShrink:0,
                      }}>
                        <span style={{ fontSize:11, fontWeight:700, color:riskColor }}>
                          {brief.risk_level || "Moderate"}
                        </span>
                        <span style={{ fontSize:9, color:riskColor, opacity:0.7, marginTop:2 }}>
                          {t("risk_word")}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-[10px] text-ink-muted uppercase tracking-widest mb-3">
                        {t("suggested_focus_label")}
                      </div>
                      {(brief.suggested_focus || []).map((item:string) => (
                        <div key={item} className="flex items-center gap-1.5 mb-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal flex-shrink-0"/>
                          <span className="text-[11px] text-teal">{item}</span>
                        </div>
                      ))}
                      {brief.risk_reason && (
                        <div className="text-[10px] text-ink-muted mt-3 italic">
                          {brief.risk_reason}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Memory source */}
                <div className="rounded-2xl p-4 border"
                  style={{ background:"#001f17", borderColor:"#00d4a030" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <IconDatabase size={12} className="text-teal"/>
                    <span className="text-[10px] text-ink-muted uppercase tracking-widest">
                      {t("memory_source_title")}
                    </span>
                  </div>
                  <p className="text-[12px] text-sage leading-relaxed">
                    {t("generated_from_text")}{" "}
                    <strong className="text-white">
                      {patient.docs?.length || 0} {t("documents_in_text")}
                    </strong>{" "}
                    in {patient.name}&apos;s Cognee Cloud {t("knowledge_graph_text")}
                  </p>
                  <Link href="/patients/chat">
                    <button className="btn-primary w-full mt-3 justify-center">
                      <IconMessageCircle size={13}/> {t("ask_medihelp")}
                    </button>
                  </Link>
                </div>
              </div>

              {/* RIGHT — 5 point summary */}
              <div className="card" style={{ opacity: refreshing ? 0.7 : 1, transition:"opacity .3s" }}>
                <div className="text-[13px] font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal flex items-center justify-center">
                    <span className="text-[10px] font-bold text-bg-base">5</span>
                  </span>
                  {t("five_point_summary_title")}
                  {refreshing && (
                    <span className="ml-auto text-[10px] text-ink-muted">{t("updating_brief")}</span>
                  )}
                </div>

                {(brief.points || []).map((item:any) => {
                  const c = COLORS[item.num] || COLORS[1];
                  return (
                    <div key={item.num}
                      className="flex gap-3 p-3 rounded-xl mb-3 last:mb-0"
                      style={{ background:c.bg, borderLeft:`3px solid ${c.color}` }}>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5"
                        style={{ background:c.color, color:"#06080f" }}>
                        {item.num}
                      </div>
                      <div className="flex-1">
                        <div className="text-[12px] font-semibold mb-1"
                          style={{ color:c.color }}>
                          {item.title}
                        </div>
                        <div className="text-[12px] text-ink-soft leading-relaxed">
                          {item.text}
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-line text-[10px] text-ink-muted">
                  <IconDatabase size={11} className="text-teal flex-shrink-0"/>
                  {t("powered_by_cognee_recall")}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

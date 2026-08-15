"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { useTranslation } from "@/hooks/useTranslation";
import {
  IconKey, IconShield, IconCheck, IconNetwork,
  IconActivity, IconTrash, IconEye, IconUser,
  IconRefresh, IconZap, IconBell,
} from "@/components/Icons";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const { t } = useTranslation();
  const [status,   setStatus]   = useState<any>(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [savingN,  setSavingN]  = useState(false);
  const [savedN,   setSavedN]   = useState(false);
  const [testing,  setTesting]  = useState(false);
  const [testOk,   setTestOk]   = useState<boolean|null>(null);
  const [showCogneeKey, setShowCogneeKey] = useState(false);
  const [showLlmKey,    setShowLlmKey]    = useState(false);

  // Cognee fields
  const [cogneeKey, setCogneeKey] = useState("");
  const [cogneeUrl, setCogneeUrl] = useState("");

  // LLM fields
  const [provider, setProvider] = useState("groq");
  const [model,    setModel]    = useState("");
  const [llmKey,   setLlmKey]   = useState("");
  const [baseUrl,  setBaseUrl]  = useState("");

  // Notification prefs
  const [prefs, setPrefs] = useState({
    drug_alerts: true,
    bp_alerts:   true,
    lab_alerts:  true,
    followup:    true,
  });

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [statusData, notifData] = await Promise.all([
        api.getStatus(),
        api.getNotifications().catch(() => ({})),
      ]);
      setStatus(statusData);
      if (statusData.cognee_cloud?.url) setCogneeUrl(statusData.cognee_cloud.url);
      if (statusData.llm?.provider)     setProvider(statusData.llm.provider);
      if (statusData.llm?.model)        setModel(statusData.llm.model);
      setPrefs({
        drug_alerts: notifData.drug_alerts ?? true,
        bp_alerts:   notifData.bp_alerts   ?? true,
        lab_alerts:  notifData.lab_alerts  ?? true,
        followup:    notifData.followup    ?? true,
      });
    } catch {}
    setLoading(false);
  };

  const saveKeys = async () => {
    setSaving(true); setTestOk(null);
    try {
      const result = await api.saveKeys({
        cognee_api_key:  cogneeKey || undefined,
        cognee_base_url: cogneeUrl || undefined,
        llm_api_key:     llmKey    || undefined,
        llm_provider:    provider,
        llm_model:       model,
        ...(baseUrl ? { llm_base_url: baseUrl } : {}),
      });
      setSaved(true);
      setTestOk(result.cognee_connected);
      await loadAll();
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) { alert(e.message); }
    finally { setSaving(false); }
  };

  const saveNotifications = async () => {
    setSavingN(true);
    try {
      await api.saveNotifications(prefs);
      setSavedN(true);
      setTimeout(() => setSavedN(false), 3000);
    } catch (e: any) { alert(e.message); }
    finally { setSavingN(false); }
  };

  const testConnection = async () => {
    setTesting(true); setTestOk(null);
    try {
      const data = await api.getStatus();
      setTestOk(data.cognee_cloud?.connected || false);
    } catch { setTestOk(false); }
    finally { setTesting(false); }
  };

  if (loading) return (
    <div className="app-shell"><Sidebar/>
      <main className="main-area flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-teal/20 border-t-teal animate-spin-slow"/>
      </main>
    </div>
  );

  const cogneeOk = status?.cognee_cloud?.connected;
  const llmOk    = status?.llm?.configured;

  return (
    <div className="app-shell">
      <Sidebar/>
      <main className="main-area">
        <div className="page-header">
          <div>
            <div className="text-[17px] font-bold text-white">{t("settings_page_title")}</div>
            <div className="text-[11px] text-ink-muted mt-0.5">{t("settings_subtitle")}</div>
          </div>
          <button onClick={saveKeys} disabled={saving} className="btn-primary">
            {saved ? <><IconCheck size={13}/> {t("saved_badge")}</> : saving ? t("saving") : t("save_changes_btn")}
          </button>
        </div>

        <div className="page-content">
          <div className="max-w-2xl flex flex-col gap-4">

            {/* ── Status bar ───────────────────── */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl p-3.5 border flex items-center gap-3"
                style={{ background:cogneeOk?"#001f17":"#1a0805", borderColor:cogneeOk?"#00d4a030":"#e05a3a30" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background:cogneeOk?"#00d4a020":"#e05a3a20" }}>
                  <IconNetwork size={15} color={cogneeOk?"#00d4a0":"#e05a3a"}/>
                </div>
                <div>
                  <div className="text-[11px] font-semibold" style={{ color:cogneeOk?"#00d4a0":"#e05a3a" }}>
                    {t("cognee_cloud_status_title")} {cogneeOk?t("connected_word"):t("not_connected_word")}
                  </div>
                  <div className="text-[10px] text-ink-muted mt-0.5">
                    {cogneeOk?t("kg_active_subtitle"):t("enter_api_key_below")}
                  </div>
                </div>
              </div>
              <div className="rounded-xl p-3.5 border flex items-center gap-3"
                style={{ background:llmOk?"#130f2e":"#1a0805", borderColor:llmOk?"#8b7ff530":"#e05a3a30" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background:llmOk?"#8b7ff520":"#e05a3a20" }}>
                  <IconActivity size={15} color={llmOk?"#8b7ff5":"#e05a3a"}/>
                </div>
                <div>
                  <div className="text-[11px] font-semibold" style={{ color:llmOk?"#8b7ff5":"#e05a3a" }}>
                    {status?.llm?.provider
                      ? status.llm.provider.charAt(0).toUpperCase()+status.llm.provider.slice(1)
                      : "LLM"} — {llmOk?t("configured_word"):t("not_configured_word")}
                  </div>
                  <div className="text-[10px] text-ink-muted mt-0.5">
                    {status?.llm?.model || t("no_model_selected_subtitle")}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Cognee Cloud ─────────────────── */}
            <div className="card">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-line">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background:"#00d4a018", border:"0.5px solid #00d4a030" }}>
                  <IconNetwork size={16} color="#00d4a0"/>
                </div>
                <div className="flex-1">
                  <div className="text-[13px] font-semibold text-white">{t("cognee_cloud_card_title")}</div>
                  <div className="text-[10px] text-ink-muted">{t("memory_kg_provider_desc")}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={testConnection} disabled={testing}
                    className="btn-secondary text-[11px] flex items-center gap-1.5">
                    <IconRefresh size={12} className={testing?"animate-spin-slow":""}/>
                    {testing ? t("testing_btn") : testOk===true ? t("test_connected_msg") : testOk===false ? t("test_failed_msg") : t("test_btn")}
                  </button>
                  <a href="https://platform.cognee.ai/sessions" target="_blank" rel="noreferrer"
                    className="btn-secondary text-[11px] no-underline">{t("sessions_link")}</a>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {/* Cognee API Key */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-bold text-ink-muted uppercase tracking-widest">{t("cognee_api_key_label")}</label>
                    <a href="https://platform.cognee.ai/apiKeys" target="_blank" rel="noreferrer"
                      className="text-[10px] text-teal hover:underline">{t("get_from_platform_link")}</a>
                  </div>
                  <div className="flex items-center gap-2 bg-bg-input border border-line-strong rounded-xl px-4 py-3 focus-within:border-teal/50 transition-all">
                    <IconKey size={14} className="text-ink-muted flex-shrink-0"/>
                    <input type={showCogneeKey?"text":"password"} value={cogneeKey}
                      onChange={e=>setCogneeKey(e.target.value)}
                      placeholder={status?.cognee_cloud?.has_key?"••••••••••••••• (saved)":"ck_your_key_here"}
                      className="flex-1 text-[13px] text-white font-mono bg-transparent outline-none border-none"/>
                    <button onClick={()=>setShowCogneeKey(s=>!s)}
                      className="text-ink-muted hover:text-white transition-all">
                      <IconEye size={14}/>
                    </button>
                  </div>
                </div>

                {/* Cognee Base URL */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-bold text-ink-muted uppercase tracking-widest">{t("cognee_base_url_label")}</label>
                    <span className="text-[10px] text-ink-muted">{t("copy_from_browser_desc")}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-bg-input border border-line-strong rounded-xl px-4 py-3 focus-within:border-teal/50 transition-all">
                    <IconNetwork size={14} className="text-ink-muted flex-shrink-0"/>
                    <input type="text" value={cogneeUrl}
                      onChange={e=>setCogneeUrl(e.target.value)}
                      placeholder="https://tenant-xxx.aws.cognee.ai"
                      className="flex-1 text-[13px] text-white font-mono bg-transparent outline-none border-none"/>
                  </div>
                </div>
              </div>
            </div>

            {/* ── AI Model ─────────────────────── */}
            <div className="card">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-line">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background:"#8b7ff518", border:"0.5px solid #8b7ff530" }}>
                  <IconZap size={16} color="#8b7ff5"/>
                </div>
                <div className="flex-1">
                  <div className="text-[13px] font-semibold text-white">{t("ai_model_card_title")}</div>
                  <div className="text-[10px] text-ink-muted">{t("generates_answers_desc")}</div>
                </div>
                {llmOk && (
                  <span className="text-[10px] font-semibold text-violet bg-violet-dark border border-violet/25 px-2.5 py-1 rounded-full">
                    {status.llm.provider} · {status.llm.model}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-3">
                {/* Provider */}
                <div>
                  <label className="text-[10px] font-bold text-ink-muted uppercase tracking-widest block mb-1.5">
                    {t("llm_provider_label")}
                  </label>
                  <div className="flex items-center gap-2 bg-bg-input border border-line-strong rounded-xl px-4 py-3 focus-within:border-teal/50 transition-all">
                    <IconActivity size={14} className="text-ink-muted flex-shrink-0"/>
                    <input type="text" value={provider}
                      onChange={e=>setProvider(e.target.value.toLowerCase().trim())}
                      placeholder="groq, openai, anthropic, mistral, together, custom"
                      className="flex-1 text-[13px] text-white bg-transparent outline-none border-none"/>
                  </div>
                  <div className="text-[10px] text-ink-muted mt-1.5">
                    {t("provider_supported_text")}
                  </div>
                </div>

                {/* Model */}
                <div>
                  <label className="text-[10px] font-bold text-ink-muted uppercase tracking-widest block mb-1.5">
                    {t("model_name_label")}
                  </label>
                  <div className="flex items-center gap-2 bg-bg-input border border-line-strong rounded-xl px-4 py-3 focus-within:border-teal/50 transition-all">
                    <IconZap size={14} className="text-ink-muted flex-shrink-0"/>
                    <input type="text" value={model}
                      onChange={e=>setModel(e.target.value.trim())}
                      placeholder="e.g. llama-3.1-8b-instant, gpt-4o-mini, claude-haiku-4-5"
                      className="flex-1 text-[13px] text-white font-mono bg-transparent outline-none border-none"/>
                  </div>
                  <div className="text-[10px] text-ink-muted mt-1.5">
                    {t("enter_supported_model_desc")}
                  </div>
                </div>

                {/* API Key */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-bold text-ink-muted uppercase tracking-widest">{t("api_key_label")}</label>
                    <span className="text-[10px] text-ink-muted">{t("from_provider_dashboard_desc")}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-bg-input border border-line-strong rounded-xl px-4 py-3 focus-within:border-teal/50 transition-all">
                    <IconKey size={14} className="text-ink-muted flex-shrink-0"/>
                    <input type={showLlmKey?"text":"password"} value={llmKey}
                      onChange={e=>setLlmKey(e.target.value)}
                      placeholder={llmOk
                        ? `••••••••••••••• (${status.llm.provider} key saved)`
                        : "Your LLM API key"
                      }
                      className="flex-1 text-[13px] text-white font-mono bg-transparent outline-none border-none"/>
                    <button onClick={()=>setShowLlmKey(s=>!s)}
                      className="text-ink-muted hover:text-white transition-all">
                      <IconEye size={14}/>
                    </button>
                  </div>
                </div>

                {/* Custom base URL — only when provider = custom */}
                {provider==="custom" && (
                  <div>
                    <label className="text-[10px] font-bold text-ink-muted uppercase tracking-widest block mb-1.5">
                      {t("base_url_compat_label")}
                    </label>
                    <div className="flex items-center gap-2 bg-bg-input border border-line-strong rounded-xl px-4 py-3 focus-within:border-teal/50 transition-all">
                      <IconNetwork size={14} className="text-ink-muted flex-shrink-0"/>
                      <input type="text" value={baseUrl}
                        onChange={e=>setBaseUrl(e.target.value)}
                        placeholder="https://your-api-endpoint.com/v1"
                        className="flex-1 text-[13px] text-white font-mono bg-transparent outline-none border-none"/>
                    </div>
                    <div className="text-[10px] text-ink-muted mt-1.5">
                      {t("openai_compat_desc")}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Alert Preferences ────────────── */}
            <div className="card">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-line">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background:"#f0a03018", border:"0.5px solid #f0a03030" }}>
                  <IconBell size={16} color="#f0a030"/>
                </div>
                <div className="flex-1">
                  <div className="text-[13px] font-semibold text-white">{t("alert_prefs_card_title")}</div>
                  <div className="text-[10px] text-ink-muted">{t("controls_cognee_scan_desc")}</div>
                </div>
                <button onClick={saveNotifications} disabled={savingN}
                  className="btn-secondary text-[11px]">
                  {savedN ? <><IconCheck size={12}/> {t("saved_badge")}</> : savingN ? t("saving") : t("save_prefs_btn")}
                </button>
              </div>
              {[
                { key:"drug_alerts", label:t("drug_alerts_label"),  sub:t("drug_alerts_sub")    },
                { key:"bp_alerts",   label:t("bp_alerts_label"),    sub:t("bp_alerts_sub") },
                { key:"lab_alerts",  label:t("lab_alerts_label"),   sub:t("lab_alerts_sub")      },
                { key:"followup",    label:t("followup_alerts_label"), sub:t("followup_alerts_sub")    },
              ].map((s,i,arr) => (
                <div key={s.key}
                  className={`flex items-center justify-between py-3 gap-4 ${i<arr.length-1?"border-b border-line":""}`}>
                  <div className="flex-1">
                    <div className="text-[12px] font-medium text-white">{s.label}</div>
                    <div className="text-[10px] text-ink-muted mt-0.5">{s.sub}</div>
                  </div>
                  <button
                    onClick={()=>setPrefs(p=>({...p,[s.key]:!p[s.key as keyof typeof p]}))}
                    style={{
                      width:40, height:22, borderRadius:99, border:"none", cursor:"pointer",
                      background:prefs[s.key as keyof typeof prefs]?"#00d4a0":"#1a2436",
                      position:"relative", flexShrink:0, transition:"background .2s",
                    }}>
                    <span style={{
                      position:"absolute", top:3,
                      left:prefs[s.key as keyof typeof prefs]?21:3,
                      width:16, height:16, borderRadius:"50%",
                      background:"white", transition:"left .2s", display:"block",
                    }}/>
                  </button>
                </div>
              ))}
            </div>

            {/* ── Account ──────────────────────── */}
            <div className="card">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-line">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background:"#ffffff10", border:"0.5px solid #ffffff20" }}>
                  <IconUser size={16} color="#e2eaf4"/>
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-white">{t("account_card_title")}</div>
                  <div className="text-[10px] text-ink-muted">{t("manage_session_data_desc")}</div>
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-line">
                <div>
                  <div className="text-[12px] font-medium text-white">{t("delete_all_memory_label")}</div>
                  <div className="text-[10px] text-ink-muted mt-0.5">{t("permanently_removes_desc")}</div>
                </div>
                <button
                  onClick={()=>{ if(confirm("Delete ALL patient memory? Cannot be undone.")) alert("Delete individual patients from the Patients page."); }}
                  className="text-[11px] font-medium px-3 py-1.5 rounded-lg border cursor-pointer flex items-center gap-1.5 bg-rose-dark border-rose/30 text-rose hover:bg-rose/10 transition-all">
                  <IconTrash size={12}/> {t("delete_all_btn")}
                </button>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <div className="text-[12px] font-medium text-white">{t("sign_out_label")}</div>
                  <div className="text-[10px] text-ink-muted mt-0.5">{t("clears_session_desc")}</div>
                </div>
                <button
                  onClick={()=>{ localStorage.removeItem("medhelp_doctor"); localStorage.removeItem("medhelp_active_patient"); window.location.href="/login"; }}
                  className="btn-secondary text-[11px]">{t("sign_out_label")}</button>
              </div>
            </div>

            <div className="text-center py-2 text-[10px] text-ink-muted">
              {t("hackathon_footer_text")}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
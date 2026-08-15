"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { useTranslation } from "@/hooks/useTranslation";
import { api } from "@/lib/api";
import {
  IconHeart, IconFileText, IconMessageSquare, IconVolume2,
  IconShield, IconPlus, IconCloud, IconCheckCircle, IconHelpCircle,
  IconUser, IconArrowRight, IconAlertTriangle
} from "@/components/Icons";

export default function AssistedCarePage() {
  const router = useRouter();
  const { t, lang } = useTranslation();
  const [patients, setPatients] = useState<any[]>([]);
  const [activePatient, setActivePatient] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioObj, setAudioObj] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const res = await api.listPatients();
      const list = res.patients || [];
      setPatients(list);
      const saved = localStorage.getItem("medhelp_active_patient");
      if (saved) {
        const parsed = JSON.parse(saved);
        const match = list.find((p: any) => p.id === parsed.id) || list[0];
        setActivePatient(match);
      } else if (list.length > 0) {
        setActivePatient(list[0]);
        localStorage.setItem("medhelp_active_patient", JSON.stringify(list[0]));
      }
    } catch (e) {
      console.error("Failed to load patients", e);
    }
  };

  const handleSelectPatient = (p: any) => {
    setActivePatient(p);
    localStorage.setItem("medhelp_active_patient", JSON.stringify(p));
    window.dispatchEvent(new Event("medhelp_patient_changed"));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activePatient) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      alert(t("pdf_first_tip_desc"));
      return;
    }

    setUploading(true);
    setUploadMsg(t("processing_upload"));

    try {
      await api.uploadDoc(activePatient.id, file);
      setUploadMsg(t("in_memory_badge"));
      await loadPatients();
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
      setTimeout(() => setUploadMsg(""), 4000);
    }
  };

  const playVoiceExplanation = async () => {
    if (!activePatient) return;
    if (audioObj) {
      audioObj.pause();
      setAudioObj(null);
      return;
    }

    const textToSpeak = lang === "hi"
      ? `रोगी ${activePatient.name}। आयु ${activePatient.age}। रक्त समूह ${activePatient.blood || "अज्ञात"}। दर्ज दस्तावेज़ ${activePatient.docs?.length || 0}।`
      : lang === "ta"
      ? `நோயாளி ${activePatient.name}. வயது ${activePatient.age}. இரத்த வகை ${activePatient.blood || "தெரியவில்லை"}. பதிவு செய்யப்பட்ட ஆவணங்கள் ${activePatient.docs?.length || 0}.`
      : `Patient ${activePatient.name}. Age ${activePatient.age}. Blood type ${activePatient.blood || "N/A"}. ${activePatient.docs?.length || 0} PDF reports stored in persistent memory.`;

    setAudioLoading(true);
    try {
      const res = await api.tts(textToSpeak);
      if (!res.ok) throw new Error("Audio generation unavailable");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      setAudioObj(audio);
      audio.play();
      audio.onended = () => setAudioObj(null);
    } catch (err: any) {
      alert(`Voice playback error: ${err.message}`);
    } finally {
      setAudioLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-area p-4 md:p-6">
        {/* Header Banner */}
        <div className="card mb-6 bg-gradient-to-r from-teal-dark/60 via-bg-card to-bg-card border-teal/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-teal bg-teal/10 px-2.5 py-1 rounded-full border border-teal/30">
                {t("assisted_care_title")}
              </span>
              <h1 className="text-[22px] font-extrabold text-white mt-2">
                {t("assisted_care")}
              </h1>
              <p className="text-[13px] text-ink-muted mt-1">
                {t("assisted_care_desc")}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/patients/list")}
                className="btn-secondary py-3 px-4 text-[13px] font-bold"
              >
                <IconUser size={16} /> {t("manage_patients_btn")}
              </button>
            </div>
          </div>
        </div>

        {/* Patient Selection Selector Bar */}
        <div className="card mb-6 border-teal/30 bg-bg-card">
          <div className="text-[11px] font-bold text-ink-muted uppercase tracking-widest mb-2">
            {t("active_patient_section_title")}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={activePatient?.id || ""}
              onChange={(e) => {
                const found = patients.find((p) => p.id === e.target.value);
                if (found) handleSelectPatient(found);
              }}
              className="bg-bg-input border border-teal/40 text-white rounded-xl px-4 py-3 text-[14px] font-semibold outline-none flex-1 min-w-[200px]"
            >
              {patients.length === 0 && <option value="">{t("no_patients_found")}</option>}
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.age} yrs · {p.gender})
                </option>
              ))}
            </select>

            {activePatient && (
              <div className="bg-teal/10 border border-teal/30 rounded-xl px-4 py-2 text-[12px] text-teal font-semibold">
                {activePatient.docs?.length || 0} {t("reports_recorded_badge")}
              </div>
            )}
          </div>
        </div>

        {/* Big Action Tiles for Rural Accessibility */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Tile 1: My Health */}
          <div
            onClick={() => router.push("/patients")}
            className="card p-6 cursor-pointer hover:border-teal transition-all group bg-gradient-to-br from-bg-card to-teal-dark/20 border-teal/30 flex flex-col justify-between h-44"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-teal/20 border border-teal/40 flex items-center justify-center text-teal">
                <IconHeart size={24} />
              </div>
              <IconArrowRight size={18} className="text-ink-muted group-hover:text-teal transition-all" />
            </div>
            <div>
              <h3 className="text-[18px] font-bold text-white group-hover:text-teal transition-all">
                {t("my_health")}
              </h3>
              <p className="text-[12px] text-ink-muted mt-1">
                {t("my_health_desc")}
              </p>
            </div>
          </div>

          {/* Tile 2: My Reports & Upload */}
          <div
            onClick={() => router.push("/patients/upload")}
            className="card p-6 cursor-pointer hover:border-teal transition-all group bg-gradient-to-br from-bg-card to-teal-dark/20 border-teal/30 flex flex-col justify-between h-44"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-teal/20 border border-teal/40 flex items-center justify-center text-teal">
                <IconFileText size={24} />
              </div>
              <label className="cursor-pointer bg-teal text-bg-dark font-bold text-[11px] px-3 py-1.5 rounded-lg hover:brightness-110">
                {t("upload_pdf_btn_short")}
                <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
            <div>
              <h3 className="text-[18px] font-bold text-white group-hover:text-teal transition-all">
                {t("my_reports")}
              </h3>
              <p className="text-[12px] text-ink-muted mt-1">
                {uploading ? uploadMsg : t("my_reports_desc")}
              </p>
            </div>
          </div>

          {/* Tile 3: Ask MediHelp */}
          <div
            onClick={() => router.push("/patients/chat")}
            className="card p-6 cursor-pointer hover:border-teal transition-all group bg-gradient-to-br from-bg-card to-teal-dark/20 border-teal/30 flex flex-col justify-between h-44"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-teal/20 border border-teal/40 flex items-center justify-center text-teal">
                <IconMessageSquare size={24} />
              </div>
              <IconArrowRight size={18} className="text-ink-muted group-hover:text-teal transition-all" />
            </div>
            <div>
              <h3 className="text-[18px] font-bold text-white group-hover:text-teal transition-all">
                {t("ask_medihelp")}
              </h3>
              <p className="text-[12px] text-ink-muted mt-1">
                {t("ask_medihelp_desc")}
              </p>
            </div>
          </div>

          {/* Tile 4: Listen */}
          <div
            onClick={playVoiceExplanation}
            className="card p-6 cursor-pointer hover:border-teal transition-all group bg-gradient-to-br from-bg-card to-teal-dark/20 border-teal/30 flex flex-col justify-between h-44"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-teal/20 border border-teal/40 flex items-center justify-center text-teal">
                <IconVolume2 size={24} className={audioObj ? "animate-bounce" : ""} />
              </div>
              <span className="text-[11px] font-bold text-teal bg-teal/10 px-2 py-1 rounded-md">
                ElevenLabs TTS
              </span>
            </div>
            <div>
              <h3 className="text-[18px] font-bold text-white group-hover:text-teal transition-all">
                {audioObj ? t("stop_audio") : t("listen_tile_title")}
              </h3>
              <p className="text-[12px] text-ink-muted mt-1">
                {audioLoading ? t("loading") : t("listen_tile_desc")}
              </p>
            </div>
          </div>

          {/* Tile 5: My Care & Timeline */}
          <div
            onClick={() => router.push("/patients/timeline")}
            className="card p-6 cursor-pointer hover:border-teal transition-all group bg-gradient-to-br from-bg-card to-teal-dark/20 border-teal/30 flex flex-col justify-between h-44"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-teal/20 border border-teal/40 flex items-center justify-center text-teal">
                <IconShield size={24} />
              </div>
              <IconArrowRight size={18} className="text-ink-muted group-hover:text-teal transition-all" />
            </div>
            <div>
              <h3 className="text-[18px] font-bold text-white group-hover:text-teal transition-all">
                {t("my_care")}
              </h3>
              <p className="text-[12px] text-ink-muted mt-1">
                {t("my_care_desc")}
              </p>
            </div>
          </div>
        </div>

        {/* Safety Disclaimer Footer */}
        <div className="bg-bg-input border border-line rounded-xl p-4 text-[12px] text-ink-muted leading-relaxed flex items-start gap-2.5">
          <IconShield size={16} className="text-teal flex-shrink-0 mt-0.5" />
          <p>{t("disclaimer")}</p>
        </div>
      </main>
    </div>
  );
}

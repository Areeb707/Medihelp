"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { Language } from "@/lib/i18n";
import {
  IconBrain, IconLayoutDash, IconUpload, IconClock,
  IconStethoscope, IconSparkles, IconShare2,
  IconBell, IconSettings, IconUsers, IconArrowRight,
  IconHelpCircle, IconShield, IconChevronRight, IconX
} from "./Icons";

import { api } from "@/lib/api";
import { isAuthenticated, logoutDoctor, getDoctorProfile } from "@/lib/auth";

// Logout icon inline since IconLogOut might not exist
const IconLogOut = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

function NavIcon({ icon, size = 14 }: { icon: string; size?: number }) {
  const p: Record<string,string> = {
    users:       "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
    layout:      "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
    upload:      "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12",
    clock:       "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2",
    stethoscope: "M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4",
    sparkles:    "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    share:       "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13",
    bell:        "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0",
    settings:    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
    help:        "M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM12 17H12.01M12 14C12.5523 14 13 13.5523 13 13C13 12.4477 12.5523 12 12 12C10.8954 12 10 11.1046 10 10C10 8.89543 10.8954 8 12 8C13.1046 8 14 8.89543 14 10",
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={p[icon] || ""}/>
    </svg>
  );
}

export default function Sidebar() {
  const path   = usePathname();
  const router = useRouter();
  const { t, lang }  = useTranslation();
  const [patient, setPatient] = useState<any>(null);
  const [doctor,  setDoctor]  = useState<any>(null);
  const [alertCount, setAlertCount] = useState(0);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const NAV = [
    { href:"/assisted",         label: t("assisted_care"),  icon:"stethoscope" },
    { href:"/patients",         label: t("memory_hub"),     icon:"layout"      },
    { href:"/patients/list",    label: t("patients"),       icon:"users"       },
    { href:"/patients/upload",  label: t("upload_reports"), icon:"upload"      },
    { href:"/patients/chat",    label: t("ai_doctor"),      icon:"sparkles"    },
    { href:"/patients/brief",   label: t("pre_visit"),      icon:"layout"      },
    { href:"/patients/timeline",label: t("timeline"),       icon:"clock"       },
    { href:"/patients/mindmap", label: t("mindmap"),        icon:"share"       },
  ];

  const BOTTOM = [
    { href:"/alerts",   label: t("alerts"),   icon:"bell"     },
    { href:"/settings", label: t("settings"), icon:"settings" },
    { href:"/faq",      label: t("faq_title"),icon:"help"     },
  ];

  useEffect(() => {
    // Route Protection Guard: Redirect to /login if unauthenticated
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    const sync = () => {
      try {
        const doc = getDoctorProfile();
        if (doc) setDoctor(doc);

        const p = localStorage.getItem("medhelp_active_patient");
        if (p) {
          const pat = JSON.parse(p);
          // Validate patient belongs to current doctor
          const docName = (doc?.name || "").trim().toLowerCase();
          const patDoc  = (pat?.doctor || "").trim().toLowerCase();
          if (docName && patDoc && patDoc !== docName) {
            // Patient belongs to a different doctor — clear it
            localStorage.removeItem("medhelp_active_patient");
            setPatient(null);
          } else {
            setPatient(pat);
          }
        } else {
          setPatient(null);
        }
      } catch {}
    };

    sync();
    window.addEventListener("medhelp_patient_changed", sync);
    window.addEventListener("medhelp_auth_changed", sync);
    return () => {
      window.removeEventListener("medhelp_patient_changed", sync);
      window.removeEventListener("medhelp_auth_changed", sync);
    };
  }, [path]);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const data = await api.getAlertCount();
        setAlertCount(data.unread || 0);
      } catch {}
    };
    fetchCount();
    const tTimer = setInterval(fetchCount, 30000);
    return () => clearInterval(tTimer);
  }, []);

  const changeLanguage = (newLang: Language) => {
    localStorage.setItem("medhelp_language", newLang);
    window.dispatchEvent(new Event("medhelp_language_changed"));
  };

  const logout = () => {
    logoutDoctor();
  };

  const isActive = (href: string) => {
    if (href === "/patients/list") return path === href;
    if (href === "/patients")      return path === "/patients";
    return path.startsWith(href);
  };

  return (
    <aside className="sb relative">
      {/* Logo */}
      <div className="sb-logo">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background:"linear-gradient(135deg,#00d4a0,#007a5e)" }}>
          <IconBrain size={16} className="text-white"/>
        </div>
        <div>
          <div className="text-[14px] font-bold text-white tracking-tight leading-none">Medhelp</div>
          <div className="text-[9px] text-ink-muted mt-0.5">{t("ai_remembers")}</div>
        </div>
      </div>

      {/* Active patient */}
      {patient ? (
        <div
          className="mx-2.5 mb-4 p-3 rounded-2xl border transition-all"
          style={{
            background: "linear-gradient(135deg, rgba(0, 212, 160, 0.12) 0%, rgba(12, 17, 32, 0.85) 100%)",
            borderColor: "rgba(0, 212, 160, 0.35)",
            boxShadow: "0 4px 20px rgba(0, 212, 160, 0.08)"
          }}
        >
          <div className="flex items-center justify-between gap-1.5 mb-1.5">
            <div className="text-[9.5px] font-extrabold uppercase tracking-wider text-teal flex items-center gap-1.5 min-w-0 flex-1">
              <span className="w-2 h-2 rounded-full bg-teal animate-pulse flex-shrink-0" />
              <span className="whitespace-nowrap truncate">{t("active_patient")}</span>
            </div>
            <Link
              href="/patients/list"
              className="text-[10px] font-bold text-teal bg-teal/15 hover:bg-teal/25 border border-teal/40 px-2 py-0.5 rounded-lg transition-all flex-shrink-0"
            >
              Change
            </Link>
          </div>
          <div>
            <div className="text-[14px] font-extrabold text-white truncate leading-tight">
              {patient.name}
            </div>
            <div className="text-[11px] text-ink-soft font-medium mt-1">
              {patient.age}y · {patient.gender} · <span className="text-teal font-semibold">{patient.blood || "N/A"}</span>
            </div>
            {patient.docs && patient.docs.length > 0 && (
              <div className="text-[9.5px] text-teal/90 font-medium mt-2 bg-teal/10 px-2 py-0.5 rounded-md border border-teal/20 inline-block">
                {patient.docs.length} reports indexed
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mx-3 mb-4 p-3.5 rounded-2xl border border-line bg-bg-card/50">
          <div className="text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-1">
            {t("active_patient")}
          </div>
          <div className="text-[11px] text-ink-muted mb-2">{t("no_patient_selected")}</div>
          <Link
            href="/patients/list"
            className="text-[11px] text-teal font-bold bg-teal/10 hover:bg-teal/20 border border-teal/30 px-3 py-1.5 rounded-xl inline-block transition-all"
          >
            {t("select_a_patient")} →
          </Link>
        </div>
      )}

      {/* Nav */}
      <nav className="sb-nav flex-1">
        <div className="text-[10px] font-extrabold uppercase tracking-widest text-ink-muted px-3 mt-2 mb-2">
          {t("nav_header")}
        </div>
        {NAV.map(({ href, icon, label }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href} className={`sb-link ${active?"active":""}`}>
              <NavIcon icon={icon} size={14}/>
              <span>{label}</span>
            </Link>
          );
        })}

        <div className="text-[10px] font-extrabold uppercase tracking-widest text-ink-muted px-3 mt-4 mb-2">
          {t("system_header")}
        </div>
        {BOTTOM.map(({ href, icon, label }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href} className={`sb-link ${active?"active":""}`}>
              <NavIcon icon={icon} size={14}/>
              <span>{label}</span>
              {icon==="bell" && alertCount>0 && (
                <span className="ml-auto text-[9px] font-bold bg-rose text-white px-1.5 py-0.5 rounded-full">
                  {alertCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Doctor Account Section & Popover Card in Bottom Left */}
      <div className="px-3 py-3 border-t border-line relative">
        {/* Account Popover Menu */}
        {showAccountMenu && (
          <div
            className="absolute bottom-16 left-3 right-3 bg-bg-card border border-teal/40 rounded-2xl p-4 shadow-2xl z-50 animate-fade-up space-y-3.5"
            style={{ background: "#0c1120" }}
          >
            {/* Header: Doctor Metadata */}
            <div className="flex items-center justify-between pb-2.5 border-b border-line">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-teal-dark border border-teal/40 flex items-center justify-center flex-shrink-0">
                  <span className="text-[12px] font-bold text-teal">
                    {doctor?.initials || "DR"}
                  </span>
                </div>
                <div>
                  <div className="text-[12px] font-bold text-white leading-tight">
                    {doctor?.name || "Dr. Alex Morgan"}
                  </div>
                  <div className="text-[10px] text-teal font-medium mt-0.5">
                    {doctor?.specialisation || "Cardiologist"}
                  </div>
                  <div className="text-[9px] text-ink-muted truncate">
                    {doctor?.email || "doctor@medihelp.ai"}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowAccountMenu(false)}
                className="text-ink-muted hover:text-white p-1"
              >
                <IconX size={14} />
              </button>
            </div>

            {/* Cognee Memory Active Status Badge */}
            <div className="flex items-center gap-2 bg-teal/10 border border-teal/30 rounded-lg px-2.5 py-1 text-[10px] font-semibold text-teal">
              <span className="w-1.5 h-1.5 rounded-full bg-teal animate-glow" />
              <span>Cognee Cloud Memory Active</span>
            </div>

            {/* ── 3 Action Placeholders ── */}
            <div className="space-y-2 pt-1">
              {/* 1. Language Placeholder */}
              <div className="p-2 rounded-xl bg-bg-base border border-line flex flex-col gap-1">
                <label className="text-[9.5px] uppercase font-bold tracking-wider text-ink-muted">
                  🌐 Language / மொழி / भाषा
                </label>
                <select
                  value={lang}
                  onChange={(e) => changeLanguage(e.target.value as Language)}
                  className="w-full bg-bg-input border border-teal/30 rounded-lg px-2.5 py-1.5 text-[11.5px] font-semibold text-white outline-none cursor-pointer hover:border-teal transition-all"
                >
                  <option value="en">English</option>
                  <option value="ta">தமிழ் (Tamil)</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                </select>
              </div>

              {/* 2. Product Guide Placeholder */}
              <button
                onClick={() => {
                  setShowAccountMenu(false);
                  window.dispatchEvent(new Event("medhelp_open_tour"));
                }}
                className="w-full p-2.5 rounded-xl bg-bg-base border border-line hover:border-teal/40 text-[11.5px] font-medium text-white flex items-center justify-between transition-all"
              >
                <span className="flex items-center gap-2">
                  💡 <span>{t("replay_guide")}</span>
                </span>
                <IconChevronRight size={14} className="text-ink-muted" />
              </button>

              {/* 3. Need Help? Placeholder */}
              <button
                onClick={() => {
                  setShowAccountMenu(false);
                  window.dispatchEvent(new Event("medhelp_open_help"));
                }}
                className="w-full p-2.5 rounded-xl bg-bg-base border border-line hover:border-teal/40 text-[11.5px] font-medium text-white flex items-center justify-between transition-all"
              >
                <span className="flex items-center gap-2">
                  ❓ <span>{t("need_help")}</span>
                </span>
                <IconChevronRight size={14} className="text-ink-muted" />
              </button>
            </div>

            {/* Logout Button */}
            <button
              onClick={() => {
                setShowAccountMenu(false);
                logout();
              }}
              className="w-full py-2 px-3 rounded-xl bg-rose-dark/30 border border-rose/30 text-rose hover:bg-rose/20 text-[11px] font-bold flex items-center justify-center gap-2 transition-all mt-2"
            >
              <IconLogOut size={13} />
              <span>{t("logout")}</span>
            </button>
          </div>
        )}

        {/* Doctor Account Tile Button */}
        <div
          onClick={() => setShowAccountMenu((v) => !v)}
          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-bg-hover transition-all cursor-pointer border border-transparent hover:border-teal/30"
          title="Click for Account Options, Language, Guide & Help"
        >
          <div className="w-8 h-8 rounded-full bg-bg-card border border-teal/30 flex items-center justify-center flex-shrink-0">
            <span className="text-[11px] font-bold text-teal">
              {doctor?.initials || "DR"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-semibold text-white truncate">
              {doctor?.name || "Doctor"}
            </div>
            <div className="text-[9px] text-ink-muted truncate">
              {doctor?.specialisation || ""}
            </div>
          </div>
          <div className="text-ink-muted hover:text-teal transition-all">
            <IconSettings size={14} />
          </div>
        </div>
      </div>
    </aside>
  );
}

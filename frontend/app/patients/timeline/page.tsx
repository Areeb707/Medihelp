"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { IconClock } from "@/components/Icons";
import { api } from "@/lib/api";

const TYPE_COLORS: Record<string, string> = {
  Diagnosis:  "#00d4a0",
  Medication: "#8b7ff5",
  Allergy:    "#f0a030",
  "Lab Result": "#4090e0",
  Vital:      "#4090e0",
  "Follow-up":  "#00d4a0",
  Note:       "#8a9ab8",
};

export default function TimelinePage() {
  const router = useRouter();
  const [patient, setPatient] = useState<any>(null);
  const [events,  setEvents]  = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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
          load(p.id);
        }
      } catch {}
    };
    init();
  }, []);

  const load = async (id: string) => {
    setLoading(true);
    try {
      const data = await api.getTimeline(id);
      const evts = data.events || [];
      setEvents(evts);
    } catch {}
    setLoading(false);
  };

  const displayPatient = patient || { id: "", name: "Patient", age: "—", gender: "—", docs: [] };

  return (
    <div className="app-shell">
      <Sidebar/>
      <main className="main-area">
        <div className="page-header">
          <div>
            <div className="text-[17px] font-bold text-white">Timeline</div>
            <div className="text-[11px] text-ink-muted mt-0.5">
              {displayPatient.name} · Medical history from Cognee memory
            </div>
          </div>
          <button onClick={() => load(patient.id)} disabled={loading}
            className="btn-secondary text-[11px]">
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        <div className="page-content">
          {loading && events.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-teal/20 border-t-teal animate-spin-slow"/>
              <div className="text-[12px] text-ink-muted">Recalling from Cognee Cloud...</div>
            </div>
          )}

          {!loading && events.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="text-[14px] text-white">No timeline events yet</div>
              <div className="text-[12px] text-ink-muted">Upload patient documents to generate timeline</div>
            </div>
          )}

          {events.length > 0 && (
            <div className="max-w-2xl">
              <div className="border-l-2 border-line pl-6 flex flex-col gap-4">
                {events.map((evt, i) => {
                  const color = TYPE_COLORS[evt.type] || "#8a9ab8";
                  return (
                    <div key={evt.id || i} className="relative">
                      <div className="absolute -left-[31px] top-3 w-3 h-3 rounded-full border-2 flex-shrink-0"
                        style={{ background: color, borderColor: color }}/>
                      <div className="bg-bg-card border border-line rounded-xl px-4 py-3 hover:border-line-strong transition-all">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ color, background: `${color}18`, border: `0.5px solid ${color}30` }}>
                            {evt.type}
                          </span>
                          <span className="text-[9px] text-ink-muted">#{i + 1}</span>
                        </div>
                        <p className="text-[12px] text-ink-soft leading-relaxed">{evt.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { CogneePill, SectionLabel, Badge } from "@/components/ui";
import {
  IconUpload, IconFileText, IconCloud, IconNetwork, IconAlertTriangle,
  IconUser, IconPlus, IconX, IconCheck
} from "@/components/Icons";
import { api } from "@/lib/api";
import { cacheClearPatient } from "@/lib/cache";

export default function UploadPage() {
  const router = useRouter();

  const [patient,     setPatient]     = useState<any>(null);
  const [allPatients, setAllPatients] = useState<any[]>([]);
  const [docs,        setDocs]        = useState<any[]>([]);
  const [drag,        setDrag]        = useState(false);
  const [uploading,   setUploading]   = useState(false);
  const [progress,    setProgress]    = useState(0);
  const [phase,       setPhase]       = useState("");
  const [error,       setError]       = useState("");

  // Quick create patient modal state
  const [modal,     setModal]     = useState(false);
  const [creating,  setCreating]  = useState(false);
  const [newName,   setNewName]   = useState("");
  const [newAge,    setNewAge]    = useState("42");
  const [newGender, setNewGender] = useState("Female");
  const [newBlood,  setNewBlood]  = useState("B+");

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const doc = localStorage.getItem("medhelp_doctor");
      const listRes = await api.listPatients();
      const list = listRes.patients || [];
      setAllPatients(list);

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

      if (!p && list.length > 0) {
        p = list[0];
        localStorage.setItem("medhelp_active_patient", JSON.stringify(p));
        window.dispatchEvent(new Event("medhelp_patient_changed"));
      }

      if (p) {
        // Find latest version from list or server
        const fresh = list.find((x: any) => x.id === p.id) || p;
        setPatient(fresh);
        setDocs(fresh.docs || []);
      }
    } catch (e: any) {
      console.error("Failed to load patients", e);
    }
  };

  const changePatient = (patientId: string) => {
    const selected = allPatients.find(p => p.id === patientId);
    if (selected) {
      setPatient(selected);
      setDocs(selected.docs || []);
      localStorage.setItem("medhelp_active_patient", JSON.stringify(selected));
      window.dispatchEvent(new Event("medhelp_patient_changed"));
    }
  };

  const handleCreatePatient = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    setError("");
    try {
      const docObj = JSON.parse(localStorage.getItem("medhelp_doctor") || "{}");
      const created = await api.createPatient({
        name: newName.trim(),
        age: parseInt(newAge) || 30,
        gender: newGender,
        blood: newBlood,
        doctor: docObj?.name || "",
      });
      const newP = created.patient;
      setAllPatients(prev => [...prev, newP]);
      setPatient(newP);
      setDocs([]);
      localStorage.setItem("medhelp_active_patient", JSON.stringify(newP));
      window.dispatchEvent(new Event("medhelp_patient_changed"));
      setModal(false);
      setNewName("");
    } catch (e: any) {
      setError("Failed to create patient: " + e.message);
    } finally {
      setCreating(false);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files supported"); return;
    }
    setError("");

    let targetPatient = patient;
    if (!targetPatient) {
      setModal(true);
      return;
    }

    setUploading(true);
    setProgress(50);
    setPhase("Uploading document to Cognee Cloud...");

    try {
      await api.uploadDoc(targetPatient.id, file);

      setProgress(100);
      setPhase("Uploaded successfully! Building knowledge graph in background.");

      // Refresh patient data and clear stale memory caches
      cacheClearPatient(targetPatient.id);
      const updated = await api.getPatient(targetPatient.id);
      localStorage.setItem("medhelp_active_patient", JSON.stringify(updated));
      setPatient(updated);
      setDocs(updated.docs || []);

      // Refresh list
      const listRes = await api.listPatients();
      setAllPatients(listRes.patients || []);

      setTimeout(() => { setUploading(false); setProgress(0); setPhase(""); }, 2000);
    } catch (e: any) {
      setError(e.message || "Upload failed. Please try again.");
      setUploading(false); setProgress(0); setPhase("");
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDrag(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const displayPatientName = patient?.name || "Select a patient";
  const totalChunks = docs.reduce((s: number, d: any) => s + (d.chunks || 0), 0);
  const totalSize   = docs.reduce((s: number, d: any) => {
    const mb = parseFloat(d.size?.replace("MB","") || "0");
    return s + mb;
  }, 0);

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-area">
        <div className="page-header">
          <div>
            <div className="text-[17px] font-bold text-white">Upload Documents</div>
            <div className="text-[11px] text-ink-muted mt-0.5">
              Target Patient: <strong className="text-teal">{displayPatientName}</strong> · Add records to Cognee Cloud memory
            </div>
          </div>
          <CogneePill />
        </div>

        <div className="page-content">
          {error && (
            <div className="bg-rose-dark border border-rose/30 rounded-xl px-4 py-2.5 text-[12px] text-rose mb-4 flex items-center gap-2">
              <IconAlertTriangle size={14} className="flex-shrink-0" />
              {error}
            </div>
          )}

          {/* ── PATIENT SELECTOR BAR ───────────────────────── */}
          <div className="card mb-5 flex flex-wrap items-center justify-between gap-4" style={{ background: "linear-gradient(135deg,#0d1527,#070d18)", borderColor: "#00d4a030" }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-bold"
                style={{ background: "#00d4a020", color: "#00d4a0", border: "1.5px solid #00d4a040" }}>
                <IconUser size={18} />
              </div>
              <div>
                <div className="text-[10px] text-ink-muted uppercase tracking-widest">Selected Target Patient</div>
                <div className="text-[14px] font-semibold text-white">
                  {patient ? `${patient.name} (${patient.age} yrs · ${patient.gender})` : "No patient selected"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={patient?.id || ""}
                onChange={e => changePatient(e.target.value)}
                className="bg-bg-input border border-line-strong rounded-xl px-3 py-2 text-[12px] text-white cursor-pointer outline-none focus:border-teal/50"
              >
                {allPatients.length === 0 && <option value="">No patients found</option>}
                {allPatients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.age} yrs, {p.gender})
                  </option>
                ))}
              </select>

              <button onClick={() => setModal(true)} className="btn-secondary py-2 text-[12px]">
                <IconPlus size={13} /> New Patient
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">

            {/* ── LEFT ─────────────────────────── */}
            <div className="flex flex-col gap-4">

              {/* Drop zone */}
              <label
                onDragOver={e => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={onDrop}
                className={`dropzone ${drag ? "over" : ""} ${uploading ? "opacity-60 pointer-events-none" : "cursor-pointer"}`}
              >
                <input type="file" accept=".pdf" className="hidden" onChange={onFileInput} />
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-teal-dark border border-teal/30">
                  <IconCloud size={26} className="text-teal" />
                </div>
                <div className="text-[16px] font-semibold text-white mb-1">
                  {uploading ? "Processing..." : `Drop PDF for ${displayPatientName}`}
                </div>
                <p className="text-[12px] text-ink-muted mb-5 leading-relaxed">
                  Lab reports, prescriptions,<br />discharge summaries, scan reports
                </p>
                {!uploading && (
                  <div className="btn-primary mx-auto pointer-events-none">
                    <IconUpload size={13} /> Browse files
                  </div>
                )}
                <p className="text-[10px] text-ink-muted mt-3">PDF files only · Max 50MB</p>
              </label>

              {/* Progress card */}
              {uploading && (
                <div className="card animate-fade-in">
                  <SectionLabel>Upload in progress</SectionLabel>
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-[12px] text-ink-muted">{phase}</div>
                    <span className="text-[13px] font-bold text-teal">
                      {Math.min(100, Math.floor(progress))}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-line-strong overflow-hidden">
                    <div
                      className="h-full rounded-full bg-teal transition-all duration-300"
                      style={{ width: `${Math.min(100, progress)}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-ink-muted mt-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse flex-shrink-0" />
                    Ingesting into Cognee dataset: patient_{patient?.id?.slice(0,8)}
                  </div>
                </div>
              )}

              {/* Cognee status card */}
              <div className="rounded-2xl p-4 border" style={{ background: "#130f2e", borderColor: "#8b7ff530" }}>
                <div className="flex items-center gap-2 mb-3">
                  <IconNetwork size={13} className="text-violet" />
                  <span className="text-[11px] font-semibold text-violet">Cognee Cloud — memory status</span>
                </div>
                {[
                  ["Target Patient",       patient?.name || "None",                        "#ffffff"],
                  ["Documents ingested",   docs.length,                                    "#00d4a0"],
                  ["Total chunks",         totalChunks,                                    "#8b7ff5"],
                  ["Knowledge graph",      totalChunks > 0 ? "Active" : "Empty",           "#00d4a0"],
                  ["Total size",           totalSize > 0 ? `${totalSize.toFixed(2)} MB` : "—", "#4090e0"],
                ].map(([k, v, c]) => (
                  <div key={String(k)} className="flex justify-between py-2 border-b last:border-0"
                    style={{ borderColor: "#2a2060" }}>
                    <span className="text-[11px] text-ink-muted">{k}</span>
                    <span className="text-[12px] font-bold" style={{ color: String(c) }}>{v}</span>
                  </div>
                ))}
                <a href="https://platform.cognee.ai/sessions" target="_blank" rel="noreferrer"
                  className="btn-violet w-full mt-3 justify-center text-[12px] no-underline">
                  <IconNetwork size={13} /> View sessions in Cognee Cloud
                </a>
              </div>
            </div>

            {/* ── RIGHT ────────────────────────── */}
            <div className="card flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <SectionLabel>Ingested documents ({displayPatientName})</SectionLabel>
                <span className="badge badge-teal">{docs.length} in memory</span>
              </div>

              {docs.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-center py-10">
                  <div>
                    <IconFileText size={32} className="text-ink-muted mx-auto mb-2" />
                    <div className="text-[12px] text-ink-muted">No documents yet for {displayPatientName}</div>
                    <div className="text-[11px] text-ink-muted mt-1">Upload a PDF to build their memory graph</div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
                  {docs.map((doc: any, i: number) => (
                    <div key={i}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl border"
                      style={{ background: "#001f17", borderColor: "#00d4a030" }}>
                      <IconFileText size={16} color="#00d4a0" className="flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-medium text-white truncate">{doc.name}</div>
                        <div className="text-[10px] text-ink-muted mt-0.5">
                          {doc.uploaded_at?.split("T")[0] || "—"} · {doc.chunks} chunks · {doc.size}
                        </div>
                      </div>
                      <Badge label="Ingested" variant="teal" />
                    </div>
                  ))}
                </div>
              )}

              {docs.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-line flex-shrink-0">
                  {[
                    ["Total chunks",  totalChunks],
                    ["Documents",     docs.length],
                    ["Total size",    totalSize > 0 ? `${totalSize.toFixed(1)}MB` : "—"],
                  ].map(([k, v]) => (
                    <div key={String(k)} className="bg-bg-input rounded-xl p-2.5 text-center">
                      <div className="text-[15px] font-bold text-teal">{v}</div>
                      <div className="text-[9px] text-ink-muted mt-1">{k}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </main>

      {/* Quick Create Patient Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background:"rgba(0,0,0,.75)", backdropFilter:"blur(4px)" }}
          onClick={() => setModal(false)}>
          <div className="w-full max-w-sm rounded-2xl p-6 border border-line-strong animate-scale-in"
            style={{ background:"#0c1018" }} onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="text-[15px] font-semibold text-white">Create Patient Record</div>
                <div className="text-[11px] text-ink-muted mt-0.5">Create record to attach uploaded documents</div>
              </div>
              <button onClick={()=>setModal(false)} className="btn-ghost p-1.5 rounded-lg"><IconX size={16} /></button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[10px] font-bold text-ink-muted uppercase tracking-widest block mb-1.5">Full name</label>
                <div className="flex items-center gap-2.5 bg-bg-input border border-line-strong rounded-xl px-3 py-2.5 focus-within:border-teal/50 transition-all">
                  <IconUser size={14} className="text-ink-muted flex-shrink-0" />
                  <input value={newName} onChange={e=>setNewName(e.target.value)}
                    placeholder="e.g. Ananya Shah" className="flex-1 text-[13px] text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-ink-muted uppercase tracking-widest block mb-1.5">Age</label>
                  <input value={newAge} onChange={e=>setNewAge(e.target.value)} placeholder="42" type="number"
                    className="w-full bg-bg-input border border-line-strong rounded-xl px-3 py-2.5 text-[13px] text-white" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-ink-muted uppercase tracking-widest block mb-1.5">Gender</label>
                  <select value={newGender} onChange={e=>setNewGender(e.target.value)}
                    className="w-full bg-bg-input border border-line-strong rounded-xl px-3 py-2.5 text-[13px] text-white cursor-pointer">
                    {["Female","Male","Other"].map(g=><option key={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-ink-muted uppercase tracking-widest block mb-1.5">Blood group</label>
                <select value={newBlood} onChange={e=>setNewBlood(e.target.value)}
                  className="w-full bg-bg-input border border-line-strong rounded-xl px-3 py-2.5 text-[13px] text-white cursor-pointer">
                  {["B+","A+","A-","B-","O+","O-","AB+","AB-"].map(b=><option key={b}>{b}</option>)}
                </select>
              </div>
              <div className="flex gap-2 mt-1">
                <button onClick={()=>setModal(false)} className="btn-secondary flex-1 justify-center py-2.5">Cancel</button>
                <button onClick={handleCreatePatient} disabled={creating}
                  className="btn-primary flex-1 justify-center py-2.5">
                  {creating ? "Creating..." : "Create & Select Patient"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

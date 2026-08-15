"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { useTranslation } from "@/hooks/useTranslation";
import { IconShare2 } from "@/components/Icons";
import { api } from "@/lib/api";
import { cacheGet, cacheSet } from "@/lib/cache";

export default function MindmapPage() {
  const router  = useRouter();
  const { t }     = useTranslation();
  const svgRef  = useRef<SVGSVGElement>(null);
  const [patient, setPatient] = useState<any>(null);
  const [data,    setData]    = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [cached,  setCached]  = useState(false);

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
    const c = cacheGet<any>(`mindmap_${id}`);
    if (c) {
      setData(c);
      setCached(true);
      setLoading(false);
    } else {
      setLoading(true);
    }

    try {
      const mm = await api.getMindmap(id);
      if (mm) {
        setData(mm);
        cacheSet(`mindmap_${id}`, mm);
      }
    } catch {}
    setLoading(false);
  };

  const displayPatient = patient || { id: "", name: "Patient", age: "—", gender: "—", docs: [] };

  const nodes = data?.nodes || [];
  const edges = data?.relationships || [];
  const center = nodes.find((n:any)=>n.primary) || nodes[0];
  const others = nodes.filter((n:any)=>!n.primary);

  // Layout
  const W=800, H=500, cx=W/2, cy=H/2;
  const r = Math.min(W,H) * 0.34;
  const placed = others.map((n:any, i:number) => {
    const angle = (i/others.length)*2*Math.PI - Math.PI/2;
    return {...n, x:cx+r*Math.cos(angle), y:cy+r*Math.sin(angle)};
  });

  const LEGEND_ITEMS = [
    ["#00d4a0", t("legend_condition")],
    ["#8b7ff5", t("legend_patient")],
    ["#f0a030", t("legend_allergy")],
    ["#4090e0", t("legend_lab_result")],
    ["#50d4a0", t("legend_medication")],
    ["#e05a3a", t("legend_episode")],
    ["#8a9ab8", t("legend_entity")],
  ];

  return (
    <div className="app-shell">
      <Sidebar/>
      <main className="main-area">
        <div className="page-header">
          <div>
            <div className="text-[17px] font-bold text-white">{t("cognee_kg_title")}</div>
            <div className="text-[11px] text-ink-muted mt-0.5">
              {displayPatient.name} · {nodes.length} {t("entities_label")} · {edges.length} {t("relationships_label")}
              {cached && <span className="ml-2 text-teal">{t("cached_label")}</span>}
            </div>
          </div>
          <div className="flex gap-2">
            <a href="https://platform.cognee.ai" target="_blank" rel="noreferrer"
              className="btn-secondary text-[11px] no-underline">
              {t("view_in_cognee_cloud_link")}
            </a>
            <button onClick={()=>displayPatient.id && load(displayPatient.id)} disabled={loading}
              className="btn-secondary text-[11px]">
              {loading ? t("loading") : t("refresh_btn")}
            </button>
          </div>
        </div>

        <div className="page-content">
          {loading && !data && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-teal/20 border-t-teal animate-spin-slow"/>
              <div className="text-[12px] text-ink-muted">{t("building_kg_loading")}</div>
            </div>
          )}

          {data && (
            <>
              <div className="card mb-4" style={{padding:0, overflow:"hidden"}}>
                <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} width="100%"
                  style={{background:"#06080f", display:"block"}}>
                  <defs>
                    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#00d4a0" stopOpacity="0.05"/>
                      <stop offset="100%" stopColor="#00d4a0" stopOpacity="0"/>
                    </radialGradient>
                  </defs>
                  <ellipse cx={cx} cy={cy} rx={r*1.2} ry={r*1.1} fill="url(#bg)"/>

                  {/* Edges */}
                  {placed.map((n:any,i:number)=>(
                    <line key={i} x1={cx} y1={cy} x2={n.x} y2={n.y}
                      stroke={n.color} strokeWidth="1" strokeDasharray="5,4" opacity="0.4"/>
                  ))}

                  {/* Satellite nodes */}
                  {placed.map((n:any,i:number)=>(
                    <g key={i}>
                      <circle cx={n.x} cy={n.y} r="36" fill="#0b1020"
                        stroke={n.color} strokeWidth="1.5"/>
                      {/* Label */}
                      <text x={n.x} y={n.y-5} textAnchor="middle" fill="white"
                        fontSize="8.5" fontWeight="600" fontFamily="Inter,system-ui">
                        {n.label?.replace(/_/g," ").slice(0,14)}
                      </text>
                      {/* Type badge */}
                      <text x={n.x} y={n.y+9} textAnchor="middle" fill={n.color}
                        fontSize="7" fontFamily="Inter,system-ui" opacity="0.85">
                        {n.type}
                      </text>
                    </g>
                  ))}

                  {/* Center node */}
                  {center && (
                    <g>
                      <circle cx={cx} cy={cy} r="56" fill="#16133a"
                        stroke="#8b7ff5" strokeWidth="2.5"/>
                      <circle cx={cx} cy={cy} r="68" fill="none"
                        stroke="#8b7ff5" strokeWidth="0.5" strokeDasharray="4,5" opacity="0.3"/>
                      <text x={cx} y={cy-8} textAnchor="middle" fill="white"
                        fontSize="13" fontWeight="700" fontFamily="Inter,system-ui">
                        {center.label?.replace(/_/g," ").split(" ")[0]}
                      </text>
                      <text x={cx} y={cy+8} textAnchor="middle" fill="white"
                        fontSize="11" fontFamily="Inter,system-ui">
                        {center.label?.replace(/_/g," ").split(" ")[1]||""}
                      </text>
                      <text x={cx} y={cy+24} textAnchor="middle" fill="#8b7ff5"
                        fontSize="8" fontFamily="Inter,system-ui">
                        {center.sub}
                      </text>
                    </g>
                  )}
                </svg>
              </div>

              {/* Legend */}
              <div className="flex gap-3 flex-wrap">
                {LEGEND_ITEMS.map(([c,l])=>(
                  <div key={l} className="flex items-center gap-1.5 bg-bg-card border border-line rounded-lg px-2.5 py-1.5">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{background:c}}/>
                    <span className="text-[10px] text-ink-muted">{l}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

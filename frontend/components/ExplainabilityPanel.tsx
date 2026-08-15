"use client";
import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { IconInfo, IconAlertTriangle, IconFileText, IconDatabase, IconClock, IconNetwork, IconChevronRight } from "./Icons";

export default function ExplainabilityPanel({ data }: { data: any }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  
  if (!data) return null;

  if (data.unsupported_evidence) {
    return (
      <div className="mt-2 p-3 bg-rose-dark/20 border border-rose/30 rounded-lg flex items-start gap-2">
        <IconAlertTriangle size={14} className="text-rose flex-shrink-0 mt-0.5" />
        <div className="text-[11px] text-rose leading-snug">
          <span className="font-semibold">{t("insufficient_evidence_title")}</span>
          <br />{t("please_upload_additional")}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2 flex flex-col gap-2">
      {/* Clinical Significance */}
      {data.clinical_significance && (
        <div className="p-2.5 bg-teal-dark/10 border border-teal/20 rounded-lg flex items-start gap-2">
          <IconInfo size={14} className="text-teal flex-shrink-0 mt-0.5" />
          <div className="text-[11px] text-teal-100 leading-snug">
            <span className="font-semibold text-teal">{t("clinical_significance_title")} </span>
            {data.clinical_significance}
          </div>
        </div>
      )}

      {/* Contradictions */}
      {data.contradictions && data.contradictions.length > 0 && (
        <div className="p-2.5 bg-amber-dark/20 border border-amber/30 rounded-lg flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <IconAlertTriangle size={14} className="text-amber" />
            <span className="text-[11px] font-semibold text-amber uppercase tracking-widest">{t("conflicting_info_detected")}</span>
          </div>
          {data.contradictions.map((c: any, i: number) => (
            <div key={i} className="text-[11px] text-amber-100/80 leading-snug pl-5">
              <div>{c.conflict}</div>
              {c.documents && c.documents.length > 0 && (
                <div className="text-[10px] mt-1 text-amber-200/50">Sources: {c.documents.join(", ")}</div>
              )}
              {c.recommendation && (
                <div className="text-[10px] mt-1 font-medium text-amber-300/70">{c.recommendation}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Expandable Evidence & Reasoning */}
      <div className="border border-line rounded-lg overflow-hidden bg-bg-card/50">
        <button onClick={() => setExpanded(!expanded)} 
          className="w-full flex items-center justify-between p-2.5 hover:bg-white/5 transition-colors">
          <div className="flex items-center gap-2">
            <IconDatabase size={13} className="text-ink-muted" />
            <span className="text-[11px] font-medium text-ink-soft">{t("show_evidence_reasoning")}</span>
            {data.evidence_strength && (
               <span className={`text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded-full ${data.evidence_strength === 'Strong' ? 'bg-teal-dark/30 text-teal border border-teal/20' : data.evidence_strength === 'Moderate' ? 'bg-amber-dark/30 text-amber border border-amber/20' : 'bg-rose-dark/30 text-rose border border-rose/20'}`}>
                 {data.evidence_strength} {t("evidence_strength_label")}
               </span>
            )}
          </div>
          <IconChevronRight size={14} className={`text-ink-muted transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </button>

        
        {expanded && (
          <div className="p-3 border-t border-line flex flex-col gap-3 text-[11px] bg-bg-base/30">
            {data.clinical_reasoning && (
              <div>
                <div className="text-[10px] uppercase tracking-widest text-ink-muted font-semibold mb-1">{t("clinical_reasoning_title")}</div>
                <div className="text-ink-soft leading-snug">{data.clinical_reasoning}</div>
              </div>
            )}
            
            {data.evidence_reason && (
              <div>
                <div className="text-[10px] uppercase tracking-widest text-ink-muted font-semibold mb-1">{t("evidence_strength_reason_title")}</div>
                <div className="text-ink-soft leading-snug">{data.evidence_reason}</div>
              </div>
            )}

            {data.source_documents && data.source_documents.length > 0 && (
              <div>
                <div className="text-[10px] uppercase tracking-widest text-ink-muted font-semibold mb-1 flex items-center gap-1"><IconFileText size={10} /> {t("source_documents_title")}</div>
                <ul className="list-disc pl-4 text-teal/80">
                  {data.source_documents.map((d: string, i: number) => <li key={i}>{d}</li>)}
                </ul>
              </div>
            )}

            {data.knowledge_graph_entities && data.knowledge_graph_entities.length > 0 && (
              <div>
                <div className="text-[10px] uppercase tracking-widest text-ink-muted font-semibold mb-1 flex items-center gap-1"><IconNetwork size={10} /> {t("knowledge_graph_entities_title")}</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {data.knowledge_graph_entities.map((e: string, i: number) => (
                    <span key={i} className="bg-violet/10 text-violet border border-violet/20 px-1.5 py-0.5 rounded text-[10px]">{e}</span>
                  ))}
                </div>
              </div>
            )}

            {data.timeline_events && data.timeline_events.length > 0 && (
              <div>
                <div className="text-[10px] uppercase tracking-widest text-ink-muted font-semibold mb-1 flex items-center gap-1"><IconClock size={10} /> {t("timeline_events_title")}</div>
                <ul className="list-disc pl-4 text-sky/80">
                  {data.timeline_events.map((e: string, i: number) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            )}

            {data.retrieval_summary && (
              <div className="pt-2 border-t border-line border-dashed mt-1">
                <div className="text-[10px] text-ink-muted italic">{t("retrieval_summary_title")} {data.retrieval_summary}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

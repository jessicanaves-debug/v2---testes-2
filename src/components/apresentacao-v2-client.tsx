"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Sparkles, Loader2, Copy, Check, ChevronDown, ChevronUp,
  Plus, X, Target, ArrowLeftRight, Hash, TrendingDown,
  TrendingUp, Users, LayoutGrid, PieChart, Award, Share2,
  Clock, CheckCircle, Coins, ListChecks, Tag, FileText,
  Image as ImageIcon, ClipboardCopy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  type TomV2, type ShareTipo, type V2InputData, type V2AnalysisResult,
  type SlidesAtivosV2, defaultSlidesAtivosV2,
  SHARE_LABELS, HEATMAP_ICON_LABEL,
} from "@/lib/apresentacao-v2-prompt";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface ImgEntry { key: string; base64: string; mimeType: string; previewUrl: string; }
type HeatmapIcon = "nenhum" | "sucesso" | "whitelist" | "tratativa" | "parceiro" | "golpe";
interface HeatmapRow { icon: HeatmapIcon; domain: string; }

const HEATMAP_ICONS: HeatmapIcon[] = ["nenhum", "sucesso", "whitelist", "tratativa", "parceiro", "golpe"];
const HEATMAP_ICON_COLOR: Record<HeatmapIcon, string> = {
  sucesso: "bg-green-500/20 border-green-500/40", whitelist: "bg-red-500/20 border-red-500/40",
  tratativa: "bg-yellow-500/20 border-yellow-500/40", parceiro: "bg-blue-500/20 border-blue-500/40",
  golpe: "bg-orange-500/20 border-orange-500/40", nenhum: "bg-white/5 border-white/10",
};
const HEATMAP_EMOJI: Record<HeatmapIcon, string> = {
  sucesso: "✅", whitelist: "🚫", tratativa: "🔔", parceiro: "🤝", golpe: "⚠️", nenhum: "⬜",
};
function emptyHeatmapRow(): HeatmapRow { return { icon: "nenhum", domain: "" }; }

function fileToBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res((reader.result as string).split(",")[1]);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
}

// ─── SimpleImageZone ──────────────────────────────────────────────────────────

function SimpleImageZone({ label, preview, enabled = true, onToggle, onFile, onClear }: {
  label: string; preview: string; enabled?: boolean;
  onToggle?: () => void; onFile: (file: File) => void; onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  function handleFile(file: File | null | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Apenas imagens"); return; }
    onFile(file);
  }

  useEffect(() => {
    if (!isFocused) return;
    function onPaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) { e.preventDefault(); handleFile(file); toast.success("Imagem colada!"); return; }
        }
      }
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-white/50">{label}</p>
        {onToggle && (
          <button type="button" onClick={onToggle}
            className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all",
              enabled ? "bg-cyan-500/20 border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30" : "bg-white/5 border-white/10 text-white/25 hover:border-white/20")}>
            <div className={cn("w-1.5 h-1.5 rounded-full transition-all", enabled ? "bg-cyan-400" : "bg-white/20")} />
            {enabled ? "Incluir no PPT" : "Não incluir"}
          </button>
        )}
      </div>
      <div className={cn("transition-all", !enabled && "opacity-30 pointer-events-none select-none")}>
        <div ref={dropRef} tabIndex={0}
          onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}
          onClick={() => { setIsFocused(true); if (!preview) inputRef.current?.click(); }}
          onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
          onDragOver={(e) => e.preventDefault()}
          className={cn("relative rounded-xl border-2 transition-all overflow-hidden outline-none",
            preview ? "border-cyan-400/50 bg-[#0a2235] cursor-default" : "border-dashed border-white/20 hover:border-cyan-400/50 hover:bg-cyan-500/5 cursor-pointer",
            isFocused && !preview && "ring-2 ring-cyan-400/20 border-cyan-400/60 bg-cyan-500/5")}>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
          {preview ? (
            <>
              <div className="w-full p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt={label} className="w-full h-auto object-contain rounded-lg" style={{ display: "block" }} />
              </div>
              <button type="button" onClick={(e) => { e.stopPropagation(); onClear(); }}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-500/80 transition-colors" title="Remover">
                <X size={12} />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 py-8">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                <ImageIcon size={18} className="text-white/30" />
              </div>
              <p className="text-sm font-medium text-white/50">Clique, arraste ou cole (Ctrl+V)</p>
              <p className="text-[11px] text-white/25 flex items-center gap-1"><ClipboardCopy size={10} />Cole da área de transferência</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function SectionCard({ children, className, dimmed = false }: { children: React.ReactNode; className?: string; dimmed?: boolean; }) {
  return <div className={cn("rounded-xl border border-white/10 bg-white/5 p-5 space-y-4 transition-opacity", dimmed && "opacity-30", className)}>{children}</div>;
}

function SectionHeader({ num, title, desc }: { num: number | string; title: string; desc?: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{num}</div>
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        {desc && <p className="text-xs text-white/40 mt-0.5">{desc}</p>}
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-medium text-white/50 mb-1.5">{children}</label>;
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string; }) {
  return <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-colors" />;
}

function TextArea({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number; }) {
  return <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows}
    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 resize-y transition-colors" />;
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2.5">
      <span className="text-xs text-white/70">{label}</span>
      <button type="button" onClick={() => onChange(!checked)} className={cn("relative w-9 h-5 rounded-full transition-colors", checked ? "bg-cyan-500" : "bg-white/10")}>
        <span className={cn("absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform", checked ? "translate-x-4" : "translate-x-0")} />
      </button>
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={cn("text-[11px] px-3 py-1.5 rounded-full border transition-all",
        active ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-300 font-medium" : "bg-white/5 border-white/10 text-white/40 hover:border-white/20 hover:text-white/60")}>
      {label}
    </button>
  );
}

function TomCard({ tom, active, onClick }: { tom: TomV2; active: boolean; onClick: () => void; }) {
  const MAP = {
    retencao: { title: "Retenção / Anti-churn", desc: "Cliente questionando valor. Foco em provar ROI." },
    renovacao: { title: "Renovação de contrato", desc: "Reforçar evolução ao longo da parceria." },
    expansao: { title: "Expansão / Upsell", desc: "Cliente saudável. Abrir novas frentes." },
    rotina: { title: "Status de rotina", desc: "Reunião mensal padrão." },
  };
  const { title, desc } = MAP[tom];
  return (
    <button type="button" onClick={onClick}
      className={cn("rounded-lg border p-3 text-left transition-all", active ? "border-cyan-500/50 bg-cyan-500/10" : "border-white/10 bg-white/5 hover:border-white/20")}>
      <p className={cn("text-xs font-semibold", active ? "text-cyan-300" : "text-white/80")}>{title}</p>
      <p className="text-[11px] text-white/40 mt-0.5 leading-relaxed">{desc}</p>
    </button>
  );
}

// ─── Constantes e helpers ─────────────────────────────────────────────────────

const FRENTE_OPTIONS = [
  { id: "BB", label: "Brand Bidding" }, { id: "GO", label: "Golpes (GO)" },
  { id: "VM", label: "Vigilância de Marca (VM)" }, { id: "VC", label: "Vigilância de Canal (VC)" },
  { id: "ADS", label: "Google Ads" }, { id: "SAVING", label: "Saving / ROI" },
];

const SHARE_OPTIONS: ShareTipo[] = ["totais_termo", "por_termo", "por_agressor", "por_pagina", "por_categoria", "por_buscador", "por_canal"];

function emptyData(): V2InputData {
  return {
    clientName: "", period: "", partnershipTime: "", tom: "retencao", frentes: ["BB"], goContratado: false, goInteresse: false,
    lastMeeting: "", pendencias: "",
    bnTotal: { identificados: "", inativos: "", ocorrencias: "", notificados: "", resolvidos: "", notificacoesEnviadas: "", economia: "" },
    bnMensal: { identificados: "", inativos: "", ocorrencias: "", notificados: "", resolvidos: "", notificacoesEnviadas: "", taxaSucesso: "", economia: "" },
    branddiScore: "", agressores: "", termosDesc: "", termosExtras: [],
    shareAtivos: ["por_termo", "por_agressor"], shareDescricoes: {} as Record<ShareTipo, string>,
    heatmap: "", hasTM: false, tmAgressores: "", tmOcorrencias: "", tmDesc: "", tmPendentes: "",
    hasAfiliados: false, afiliadosDesc: "", tratativas: "", mediacao: "", negativacoes: "", resolvidosDominios: "",
    hasAds: false, adsCpc: "", adsCtr: "", adsParcela: "", adsPos1: "", adsKeyword: "",
    hasSaving: false, savingTotal: "", savingRoi: "",
  };
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function ApresentacaoV2Client() {
  const [data, setData] = useState<V2InputData>(emptyData);
  const [heatmapRows, setHeatmapRows] = useState<HeatmapRow[]>([emptyHeatmapRow(), emptyHeatmapRow(), emptyHeatmapRow()]);
  const [images, setImages] = useState<ImgEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<V2AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [slidesAtivos, setSlidesAtivos] = useState<SlidesAtivosV2>(defaultSlidesAtivosV2());

  const upd = useCallback((partial: Partial<V2InputData>) => setData((d) => ({ ...d, ...partial })), []);
  const updBnTotal = useCallback((partial: Partial<V2InputData["bnTotal"]>) => setData((d) => ({ ...d, bnTotal: { ...d.bnTotal, ...partial } })), []);
  const updBnMensal = useCallback((partial: Partial<V2InputData["bnMensal"]>) => setData((d) => ({ ...d, bnMensal: { ...d.bnMensal, ...partial } })), []);

  function toggleSlide(key: keyof SlidesAtivosV2) { setSlidesAtivos((prev) => ({ ...prev, [key]: !prev[key] })); }
  function toggleFrente(f: string) { setData((d) => ({ ...d, frentes: d.frentes.includes(f) ? d.frentes.filter((x) => x !== f) : [...d.frentes, f] })); }
  function toggleShare(k: ShareTipo) { setData((d) => ({ ...d, shareAtivos: d.shareAtivos.includes(k) ? d.shareAtivos.filter((x) => x !== k) : [...d.shareAtivos, k] })); }
  function setShareDesc(k: ShareTipo, v: string) { setData((d) => ({ ...d, shareDescricoes: { ...d.shareDescricoes, [k]: v } })); }
  function addTermoExtra() { setData((d) => ({ ...d, termosExtras: [...d.termosExtras, ""] })); }
  function updateTermoExtra(i: number, v: string) { setData((d) => { const arr = [...d.termosExtras]; arr[i] = v; return { ...d, termosExtras: arr }; }); }
  function removeTermoExtra(i: number) { setData((d) => ({ ...d, termosExtras: d.termosExtras.filter((_, idx) => idx !== i) })); }

  async function handleImageFile(file: File, key: string) {
    const base64 = await fileToBase64(file);
    const previewUrl = URL.createObjectURL(file);
    setImages((prev) => [...prev.filter((i) => i.key !== key), { key, base64, mimeType: file.type || "image/png", previewUrl }]);
  }

  function clearImage(key: string) { setImages((prev) => prev.filter((i) => i.key !== key)); }

  async function handleGenerate() {
    setLoading(true); setError(""); setResult(null);
    try {
      const hmRowsDesc = heatmapRows.filter((r) => r.domain.trim()).map((r) => `${r.domain} (${r.icon === "tratativa" ? "em tratativa" : r.icon})`).join(", ");
      const dataWithHeatmap = { ...data, heatmap: hmRowsDesc ? `Agressores classificados: ${hmRowsDesc}` : data.heatmap };
      const res = await fetch("/api/analyze-v2", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: dataWithHeatmap, images: images.map(({ key, base64, mimeType }) => ({ key, base64, mimeType })) }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Erro desconhecido");
      setResult(json.data); setShowResult(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao gerar análise");
    } finally {
      setLoading(false);
    }
  }

  function handleCopyAll() {
    if (!result) return;
    const lines: string[] = ["APRESENTAÇÃO MENSAL V2\n"];
    // TODO: adicionar renderização dos blocos
    navigator.clipboard.writeText(lines.join("\n")).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col flex-1 overflow-hidden" style={{ background: "linear-gradient(135deg, #061520 0%, #0a2235 40%, #0d3349 70%, #0a4d5c 100%)" }}>
      <div className="flex-1 overflow-y-auto p-6 relative">
        <div className="max-w-3xl mx-auto space-y-5">
          
          <div className="flex items-center gap-3 mb-2">
            <div><h2 className="text-white font-bold text-lg">Apresentação Mensal</h2><p className="text-xs text-white/40 mt-0.5">V2 — Análise correlacionada completa</p></div>
            <span className="ml-auto shrink-0 text-[11px] px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-semibold">V2 — Correlacionada</span>
          </div>

          {/* BLOCO 1: CONTEXTO */}
          <SectionCard><SectionHeader num={1} title="Contexto estratégico" desc="Define tom e foco" />
            <div className="grid grid-cols-3 gap-3">
              <div><FieldLabel>Nome do cliente</FieldLabel><TextInput value={data.clientName} onChange={(v) => upd({ clientName: v })} placeholder="Ex: Banco XYZ" /></div>
              <div><FieldLabel>Mês / Período</FieldLabel><TextInput value={data.period} onChange={(v) => upd({ period: v })} placeholder="Abril/2026" /></div>
              <div><FieldLabel>Tempo de parceria</FieldLabel><TextInput value={data.partnershipTime} onChange={(v) => upd({ partnershipTime: v })} placeholder="8 meses" /></div>
            </div>
            <div><FieldLabel>Objetivo</FieldLabel><div className="grid grid-cols-2 gap-2">{(["retencao","renovacao","expansao","rotina"] as TomV2[]).map((t) => <TomCard key={t} tom={t} active={data.tom === t} onClick={() => upd({ tom: t })} />)}</div></div>
            <div><FieldLabel>Frentes ativas</FieldLabel><div className="flex flex-wrap gap-2">{FRENTE_OPTIONS.map((f) => <Chip key={f.id} label={f.label} active={data.frentes.includes(f.id)} onClick={() => toggleFrente(f.id)} />)}</div></div>
          </SectionCard>

          {/* BLOCO 2: ÚLTIMA REUNIÃO */}
          <SectionCard><SectionHeader num={2} title="Contexto da última reunião" />
            <div><FieldLabel>Como foi? Como o cliente se sente?</FieldLabel><TextArea value={data.lastMeeting} onChange={(v) => upd({ lastMeeting: v })} rows={3} placeholder="Contexto..." /></div>
            <div><FieldLabel>Alertas ou pendências</FieldLabel><TextArea value={data.pendencias} onChange={(v) => upd({ pendencias: v })} rows={2} placeholder="Pendências..." /></div>
            <div className="grid grid-cols-2 gap-2"><Toggle checked={data.goContratado} onChange={(v) => upd({ goContratado: v })} label="GO contratado?" /><Toggle checked={data.goInteresse} onChange={(v) => upd({ goInteresse: v })} label="Interesse em GO?" /></div>
          </SectionCard>

          {/* BLOCO 3: DADOS E GRÁFICOS (com toggles) */}
          <SectionCard><SectionHeader num={3} title="Dados e gráficos" desc="Cole prints e dados" />
            
            {/* Big Numbers Total */}
            <div className={cn("transition-opacity", !slidesAtivos.bigNumbersTotal && "opacity-30")}>
              <SimpleImageZone label="Big Numbers Total" preview="" enabled={slidesAtivos.bigNumbersTotal} onToggle={() => toggleSlide("bigNumbersTotal")} onFile={(f) => handleImageFile(f, "bn_total")} onClear={() => clearImage("bn_total")} />
              <div className="grid grid-cols-3 gap-2 mt-2">
                <div><FieldLabel>Identificados</FieldLabel><TextInput value={data.bnTotal.identificados} onChange={(v) => updBnTotal({ identificados: v })} placeholder="847" /></div>
                <div><FieldLabel>Inativos</FieldLabel><TextInput value={data.bnTotal.inativos} onChange={(v) => updBnTotal({ inativos: v })} placeholder="558" /></div>
                <div><FieldLabel>Ocorrências</FieldLabel><TextInput value={data.bnTotal.ocorrencias} onChange={(v) => updBnTotal({ ocorrencias: v })} placeholder="12403" /></div>
                <div><FieldLabel>Notificados</FieldLabel><TextInput value={data.bnTotal.notificados} onChange={(v) => updBnTotal({ notificados: v })} placeholder="312" /></div>
                <div><FieldLabel>Resolvidos</FieldLabel><TextInput value={data.bnTotal.resolvidos} onChange={(v) => updBnTotal({ resolvidos: v })} placeholder="289" /></div>
                <div><FieldLabel>Notif. enviadas</FieldLabel><TextInput value={data.bnTotal.notificacoesEnviadas} onChange={(v) => updBnTotal({ notificacoesEnviadas: v })} placeholder="300" /></div>
              </div>
              <div className="mt-2"><FieldLabel>Economia total (R$)</FieldLabel><TextInput value={data.bnTotal.economia} onChange={(v) => updBnTotal({ economia: v })} placeholder="R$ 109.200" /></div>
            </div>

            {/* Big Numbers Mensal */}
            <div className={cn("transition-opacity", !slidesAtivos.bigNumbersMensal && "opacity-30")}>
              <SimpleImageZone label="Big Numbers Mensal" preview="" enabled={slidesAtivos.bigNumbersMensal} onToggle={() => toggleSlide("bigNumbersMensal")} onFile={(f) => handleImageFile(f, "bn_mensal")} onClear={() => clearImage("bn_mensal")} />
              <div className="grid grid-cols-3 gap-2 mt-2">
                <div><FieldLabel>Identificados</FieldLabel><TextInput value={data.bnMensal.identificados} onChange={(v) => updBnMensal({ identificados: v })} placeholder="44" /></div>
                <div><FieldLabel>Inativos</FieldLabel><TextInput value={data.bnMensal.inativos} onChange={(v) => updBnMensal({ inativos: v })} placeholder="28" /></div>
                <div><FieldLabel>Ocorrências</FieldLabel><TextInput value={data.bnMensal.ocorrencias} onChange={(v) => updBnMensal({ ocorrencias: v })} placeholder="1820" /></div>
                <div><FieldLabel>Notificados</FieldLabel><TextInput value={data.bnMensal.notificados} onChange={(v) => updBnMensal({ notificados: v })} placeholder="19" /></div>
                <div><FieldLabel>Resolvidos</FieldLabel><TextInput value={data.bnMensal.resolvidos} onChange={(v) => updBnMensal({ resolvidos: v })} placeholder="17" /></div>
                <div><FieldLabel>Notif. enviadas</FieldLabel><TextInput value={data.bnMensal.notificacoesEnviadas} onChange={(v) => updBnMensal({ notificacoesEnviadas: v })} placeholder="23" /></div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div><FieldLabel>Taxa de sucesso</FieldLabel><TextInput value={data.bnMensal.taxaSucesso} onChange={(v) => updBnMensal({ taxaSucesso: v })} placeholder="89%" /></div>
                <div><FieldLabel>Economia mês (R$)</FieldLabel><TextInput value={data.bnMensal.economia} onChange={(v) => updBnMensal({ economia: v })} placeholder="R$ 8.050" /></div>
              </div>
            </div>

            {/* Branddi Score */}
            <div className={cn("transition-opacity", !slidesAtivos.branddiScore && "opacity-30")}>
              <SimpleImageZone label="Branddi Score" preview={images.find(i => i.key === 'score')?.previewUrl || ''} enabled={slidesAtivos.branddiScore} onToggle={() => toggleSlide("branddiScore")} onFile={(f) => handleImageFile(f, 'score')} onClear={() => clearImage('score')} />
              <div className="mt-2"><FieldLabel>Dados do score e histórico</FieldLabel><TextInput value={data.branddiScore} onChange={(v) => upd({ branddiScore: v })} placeholder="Atual 74. Jan:71 Fev:73 Mar:68 Abr:74. Média ~60" /></div>
            </div>

            {/* Agressores Total */}
            <div className={cn("transition-opacity", !slidesAtivos.agressoresTotal && "opacity-30")}>
              <SimpleImageZone label="Agressores Total" preview={images.find(i => i.key === 'agr_total')?.previewUrl || ''} enabled={slidesAtivos.agressoresTotal} onToggle={() => toggleSlide("agressoresTotal")} onFile={(f) => handleImageFile(f, 'agr_total')} onClear={() => clearImage('agr_total')} />
            </div>

            {/* Agressores Semanal */}
            <div className={cn("transition-opacity", !slidesAtivos.agressoresSemanal && "opacity-30")}>
              <SimpleImageZone label="Agressores Semanal" preview={images.find(i => i.key === 'agr_sem')?.previewUrl || ''} enabled={slidesAtivos.agressoresSemanal} onToggle={() => toggleSlide("agressoresSemanal")} onFile={(f) => handleImageFile(f, 'agr_sem')} onClear={() => clearImage('agr_sem')} />
              <div className="mt-2"><FieldLabel>Dados mensais e semanais</FieldLabel><TextArea value={data.agressores} onChange={(v) => upd({ agressores: v })} rows={3} placeholder="Jan:42/8 novos. Fev:38/5. Mar:51/11..." /></div>
            </div>

            {/* Termos */}
            <div className={cn("transition-opacity", !slidesAtivos.termos && "opacity-30")}>
              <SimpleImageZone label="Análise de Termos" preview={images.find(i => i.key === 'termos')?.previewUrl || ''} enabled={slidesAtivos.termos} onToggle={() => toggleSlide("termos")} onFile={(f) => handleImageFile(f, 'termos')} onClear={() => clearImage('termos')} />
              <div className="mt-2"><FieldLabel>Análise termos compostos vs puro</FieldLabel><TextArea value={data.termosDesc} onChange={(v) => upd({ termosDesc: v })} rows={2} placeholder="Termos compostos 68%..." /></div>
              {data.termosExtras.map((t, i) => (
                <div key={i} className="flex gap-2 mt-2"><TextInput value={t} onChange={(v) => updateTermoExtra(i, v)} placeholder={`Termo ${i + 1}`} /><button type="button" onClick={() => removeTermoExtra(i)} className="w-8 rounded text-white/30 hover:text-red-400"><X size={12} /></button></div>
              ))}
              <button type="button" onClick={addTermoExtra} className="mt-2 text-xs text-cyan-400 flex items-center gap-1"><Plus size={12} />Adicionar termo</button>
            </div>

            {/* Heatmap */}
            <div className={cn("transition-opacity", !slidesAtivos.heatmap && "opacity-30")}>
              <SimpleImageZone label="Heatmap" preview={images.find(i => i.key === 'heatmap')?.previewUrl || ''} enabled={slidesAtivos.heatmap} onToggle={() => toggleSlide("heatmap")} onFile={(f) => handleImageFile(f, 'heatmap')} onClear={() => clearImage('heatmap')} />
              <div className="mt-3 rounded border border-white/10 bg-white/5 p-3">
                <p className="text-[10px] font-semibold text-white/40 uppercase mb-2">Classificar agressores</p>
                {heatmapRows.map((row, i) => (
                  <div key={i} className="flex gap-2 items-center mb-1.5">
                    <div className={cn("w-8 h-8 flex items-center justify-center rounded-lg border text-base", HEATMAP_ICON_COLOR[row.icon])}>{HEATMAP_EMOJI[row.icon]}</div>
                    <input type="text" value={row.domain} onChange={(e) => setHeatmapRows((prev) => prev.map((r, idx) => idx === i ? { ...r, domain: e.target.value } : r))} placeholder="dominio.com" className="flex-1 rounded border border-white/10 bg-white/5 text-white px-2 py-1.5 text-xs" />
                    <select value={row.icon} onChange={(e) => setHeatmapRows((prev) => prev.map((r, idx) => idx === i ? { ...r, icon: e.target.value as HeatmapIcon } : r))} className="rounded border border-white/10 bg-[#0d2035] text-white px-2 py-1.5 text-xs w-36">{HEATMAP_ICONS.map((ic) => <option key={ic} value={ic}>{HEATMAP_ICON_LABEL[ic]}</option>)}</select>
                    <button type="button" onClick={() => setHeatmapRows((prev) => prev.filter((_, idx) => idx !== i))} className="w-7 h-7 text-white/20 hover:text-red-400"><X size={11} /></button>
                  </div>
                ))}
                <button type="button" onClick={() => setHeatmapRows((prev) => [...prev, emptyHeatmapRow()])} className="mt-2 text-xs text-cyan-400 flex items-center gap-1"><Plus size={12} />Adicionar linha</button>
              </div>
            </div>

          </SectionCard>

          {/* BOTÃO GERAR */}
          <button onClick={handleGenerate} disabled={loading} className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm bg-cyan-500 hover:bg-cyan-400 text-white transition-all disabled:opacity-40">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {loading ? "Analisando..." : "Gerar análise correlacionada completa"}
          </button>

          {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}

          {/* RESULTADO */}
          {result && (
            <div className="rounded-xl border border-white/10 bg-white/5">
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
                <div className="flex items-center gap-2"><CheckCircle size={14} className="text-cyan-400" /><span className="text-sm font-semibold text-white">Análise gerada</span></div>
                <button onClick={handleCopyAll} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/60 hover:text-white"><Copy size={11} />{copied ? "Copiado!" : "Copiar"}</button>
              </div>
              <div className="p-5 text-sm text-white">Análise pronta. (Preview será implementado na etapa 4)</div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

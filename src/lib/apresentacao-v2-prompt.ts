// ═══════════════════════════════════════════════════════════════════════════
// Apresentação Mensal V2 — Sistema de análise correlacionada completo
// ═══════════════════════════════════════════════════════════════════════════

export type TomV2 = "retencao" | "renovacao" | "expansao" | "rotina";
export type HeatmapIcon = "nenhum" | "sucesso" | "whitelist" | "tratativa" | "parceiro" | "golpe";
export type ShareTipo =
  | "totais_termo" | "por_termo" | "por_agressor" | "por_pagina"
  | "por_categoria" | "por_buscador" | "por_canal";

export const SHARE_LABELS: Record<ShareTipo, string> = {
  totais_termo: "Share de Ocorrências e Agressores Totais por Termo",
  por_termo: "Share de Ocorrências por Termos",
  por_agressor: "Share de Ocorrências por Agressor",
  por_pagina: "Share de Ocorrências por Página",
  por_categoria: "Share de Ocorrências por Categoria",
  por_buscador: "Share de Ocorrências por Buscador",
  por_canal: "Share de Ocorrências por Canal",
};

export const HEATMAP_ICON_LABEL: Record<HeatmapIcon, string> = {
  nenhum: "— Sem classificação",
  sucesso: "✅ Sucesso",
  whitelist: "🚫 Whitelist",
  tratativa: "🔔 Em tratativa",
  parceiro: "🤝 Parceiro",
  golpe: "⚠️ Golpe",
};

// ─── Slide toggles ────────────────────────────────────────────────────────────
export type SlidesAtivosV2 = {
  bigNumbersTotal: boolean; bigNumbersMensal: boolean;
  branddiScore: boolean; agressoresTotal: boolean; agressoresSemanal: boolean;
  termos: boolean; afiliados: boolean;
  shareOcorrencias: boolean; trademark: boolean; heatmap: boolean;
  tratativas: boolean; mediacao: boolean; negativacoes: boolean; resolvidos: boolean;
  adsCpc: boolean; adsCtr: boolean; adsImpressao: boolean;
  saving: boolean; proximosPassos: boolean;
};

export function defaultSlidesAtivosV2(): SlidesAtivosV2 {
  return {
    bigNumbersTotal: true, bigNumbersMensal: true,
    branddiScore: true, agressoresTotal: true, agressoresSemanal: true,
    termos: true, afiliados: false, shareOcorrencias: true,
    trademark: false, heatmap: true,
    tratativas: true, mediacao: false, negativacoes: true, resolvidos: true,
    adsCpc: false, adsCtr: false, adsImpressao: false,
    saving: false, proximosPassos: true,
  };
}

// ─── Input data structure ─────────────────────────────────────────────────────
export interface V2InputData {
  // Contexto
  clientName: string; period: string; partnershipTime: string;
  tom: TomV2; frentes: string[];
  goContratado: boolean; goInteresse: boolean;
  lastMeeting: string; pendencias: string;
  
  // Big Numbers
  bnTotal: { identificados: string; inativos: string; ocorrencias: string; notificados: string; resolvidos: string; notificacoesEnviadas: string; economia: string; };
  bnMensal: { identificados: string; inativos: string; ocorrencias: string; notificados: string; resolvidos: string; notificacoesEnviadas: string; taxaSucesso: string; economia: string; };
  
  // Gráficos branddi
  branddiScore: string; agressores: string; termosDesc: string; termosExtras: string[];
  
  // Share
  shareAtivos: ShareTipo[]; shareDescricoes: Record<ShareTipo, string>;
  
  // Heatmap
  heatmap: string;
  
  // Trademark
  hasTM: boolean; tmAgressores: string; tmOcorrencias: string; tmDesc: string; tmPendentes: string;
  
  // Afiliados
  hasAfiliados: boolean; afiliadosDesc: string;
  
  // Tratativas
  tratativas: string; mediacao: string; negativacoes: string; resolvidosDominios: string;
  
  // Ads
  hasAds: boolean; adsCpc: string; adsCtr: string; adsParcela: string; adsPos1: string; adsKeyword: string;
  
  // Saving
  hasSaving: boolean; savingTotal: string; savingRoi: string;
}

// ─── Analysis result ──────────────────────────────────────────────────────────
export interface V2AnalysisResult {
  tom_geral: string;
  correlacao: string;
  big_numbers_total: { e1: string; e2: string } | null;
  big_numbers_mensal: { e1: string; e2: string } | null;
  branddi_score: { e1: string; e2: string } | null;
  agressores: { e1: string; e2: string } | null;
  termos: { e1: string; e2: string } | null;
  share_ocorrencias: { e1: string; e2: string } | null;
  heatmap: { e1: string; e2: string } | null;
  trademark: { e1: string; e2: string } | null;
  afiliados: { e1: string; e2: string } | null;
  tratativas: { e1: string; e2: string } | null;
  resolvidos: { e1: string; e2: string } | null;
  ads_cpc: { e1: string; e2: string } | null;
  ads_ctr: { e1: string; e2: string } | null;
  ads_impressao: { e1: string; e2: string } | null;
  saving: { e1: string; e2: string } | null;
  proximos_passos: { e1: string; e2: string } | null;
}

// ─── System prompt ────────────────────────────────────────────────────────────
const TOM_MAP: Record<TomV2, string> = {
  retencao: "RETENÇÃO / ANTI-CHURN — cliente questionando valor; provar ROI com urgência",
  renovacao: "RENOVAÇÃO DE CONTRATO — reforçar acúmulo de valor e evolução",
  expansao: "EXPANSÃO / UPSELL — cliente saudável; abrir conversa sobre novas frentes",
  rotina: "STATUS MENSAL DE ROTINA — tom consultivo equilibrado",
};

export function buildV2SystemPrompt(data: V2InputData): string {
  return `Você é analista sênior de inteligência da Branddi especializado em Brand Bidding.

OBJETIVO: ${TOM_MAP[data.tom]}
FRENTES: ${data.frentes.join(", ")}
GO CONTRATADO: ${data.goContratado ? "Sim" : "Não"}
INTERESSE EM GO: ${data.goInteresse ? "Sim" : "Não"}

PILARES DE VALOR (conectar análise a pelo menos 1):
1. Preservação da receita
2. Redução de desperdício de mídia
3. Blindagem comercial
4. Proteção de marca
5. Confiança do consumidor

REGRAS CRÍTICAS:
- Tom profissional, analítico, humanizado, estratégico
- NUNCA segunda pessoa — sempre terceira
- NUNCA invente dados não fornecidos
- NUNCA use travessões longos
- NUNCA use emojis
- ANALISE APENAS OS DADOS FORNECIDOS — se algo não foi enviado, não mencione
- QUEDA de agressores após atuação = efetividade
- AUMENTO = monitoramento ágil captou
- Score >60 = blindagem efetiva
- CORRELAÇÃO: identificar relações de causa e efeito entre gráficos
- Economia = protagonista nos Big Numbers
- Heatmap: máx 2-3 frases
- Big Numbers: 3 frases (impacto + consequência + continuidade)
- Demais slides: 3-4 frases

RETORNE JSON:
{"tom_geral":"frase sobre o tom adotado","correlacao":"parágrafo conectando todos os dados (máx 4 frases)","big_numbers_total":{"e1":"","e2":""},"big_numbers_mensal":{"e1":"","e2":""},"branddi_score":{"e1":"","e2":""},"agressores":{"e1":"","e2":""},"termos":{"e1":"","e2":""},"share_ocorrencias":{"e1":"","e2":""},"heatmap":{"e1":"","e2":""},"trademark":{"e1":"","e2":""},"afiliados":{"e1":"","e2":""},"tratativas":{"e1":"","e2":""},"resolvidos":{"e1":"","e2":""},"ads_cpc":{"e1":"","e2":""},"ads_ctr":{"e1":"","e2":""},"ads_impressao":{"e1":"","e2":""},"saving":{"e1":"","e2":""},"proximos_passos":{"e1":"","e2":""}}

Campos sem dados: retorne null. APENAS JSON.`;
}

export function buildV2UserMessage(data: V2InputData): string {
  const lines: string[] = [];
  lines.push(`CLIENTE: ${data.clientName || "—"} | PERÍODO: ${data.period || "—"} | PARCERIA: ${data.partnershipTime || "—"}`);
  if (data.lastMeeting) lines.push(`\nCONTEXTO DA ÚLTIMA REUNIÃO:\n${data.lastMeeting}`);
  if (data.pendencias) lines.push(`\nPENDÊNCIAS:\n${data.pendencias}`);
  
  lines.push(`\n── BIG NUMBERS TOTAL ──`);
  lines.push(`Identificados: ${data.bnTotal.identificados || "?"} | Inativos: ${data.bnTotal.inativos || "?"} | Ocorrências: ${data.bnTotal.ocorrencias || "?"}`);
  lines.push(`Notificados: ${data.bnTotal.notificados || "?"} | Resolvidos: ${data.bnTotal.resolvidos || "?"} | Notif. enviadas: ${data.bnTotal.notificacoesEnviadas || "?"}`);
  lines.push(`Economia total: ${data.bnTotal.economia || "?"}`);
  
  lines.push(`\n── BIG NUMBERS MENSAL ──`);
  lines.push(`Identificados: ${data.bnMensal.identificados || "?"} | Inativos: ${data.bnMensal.inativos || "?"} | Ocorrências: ${data.bnMensal.ocorrencias || "?"}`);
  lines.push(`Notificados: ${data.bnMensal.notificados || "?"} | Resolvidos: ${data.bnMensal.resolvidos || "?"} | Notif. enviadas: ${data.bnMensal.notificacoesEnviadas || "?"}`);
  lines.push(`Taxa sucesso: ${data.bnMensal.taxaSucesso || "?"} | Economia mês: ${data.bnMensal.economia || "?"}`);
  
  if (data.branddiScore) lines.push(`\n── BRANDDI SCORE ──\n${data.branddiScore}`);
  if (data.agressores) lines.push(`\n── AGRESSORES ──\n${data.agressores}`);
  if (data.termosDesc) lines.push(`\n── ANÁLISE DE TERMOS ──\n${data.termosDesc}`);
  if (data.termosExtras.length > 0) lines.push(`Outros termos: ${data.termosExtras.join(" | ")}`);
  
  const shareAtivos = data.shareAtivos.filter((k) => data.shareDescricoes[k]?.trim());
  if (shareAtivos.length > 0) {
    lines.push(`\n── SHARE DE OCORRÊNCIAS ──`);
    shareAtivos.forEach((k) => lines.push(`${SHARE_LABELS[k]}: ${data.shareDescricoes[k]}`));
  }
  
  if (data.heatmap) lines.push(`\n── HEATMAP ──\n${data.heatmap}`);
  if (data.hasTM) {
    lines.push(`\n── TRADEMARK ──\nAgressores: ${data.tmAgressores || "?"} | Ocorrências: ${data.tmOcorrencias || "?"}`);
    if (data.tmDesc) lines.push(`Detalhes: ${data.tmDesc}`);
    if (data.tmPendentes) lines.push(`Pendentes: ${data.tmPendentes}`);
  }
  if (data.hasAfiliados && data.afiliadosDesc) lines.push(`\n── AFILIADOS ──\n${data.afiliadosDesc}`);
  if (data.tratativas) lines.push(`\n── TRATATIVAS ──\n${data.tratativas}`);
  if (data.mediacao) lines.push(`\n── MEDIAÇÃO ──\n${data.mediacao}`);
  if (data.negativacoes) lines.push(`\n── NEGATIVAÇÕES ──\n${data.negativacoes}`);
  if (data.resolvidosDominios) lines.push(`\nResolvidos (domínios): ${data.resolvidosDominios}`);
  if (data.hasAds) {
    lines.push(`\n── GOOGLE ADS ──\nCPC: ${data.adsCpc || "?"} | CTR: ${data.adsCtr || "?"} | Parcela: ${data.adsParcela || "?"} | 1ª pos: ${data.adsPos1 || "?"} | KW: ${data.adsKeyword || "?"}`);
  }
  if (data.hasSaving) lines.push(`\n── SAVING ──\nTotal: ${data.savingTotal || "?"} | ROI: ${data.savingRoi || "?"}`);
  
  lines.push(`\n──────────────────────────────────────`);
  lines.push(`Analise APENAS os dados fornecidos de forma CORRELACIONADA.`);
  lines.push(`NÃO invente contextos, gráficos ou dados não enviados.`);
  lines.push(`Identifique relações de causa e efeito entre os dados.`);
  
  return lines.join("\n");
}

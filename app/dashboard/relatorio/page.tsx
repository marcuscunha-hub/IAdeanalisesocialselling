"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

type Seller = { name: string; igAccountId: string };
type Report = {
  seller: string; period: string; totalConversations: number; score: number;
  stages: {
    abordagem:    { score: number; feedback: string };
    qualificacao: { score: number; feedback: string };
    agendamento:  { score: number; feedback: string };
    followUp:     { score: number; feedback: string };
  };
  highlights: string[]; improvements: string[];
};

const STAGE_LABELS: Record<string, string> = {
  abordagem: "Abordagem", qualificacao: "Qualificação",
  agendamento: "Agendamento", followUp: "Follow-up",
};

function ScoreBar({ score }: { score: number }) {
  const color = score >= 70 ? "bg-lime" : score >= 50 ? "bg-olive" : "bg-coral";
  return (
    <div className="mt-3 h-1.5 w-full rounded-full bg-beige-50 dark:bg-white/10 overflow-hidden">
      <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${score}%` }} />
    </div>
  );
}

function ScoreLabel({ score }: { score: number }) {
  const cls = score >= 70 ? "text-olive" : score >= 50 ? "text-olive/70" : "text-coral";
  return <span className={`${cls} font-medium`}>{score}</span>;
}

function RelatorioContent() {
  const searchParams = useSearchParams();
  const preselected = searchParams.get("seller") ?? "";

  const [sellers, setSellers]       = useState<Seller[]>([]);
  const [igAccountId, setAccountId] = useState(preselected);
  const [period, setPeriod]         = useState("7d");
  const [loading, setLoading]       = useState(false);
  const [report, setReport]         = useState<Report | null>(null);
  const [error, setError]           = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/sellers").then((r) => r.json()).then((data) => {
      setSellers(data.sellers ?? []);
      if (!preselected && data.sellers?.length > 0) setAccountId(data.sellers[0].igAccountId);
    }).catch(() => {});
  }, [preselected]);

  async function generateReport() {
    setLoading(true); setError(null); setReport(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ igAccountId, period }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Erro desconhecido");
      else setReport(data.report);
    } catch { setError("Falha na conexão com o servidor"); }
    finally { setLoading(false); }
  }

  const periodLabel: Record<string, string> = { "7d": "Últimos 7 dias", "14d": "Últimos 14 dias", "30d": "Últimos 30 dias" };

  return (
    <div className="px-8 py-10">
      <div className="mb-8">
        <p className="text-xs font-medium tracking-widest uppercase text-beige-100 dark:text-white/40 mb-1">Análise com IA</p>
        <h1 className="font-heading text-4xl text-forest dark:text-beige">Gerar relatório</h1>
        <p className="text-beige-100 dark:text-white/40 text-sm mt-1">Selecione o vendedor e o período para analisar as conversas.</p>
      </div>

      {/* Filter card */}
      <div className="bg-white dark:bg-forest border border-beige-50 dark:border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row gap-4 items-stretch sm:items-end mb-8">
        <div className="flex-1">
          <p className="text-xs font-medium tracking-widest uppercase text-beige-100 dark:text-white/40 mb-2">Vendedor</p>
          <select value={igAccountId} onChange={(e) => setAccountId(e.target.value)} disabled={sellers.length === 0}
            className="w-full bg-beige-25 dark:bg-white/5 border border-beige-50 dark:border-white/10 rounded-lg px-4 py-2.5 text-forest dark:text-beige text-sm focus:outline-none focus:border-forest dark:focus:border-lime/40 transition pr-9">
            {sellers.length === 0 && <option>Nenhum sócio configurado</option>}
            {sellers.map((s) => <option key={s.igAccountId} value={s.igAccountId}>{s.name}</option>)}
          </select>
        </div>
        <div className="sm:w-44">
          <p className="text-xs font-medium tracking-widest uppercase text-beige-100 dark:text-white/40 mb-2">Período</p>
          <select value={period} onChange={(e) => setPeriod(e.target.value)}
            className="w-full bg-beige-25 dark:bg-white/5 border border-beige-50 dark:border-white/10 rounded-lg px-4 py-2.5 text-forest dark:text-beige text-sm focus:outline-none focus:border-forest dark:focus:border-lime/40 transition pr-9">
            <option value="7d">Últimos 7 dias</option>
            <option value="14d">Últimos 14 dias</option>
            <option value="30d">Últimos 30 dias</option>
          </select>
        </div>
        <button onClick={generateReport} disabled={!igAccountId || loading}
          className="bg-forest dark:bg-lime text-lime dark:text-forest rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-moss dark:hover:bg-lime/90 transition disabled:opacity-40 whitespace-nowrap flex items-center gap-2">
          {loading ? <><span className="w-3.5 h-3.5 border-2 border-lime/30 border-t-lime rounded-full animate-spin inline-block"/>Analisando...</> : "Gerar relatório →"}
        </button>
      </div>

      {error && <div className="bg-coral/5 border border-coral/20 rounded-xl px-5 py-4 mb-6 text-coral text-sm">{error}</div>}

      {!report && !loading && !error && (
        <div className="text-center py-24 border border-dashed border-beige-50 dark:border-white/10 rounded-2xl">
          <p className="font-heading text-3xl text-forest/20 dark:text-white/20 mb-2">Nenhum relatório gerado</p>
          <p className="text-sm text-beige-100 dark:text-white/40">Clique em "Gerar relatório" para começar a análise</p>
        </div>
      )}

      {loading && (
        <div className="text-center py-24">
          <div className="inline-block w-8 h-8 border-2 border-beige-50 dark:border-white/10 border-t-forest dark:border-t-lime rounded-full animate-spin mb-4"/>
          <p className="text-sm text-beige-100 dark:text-white/40">A IA está analisando as conversas...</p>
        </div>
      )}

      {report && (
        <div className="space-y-5">
          <div className="bg-forest rounded-2xl p-7 flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="flex-1">
              <p className="text-xs tracking-widest uppercase text-lime/50 mb-1">Relatório de performance</p>
              <p className="font-heading text-3xl text-white mb-0.5">{report.seller}</p>
              <p className="text-sm text-lime/60">{report.totalConversations} conversa{report.totalConversations !== 1 ? "s" : ""} analisada{report.totalConversations !== 1 ? "s" : ""} · {periodLabel[period]}</p>
            </div>
            <div className="flex items-end gap-1">
              <span className="font-heading text-7xl text-lime leading-none">{report.score}</span>
              <span className="text-lime/50 text-xl mb-2">/100</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(report.stages).map(([key, stage]) => (
              <div key={key} className="bg-white dark:bg-forest border border-beige-50 dark:border-white/10 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-1">
                  <p className="text-xs font-medium tracking-widest uppercase text-beige-100 dark:text-white/40">{STAGE_LABELS[key] ?? key}</p>
                  <p className="text-sm"><ScoreLabel score={stage.score}/><span className="text-beige-100 dark:text-white/40">/100</span></p>
                </div>
                <ScoreBar score={stage.score}/>
                <p className="mt-4 text-sm text-forest/70 dark:text-white/60 leading-relaxed">{stage.feedback}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-forest border border-beige-50 dark:border-white/10 rounded-2xl p-6">
              <p className="text-xs font-medium tracking-widest uppercase text-beige-100 dark:text-white/40 mb-4">Pontos positivos</p>
              <ul className="space-y-3">
                {report.highlights.map((h, i) => (
                  <li key={i} className="flex gap-3 text-sm text-forest/80 dark:text-white/70 leading-relaxed">
                    <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-lime/20 text-olive flex items-center justify-center text-xs font-bold">✓</span>{h}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white dark:bg-forest border border-beige-50 dark:border-white/10 rounded-2xl p-6">
              <p className="text-xs font-medium tracking-widest uppercase text-beige-100 dark:text-white/40 mb-4">Pontos de melhoria</p>
              <ul className="space-y-3">
                {report.improvements.map((imp, i) => (
                  <li key={i} className="flex gap-3 text-sm text-forest/80 dark:text-white/70 leading-relaxed">
                    <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-coral/10 text-coral flex items-center justify-center text-xs">→</span>{imp}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RelatorioPage() {
  return (
    <Suspense fallback={<div className="px-8 py-10 text-beige-100 dark:text-white/40 text-sm">Carregando...</div>}>
      <RelatorioContent />
    </Suspense>
  );
}

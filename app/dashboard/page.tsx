"use client";
import { useState, useEffect } from "react";

type Seller = { name: string; igAccountId: string };

type Report = {
  seller: string;
  period: string;
  totalConversations: number;
  score: number;
  stages: {
    abordagem:    { score: number; feedback: string };
    qualificacao: { score: number; feedback: string };
    agendamento:  { score: number; feedback: string };
    followUp:     { score: number; feedback: string };
  };
  highlights: string[];
  improvements: string[];
};

const STAGE_LABELS: Record<string, string> = {
  abordagem:    "Abordagem",
  qualificacao: "Qualificação",
  agendamento:  "Agendamento",
  followUp:     "Follow-up",
};

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 70 ? "bg-lime" : score >= 50 ? "bg-olive" : "bg-coral";
  return (
    <div className="mt-3 h-1.5 w-full rounded-full bg-beige-50 overflow-hidden">
      <div
        className={`h-full rounded-full ${color} transition-all duration-700`}
        style={{ width: `${score}%` }}
      />
    </div>
  );
}

function ScoreLabel({ score }: { score: number }) {
  if (score >= 70) return <span className="text-olive font-medium">{score}</span>;
  if (score >= 50) return <span className="text-olive/80 font-medium">{score}</span>;
  return <span className="text-coral font-medium">{score}</span>;
}

export default function Dashboard() {
  const [sellers, setSellers]       = useState<Seller[]>([]);
  const [igAccountId, setAccountId] = useState("");
  const [period, setPeriod]         = useState("7d");
  const [loading, setLoading]       = useState(false);
  const [report, setReport]         = useState<Report | null>(null);
  const [error, setError]           = useState<string | null>(null);
  const [demo, setDemo]             = useState(false);

  useEffect(() => {
    fetch("/api/sellers")
      .then((r) => r.json())
      .then((data) => {
        setSellers(data.sellers ?? []);
        setDemo(data.demo ?? false);
        if (data.sellers?.length > 0) setAccountId(data.sellers[0].igAccountId);
      })
      .catch(() => {});
  }, []);

  async function generateReport() {
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ igAccountId, period }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Erro desconhecido");
      else setReport(data.report);
    } catch {
      setError("Falha na conexão com o servidor");
    } finally {
      setLoading(false);
    }
  }

  const selectedSeller = sellers.find((s) => s.igAccountId === igAccountId);

  return (
    <div className="min-h-screen bg-beige flex flex-col">

      {/* ── Top nav ── */}
      <header className="bg-forest text-lime">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-lime/20 flex items-center justify-center">
              <div className="w-3 h-3 rounded-sm bg-lime" />
            </div>
            <span className="font-heading text-lg text-white leading-none">Social Selling AI</span>
            <span className="hidden sm:block text-xs tracking-widest uppercase text-lime/50 ml-1">Full Sales System</span>
          </div>
          {demo && (
            <span className="text-xs bg-lime/10 text-lime border border-lime/20 rounded-full px-3 py-1 tracking-wide">
              Modo demo
            </span>
          )}
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">

        {/* Filter row */}
        <div className="bg-white border border-beige-50 rounded-2xl p-5 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center mb-8">
          <div className="flex-1">
            <p className="text-xs font-medium tracking-widest uppercase text-beige-100 mb-1.5">Vendedor</p>
            <select
              value={igAccountId}
              onChange={(e) => setAccountId(e.target.value)}
              disabled={sellers.length === 0}
              className="w-full bg-beige-25 border border-beige-50 rounded-lg px-4 py-2.5 text-forest text-sm focus:outline-none focus:border-forest transition pr-9"
            >
              {sellers.length === 0 && <option>Nenhum sócio configurado</option>}
              {sellers.map((s) => (
                <option key={s.igAccountId} value={s.igAccountId}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="sm:w-44">
            <p className="text-xs font-medium tracking-widest uppercase text-beige-100 mb-1.5">Período</p>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full bg-beige-25 border border-beige-50 rounded-lg px-4 py-2.5 text-forest text-sm focus:outline-none focus:border-forest transition pr-9"
            >
              <option value="7d">Últimos 7 dias</option>
              <option value="14d">Últimos 14 dias</option>
              <option value="30d">Últimos 30 dias</option>
            </select>
          </div>
          <div className="sm:self-end">
            <div className="hidden sm:block text-xs font-medium tracking-widest uppercase text-transparent mb-1.5">.</div>
            <button
              onClick={generateReport}
              disabled={!igAccountId || loading}
              className="w-full sm:w-auto bg-forest text-lime rounded-lg px-6 py-2.5 text-sm font-medium tracking-wide hover:bg-moss transition disabled:opacity-40 whitespace-nowrap"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block w-3.5 h-3.5 border-2 border-lime/30 border-t-lime rounded-full animate-spin" />
                  Analisando...
                </span>
              ) : "Gerar relatório →"}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-coral/5 border border-coral/20 rounded-xl px-5 py-4 mb-6 text-coral text-sm">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!report && !loading && !error && (
          <div className="text-center py-24">
            <p className="font-heading text-3xl text-forest/30 mb-2">Nenhum relatório gerado</p>
            <p className="text-sm text-beige-100">Selecione um vendedor e clique em Gerar relatório</p>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="text-center py-24">
            <div className="inline-block w-8 h-8 border-2 border-beige-50 border-t-forest rounded-full animate-spin mb-4" />
            <p className="text-sm text-beige-100">A IA está analisando as conversas...</p>
          </div>
        )}

        {/* ── Report ── */}
        {report && (
          <div className="space-y-5">

            {/* Score hero */}
            <div className="bg-forest text-lime rounded-2xl p-7 flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="flex-1">
                <p className="text-xs tracking-widest uppercase text-lime/50 mb-1">Relatório de performance</p>
                <p className="font-heading text-3xl text-white mb-0.5">{report.seller}</p>
                <p className="text-sm text-lime/60">
                  {report.totalConversations} conversa{report.totalConversations !== 1 ? "s" : ""} analisada{report.totalConversations !== 1 ? "s" : ""} · {period === "7d" ? "Últimos 7 dias" : period === "14d" ? "Últimos 14 dias" : "Últimos 30 dias"}
                </p>
              </div>
              <div className="flex items-end gap-1">
                <span className="font-heading text-7xl text-lime leading-none">{report.score}</span>
                <span className="text-lime/50 text-xl mb-2">/100</span>
              </div>
            </div>

            {/* Stage cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(report.stages).map(([key, stage]) => (
                <div key={key} className="bg-white border border-beige-50 rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-xs font-medium tracking-widest uppercase text-beige-100">
                      {STAGE_LABELS[key] ?? key}
                    </p>
                    <p className="text-sm"><ScoreLabel score={stage.score} /><span className="text-beige-100">/100</span></p>
                  </div>
                  <ScoreBar score={stage.score} />
                  <p className="mt-4 text-sm text-forest/70 leading-relaxed">{stage.feedback}</p>
                </div>
              ))}
            </div>

            {/* Highlights & improvements */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white border border-beige-50 rounded-2xl p-6">
                <p className="text-xs font-medium tracking-widest uppercase text-beige-100 mb-4">
                  Pontos positivos
                </p>
                <ul className="space-y-3">
                  {report.highlights.map((h, i) => (
                    <li key={i} className="flex gap-3 text-sm text-forest/80 leading-relaxed">
                      <span className="mt-0.5 flex-none w-4 h-4 rounded-full bg-lime/20 text-olive flex items-center justify-center text-xs font-bold">✓</span>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white border border-beige-50 rounded-2xl p-6">
                <p className="text-xs font-medium tracking-widest uppercase text-beige-100 mb-4">
                  Pontos de melhoria
                </p>
                <ul className="space-y-3">
                  {report.improvements.map((imp, i) => (
                    <li key={i} className="flex gap-3 text-sm text-forest/80 leading-relaxed">
                      <span className="mt-0.5 flex-none w-4 h-4 rounded-full bg-coral/10 text-coral flex items-center justify-center text-xs">→</span>
                      {imp}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-beige-50 py-5">
        <p className="text-center text-xs text-beige-100 tracking-wide">
          Full Sales System · Social Selling AI
        </p>
      </footer>

    </div>
  );
}

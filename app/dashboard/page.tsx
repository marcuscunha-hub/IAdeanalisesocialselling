"use client";
import { useState, useEffect } from "react";

type Seller = { name: string; igAccountId: string };

type Report = {
  seller: string;
  period: string;
  totalConversations: number;
  score: number;
  stages: {
    abordagem: { score: number; feedback: string };
    qualificacao: { score: number; feedback: string };
    agendamento: { score: number; feedback: string };
    followUp: { score: number; feedback: string };
  };
  highlights: string[];
  improvements: string[];
};

export default function Dashboard() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [igAccountId, setIgAccountId] = useState("");
  const [period, setPeriod] = useState("7d");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [demo, setDemo] = useState(false);

  useEffect(() => {
    fetch("/api/sellers")
      .then((r) => r.json())
      .then((data) => {
        setSellers(data.sellers ?? []);
        setDemo(data.demo ?? false);
        if (data.sellers?.length > 0) setIgAccountId(data.sellers[0].igAccountId);
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
      if (!res.ok) {
        setError(data.error ?? "Erro desconhecido");
      } else {
        setReport(data.report);
      }
    } catch {
      setError("Falha na conexão com o servidor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-8">Dashboard de Performance</h1>

      {demo && (
        <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg px-5 py-3 mb-6 text-yellow-300 text-sm">
          Modo demo — dados simulados. Configure <code className="font-mono">META_ACCOUNTS</code> no <code className="font-mono">.env.local</code> para usar dados reais.
        </div>
      )}

      {/* Filtros */}
      <div className="flex gap-4 mb-8">
        <select
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 flex-1"
          value={igAccountId}
          onChange={(e) => setIgAccountId(e.target.value)}
          disabled={sellers.length === 0}
        >
          {sellers.length === 0 && <option value="">Nenhum sócio configurado</option>}
          {sellers.map((s) => (
            <option key={s.igAccountId} value={s.igAccountId}>
              {s.name}
            </option>
          ))}
        </select>

        <select
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          <option value="7d">Últimos 7 dias</option>
          <option value="14d">Últimos 14 dias</option>
          <option value="30d">Últimos 30 dias</option>
        </select>

        <button
          onClick={generateReport}
          disabled={!igAccountId || loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 py-2 rounded-lg font-medium transition"
        >
          {loading ? "Analisando..." : "Gerar Relatório"}
        </button>
      </div>

      {/* Erro */}
      {error && (
        <div className="bg-red-900/40 border border-red-700 rounded-lg px-5 py-4 mb-6 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Relatório */}
      {report && (
        <div className="space-y-6">
          {/* Score geral */}
          <div className="bg-gray-800 rounded-xl p-6 flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Vendedor</p>
              <p className="text-xl font-bold">{report.seller}</p>
              <p className="text-gray-400 text-sm mt-1">{report.totalConversations} conversas analisadas</p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-bold text-blue-400">{report.score}</p>
              <p className="text-gray-400 text-sm">Score geral /100</p>
            </div>
          </div>

          {/* Etapas do processo */}
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(report.stages).map(([key, stage]) => (
              <div key={key} className="bg-gray-800 rounded-xl p-5">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-medium capitalize">
                    {key === "followUp" ? "Follow-up" : key}
                  </p>
                  <span
                    className={`text-lg font-bold ${
                      stage.score >= 70
                        ? "text-green-400"
                        : stage.score >= 50
                        ? "text-yellow-400"
                        : "text-red-400"
                    }`}
                  >
                    {stage.score}/100
                  </span>
                </div>
                <p className="text-gray-400 text-sm">{stage.feedback}</p>
              </div>
            ))}
          </div>

          {/* Destaques e melhorias */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-xl p-5">
              <p className="font-medium text-green-400 mb-3">Pontos positivos</p>
              <ul className="space-y-2">
                {report.highlights.map((h, i) => (
                  <li key={i} className="text-gray-300 text-sm flex gap-2">
                    <span>+</span> {h}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-800 rounded-xl p-5">
              <p className="font-medium text-yellow-400 mb-3">Pontos de melhoria</p>
              <ul className="space-y-2">
                {report.improvements.map((imp, i) => (
                  <li key={i} className="text-gray-300 text-sm flex gap-2">
                    <span>→</span> {imp}
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

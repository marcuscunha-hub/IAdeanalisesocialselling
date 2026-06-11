"use client";
import { useState } from "react";

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
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [seller, setSeller] = useState("");
  const [period, setPeriod] = useState("7d");

  async function generateReport() {
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seller, period }),
      });
      const data = await res.json();
      setReport(data.report);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-8">Dashboard de Performance</h1>

      {/* Filtros */}
      <div className="flex gap-4 mb-8">
        <input
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 flex-1"
          placeholder="Vendedor (Instagram username)"
          value={seller}
          onChange={(e) => setSeller(e.target.value)}
        />
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
          disabled={!seller || loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 py-2 rounded-lg font-medium transition"
        >
          {loading ? "Analisando..." : "Gerar Relatório"}
        </button>
      </div>

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
                  <span className={`text-lg font-bold ${stage.score >= 70 ? "text-green-400" : stage.score >= 50 ? "text-yellow-400" : "text-red-400"}`}>
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
                    <span>✓</span> {h}
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

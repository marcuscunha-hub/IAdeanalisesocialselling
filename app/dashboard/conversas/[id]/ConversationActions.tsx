"use client";
import { useState } from "react";

export default function ConversationActions({ conversationId, igAccountId }: { conversationId: string; igAccountId: string }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]         = useState<string | null>(null);

  async function handleAnalyze() {
    setLoading(true); setMsg(null);
    try {
      const res = await fetch("/api/analyze/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, igAccountId }),
      });
      const data = await res.json();
      if (res.ok) { setMsg("Análise concluída! Recarregue para ver o resultado."); }
      else         { setMsg(data.error ?? "Erro ao analisar."); }
    } catch { setMsg("Falha na conexão."); }
    finally { setLoading(false); }
  }

  return (
    <div className="mt-4 flex items-center gap-3">
      <button onClick={handleAnalyze} disabled={loading}
        className="bg-forest dark:bg-lime text-lime dark:text-forest rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-moss dark:hover:bg-lime/90 transition disabled:opacity-40 flex items-center gap-2">
        {loading && <span className="w-3.5 h-3.5 border-2 border-lime/30 border-t-lime rounded-full animate-spin inline-block" />}
        {loading ? "Analisando..." : "Analisar com IA →"}
      </button>
      {msg && <p className="text-sm text-beige-100 dark:text-white/40">{msg}</p>}
    </div>
  );
}

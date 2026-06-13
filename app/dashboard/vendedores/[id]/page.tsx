import Link from "next/link";
import { getSellerAccounts } from "@/lib/meta";
import { MOCK_SELLERS, MOCK_REPORT } from "@/lib/mock";
import { notFound } from "next/navigation";

const STAGE_LABELS: Record<string, string> = {
  abordagem: "Abordagem", qualificacao: "Qualificação",
  agendamento: "Agendamento", followUp: "Follow-up",
};

const MOCK_HISTORY = [
  { date: "07 Jun 2026", period: "7 dias", score: 72, conversas: 4 },
  { date: "01 Jun 2026", period: "7 dias", score: 65, conversas: 6 },
  { date: "24 Mai 2026", period: "7 dias", score: 58, conversas: 5 },
];

export default function SellerProfilePage({ params }: { params: { id: string } }) {
  const accounts = getSellerAccounts();
  const configured = accounts.filter((a) => a.igAccountId && a.accessToken);
  const all = configured.length > 0 ? configured : MOCK_SELLERS;
  const seller = all.find((s) => s.igAccountId === params.id);

  if (!seller) notFound();

  const demo = configured.length === 0;
  const report = MOCK_REPORT;

  return (
    <div className="px-8 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-beige-100 dark:text-white/40 mb-6">
        <Link href="/dashboard/vendedores" className="hover:text-forest dark:hover:text-beige transition">Vendedores</Link>
        <span>/</span>
        <span className="text-forest dark:text-beige">{seller.name}</span>
      </div>

      {/* Header */}
      <div className="bg-forest rounded-2xl p-7 flex flex-col sm:flex-row sm:items-center gap-6 mb-8">
        <div className="w-16 h-16 rounded-2xl bg-lime/20 flex items-center justify-center shrink-0">
          <span className="text-lime font-heading text-2xl">
            {seller.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </span>
        </div>
        <div className="flex-1">
          <p className="text-lime/50 text-xs tracking-widest uppercase mb-1">Perfil do vendedor</p>
          <h1 className="font-heading text-3xl text-white">{seller.name}</h1>
          <p className="text-white/40 text-sm mt-1 font-mono">{seller.igAccountId}</p>
        </div>
        <Link href={`/dashboard/relatorio?seller=${seller.igAccountId}`}
          className="bg-lime text-forest rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-lime/90 transition whitespace-nowrap">
          Gerar relatório →
        </Link>
      </div>

      {demo && (
        <div className="bg-beige-25 dark:bg-white/5 border border-beige-50 dark:border-white/10 rounded-xl px-5 py-3 mb-6 text-sm text-beige-100 dark:text-white/40">
          Exibindo dados de exemplo.
        </div>
      )}

      {/* Last report scores */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-heading text-2xl text-forest dark:text-beige">Último relatório</h2>
        <div className="flex items-center gap-2 text-beige-100 dark:text-white/40 text-sm">
          Score geral:
          <span className="font-heading text-2xl text-forest dark:text-beige ml-1">{report.score}</span>
          <span className="text-beige-100 dark:text-white/40">/100</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {Object.entries(report.stages).map(([key, stage]) => {
          const color = stage.score >= 70 ? "bg-lime" : stage.score >= 50 ? "bg-olive" : "bg-coral";
          const textColor = stage.score >= 70 ? "text-olive" : stage.score >= 50 ? "text-olive/70" : "text-coral";
          return (
            <div key={key} className="bg-white dark:bg-forest border border-beige-50 dark:border-white/10 rounded-2xl p-5">
              <p className="text-xs font-medium tracking-widest uppercase text-beige-100 dark:text-white/40 mb-2">{STAGE_LABELS[key]}</p>
              <p className={`font-heading text-3xl ${textColor}`}>{stage.score}<span className="text-beige-100 dark:text-white/40 text-base">/100</span></p>
              <div className="mt-3 h-1.5 w-full rounded-full bg-beige-50 dark:bg-white/10 overflow-hidden">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${stage.score}%` }}/>
              </div>
              <p className="mt-3 text-xs text-forest/60 dark:text-white/50 leading-relaxed line-clamp-2">{stage.feedback}</p>
            </div>
          );
        })}
      </div>

      {/* History */}
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-heading text-2xl text-forest dark:text-beige">Histórico</h2>
        <span className="text-xs bg-beige-25 dark:bg-white/5 border border-beige-50 dark:border-white/10 rounded-full px-3 py-1 text-beige-100 dark:text-white/40">
          Banco de dados em breve
        </span>
      </div>

      <div className="bg-white dark:bg-forest border border-beige-50 dark:border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-beige-50 dark:border-white/10">
              <th className="text-left px-6 py-4 text-xs font-medium tracking-widest uppercase text-beige-100 dark:text-white/40">Data</th>
              <th className="text-left px-6 py-4 text-xs font-medium tracking-widest uppercase text-beige-100 dark:text-white/40">Período</th>
              <th className="text-left px-6 py-4 text-xs font-medium tracking-widest uppercase text-beige-100 dark:text-white/40">Conversas</th>
              <th className="text-left px-6 py-4 text-xs font-medium tracking-widest uppercase text-beige-100 dark:text-white/40">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-beige-50 dark:divide-white/10">
            {MOCK_HISTORY.map((h, i) => (
              <tr key={i} className="hover:bg-beige/50 dark:hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 text-forest/70 dark:text-white/60">{h.date}</td>
                <td className="px-6 py-4 text-forest/70 dark:text-white/60">{h.period}</td>
                <td className="px-6 py-4 text-forest/70 dark:text-white/60">{h.conversas}</td>
                <td className="px-6 py-4">
                  <span className={`font-heading text-lg ${h.score >= 70 ? "text-olive" : h.score >= 50 ? "text-olive/70" : "text-coral"}`}>
                    {h.score}
                  </span>
                  <span className="text-beige-100 dark:text-white/40 text-xs">/100</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import Link from "next/link";
import { getSellerAccounts } from "@/lib/meta";
import { MOCK_REPORT } from "@/lib/mock";

export default function Overview() {
  const accounts = getSellerAccounts();
  const configured = accounts.filter((a) => a.igAccountId && a.accessToken);
  const sellers = configured.length > 0 ? configured : [
    { name: "João Silva", igAccountId: "mock_001", accessToken: "mock" },
    { name: "Maria Costa", igAccountId: "mock_002", accessToken: "mock" },
  ];
  const demo = configured.length === 0;

  const stats = [
    { label: "Vendedores ativos", value: sellers.length, sub: "contas conectadas" },
    { label: "Score médio", value: MOCK_REPORT.score, sub: demo ? "dados de exemplo" : "último período" },
    { label: "Conversas analisadas", value: MOCK_REPORT.totalConversations, sub: demo ? "dados de exemplo" : "último relatório" },
    { label: "Etapa mais fraca", value: "Follow-up", sub: `score ${MOCK_REPORT.stages.followUp.score}/100`, text: true },
  ];

  return (
    <div className="px-8 py-10">
      {/* Header */}
      <div className="mb-10">
        <p className="text-xs font-medium tracking-widest uppercase text-beige-100 mb-1">Full Sales System</p>
        <h1 className="font-heading text-4xl text-forest">Visão geral</h1>
        <p className="text-beige-100 text-sm mt-1">
          Acompanhe a performance da sua equipe de Social Sellers.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-beige-50 rounded-2xl p-5">
            <p className="text-xs font-medium tracking-widest uppercase text-beige-100 mb-3">{s.label}</p>
            {s.text ? (
              <p className="font-heading text-2xl text-forest">{s.value}</p>
            ) : (
              <p className="font-heading text-4xl text-forest">{s.value}</p>
            )}
            <p className="text-xs text-beige-100 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Sellers grid */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-heading text-2xl text-forest">Vendedores</h2>
        <Link href="/dashboard/vendedores" className="text-sm text-beige-100 hover:text-forest transition">
          Ver todos →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-10">
        {sellers.map((seller) => (
          <div key={seller.igAccountId} className="bg-white border border-beige-50 rounded-2xl p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-forest flex items-center justify-center shrink-0">
              <span className="text-lime font-heading text-base">
                {seller.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-forest text-sm truncate">{seller.name}</p>
              <p className="text-beige-100 text-xs mt-0.5">
                {demo ? "Modo demo" : "Conta conectada"}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Link
                  href={`/dashboard/vendedores/${seller.igAccountId}`}
                  className="text-xs text-forest/60 hover:text-forest border border-beige-50 rounded-lg px-3 py-1.5 transition hover:border-forest/20"
                >
                  Ver perfil
                </Link>
                <Link
                  href={`/dashboard/relatorio?seller=${seller.igAccountId}`}
                  className="text-xs bg-forest text-lime rounded-lg px-3 py-1.5 hover:bg-moss transition"
                >
                  Gerar relatório
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/dashboard/relatorio" className="group bg-forest rounded-2xl p-6 flex items-center justify-between hover:bg-moss transition">
          <div>
            <p className="text-lime font-medium text-sm">Gerar relatório</p>
            <p className="text-white/50 text-xs mt-1">Analise conversas com IA agora</p>
          </div>
          <span className="text-lime/50 group-hover:text-lime transition text-xl">→</span>
        </Link>
        <Link href="/dashboard/configuracoes" className="group bg-white border border-beige-50 rounded-2xl p-6 flex items-center justify-between hover:border-forest/20 transition">
          <div>
            <p className="text-forest font-medium text-sm">Configurações</p>
            <p className="text-beige-100 text-xs mt-1">Contas Meta, senha e integrações</p>
          </div>
          <span className="text-beige-100 group-hover:text-forest transition text-xl">→</span>
        </Link>
      </div>
    </div>
  );
}

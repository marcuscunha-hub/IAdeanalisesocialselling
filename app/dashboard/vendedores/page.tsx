import Link from "next/link";
import { getSellerAccounts } from "@/lib/meta";
import { MOCK_SELLERS } from "@/lib/mock";

export default function VendedoresPage() {
  const accounts = getSellerAccounts();
  const configured = accounts.filter((a) => a.igAccountId && a.accessToken);
  const demo = configured.length === 0;
  const sellers = demo ? MOCK_SELLERS : configured;

  return (
    <div className="px-8 py-10">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <p className="text-xs font-medium tracking-widest uppercase text-beige-100 mb-1">Equipe</p>
          <h1 className="font-heading text-4xl text-forest">Vendedores</h1>
          <p className="text-beige-100 text-sm mt-1">{sellers.length} Social Seller{sellers.length !== 1 ? "s" : ""} configurado{sellers.length !== 1 ? "s" : ""}.</p>
        </div>
        <Link href="/dashboard/configuracoes" className="text-sm bg-forest text-lime rounded-lg px-4 py-2 hover:bg-moss transition">
          + Adicionar
        </Link>
      </div>

      {demo && (
        <div className="bg-beige-25 border border-beige-50 rounded-xl px-5 py-4 mb-6 text-sm text-beige-100">
          Exibindo dados de exemplo. Configure <code className="font-mono text-forest/70">META_ACCOUNTS</code> para ver os sócios reais.
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-beige-50 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-beige-50">
              <th className="text-left px-6 py-4 text-xs font-medium tracking-widest uppercase text-beige-100">Vendedor</th>
              <th className="text-left px-6 py-4 text-xs font-medium tracking-widest uppercase text-beige-100 hidden md:table-cell">ID da Conta</th>
              <th className="text-left px-6 py-4 text-xs font-medium tracking-widest uppercase text-beige-100">Status</th>
              <th className="px-6 py-4"/>
            </tr>
          </thead>
          <tbody className="divide-y divide-beige-50">
            {sellers.map((seller) => {
              const connected = !!seller.accessToken && seller.accessToken !== "mock";
              return (
                <tr key={seller.igAccountId} className="hover:bg-beige/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-forest flex items-center justify-center shrink-0">
                        <span className="text-lime font-heading text-sm">
                          {seller.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </span>
                      </div>
                      <span className="font-medium text-forest">{seller.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-beige-100 font-mono text-xs hidden md:table-cell">
                    {seller.igAccountId}
                  </td>
                  <td className="px-6 py-4">
                    {connected ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-olive bg-lime/10 border border-lime/20 rounded-full px-2.5 py-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-lime inline-block"/>Conectado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-beige-100 bg-beige-25 border border-beige-50 rounded-full px-2.5 py-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-beige-100 inline-block"/>Demo
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/dashboard/relatorio?seller=${seller.igAccountId}`}
                        className="text-xs bg-forest text-lime rounded-lg px-3 py-1.5 hover:bg-moss transition">
                        Gerar relatório
                      </Link>
                      <Link href={`/dashboard/vendedores/${seller.igAccountId}`}
                        className="text-xs border border-beige-50 text-forest/60 rounded-lg px-3 py-1.5 hover:border-forest/20 hover:text-forest transition">
                        Ver perfil
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

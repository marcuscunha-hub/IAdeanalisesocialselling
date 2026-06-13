import ConversasFeed from "@/components/ConversasFeed";
import { getSellerAccounts } from "@/lib/meta";

export default function ConversasPage() {
  const accounts = getSellerAccounts();
  const configured = accounts.filter((a) => a.igAccountId && a.accessToken);
  const demo = configured.length === 0;

  return (
    <div className="px-8 py-10">
      <div className="mb-8">
        <p className="text-xs font-medium tracking-widest uppercase text-beige-100 dark:text-white/40 mb-1">Tempo real</p>
        <h1 className="font-heading text-4xl text-forest dark:text-beige">Conversas</h1>
        <p className="text-beige-100 dark:text-white/40 text-sm mt-1">
          Feed ao vivo das conversas dos seus Social Sellers no Instagram.
        </p>
      </div>

      {demo && (
        <div className="bg-beige-25 dark:bg-white/5 border border-beige-50 dark:border-white/10 rounded-xl px-5 py-4 mb-6 text-sm text-beige-100 dark:text-white/40">
          Configure <code className="font-mono text-forest/70 dark:text-white/60">META_ACCOUNTS</code> e o webhook para ver conversas em tempo real.
        </div>
      )}

      <ConversasFeed />
    </div>
  );
}

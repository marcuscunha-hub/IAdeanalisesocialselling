import { getSellerAccounts } from "@/lib/meta";
import PasswordForm from "./PasswordForm";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-beige-50 rounded-2xl overflow-hidden mb-5">
      <div className="px-6 py-4 border-b border-beige-50">
        <h2 className="font-heading text-lg text-forest">{title}</h2>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function StatusBadge({ ok }: { ok: boolean }) {
  return ok ? (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-olive bg-lime/10 border border-lime/20 rounded-full px-2.5 py-1">
      <span className="w-1.5 h-1.5 rounded-full bg-lime inline-block" />Conectado
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-beige-100 bg-beige-25 border border-beige-50 rounded-full px-2.5 py-1">
      <span className="w-1.5 h-1.5 rounded-full bg-beige-100 inline-block" />Não configurado
    </span>
  );
}

export default function ConfiguracoesPage() {
  const accounts = getSellerAccounts();
  const configured = accounts.filter((a) => a.igAccountId && a.accessToken);
  const hasGemini = !!process.env.GEMINI_API_KEY;

  return (
    <div className="px-8 py-10">
      <div className="mb-8">
        <p className="text-xs font-medium tracking-widest uppercase text-beige-100 mb-1">Painel</p>
        <h1 className="font-heading text-4xl text-forest">Configurações</h1>
        <p className="text-beige-100 text-sm mt-1">Gerencie contas, integrações e acesso ao sistema.</p>
      </div>

      {/* Meta Accounts */}
      <Section title="Contas Meta (Instagram)">
        <p className="text-sm text-forest/60 mb-4">
          As contas são configuradas via variável{" "}
          <code className="font-mono text-xs bg-beige-25 border border-beige-50 rounded px-1.5 py-0.5 text-forest/70">META_ACCOUNTS</code>{" "}
          no Vercel → Project Settings → Environment Variables.
        </p>

        {configured.length === 0 ? (
          <div className="bg-beige-25 border border-beige-50 rounded-xl px-4 py-3 text-sm text-beige-100">
            Nenhuma conta configurada. Adicione a variável{" "}
            <code className="font-mono text-forest/70">META_ACCOUNTS</code> no Vercel.
          </div>
        ) : (
          <div className="divide-y divide-beige-50 border border-beige-50 rounded-xl overflow-hidden">
            {configured.map((acc) => (
              <div key={acc.igAccountId} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-forest flex items-center justify-center shrink-0">
                    <span className="text-lime font-heading text-xs">
                      {acc.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-forest">{acc.name}</p>
                    <p className="text-xs text-beige-100 font-mono">{acc.igAccountId}</p>
                  </div>
                </div>
                <StatusBadge ok={acc.accessToken !== "mock"} />
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-beige-50">
          <p className="text-xs text-beige-100">
            Formato:{" "}
            <code className="font-mono bg-beige-25 border border-beige-50 rounded px-1.5 py-0.5">
              {`[{"name":"Nome","igAccountId":"ID","accessToken":"TOKEN"}]`}
            </code>
          </p>
        </div>
      </Section>

      {/* AI Integration */}
      <Section title="Integração com IA">
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-forest">Google Gemini</p>
            <p className="text-xs text-beige-100 mt-0.5">Modelo: gemini-2.0-flash-lite</p>
          </div>
          <StatusBadge ok={hasGemini} />
        </div>
        <p className="text-xs text-beige-100 mt-4">
          Configure via variável{" "}
          <code className="font-mono bg-beige-25 border border-beige-50 rounded px-1.5 py-0.5">GEMINI_API_KEY</code>{" "}
          no Vercel.
        </p>
      </Section>

      {/* Password */}
      <Section title="Alterar senha de acesso">
        <PasswordForm />
        <p className="text-xs text-beige-100 mt-4">
          Em produção, atualize a variável{" "}
          <code className="font-mono bg-beige-25 border border-beige-50 rounded px-1.5 py-0.5">DASHBOARD_PASSWORD</code>{" "}
          no Vercel e faça redeploy.
        </p>
      </Section>

      {/* App info */}
      <Section title="Sobre o sistema">
        <dl className="space-y-3 text-sm">
          {[
            ["Produto", "Social Selling AI"],
            ["Empresa", "Full Sales System"],
            ["Versão", "1.0.0"],
            ["Stack", "Next.js 14 · Gemini · Meta Graph API v19"],
            ["Deploy", "Vercel"],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center gap-4">
              <dt className="w-28 text-xs font-medium tracking-widest uppercase text-beige-100 shrink-0">{k}</dt>
              <dd className="text-forest/70">{v}</dd>
            </div>
          ))}
        </dl>
      </Section>
    </div>
  );
}

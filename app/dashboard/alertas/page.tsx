export const dynamic = "force-dynamic";
import { db, alerts, conversations } from "@/lib/db/client";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import AlertDismiss from "./AlertDismiss";

const ALERT_CONFIG: Record<string, { label: string; urgency: string; dot: string }> = {
  followup_14d: { label: "14 dias sem resposta", urgency: "text-coral", dot: "bg-coral" },
  followup_7d:  { label: "7 dias sem resposta",  urgency: "text-coral/70", dot: "bg-coral/70" },
  followup_3d:  { label: "3 dias sem resposta",  urgency: "text-beige-100 dark:text-white/40", dot: "bg-beige-100 dark:bg-white/30" },
};

export default async function AlertasPage() {
  const rows = await db
    .select({ alert: alerts, conversation: conversations })
    .from(alerts)
    .innerJoin(conversations, eq(alerts.conversationId, conversations.id))
    .where(eq(alerts.status, "pending"))
    .orderBy(desc(alerts.triggeredAt));

  return (
    <div className="px-8 py-10">
      <div className="mb-8">
        <p className="text-xs font-medium tracking-widest uppercase text-beige-100 dark:text-white/40 mb-1">Follow-up</p>
        <h1 className="font-heading text-4xl text-forest dark:text-beige">Alertas</h1>
        <p className="text-beige-100 dark:text-white/40 text-sm mt-1">
          Leads que precisam de atenção — seguimentos atrasados.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-beige-50 dark:border-white/10 rounded-2xl">
          <p className="font-heading text-3xl text-forest/20 dark:text-white/20 mb-2">Nenhum alerta</p>
          <p className="text-sm text-beige-100 dark:text-white/40">Todos os follow-ups estão em dia</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-forest border border-beige-50 dark:border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-beige-50 dark:border-white/10">
                <th className="text-left px-6 py-4 text-xs font-medium tracking-widest uppercase text-beige-100 dark:text-white/40">Lead</th>
                <th className="text-left px-6 py-4 text-xs font-medium tracking-widest uppercase text-beige-100 dark:text-white/40 hidden md:table-cell">Vendedor</th>
                <th className="text-left px-6 py-4 text-xs font-medium tracking-widest uppercase text-beige-100 dark:text-white/40">Alerta</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-beige-50 dark:divide-white/10">
              {rows.map(({ alert, conversation: conv }) => {
                const cfg = ALERT_CONFIG[alert.type] ?? ALERT_CONFIG.followup_3d;
                return (
                  <tr key={alert.id} className="hover:bg-beige/50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full ${cfg.dot} shrink-0`} />
                        <Link href={`/dashboard/conversas/${encodeURIComponent(conv.id)}`}
                          className="font-medium text-forest dark:text-beige hover:underline">
                          {conv.leadUsername ? `@${conv.leadUsername}` : conv.leadId}
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-beige-100 dark:text-white/40 hidden md:table-cell font-mono text-xs">
                      {conv.igAccountId}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${cfg.urgency}`}>{cfg.label}</span>
                      <p className="text-xs text-beige-100 dark:text-white/40 mt-0.5">
                        Desde {alert.triggeredAt ? new Date(alert.triggeredAt).toLocaleDateString("pt-BR") : "—"}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/dashboard/conversas/${encodeURIComponent(conv.id)}`}
                          className="text-xs border border-beige-50 dark:border-white/10 text-forest/60 dark:text-white/40 rounded-lg px-3 py-1.5 hover:text-forest dark:hover:text-beige transition">
                          Ver conversa
                        </Link>
                        <AlertDismiss alertId={alert.id} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

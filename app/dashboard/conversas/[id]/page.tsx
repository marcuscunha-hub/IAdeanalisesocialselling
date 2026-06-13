export const dynamic = "force-dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db, conversations, messages, analyses } from "@/lib/db/client";
import { eq, desc, asc } from "drizzle-orm";
import { getSellerAccounts } from "@/lib/meta";
import StageTag from "@/components/StageTag";
import ConversationActions from "./ConversationActions";

function ScoreBar({ score }: { score: number }) {
  const color = score >= 70 ? "bg-lime" : score >= 50 ? "bg-olive" : "bg-coral";
  return (
    <div className="mt-1.5 h-1 w-full rounded-full bg-beige-50 dark:bg-white/10 overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
    </div>
  );
}

function timeAgo(date: Date | string | null) {
  if (!date) return "—";
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60)   return `${diff}s atrás`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m atrás`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
  return `${Math.floor(diff / 86400)}d atrás`;
}

export default async function ConversationDetailPage({ params }: { params: { id: string } }) {
  const convId = decodeURIComponent(params.id);
  const [conv] = await db.select().from(conversations).where(eq(conversations.id, convId)).limit(1);
  if (!conv) notFound();

  const msgs = await db.select().from(messages).where(eq(messages.conversationId, convId)).orderBy(asc(messages.sentAt));
  const [analysis] = await db.select().from(analyses).where(eq(analyses.conversationId, convId)).orderBy(desc(analyses.createdAt)).limit(1);

  const accounts = getSellerAccounts();
  const seller = accounts.find((a) => a.igAccountId === conv.igAccountId);
  const sellerName = seller?.name ?? conv.igAccountId;

  const stageScores = analysis?.stageScores as Record<string, number> | null;
  const stageFeedback = analysis?.stageFeedback as Record<string, string> | null;

  const STAGE_LABELS: Record<string, string> = {
    abordagem: "Abordagem", qualificacao: "Qualificação",
    agendamento: "Agendamento", followUp: "Follow-up",
  };

  return (
    <div className="px-8 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-beige-100 dark:text-white/40 mb-6">
        <Link href="/dashboard/conversas" className="hover:text-forest dark:hover:text-beige transition">Conversas</Link>
        <span>/</span>
        <span className="text-forest dark:text-beige">{conv.leadUsername ? `@${conv.leadUsername}` : conv.leadId}</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: DM thread */}
        <div className="xl:col-span-2">
          {/* Header */}
          <div className="bg-forest rounded-2xl p-6 flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-lime/20 flex items-center justify-center shrink-0">
              <span className="text-lime font-heading text-lg">
                {(conv.leadUsername ?? conv.leadId).charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-lime/50 tracking-widest uppercase mb-0.5">Lead</p>
              <p className="font-heading text-xl text-white truncate">
                {conv.leadUsername ? `@${conv.leadUsername}` : conv.leadId}
              </p>
              <p className="text-white/40 text-xs mt-0.5">Vendedor: {sellerName}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <StageTag stage={conv.stage} />
              <p className="text-white/40 text-xs">{timeAgo(conv.lastMessageAt)}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="bg-white dark:bg-forest border border-beige-50 dark:border-white/10 rounded-2xl p-6 space-y-4 max-h-[600px] overflow-y-auto">
            {msgs.length === 0 ? (
              <p className="text-center text-beige-100 dark:text-white/40 text-sm py-8">Nenhuma mensagem registrada ainda.</p>
            ) : (
              msgs.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isFromSeller ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-xs lg:max-w-md rounded-2xl px-4 py-2.5 text-sm ${
                    msg.isFromSeller
                      ? "bg-forest dark:bg-lime/20 text-white dark:text-beige rounded-br-sm"
                      : "bg-beige-25 dark:bg-white/10 text-forest dark:text-beige rounded-bl-sm"
                  }`}>
                    <p>{msg.body}</p>
                    <p className={`text-[11px] mt-1 ${msg.isFromSeller ? "text-white/40 dark:text-beige/40 text-right" : "text-beige-100 dark:text-white/40"}`}>
                      {new Date(msg.sentAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <ConversationActions conversationId={convId} igAccountId={conv.igAccountId} />
        </div>

        {/* Right: AI Analysis panel */}
        <div className="space-y-4">
          {/* Score */}
          <div className="bg-white dark:bg-forest border border-beige-50 dark:border-white/10 rounded-2xl p-5">
            <p className="text-xs font-medium tracking-widest uppercase text-beige-100 dark:text-white/40 mb-3">Score IA</p>
            {analysis ? (
              <>
                <p className="font-heading text-5xl text-forest dark:text-beige leading-none">{analysis.score}<span className="text-beige-100 dark:text-white/40 text-lg">/100</span></p>
                {stageScores && Object.entries(stageScores).map(([key, score]) => (
                  <div key={key} className="mt-3">
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="text-beige-100 dark:text-white/40">{STAGE_LABELS[key] ?? key}</span>
                      <span className={`font-medium ${score >= 70 ? "text-olive" : score >= 50 ? "text-olive/70" : "text-coral"}`}>{score}</span>
                    </div>
                    <ScoreBar score={score} />
                  </div>
                ))}
              </>
            ) : (
              <p className="text-sm text-beige-100 dark:text-white/40">Nenhuma análise ainda. Clique em "Analisar" abaixo.</p>
            )}
          </div>

          {/* Feedback */}
          {stageFeedback && (
            <div className="bg-white dark:bg-forest border border-beige-50 dark:border-white/10 rounded-2xl p-5">
              <p className="text-xs font-medium tracking-widest uppercase text-beige-100 dark:text-white/40 mb-3">Feedback por etapa</p>
              <div className="space-y-3">
                {Object.entries(stageFeedback).map(([key, fb]) => (
                  <div key={key}>
                    <p className="text-xs font-medium text-forest dark:text-beige mb-0.5">{STAGE_LABELS[key] ?? key}</p>
                    <p className="text-xs text-forest/60 dark:text-white/50 leading-relaxed">{fb}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Highlights & improvements */}
          {analysis && (
            <div className="bg-white dark:bg-forest border border-beige-50 dark:border-white/10 rounded-2xl p-5">
              <p className="text-xs font-medium tracking-widest uppercase text-beige-100 dark:text-white/40 mb-3">Pontos positivos</p>
              <ul className="space-y-2">
                {(analysis.highlights as string[] ?? []).map((h, i) => (
                  <li key={i} className="flex gap-2 text-xs text-forest/70 dark:text-white/60 leading-relaxed">
                    <span className="shrink-0 text-olive mt-0.5">✓</span>{h}
                  </li>
                ))}
              </ul>
              <p className="text-xs font-medium tracking-widest uppercase text-beige-100 dark:text-white/40 mb-3 mt-4">Melhorias</p>
              <ul className="space-y-2">
                {(analysis.improvements as string[] ?? []).map((imp, i) => (
                  <li key={i} className="flex gap-2 text-xs text-forest/70 dark:text-white/60 leading-relaxed">
                    <span className="shrink-0 text-coral mt-0.5">→</span>{imp}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

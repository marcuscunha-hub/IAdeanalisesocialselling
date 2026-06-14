"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import StageTag from "./StageTag";
import type { Conversation } from "@/lib/db/schema";

function timeAgo(date: Date | string | null) {
  if (!date) return "—";
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60)    return `${diff}s`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

export default function ConversasFeed({ igAccountId }: { igAccountId?: string }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [connected, setConnected] = useState(false);

  const fetchConversations = useCallback(async () => {
    const url = igAccountId
      ? `/api/stream/conversations?igAccountId=${igAccountId}`
      : "/api/stream/conversations";
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setConversations(data);
      setConnected(true);
    } catch {
      setConnected(false);
    }
  }, [igAccountId]);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className={`w-2 h-2 rounded-full ${connected ? "bg-lime animate-pulse" : "bg-beige-100 dark:bg-white/30"}`} />
        <span className="text-xs text-beige-100 dark:text-white/40">
          {connected ? "Ao vivo" : "Reconectando..."}
        </span>
        <span className="text-xs text-beige-100 dark:text-white/40 ml-auto">
          {conversations.length} conversa{conversations.length !== 1 ? "s" : ""}
        </span>
      </div>

      {conversations.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-beige-50 dark:border-white/10 rounded-2xl">
          <p className="font-heading text-2xl text-forest/20 dark:text-white/20 mb-1">Nenhuma conversa</p>
          <p className="text-sm text-beige-100 dark:text-white/40">As conversas aparecerão aqui em tempo real</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-forest border border-beige-50 dark:border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-beige-50 dark:border-white/10">
                <th className="text-left px-6 py-4 text-xs font-medium tracking-widest uppercase text-beige-100 dark:text-white/40">Lead</th>
                <th className="text-left px-6 py-4 text-xs font-medium tracking-widest uppercase text-beige-100 dark:text-white/40 hidden md:table-cell">Etapa</th>
                <th className="text-left px-6 py-4 text-xs font-medium tracking-widest uppercase text-beige-100 dark:text-white/40 hidden lg:table-cell">Status</th>
                <th className="text-left px-6 py-4 text-xs font-medium tracking-widest uppercase text-beige-100 dark:text-white/40">Última msg</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-beige-50 dark:divide-white/10">
              {conversations.map((conv) => (
                <tr key={conv.id} className="hover:bg-beige/50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-beige-50 dark:bg-white/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-medium text-beige-100 dark:text-white/50">
                          {(conv.leadUsername ?? conv.leadId).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-forest dark:text-beige text-sm">
                          {conv.leadUsername ? `@${conv.leadUsername}` : conv.leadId}
                        </p>
                        <p className="text-xs text-beige-100 dark:text-white/40 font-mono">{conv.igAccountId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <StageTag stage={conv.stage} />
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className={`text-xs font-medium ${conv.status === "active" ? "text-olive" : conv.status === "scheduled" ? "text-lime" : "text-beige-100 dark:text-white/40"}`}>
                      {conv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-beige-100 dark:text-white/40 text-xs">
                    {timeAgo(conv.lastMessageAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/dashboard/conversas/${conv.id}`}
                      className="text-xs border border-beige-50 dark:border-white/10 text-forest/60 dark:text-white/40 rounded-lg px-3 py-1.5 hover:border-forest/20 dark:hover:border-white/20 hover:text-forest dark:hover:text-beige transition">
                      Ver →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

"use client";
import { useEffect, useReducer } from "react";
import Link from "next/link";
import StageTag from "./StageTag";
import type { Conversation } from "@/lib/db/schema";

type State = { conversations: Conversation[]; connected: boolean };
type Action =
  | { type: "snapshot"; payload: Conversation[] }
  | { type: "update"; payload: Conversation[] }
  | { type: "status"; connected: boolean };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "snapshot":
      return { ...state, conversations: action.payload };
    case "update": {
      const map = new Map(state.conversations.map((c) => [c.id, c]));
      for (const c of action.payload) map.set(c.id, c);
      return { ...state, conversations: Array.from(map.values()).sort((a, b) =>
        new Date(b.lastMessageAt ?? 0).getTime() - new Date(a.lastMessageAt ?? 0).getTime()
      )};
    }
    case "status":
      return { ...state, connected: action.connected };
  }
}

function timeAgo(date: Date | string | null) {
  if (!date) return "—";
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60)   return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

export default function ConversasFeed({ igAccountId }: { igAccountId?: string }) {
  const [state, dispatch] = useReducer(reducer, { conversations: [], connected: false });

  useEffect(() => {
    const url = igAccountId
      ? `/api/stream/conversations?igAccountId=${igAccountId}`
      : "/api/stream/conversations";

    const es = new EventSource(url);
    es.addEventListener("snapshot", (e) => {
      dispatch({ type: "snapshot", payload: JSON.parse(e.data) });
      dispatch({ type: "status", connected: true });
    });
    es.addEventListener("update", (e) => {
      dispatch({ type: "update", payload: JSON.parse(e.data) });
    });
    es.onerror = () => {
      dispatch({ type: "status", connected: false });
    };
    es.onopen = () => dispatch({ type: "status", connected: true });
    return () => es.close();
  }, [igAccountId]);

  return (
    <div>
      {/* Status bar */}
      <div className="flex items-center gap-2 mb-4">
        <span className={`w-2 h-2 rounded-full ${state.connected ? "bg-lime animate-pulse" : "bg-beige-100 dark:bg-white/30"}`} />
        <span className="text-xs text-beige-100 dark:text-white/40">
          {state.connected ? "Ao vivo" : "Reconectando..."}
        </span>
        <span className="text-xs text-beige-100 dark:text-white/40 ml-auto">
          {state.conversations.length} conversa{state.conversations.length !== 1 ? "s" : ""}
        </span>
      </div>

      {state.conversations.length === 0 ? (
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
              {state.conversations.map((conv) => (
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

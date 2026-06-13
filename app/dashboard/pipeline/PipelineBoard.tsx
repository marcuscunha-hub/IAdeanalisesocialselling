"use client";
import { useState } from "react";
import Link from "next/link";
import StageTag from "@/components/StageTag";
import type { Conversation } from "@/lib/db/schema";

const STAGES = [
  { id: "abordagem",     label: "Abordagem"      },
  { id: "rapport",       label: "Rapport"         },
  { id: "qualificacao",  label: "Qualificação"    },
  { id: "identificacao", label: "Identificação"   },
  { id: "pitch",         label: "Pitch"           },
  { id: "followup",      label: "Follow-up"       },
  { id: "agendado",      label: "Agendado"        },
  { id: "perdido",       label: "Perdido"         },
];

function timeAgo(date: Date | string | null) {
  if (!date) return "—";
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

export default function PipelineBoard({ initialConversations }: { initialConversations: Conversation[] }) {
  const [convs, setConvs] = useState(initialConversations);
  const [dragging, setDragging] = useState<string | null>(null);

  async function moveConv(id: string, newStage: string) {
    setConvs((prev) => prev.map((c) => c.id === id ? { ...c, stage: newStage } : c));
    await fetch(`/api/conversations/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: newStage }),
    });
  }

  function onDragOver(e: React.DragEvent) { e.preventDefault(); }
  function onDrop(e: React.DragEvent, stageId: string) {
    e.preventDefault();
    if (dragging && dragging !== stageId) moveConv(dragging, stageId);
    setDragging(null);
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-3 min-w-max">
        {STAGES.map((stage) => {
          const cards = convs.filter((c) => (c.stage ?? "abordagem") === stage.id);
          return (
            <div key={stage.id}
              className="w-56 shrink-0"
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, stage.id)}
            >
              {/* Column header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <StageTag stage={stage.id} />
                <span className="text-xs text-beige-100 dark:text-white/40 font-medium">{cards.length}</span>
              </div>

              {/* Cards */}
              <div className="space-y-2 min-h-24">
                {cards.map((conv) => (
                  <div
                    key={conv.id}
                    draggable
                    onDragStart={() => setDragging(conv.id)}
                    onDragEnd={() => setDragging(null)}
                    className="bg-white dark:bg-forest border border-beige-50 dark:border-white/10 rounded-xl p-3 cursor-grab active:cursor-grabbing hover:border-forest/20 dark:hover:border-white/20 transition"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm font-medium text-forest dark:text-beige truncate">
                        {conv.leadUsername ? `@${conv.leadUsername}` : conv.leadId}
                      </p>
                      <span className="text-[11px] text-beige-100 dark:text-white/40 shrink-0">{timeAgo(conv.lastMessageAt)}</span>
                    </div>
                    <p className="text-xs text-beige-100 dark:text-white/40 mb-3 font-mono">{conv.igAccountId}</p>
                    <Link href={`/dashboard/conversas/${encodeURIComponent(conv.id)}`}
                      className="text-[11px] text-forest/50 dark:text-white/40 hover:text-forest dark:hover:text-beige transition">
                      Ver conversa →
                    </Link>
                  </div>
                ))}

                {cards.length === 0 && (
                  <div className="border-2 border-dashed border-beige-50 dark:border-white/10 rounded-xl h-20 flex items-center justify-center">
                    <p className="text-xs text-beige-100/50 dark:text-white/20">Arraste aqui</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

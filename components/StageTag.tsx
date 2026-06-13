const STAGE_CONFIG: Record<string, { label: string; cls: string }> = {
  abordagem:      { label: "Abordagem",    cls: "bg-beige-25 dark:bg-white/5 text-beige-100 dark:text-white/50 border-beige-50 dark:border-white/10" },
  rapport:        { label: "Rapport",      cls: "bg-lake/10 text-lake border-lake/20" },
  qualificacao:   { label: "Qualificação", cls: "bg-olive/10 text-olive border-olive/20" },
  identificacao:  { label: "Identificação",cls: "bg-olive/10 text-olive border-olive/20" },
  pitch:          { label: "Pitch",        cls: "bg-lime/10 text-olive border-lime/20" },
  followup:       { label: "Follow-up",    cls: "bg-coral/10 text-coral border-coral/20" },
  agendado:       { label: "Agendado",     cls: "bg-lime/20 text-olive border-lime/30" },
  perdido:        { label: "Perdido",      cls: "bg-coral/5 text-coral/60 border-coral/10" },
};

export default function StageTag({ stage }: { stage: string | null }) {
  const cfg = STAGE_CONFIG[stage ?? "abordagem"] ?? STAGE_CONFIG.abordagem;
  return (
    <span className={`inline-flex items-center text-[11px] font-medium border rounded-full px-2 py-0.5 ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

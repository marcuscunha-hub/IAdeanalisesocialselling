"use client";
import { useState } from "react";

export default function PasswordForm() {
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw]         = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [msg, setMsg]             = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [loading, setLoading]     = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPw !== confirmPw) { setMsg({ type: "err", text: "As senhas não coincidem." }); return; }
    if (newPw.length < 6)    { setMsg({ type: "err", text: "A nova senha deve ter ao menos 6 caracteres." }); return; }
    setLoading(true); setMsg(null);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const data = await res.json();
      if (!res.ok) setMsg({ type: "err", text: data.error ?? "Erro ao alterar senha." });
      else { setMsg({ type: "ok", text: "Senha alterada com sucesso." }); setCurrentPw(""); setNewPw(""); setConfirmPw(""); }
    } catch { setMsg({ type: "err", text: "Falha na conexão." }); }
    finally { setLoading(false); }
  }

  const inputCls = "w-full bg-beige-25 dark:bg-white/5 border border-beige-50 dark:border-white/10 rounded-lg px-4 py-2.5 text-forest dark:text-beige text-sm focus:outline-none focus:border-forest dark:focus:border-lime/40 transition";
  const labelCls = "text-xs font-medium tracking-widest uppercase text-beige-100 dark:text-white/40 block mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
      <div>
        <label className={labelCls}>Senha atual</label>
        <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} required className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Nova senha</label>
        <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} required className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Confirmar nova senha</label>
        <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} required className={inputCls} />
      </div>
      {msg && (
        <p className={`text-sm ${msg.type === "ok" ? "text-olive" : "text-coral"}`}>{msg.text}</p>
      )}
      <button type="submit" disabled={loading}
        className="bg-forest dark:bg-lime text-lime dark:text-forest rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-moss dark:hover:bg-lime/90 transition disabled:opacity-40">
        {loading ? "Salvando..." : "Salvar nova senha"}
      </button>
    </form>
  );
}

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

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
      <div>
        <label className="text-xs font-medium tracking-widest uppercase text-beige-100 block mb-1.5">Senha atual</label>
        <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} required
          className="w-full bg-beige-25 border border-beige-50 rounded-lg px-4 py-2.5 text-forest text-sm focus:outline-none focus:border-forest transition" />
      </div>
      <div>
        <label className="text-xs font-medium tracking-widest uppercase text-beige-100 block mb-1.5">Nova senha</label>
        <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} required
          className="w-full bg-beige-25 border border-beige-50 rounded-lg px-4 py-2.5 text-forest text-sm focus:outline-none focus:border-forest transition" />
      </div>
      <div>
        <label className="text-xs font-medium tracking-widest uppercase text-beige-100 block mb-1.5">Confirmar nova senha</label>
        <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} required
          className="w-full bg-beige-25 border border-beige-50 rounded-lg px-4 py-2.5 text-forest text-sm focus:outline-none focus:border-forest transition" />
      </div>
      {msg && (
        <p className={`text-sm ${msg.type === "ok" ? "text-olive" : "text-coral"}`}>{msg.text}</p>
      )}
      <button type="submit" disabled={loading}
        className="bg-forest text-lime rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-moss transition disabled:opacity-40">
        {loading ? "Salvando..." : "Salvar nova senha"}
      </button>
    </form>
  );
}

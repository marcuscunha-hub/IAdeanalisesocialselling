"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push("/dashboard");
    } else {
      setError("Senha incorreta. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-beige dark:bg-[#040f01] flex flex-col items-center justify-center px-4">

      {/* Logo mark */}
      <div className="mb-10 flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-forest flex items-center justify-center">
          <div className="w-5 h-5 rounded-sm bg-lime" />
        </div>
        <div className="text-center">
          <p className="font-heading text-2xl text-forest dark:text-beige leading-tight">Social Selling AI</p>
          <p className="text-sm text-beige-100 dark:text-white/40 tracking-widest uppercase mt-0.5">Full Sales System</p>
        </div>
      </div>

      {/* Card */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white dark:bg-forest border border-beige-50 dark:border-white/10 rounded-2xl p-8 shadow-sm"
      >
        <p className="text-xs font-medium tracking-widest uppercase text-beige-100 dark:text-white/40 mb-6">
          Acesso restrito
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-forest dark:text-beige mb-2">
            Senha
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-beige-50 dark:border-white/10 bg-beige-25 dark:bg-white/5 rounded-lg px-4 py-3 text-forest dark:text-beige placeholder-beige-100 dark:placeholder-white/30 focus:outline-none focus:border-forest dark:focus:border-lime/40 transition text-sm"
            placeholder="••••••••"
            autoFocus
          />
        </div>

        {error && (
          <p className="text-coral text-sm mb-4">{error}</p>
        )}

        <button
          type="submit"
          disabled={!password || loading}
          className="w-full bg-forest dark:bg-lime text-lime dark:text-forest rounded-lg py-3 text-sm font-medium tracking-wide hover:bg-moss dark:hover:bg-lime/90 transition disabled:opacity-40"
        >
          {loading ? "Entrando..." : "Entrar →"}
        </button>
      </form>
    </div>
  );
}

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AlertDismiss({ alertId }: { alertId: number }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function dismiss() {
    setLoading(true);
    await fetch(`/api/alerts/${alertId}`, { method: "PATCH" });
    router.refresh();
  }

  return (
    <button onClick={dismiss} disabled={loading}
      className="text-xs bg-forest dark:bg-lime text-lime dark:text-forest rounded-lg px-3 py-1.5 hover:bg-moss dark:hover:bg-lime/90 transition disabled:opacity-40">
      {loading ? "..." : "Tratado ✓"}
    </button>
  );
}

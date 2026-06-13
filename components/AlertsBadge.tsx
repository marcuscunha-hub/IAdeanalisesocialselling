"use client";
import { useEffect, useState } from "react";

export default function AlertsBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const es = new EventSource("/api/stream/alerts");
    es.addEventListener("count", (e) => {
      const data = JSON.parse(e.data);
      setCount(data.count ?? 0);
    });
    es.onerror = () => es.close();
    return () => es.close();
  }, []);

  if (count === 0) return null;
  return (
    <span className="ml-auto inline-flex items-center justify-center w-4 h-4 rounded-full bg-coral text-white text-[10px] font-bold">
      {count > 9 ? "9+" : count}
    </span>
  );
}

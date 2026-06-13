import { NextRequest } from "next/server";
import { db, alerts } from "@/lib/db/client";
import { eq, desc, gt, and } from "drizzle-orm";
import { sql } from "drizzle-orm";

export const runtime = "nodejs";
export const maxDuration = 25;

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();
  let lastCheck = new Date();
  let intervalId: ReturnType<typeof setInterval>;

  const stream = new ReadableStream({
    async start(controller) {
      function send(event: string, data: unknown) {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      }

      try {
        const pending = await db.select().from(alerts).where(eq(alerts.status, "pending")).limit(100);
        send("count", { count: pending.length });
      } catch {
        send("count", { count: 0 });
      }

      intervalId = setInterval(async () => {
        try {
          const newAlerts = await db.select().from(alerts)
            .where(and(eq(alerts.status, "pending"), gt(alerts.triggeredAt, lastCheck)))
            .limit(10);
          lastCheck = new Date();
          if (newAlerts.length > 0) {
            const total = await db.select({ count: sql<number>`count(*)` }).from(alerts).where(eq(alerts.status, "pending"));
            send("count", { count: Number(total[0].count), new: newAlerts });
          }
        } catch {}
      }, 5000);
    },
    cancel() {
      clearInterval(intervalId);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type":  "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection":    "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

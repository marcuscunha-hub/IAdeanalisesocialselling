import { NextRequest } from "next/server";
import { db, conversations } from "@/lib/db/client";
import { desc, gt } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
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

      // Initial snapshot
      try {
        const all = await db.select().from(conversations).orderBy(desc(conversations.lastMessageAt)).limit(50);
        send("snapshot", all);
      } catch {
        send("error", { message: "DB unavailable" });
      }

      // Poll every 3 seconds for updates
      intervalId = setInterval(async () => {
        try {
          const updated = await db.select().from(conversations)
            .where(gt(conversations.updatedAt, lastCheck))
            .orderBy(desc(conversations.updatedAt))
            .limit(20);
          lastCheck = new Date();
          if (updated.length > 0) send("update", updated);
        } catch {
          // silently skip failed polls
        }
      }, 3000);
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

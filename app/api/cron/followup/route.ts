import { NextRequest, NextResponse } from "next/server";
import { db, conversations, alerts } from "@/lib/db/client";
import { eq, lt, and, isNotNull, sql } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  // Protect the cron route
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const now   = new Date();
  const d3    = new Date(now.getTime() - 3  * 24 * 60 * 60 * 1000);
  const d7    = new Date(now.getTime() - 7  * 24 * 60 * 60 * 1000);
  const d14   = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  // Find active conversations where seller hasn't sent a message in X days
  // but the lead HAS messaged (sellerLastAt < threshold AND lastMessageAt is more recent)
  const activeConvs = await db.select().from(conversations).where(
    and(eq(conversations.status, "active"), isNotNull(conversations.sellerLastAt))
  );

  let created = 0;
  for (const conv of activeConvs) {
    if (!conv.sellerLastAt) continue;

    const gaps: { type: string; threshold: Date }[] = [
      { type: "followup_3d",  threshold: d3  },
      { type: "followup_7d",  threshold: d7  },
      { type: "followup_14d", threshold: d14 },
    ];

    for (const gap of gaps) {
      if (conv.sellerLastAt < gap.threshold) {
        // Only create if not already exists for this conversation+type
        const existing = await db.select().from(alerts).where(
          and(
            eq(alerts.conversationId, conv.id),
            eq(alerts.type, gap.type),
            eq(alerts.status, "pending")
          )
        ).limit(1);

        if (existing.length === 0) {
          await db.insert(alerts).values({
            conversationId: conv.id,
            igAccountId:    conv.igAccountId,
            type:           gap.type,
          });
          created++;
        }
      }
    }
  }

  return NextResponse.json({ ok: true, alertsCreated: created, checkedConversations: activeConvs.length });
}

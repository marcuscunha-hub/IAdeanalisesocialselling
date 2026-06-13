import { NextResponse } from "next/server";
import { db, alerts, conversations } from "@/lib/db/client";
import { eq, desc } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET() {
  try {
    const rows = await db
      .select({
        alert:        alerts,
        conversation: conversations,
      })
      .from(alerts)
      .innerJoin(conversations, eq(alerts.conversationId, conversations.id))
      .where(eq(alerts.status, "pending"))
      .orderBy(desc(alerts.triggeredAt));

    return NextResponse.json({ alerts: rows });
  } catch {
    return NextResponse.json({ alerts: [] }, { status: 500 });
  }
}

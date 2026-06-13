import { NextRequest, NextResponse } from "next/server";
import { db, conversations, analyses } from "@/lib/db/client";
import { eq, desc, and } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const igAccountId = searchParams.get("igAccountId");
  const stage       = searchParams.get("stage");
  const limit       = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100);

  try {
    const where = igAccountId
      ? stage
        ? and(eq(conversations.igAccountId, igAccountId), eq(conversations.stage, stage))
        : eq(conversations.igAccountId, igAccountId)
      : stage
        ? eq(conversations.stage, stage)
        : undefined;

    const rows = await db
      .select()
      .from(conversations)
      .where(where)
      .orderBy(desc(conversations.lastMessageAt))
      .limit(limit);

    return NextResponse.json({ conversations: rows });
  } catch (err) {
    return NextResponse.json({ error: "DB error", conversations: [] }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db, conversations } from "@/lib/db/client";
import { desc, eq } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const igAccountId = searchParams.get("igAccountId");

  try {
    let query = db.select().from(conversations).orderBy(desc(conversations.lastMessageAt)).limit(50);
    if (igAccountId) {
      query = db.select().from(conversations)
        .where(eq(conversations.igAccountId, igAccountId))
        .orderBy(desc(conversations.lastMessageAt))
        .limit(50) as typeof query;
    }
    const all = await query;
    return NextResponse.json(all);
  } catch {
    return NextResponse.json({ error: "DB unavailable" }, { status: 500 });
  }
}

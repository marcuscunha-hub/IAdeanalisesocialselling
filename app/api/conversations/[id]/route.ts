import { NextRequest, NextResponse } from "next/server";
import { db, conversations, messages, analyses } from "@/lib/db/client";
import { eq, desc } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const conv = await db.select().from(conversations).where(eq(conversations.id, params.id)).limit(1);
  if (!conv.length) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const msgs = await db.select().from(messages).where(eq(messages.conversationId, params.id));
  const latestAnalysis = await db.select().from(analyses)
    .where(eq(analyses.conversationId, params.id))
    .orderBy(desc(analyses.createdAt))
    .limit(1);

  return NextResponse.json({ conversation: conv[0], messages: msgs, analysis: latestAnalysis[0] ?? null });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const allowed: Record<string, unknown> = {};
  if (body.stage)  allowed.stage  = body.stage;
  if (body.status) allowed.status = body.status;
  if (!Object.keys(allowed).length) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });

  allowed.updatedAt = new Date();
  const [updated] = await db.update(conversations).set(allowed).where(eq(conversations.id, params.id)).returning();
  return NextResponse.json({ conversation: updated });
}

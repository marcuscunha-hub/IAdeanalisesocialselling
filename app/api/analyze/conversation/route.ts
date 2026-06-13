import { NextRequest, NextResponse } from "next/server";
import { db, messages, conversations } from "@/lib/db/client";
import { eq } from "drizzle-orm";
import { analyzeConversation } from "@/lib/analyze";
import { getSellerAccounts } from "@/lib/meta";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { conversationId, igAccountId } = await req.json();
  if (!conversationId || !igAccountId) {
    return NextResponse.json({ error: "conversationId and igAccountId required" }, { status: 400 });
  }

  const accounts = getSellerAccounts();
  const seller = accounts.find((a) => a.igAccountId === igAccountId);
  const sellerName = seller?.name ?? igAccountId;

  const convMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId));

  if (convMessages.length === 0) {
    return NextResponse.json({ error: "No messages found for this conversation" }, { status: 404 });
  }

  const analysis = await analyzeConversation(
    conversationId,
    convMessages.map((m) => ({
      fromUsername: m.fromUsername,
      isFromSeller: m.isFromSeller,
      body: m.body,
      sentAt: new Date(m.sentAt),
    })),
    sellerName,
    "webhook",
    igAccountId
  );

  return NextResponse.json({ analysis });
}

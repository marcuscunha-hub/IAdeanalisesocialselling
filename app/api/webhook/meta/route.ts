import { NextRequest, NextResponse } from "next/server";
import { verifyMetaSignature, extractMessages, upsertMessage, MetaWebhookPayload } from "@/lib/webhook";
import { getSellerAccounts } from "@/lib/meta";

export const runtime = "nodejs";

// GET — Meta webhook verification challenge
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode      = searchParams.get("hub.mode");
  const token     = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.META_WEBHOOK_SECRET) {
    return new Response(challenge, { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

// POST — Receive live DM events from Meta
export async function POST(req: NextRequest) {
  const rawBody  = await req.text();
  const signature = req.headers.get("x-hub-signature-256") ?? "";

  if (!verifyMetaSignature(rawBody, signature)) {
    return new Response("Invalid signature", { status: 401 });
  }

  let payload: MetaWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response("Bad JSON", { status: 400 });
  }

  if (payload.object !== "instagram") {
    return NextResponse.json({ ok: true }); // Ignore non-Instagram events
  }

  const accounts = getSellerAccounts();

  for (const entry of payload.entry) {
    const account = accounts.find((a) => a.igAccountId === entry.id);
    if (!account) continue;

    const items = extractMessages(payload, account.igAccountId);

    for (const item of items) {
      await upsertMessage(item, account.igAccountId);

      // Fire-and-forget: trigger per-conversation AI analysis
      const analyzeUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://i-adeanalisesocialselling.vercel.app"}/api/analyze/conversation`;
      fetch(analyzeUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: item.conversationId, igAccountId: account.igAccountId }),
      }).catch(() => {});
    }
  }

  return NextResponse.json({ ok: true });
}

import crypto from "crypto";
import { db, conversations, messages } from "@/lib/db/client";
import { eq } from "drizzle-orm";

export type WebhookEntry = {
  id: string;
  time: number;
  messaging: WebhookMessaging[];
};

export type WebhookMessaging = {
  sender:    { id: string };
  recipient: { id: string };
  timestamp: number;
  message?: {
    mid: string;
    text?: string;
    is_echo?: boolean;
  };
};

export type MetaWebhookPayload = {
  object: string;
  entry: WebhookEntry[];
};

export function verifyMetaSignature(rawBody: string, signature: string): boolean {
  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret || !signature) {
    console.error("[webhook] META_APP_SECRET ausente ou signature vazia");
    return false;
  }
  const expected = "sha256=" + crypto
    .createHmac("sha256", appSecret)
    .update(rawBody)
    .digest("hex");
  console.log("[webhook] app_secret prefix:", appSecret.slice(0, 8));
  console.log("[webhook] sig recebida:", signature.slice(0, 40));
  console.log("[webhook] sig esperada:", expected.slice(0, 40));
  try {
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length) {
      console.error("[webhook] tamanhos diferentes:", sigBuf.length, expBuf.length);
      return false;
    }
    return crypto.timingSafeEqual(sigBuf, expBuf);
  } catch (e) {
    console.error("[webhook] erro na verificação:", e);
    return false;
  }
}

export function extractMessages(payload: MetaWebhookPayload, sellerIgAccountId: string) {
  const items: {
    conversationId: string;
    messageId: string;
    senderId: string;
    recipientId: string;
    text: string;
    isFromSeller: boolean;
    timestamp: Date;
  }[] = [];

  for (const entry of payload.entry) {
    for (const msg of entry.messaging ?? []) {
      if (!msg.message?.mid || !msg.message?.text) continue;
      const isEcho = msg.message.is_echo === true;
      items.push({
        conversationId: `${Math.min(Number(msg.sender.id), Number(msg.recipient.id))}_${Math.max(Number(msg.sender.id), Number(msg.recipient.id))}`,
        messageId:  msg.message.mid,
        senderId:   msg.sender.id,
        recipientId: msg.recipient.id,
        text:       msg.message.text,
        isFromSeller: isEcho,
        timestamp:  new Date(msg.timestamp),
      });
    }
  }
  return items;
}

export async function upsertMessage(item: ReturnType<typeof extractMessages>[number], sellerIgAccountId: string) {
  const leadId = item.isFromSeller ? item.recipientId : item.senderId;

  // Upsert conversation
  await db.insert(conversations).values({
    id:           item.conversationId,
    igAccountId:  sellerIgAccountId,
    leadId,
    lastMessageAt: item.timestamp,
    sellerLastAt:  item.isFromSeller ? item.timestamp : undefined,
    updatedAt:     new Date(),
  }).onConflictDoUpdate({
    target: conversations.id,
    set: {
      lastMessageAt: item.timestamp,
      ...(item.isFromSeller ? { sellerLastAt: item.timestamp } : {}),
      updatedAt: new Date(),
    },
  });

  // Insert message (ignore duplicate)
  await db.insert(messages).values({
    id:             item.messageId,
    conversationId: item.conversationId,
    fromId:         item.senderId,
    body:           item.text,
    isFromSeller:   item.isFromSeller,
    sentAt:         item.timestamp,
  }).onConflictDoNothing();
}

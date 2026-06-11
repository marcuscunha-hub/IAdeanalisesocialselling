import { NextRequest, NextResponse } from "next/server";
import { getConversations, periodToDays } from "@/lib/meta";
import { analyzeConversations } from "@/lib/claude";

export async function POST(req: NextRequest) {
  const { seller, period } = await req.json();

  if (!seller) {
    return NextResponse.json({ error: "seller é obrigatório" }, { status: 400 });
  }

  const igAccountId = process.env.META_IG_ACCOUNT_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;

  if (!igAccountId || !accessToken) {
    return NextResponse.json({ error: "Meta API não configurada" }, { status: 500 });
  }

  const days = periodToDays(period ?? "7d");
  const since = new Date();
  since.setDate(since.getDate() - days);

  const conversations = await getConversations(igAccountId, accessToken, since);

  if (conversations.length === 0) {
    return NextResponse.json({ error: "Nenhuma conversa encontrada no período" }, { status: 404 });
  }

  const analysis = await analyzeConversations(conversations, seller);

  return NextResponse.json({
    report: {
      seller,
      period,
      ...(analysis as object),
    },
  });
}

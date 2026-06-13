import { NextRequest, NextResponse } from "next/server";
import { getSellerByAccountId, getConversations, periodToDays } from "@/lib/meta";
import { analyzeConversations } from "@/lib/claude";
import { MOCK_SELLERS, MOCK_CONVERSATIONS, MOCK_REPORT } from "@/lib/mock";

function isDemoMode() {
  const accounts = process.env.META_ACCOUNTS;
  if (!accounts) return true;
  try {
    const parsed = JSON.parse(accounts);
    return !Array.isArray(parsed) || parsed.length === 0 || !parsed[0]?.accessToken;
  } catch {
    return true;
  }
}

export async function POST(req: NextRequest) {
  const { igAccountId, period } = await req.json();

  if (!igAccountId) {
    return NextResponse.json({ error: "igAccountId é obrigatório" }, { status: 400 });
  }

  if (isDemoMode()) {
    const account = MOCK_SELLERS.find((s) => s.igAccountId === igAccountId);
    if (!account) {
      return NextResponse.json({ error: "Conta não encontrada" }, { status: 404 });
    }
    try {
      const analysis = await analyzeConversations(MOCK_CONVERSATIONS, account.name);
      return NextResponse.json({
        demo: true,
        report: { seller: account.name, period, ...(analysis as object) },
      });
    } catch {
      return NextResponse.json({
        demo: true,
        report: { seller: account.name, period, ...MOCK_REPORT },
      });
    }
  }

  const account = getSellerByAccountId(igAccountId);
  if (!account) {
    return NextResponse.json({ error: "Conta não encontrada" }, { status: 404 });
  }

  const days = periodToDays(period ?? "7d");
  const since = new Date();
  since.setDate(since.getDate() - days);

  let conversations;
  try {
    conversations = await getConversations(account.igAccountId, account.accessToken, since);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro ao buscar conversas";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  if (conversations.length === 0) {
    return NextResponse.json({ error: "Nenhuma conversa encontrada no período" }, { status: 404 });
  }

  const analysis = await analyzeConversations(conversations, account.name);
  return NextResponse.json({
    demo: false,
    report: { seller: account.name, period, ...(analysis as object) },
  });
}

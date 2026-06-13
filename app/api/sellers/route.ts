import { NextResponse } from "next/server";
import { getSellerAccounts } from "@/lib/meta";
import { MOCK_SELLERS } from "@/lib/mock";

export async function GET() {
  const accounts = getSellerAccounts();
  const configured = accounts.filter((a) => a.igAccountId && a.accessToken);
  const demo = configured.length === 0;
  const source = demo ? MOCK_SELLERS : configured;
  const sellers = source.map(({ name, igAccountId }) => ({ name, igAccountId }));
  return NextResponse.json({ sellers, demo });
}

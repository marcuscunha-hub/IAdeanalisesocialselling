import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (password !== process.env.DASHBOARD_PASSWORD) {
    return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set("auth", process.env.DASHBOARD_PASSWORD!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 dias
    path: "/",
  });

  return NextResponse.json({ ok: true });
}

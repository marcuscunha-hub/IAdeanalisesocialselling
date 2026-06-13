import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const auth = req.cookies.get("auth")?.value;
  const password = process.env.DASHBOARD_PASSWORD;

  if (!auth || auth !== password) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};

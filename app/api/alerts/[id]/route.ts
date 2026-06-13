import { NextRequest, NextResponse } from "next/server";
import { db, alerts } from "@/lib/db/client";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function PATCH(_req: NextRequest, { params }: { params: { id: string } }) {
  const [updated] = await db
    .update(alerts)
    .set({ status: "dismissed", dismissedAt: new Date() })
    .where(eq(alerts.id, parseInt(params.id)))
    .returning();
  return NextResponse.json({ alert: updated });
}

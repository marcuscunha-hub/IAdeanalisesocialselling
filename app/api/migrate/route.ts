import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export const runtime = "nodejs";

// One-time migration endpoint — protected by CRON_SECRET
export async function GET(_req: NextRequest) {

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS conversations (
        id               TEXT PRIMARY KEY,
        ig_account_id    TEXT NOT NULL,
        lead_username    TEXT,
        lead_id          TEXT NOT NULL,
        stage            TEXT DEFAULT 'abordagem',
        status           TEXT DEFAULT 'active',
        last_message_at  TIMESTAMPTZ,
        seller_last_at   TIMESTAMPTZ,
        created_at       TIMESTAMPTZ DEFAULT NOW(),
        updated_at       TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS messages (
        id               TEXT PRIMARY KEY,
        conversation_id  TEXT REFERENCES conversations(id),
        from_id          TEXT NOT NULL,
        from_username    TEXT,
        body             TEXT NOT NULL,
        is_from_seller   BOOLEAN NOT NULL,
        sent_at          TIMESTAMPTZ NOT NULL,
        created_at       TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS analyses (
        id               SERIAL PRIMARY KEY,
        conversation_id  TEXT REFERENCES conversations(id),
        ig_account_id    TEXT NOT NULL,
        score            INTEGER,
        stage_scores     JSONB,
        stage_feedback   JSONB,
        highlights       JSONB,
        improvements     JSONB,
        current_stage    TEXT,
        triggered_by     TEXT,
        created_at       TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS reports (
        id                    SERIAL PRIMARY KEY,
        ig_account_id         TEXT NOT NULL,
        period                TEXT NOT NULL,
        score                 INTEGER,
        total_conversations   INTEGER,
        stages                JSONB,
        highlights            JSONB,
        improvements          JSONB,
        created_at            TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS alerts (
        id               SERIAL PRIMARY KEY,
        conversation_id  TEXT REFERENCES conversations(id),
        ig_account_id    TEXT NOT NULL,
        type             TEXT NOT NULL,
        status           TEXT DEFAULT 'pending',
        triggered_at     TIMESTAMPTZ DEFAULT NOW(),
        dismissed_at     TIMESTAMPTZ
      )
    `;

    return NextResponse.json({ ok: true, message: "Todas as tabelas criadas com sucesso." });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

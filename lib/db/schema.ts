import { pgTable, text, integer, boolean, jsonb, serial, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const conversations = pgTable("conversations", {
  id:              text("id").primaryKey(),                          // Meta conversation ID
  igAccountId:     text("ig_account_id").notNull(),                 // seller's IG account
  leadUsername:    text("lead_username"),                            // lead's @handle
  leadId:          text("lead_id").notNull(),                       // Meta user ID of lead
  stage:           text("stage").default("abordagem"),              // current sales funnel stage
  status:          text("status").default("active"),                // active | scheduled | lost | no_reply
  lastMessageAt:   timestamp("last_message_at", { withTimezone: true }),
  sellerLastAt:    timestamp("seller_last_at",  { withTimezone: true }),
  createdAt:       timestamp("created_at",      { withTimezone: true }).default(sql`now()`),
  updatedAt:       timestamp("updated_at",      { withTimezone: true }).default(sql`now()`),
});

export const messages = pgTable("messages", {
  id:             text("id").primaryKey(),                           // Meta message ID
  conversationId: text("conversation_id").references(() => conversations.id),
  fromId:         text("from_id").notNull(),
  fromUsername:   text("from_username"),
  body:           text("body").notNull(),
  isFromSeller:   boolean("is_from_seller").notNull(),
  sentAt:         timestamp("sent_at", { withTimezone: true }).notNull(),
  createdAt:      timestamp("created_at", { withTimezone: true }).default(sql`now()`),
});

export const analyses = pgTable("analyses", {
  id:             serial("id").primaryKey(),
  conversationId: text("conversation_id").references(() => conversations.id),
  igAccountId:    text("ig_account_id").notNull(),
  score:          integer("score"),
  stageScores:    jsonb("stage_scores"),                            // { abordagem: 85, ... }
  stageFeedback:  jsonb("stage_feedback"),                          // { abordagem: "...", ... }
  highlights:     jsonb("highlights"),                              // string[]
  improvements:   jsonb("improvements"),                            // string[]
  currentStage:   text("current_stage"),                            // AI-determined funnel stage
  triggeredBy:    text("triggered_by"),                             // 'webhook' | 'manual' | 'cron'
  createdAt:      timestamp("created_at", { withTimezone: true }).default(sql`now()`),
});

export const reports = pgTable("reports", {
  id:                  serial("id").primaryKey(),
  igAccountId:         text("ig_account_id").notNull(),
  period:              text("period").notNull(),
  score:               integer("score"),
  totalConversations:  integer("total_conversations"),
  stages:              jsonb("stages"),
  highlights:          jsonb("highlights"),
  improvements:        jsonb("improvements"),
  createdAt:           timestamp("created_at", { withTimezone: true }).default(sql`now()`),
});

export const alerts = pgTable("alerts", {
  id:             serial("id").primaryKey(),
  conversationId: text("conversation_id").references(() => conversations.id),
  igAccountId:    text("ig_account_id").notNull(),
  type:           text("type").notNull(),                           // 'followup_3d' | 'followup_7d' | 'followup_14d'
  status:         text("status").default("pending"),                // pending | dismissed
  triggeredAt:    timestamp("triggered_at", { withTimezone: true }).default(sql`now()`),
  dismissedAt:    timestamp("dismissed_at", { withTimezone: true }),
});

export type Conversation = typeof conversations.$inferSelect;
export type Message      = typeof messages.$inferSelect;
export type Analysis     = typeof analyses.$inferSelect;
export type Report       = typeof reports.$inferSelect;
export type Alert        = typeof alerts.$inferSelect;

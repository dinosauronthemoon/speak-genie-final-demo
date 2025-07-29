import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  preferredLanguage: text("preferred_language").default("English"),
  geminiApiKey: text("gemini_api_key"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  title: text("title").notNull(),
  language: text("language").notNull(),
  mode: text("mode").notNull(), // 'freeChat' | 'roleplay'
  scenario: text("scenario"), // school, store, home, restaurant
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").references(() => conversations.id),
  role: text("role").notNull(), // 'user' | 'assistant'
  content: text("content").notNull(),
  language: text("language").notNull(),
  isVoiceMessage: boolean("is_voice_message").default(false),
  voiceSettings: jsonb("voice_settings"), // speed, pitch, voice
  createdAt: timestamp("created_at").defaultNow(),
});

export const sessionStats = pgTable("session_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").references(() => conversations.id),
  messageCount: integer("message_count").default(0),
  voiceMessageCount: integer("voice_message_count").default(0),
  duration: integer("duration_seconds").default(0), // in seconds
  language: text("language").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  preferredLanguage: true,
});

export const insertConversationSchema = createInsertSchema(conversations).pick({
  title: true,
  language: true,
  mode: true,
  scenario: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  conversationId: true,
  role: true,
  content: true,
  language: true,
  isVoiceMessage: true,
  voiceSettings: true,
});

export const insertSessionStatsSchema = createInsertSchema(sessionStats).pick({
  conversationId: true,
  messageCount: true,
  voiceMessageCount: true,
  duration: true,
  language: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertSessionStats = z.infer<typeof insertSessionStatsSchema>;
export type SessionStats = typeof sessionStats.$inferSelect;

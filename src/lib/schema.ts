import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  uuid,
} from "drizzle-orm/pg-core";

// ── Better Auth tables ──────────────────────────────────────────────

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  issuer: text("issuer"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ── Application tables ──────────────────────────────────────────────

export const tests = pgTable("tests", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").references(() => user.id),
  title: text("title").notNull(),
  examType: text("exam_type").notNull(),
  questionCount: integer("question_count").notNull(),
  imageUrl: text("image_url").notNull().default(""),
  imageUrls: jsonb("image_urls").notNull().default([]),
  shareToken: text("share_token").notNull().unique(),
  additionalPrompt: text("additional_prompt"),
  questions: jsonb("questions").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const testAttempts = pgTable("test_attempts", {
  id: uuid("id").primaryKey().defaultRandom(),
  testId: uuid("test_id")
    .notNull()
    .references(() => tests.id),
  userName: text("user_name"),
  userId: text("user_id").references(() => user.id),
  score: integer("score").notNull().default(0),
  total: integer("total").notNull(),
  answers: jsonb("answers").notNull(),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
});

// ── Types ───────────────────────────────────────────────────────────

export type Question = {
  id: number;
  question_en: string;
  question_hi: string;
  options_en: string[];
  options_hi: string[];
  correct_answer: string;
  explanation_en: string;
  explanation_hi: string;
};

export type TestRecord = typeof tests.$inferSelect;
export type TestAttempt = typeof testAttempts.$inferSelect;

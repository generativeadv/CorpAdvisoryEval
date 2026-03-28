import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const firms = sqliteTable("firms", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  shortName: text("short_name").notNull(),
  group: integer("group_number").notNull(),
  reportPath: text("report_path"),
  reportContent: text("report_content"), // fallback for dynamically added firms
  reportGeneratedAt: text("report_generated_at"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const evaluations = sqliteTable("evaluations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  firmId: integer("firm_id")
    .notNull()
    .references(() => firms.id),
  version: integer("version").notNull().default(1),
  isActive: integer("is_active").notNull().default(1),

  // Framework 1: AI Maturity Model (1-5)
  maturityStage: integer("maturity_stage").notNull(),
  maturityRationale: text("maturity_rationale"),

  // Framework 2: Dimension Scorecard (10 dims, 1-5 each)
  dim1: integer("dim1_client_offering").notNull(),
  dim2: integer("dim2_proprietary_tech").notNull(),
  dim3: integer("dim3_leadership_governance").notNull(),
  dim4: integer("dim4_technical_talent").notNull(),
  dim5: integer("dim5_partnerships").notNull(),
  dim6: integer("dim6_thought_leadership").notNull(),
  dim7: integer("dim7_acquisitions").notNull(),
  dim8: integer("dim8_internal_adoption").notNull(),
  dim9: integer("dim9_commercial_momentum").notNull(),
  dim10: integer("dim10_strategic_coherence").notNull(),

  compositeScoreUnweighted: real("composite_score_unweighted").notNull(),
  compositeScoreWeighted: real("composite_score_weighted").notNull(),

  // Framework 3: Evidence Confidence Index
  confidenceGrade: text("confidence_grade").notNull(), // A, B, C, D
  confidenceRationale: text("confidence_rationale"),

  // Archetype
  archetype: text("archetype").notNull(),

  scoredAt: text("scored_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const chatSessions = sqliteTable("chat_sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const chatMessages = sqliteTable("chat_messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: integer("session_id")
    .notNull()
    .references(() => chatSessions.id),
  role: text("role").notNull(), // "user" | "assistant"
  content: text("content").notNull(),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

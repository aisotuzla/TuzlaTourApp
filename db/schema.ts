import { pgTable, text, boolean, timestamp, date } from "drizzle-orm/pg-core";

export const verifiedEvents = pgTable("verified_events", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  startDate: date("start_date", { mode: "string" }).notNull(),
  startTime: text("start_time").notNull(),
  venueName: text("venue_name").notNull(),
  city: text("city").notNull().default("Tuzla"),
  price: text("price"),
  sourceUrls: text("source_urls").array().notNull(),
  verificationSources: text("verification_sources").array().notNull(),
  verified: boolean("verified").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

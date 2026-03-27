import { pgTable, text, serial, integer, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const locationSessionsTable = pgTable("location_sessions", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  pageStyle: text("page_style").notNull().default("delivery"),
  captureCount: integer("capture_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const locationsTable = pgTable("locations", {
  id: serial("id").primaryKey(),
  sessionToken: text("session_token").notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  accuracy: doublePrecision("accuracy"),
  altitude: doublePrecision("altitude"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  capturedAt: timestamp("captured_at").notNull().defaultNow(),
});

export const insertLocationSessionSchema = createInsertSchema(locationSessionsTable).omit({ id: true, createdAt: true, captureCount: true });
export type InsertLocationSession = z.infer<typeof insertLocationSessionSchema>;
export type LocationSession = typeof locationSessionsTable.$inferSelect;

export const insertLocationSchema = createInsertSchema(locationsTable).omit({ id: true, capturedAt: true });
export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Location = typeof locationsTable.$inferSelect;

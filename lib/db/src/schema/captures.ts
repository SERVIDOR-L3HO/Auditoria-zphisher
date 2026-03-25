import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { campaignsTable } from "./campaigns";

export const capturesTable = pgTable("captures", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull().references(() => campaignsTable.id, { onDelete: "cascade" }),
  username: text("username"),
  password: text("password"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  capturedAt: timestamp("captured_at").notNull().defaultNow(),
});

export const insertCaptureSchema = createInsertSchema(capturesTable).omit({ id: true, capturedAt: true });
export type InsertCapture = z.infer<typeof insertCaptureSchema>;
export type Capture = typeof capturesTable.$inferSelect;

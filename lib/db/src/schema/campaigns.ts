import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const campaignsTable = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  templateId: text("template_id").notNull(),
  templateName: text("template_name").notNull(),
  status: text("status").notNull().default("draft"),
  targetCount: integer("target_count").notNull().default(0),
  captureCount: integer("capture_count").notNull().default(0),
  phishUrl: text("phish_url"),
  tunnelType: text("tunnel_type").notNull().default("localhost"),
  port: integer("port"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertCampaignSchema = createInsertSchema(campaignsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Campaign = typeof campaignsTable.$inferSelect;

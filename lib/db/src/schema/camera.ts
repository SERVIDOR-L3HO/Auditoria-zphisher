import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";

export const cameraSessionsTable = pgTable("camera_sessions", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  pageStyle: text("page_style").notNull().default("identity"),
  captureCount: integer("capture_count").notNull().default(0),
  ownerUid: text("owner_uid"),
  ownerEmail: text("owner_email"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const cameraCapturesTable = pgTable("camera_captures", {
  id: serial("id").primaryKey(),
  sessionToken: text("session_token").notNull(),
  imageData: text("image_data").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  capturedAt: timestamp("captured_at").notNull().defaultNow(),
});

export type CameraSession = typeof cameraSessionsTable.$inferSelect;
export type CameraCapture = typeof cameraCapturesTable.$inferSelect;

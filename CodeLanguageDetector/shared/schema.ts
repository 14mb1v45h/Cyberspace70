import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const uploadedFiles = pgTable("uploaded_files", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  originalPath: text("original_path"),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type"),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const detectionResults = pgTable("detection_results", {
  id: serial("id").primaryKey(),
  fileId: integer("file_id").references(() => uploadedFiles.id).notNull(),
  detectedLanguage: text("detected_language").notNull(),
  confidence: real("confidence").notNull(),
  detectionMethod: text("detection_method").notNull(),
  keywords: text("keywords").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const detectionSettings = pgTable("detection_settings", {
  id: serial("id").primaryKey(),
  enableExtensionDetection: boolean("enable_extension_detection").default(true),
  enableSyntaxAnalysis: boolean("enable_syntax_analysis").default(true),
  confidenceThreshold: real("confidence_threshold").default(0.7),
  maxFileSize: integer("max_file_size").default(10485760), // 10MB
});

export const insertUploadedFileSchema = createInsertSchema(uploadedFiles).omit({
  id: true,
  uploadedAt: true,
});

export const insertDetectionResultSchema = createInsertSchema(detectionResults).omit({
  id: true,
  createdAt: true,
});

export const insertDetectionSettingsSchema = createInsertSchema(detectionSettings).omit({
  id: true,
});

export type UploadedFile = typeof uploadedFiles.$inferSelect;
export type InsertUploadedFile = z.infer<typeof insertUploadedFileSchema>;
export type DetectionResult = typeof detectionResults.$inferSelect;
export type InsertDetectionResult = z.infer<typeof insertDetectionResultSchema>;
export type DetectionSettings = typeof detectionSettings.$inferSelect;
export type InsertDetectionSettings = z.infer<typeof insertDetectionSettingsSchema>;

export interface FileWithResults extends UploadedFile {
  results: DetectionResult[];
}

export interface LanguageStats {
  language: string;
  count: number;
  percentage: number;
  color: string;
}

export interface ProcessingStatus {
  totalFiles: number;
  processedFiles: number;
  currentFile?: string;
  progress: number;
}

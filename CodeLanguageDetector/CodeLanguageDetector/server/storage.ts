import { 
  uploadedFiles, 
  detectionResults, 
  detectionSettings,
  type UploadedFile, 
  type InsertUploadedFile,
  type DetectionResult,
  type InsertDetectionResult,
  type DetectionSettings,
  type InsertDetectionSettings,
  type FileWithResults,
  type LanguageStats,
  type ProcessingStatus
} from "@shared/schema";
import { db } from "./db.js";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  // File operations
  createFile(file: InsertUploadedFile): Promise<UploadedFile>;
  getFile(id: number): Promise<UploadedFile | undefined>;
  getAllFiles(): Promise<UploadedFile[]>;
  deleteFile(id: number): Promise<void>;
  
  // Detection result operations
  createDetectionResult(result: InsertDetectionResult): Promise<DetectionResult>;
  getDetectionResultsByFileId(fileId: number): Promise<DetectionResult[]>;
  getAllDetectionResults(): Promise<DetectionResult[]>;
  
  // Settings operations
  getDetectionSettings(): Promise<DetectionSettings>;
  updateDetectionSettings(settings: Partial<InsertDetectionSettings>): Promise<DetectionSettings>;
  
  // Combined operations
  getFilesWithResults(): Promise<FileWithResults[]>;
  getLanguageStats(): Promise<LanguageStats[]>;
  getProcessingStatus(): Promise<ProcessingStatus>;
}

export class DatabaseStorage implements IStorage {
  async createFile(insertFile: InsertUploadedFile): Promise<UploadedFile> {
    const [file] = await db
      .insert(uploadedFiles)
      .values(insertFile)
      .returning();
    return file;
  }

  async getFile(id: number): Promise<UploadedFile | undefined> {
    const [file] = await db.select().from(uploadedFiles).where(eq(uploadedFiles.id, id));
    return file || undefined;
  }

  async getAllFiles(): Promise<UploadedFile[]> {
    return await db.select().from(uploadedFiles);
  }

  async deleteFile(id: number): Promise<void> {
    // Delete associated results first
    await db.delete(detectionResults).where(eq(detectionResults.fileId, id));
    // Then delete the file
    await db.delete(uploadedFiles).where(eq(uploadedFiles.id, id));
  }

  async createDetectionResult(insertResult: InsertDetectionResult): Promise<DetectionResult> {
    const [result] = await db
      .insert(detectionResults)
      .values(insertResult)
      .returning();
    return result;
  }

  async getDetectionResultsByFileId(fileId: number): Promise<DetectionResult[]> {
    return await db.select().from(detectionResults).where(eq(detectionResults.fileId, fileId));
  }

  async getAllDetectionResults(): Promise<DetectionResult[]> {
    return await db.select().from(detectionResults);
  }

  async getDetectionSettings(): Promise<DetectionSettings> {
    const [settings] = await db.select().from(detectionSettings);
    
    if (!settings) {
      // Create default settings if none exist
      const [newSettings] = await db
        .insert(detectionSettings)
        .values({
          enableExtensionDetection: true,
          enableSyntaxAnalysis: true,
          confidenceThreshold: 0.7,
          maxFileSize: 10485760,
        })
        .returning();
      return newSettings;
    }
    
    return settings;
  }

  async updateDetectionSettings(newSettings: Partial<InsertDetectionSettings>): Promise<DetectionSettings> {
    const currentSettings = await this.getDetectionSettings();
    
    const [updatedSettings] = await db
      .update(detectionSettings)
      .set(newSettings)
      .where(eq(detectionSettings.id, currentSettings.id))
      .returning();
    
    return updatedSettings;
  }

  async getFilesWithResults(): Promise<FileWithResults[]> {
    // Use a more efficient query with joins instead of N+1 queries
    const files = await this.getAllFiles();
    const allResults = await this.getAllDetectionResults();
    
    const resultsByFileId = new Map<number, DetectionResult[]>();
    allResults.forEach(result => {
      if (!resultsByFileId.has(result.fileId)) {
        resultsByFileId.set(result.fileId, []);
      }
      resultsByFileId.get(result.fileId)!.push(result);
    });

    return files.map(file => ({
      ...file,
      results: resultsByFileId.get(file.id) || []
    }));
  }

  async getLanguageStats(): Promise<LanguageStats[]> {
    const results = await this.getAllDetectionResults();
    const languageCounts = new Map<string, number>();
    
    results.forEach(result => {
      const count = languageCounts.get(result.detectedLanguage) || 0;
      languageCounts.set(result.detectedLanguage, count + 1);
    });

    const total = results.length;
    const colors = ['#3B82F6', '#EAB308', '#10B981', '#EF4444', '#8B5CF6', '#6B7280'];
    
    return Array.from(languageCounts.entries())
      .map(([language, count], index) => ({
        language,
        count,
        percentage: Math.round((count / total) * 100),
        color: colors[index % colors.length],
      }))
      .sort((a, b) => b.count - a.count);
  }

  async getProcessingStatus(): Promise<ProcessingStatus> {
    // Use simple count queries for better performance
    const files = await db.select({ id: uploadedFiles.id }).from(uploadedFiles);
    const distinctFileIds = await db.select({ fileId: detectionResults.fileId })
      .from(detectionResults)
      .groupBy(detectionResults.fileId);
    
    const totalFiles = files.length;
    const processedFiles = distinctFileIds.length;
    
    return {
      totalFiles,
      processedFiles,
      progress: totalFiles > 0 ? Math.round((processedFiles / totalFiles) * 100) : 0,
    };
  }
}

export const storage = new DatabaseStorage();

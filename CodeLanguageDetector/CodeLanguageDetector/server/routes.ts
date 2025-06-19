import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage.js";
import { FileProcessor } from "./services/file-processor.js";
import { z } from "zod";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for uploads
  }
});

const updateSettingsSchema = z.object({
  enableExtensionDetection: z.boolean().optional(),
  enableSyntaxAnalysis: z.boolean().optional(),
  confidenceThreshold: z.number().min(0).max(1).optional(),
  maxFileSize: z.number().min(1024).optional(), // Minimum 1KB
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all uploaded files with their detection results
  app.get("/api/files", async (req, res) => {
    try {
      const filesWithResults = await storage.getFilesWithResults();
      res.json(filesWithResults);
    } catch (error) {
      console.error("Error fetching files:", error);
      res.status(500).json({ message: "Failed to fetch files" });
    }
  });

  // Upload and process files
  app.post("/api/upload", upload.array('files'), async (req, res) => {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({ message: "No files provided" });
      }

      const settings = await storage.getDetectionSettings();
      const processor = new FileProcessor(100 * 1024 * 1024); // 100MB limit
      const uploadedFiles = [];

      for (const file of req.files) {
        try {
          // Create file record
          const uploadedFile = await storage.createFile({
            filename: file.originalname,
            fileSize: file.size,
            mimeType: file.mimetype,
          });

          // Process the file
          const processedFiles = await processor.processFile(file.buffer, file.originalname);
          
          // Store detection results
          for (const processedFile of processedFiles) {
            if (processedFile.detectionResult) {
              const { confidence } = processedFile.detectionResult;
              
              // Only store results that meet the confidence threshold
              if (confidence >= (settings.confidenceThreshold ?? 0.7)) {
                await storage.createDetectionResult({
                  fileId: uploadedFile.id,
                  detectedLanguage: processedFile.detectionResult.language,
                  confidence: processedFile.detectionResult.confidence,
                  detectionMethod: processedFile.detectionResult.method,
                  keywords: processedFile.detectionResult.keywords,
                });
              }
            }
          }

          uploadedFiles.push(uploadedFile);
        } catch (error) {
          console.error(`Error processing file ${file.originalname}:`, error);
          // Continue processing other files, but log the error
        }
      }

      // Invalidate cache after upload
      invalidateProcessingCache();

      res.json({ 
        message: `Successfully processed ${uploadedFiles.length} files`,
        files: uploadedFiles 
      });
    } catch (error) {
      console.error("Error uploading files:", error);
      res.status(500).json({ message: "Failed to process files" });
    }
  });

  // Delete a file and its results
  app.delete("/api/files/:id", async (req, res) => {
    try {
      const fileId = parseInt(req.params.id);
      if (isNaN(fileId)) {
        return res.status(400).json({ message: "Invalid file ID" });
      }

      const file = await storage.getFile(fileId);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }

      await storage.deleteFile(fileId);
      
      // Invalidate cache after deletion
      invalidateProcessingCache();
      
      res.json({ message: "File deleted successfully" });
    } catch (error) {
      console.error("Error deleting file:", error);
      res.status(500).json({ message: "Failed to delete file" });
    }
  });

  // Get language statistics
  app.get("/api/stats/languages", async (req, res) => {
    try {
      const stats = await storage.getLanguageStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching language stats:", error);
      res.status(500).json({ message: "Failed to fetch language statistics" });
    }
  });

  // Cache for processing status to reduce database calls
  let processingStatusCache: { data: any; timestamp: number } | null = null;
  const CACHE_DURATION = 3000; // 3 seconds
  
  const invalidateProcessingCache = () => {
    processingStatusCache = null;
  };

  // Get processing status
  app.get("/api/stats/processing", async (req, res) => {
    try {
      const now = Date.now();
      
      // Return cached data if it's still fresh
      if (processingStatusCache && (now - processingStatusCache.timestamp) < CACHE_DURATION) {
        console.log("Returning cached processing status");
        return res.json(processingStatusCache.data);
      }
      
      console.log("Fetching fresh processing status from database");
      const status = await storage.getProcessingStatus();
      
      // Update cache
      processingStatusCache = { data: status, timestamp: now };
      
      res.json(status);
    } catch (error) {
      console.error("Error fetching processing status:", error);
      res.status(500).json({ message: "Failed to fetch processing status" });
    }
  });

  // Get detection settings
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getDetectionSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  // Update detection settings
  app.patch("/api/settings", async (req, res) => {
    try {
      const validatedData = updateSettingsSchema.parse(req.body);
      const updatedSettings = await storage.updateDetectionSettings(validatedData);
      res.json(updatedSettings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid settings data", 
          errors: error.errors 
        });
      }
      console.error("Error updating settings:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

import JSZip from 'jszip';
import { LanguageDetector } from './language-detection.js';
import type { DetectionResult } from './language-detection.js';

export interface ProcessedFile {
  filename: string;
  path: string;
  size: number;
  content?: string;
  detectionResult?: DetectionResult;
}

export class FileProcessor {
  private detector: LanguageDetector;
  private maxFileSize: number;

  constructor(maxFileSize: number = 100 * 1024 * 1024) { // 100MB default
    this.detector = new LanguageDetector();
    this.maxFileSize = maxFileSize;
  }

  async processFile(buffer: Buffer, filename: string): Promise<ProcessedFile[]> {
    if (buffer.length > this.maxFileSize) {
      throw new Error(`File ${filename} exceeds maximum size limit`);
    }

    const extension = this.getFileExtension(filename).toLowerCase();
    
    // Handle zip files
    if (extension === '.zip') {
      return this.processZipFile(buffer, filename);
    }
    
    // Handle individual code files
    if (this.isCodeFile(filename)) {
      const content = buffer.toString('utf8');
      const detectionResult = this.detector.detectFromContent(content, filename);
      
      return [{
        filename,
        path: filename,
        size: buffer.length,
        content,
        detectionResult,
      }];
    }
    
    throw new Error(`Unsupported file type: ${extension}`);
  }

  private async processZipFile(buffer: Buffer, zipFilename: string): Promise<ProcessedFile[]> {
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(buffer);
    const processedFiles: ProcessedFile[] = [];

    for (const [path, file] of Object.entries(zipContent.files)) {
      if (file.dir) continue; // Skip directories
      
      const filename = path.split('/').pop() || path;
      
      if (!this.isCodeFile(filename)) continue; // Skip non-code files
      
      try {
        const fileBuffer = await file.async('nodebuffer');
        
        if (fileBuffer.length > this.maxFileSize) {
          console.warn(`Skipping ${path}: file too large`);
          continue;
        }
        
        const content = fileBuffer.toString('utf8');
        const detectionResult = this.detector.detectFromContent(content, filename);
        
        processedFiles.push({
          filename,
          path,
          size: fileBuffer.length,
          content,
          detectionResult,
        });
      } catch (error) {
        console.error(`Error processing ${path}:`, error);
        // Continue processing other files
      }
    }

    return processedFiles;
  }

  private isCodeFile(filename: string): boolean {
    const extension = this.getFileExtension(filename).toLowerCase();
    const codeExtensions = [
      '.py', '.pyw', '.js', '.jsx', '.ts', '.tsx', '.java', '.cpp', '.cc', '.cxx', '.c++',
      '.hpp', '.h++', '.c', '.h', '.php', '.phtml', '.rb', '.rbw', '.go', '.rs',
      '.cs', '.vb', '.swift', '.kt', '.scala', '.pl', '.pm', '.r', '.R', '.m',
      '.mm', '.pas', '.pp', '.inc', '.asm', '.s', '.sh', '.bash', '.zsh', '.fish',
      '.ps1', '.psm1', '.psd1', '.bat', '.cmd', '.sql', '.html', '.htm', '.xml',
      '.css', '.scss', '.sass', '.less', '.json', '.yaml', '.yml', '.toml', '.ini',
      '.cfg', '.conf', '.properties', '.gradle', '.maven', '.make', '.cmake',
      '.dockerfile', '.docker', '.md', '.rst', '.tex', '.lua', '.vim', '.el',
    ];
    
    return codeExtensions.includes(extension);
  }

  private getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    return lastDot !== -1 ? filename.substring(lastDot) : '';
  }
}

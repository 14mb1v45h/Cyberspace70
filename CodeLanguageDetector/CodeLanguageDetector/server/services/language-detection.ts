export interface LanguageSignature {
  extensions: string[];
  keywords: string[];
  patterns: RegExp[];
  weight: number;
}

export const languageSignatures: Record<string, LanguageSignature> = {
  Python: {
    extensions: ['.py', '.pyw', '.pyc'],
    keywords: ['def', 'import', 'from', 'class', 'if __name__', 'print', 'return', 'elif', 'except', 'finally'],
    patterns: [
      /def\s+\w+\s*\(/,
      /import\s+\w+/,
      /from\s+\w+\s+import/,
      /if\s+__name__\s*==\s*['"']__main__['"']/,
    ],
    weight: 1.0,
  },
  JavaScript: {
    extensions: ['.js', '.jsx', '.mjs'],
    keywords: ['function', 'const', 'let', 'var', 'export', 'import', 'class', 'extends', 'return', 'if'],
    patterns: [
      /function\s+\w+\s*\(/,
      /const\s+\w+\s*=/,
      /let\s+\w+\s*=/,
      /export\s+(default\s+)?/,
      /import\s+.*from/,
    ],
    weight: 1.0,
  },
  TypeScript: {
    extensions: ['.ts', '.tsx'],
    keywords: ['interface', 'type', 'enum', 'namespace', 'implements', 'extends', 'public', 'private', 'protected'],
    patterns: [
      /interface\s+\w+/,
      /type\s+\w+\s*=/,
      /enum\s+\w+/,
      /:\s*\w+(\[\])?(\s*\|\s*\w+)*\s*[;,=]/,
    ],
    weight: 1.2,
  },
  Java: {
    extensions: ['.java'],
    keywords: ['public', 'private', 'protected', 'class', 'interface', 'extends', 'implements', 'static', 'final', 'void'],
    patterns: [
      /public\s+class\s+\w+/,
      /public\s+static\s+void\s+main/,
      /import\s+[\w.]+;/,
      /package\s+[\w.]+;/,
    ],
    weight: 1.0,
  },
  'C++': {
    extensions: ['.cpp', '.cc', '.cxx', '.c++', '.hpp', '.h++'],
    keywords: ['#include', 'namespace', 'class', 'public:', 'private:', 'protected:', 'virtual', 'override', 'template'],
    patterns: [
      /#include\s*<[\w.]+>/,
      /namespace\s+\w+/,
      /class\s+\w+/,
      /template\s*<.*>/,
      /std::/,
    ],
    weight: 1.0,
  },
  C: {
    extensions: ['.c', '.h'],
    keywords: ['#include', 'int main', 'printf', 'scanf', 'malloc', 'free', 'struct', 'typedef'],
    patterns: [
      /#include\s*<[\w.]+>/,
      /int\s+main\s*\(/,
      /printf\s*\(/,
      /struct\s+\w+/,
    ],
    weight: 0.9,
  },
  PHP: {
    extensions: ['.php', '.phtml'],
    keywords: ['<?php', 'function', 'class', 'public', 'private', 'protected', 'namespace', 'use', 'echo', 'print'],
    patterns: [
      /<\?php/,
      /function\s+\w+\s*\(/,
      /class\s+\w+/,
      /namespace\s+[\w\\]+/,
    ],
    weight: 1.0,
  },
  Ruby: {
    extensions: ['.rb', '.rbw'],
    keywords: ['def', 'class', 'module', 'end', 'require', 'include', 'attr_accessor', 'puts', 'print'],
    patterns: [
      /def\s+\w+/,
      /class\s+\w+/,
      /module\s+\w+/,
      /require\s+['"'][\w\/]+['"']/,
    ],
    weight: 1.0,
  },
  Go: {
    extensions: ['.go'],
    keywords: ['package', 'import', 'func', 'var', 'const', 'type', 'struct', 'interface', 'chan', 'go'],
    patterns: [
      /package\s+\w+/,
      /func\s+\w+\s*\(/,
      /import\s*\(/,
      /type\s+\w+\s+struct/,
    ],
    weight: 1.0,
  },
  Rust: {
    extensions: ['.rs'],
    keywords: ['fn', 'let', 'mut', 'struct', 'enum', 'impl', 'trait', 'use', 'mod', 'pub'],
    patterns: [
      /fn\s+\w+\s*\(/,
      /let\s+(mut\s+)?\w+/,
      /struct\s+\w+/,
      /impl\s+\w+/,
    ],
    weight: 1.0,
  },
};

export interface DetectionResult {
  language: string;
  confidence: number;
  method: string;
  keywords: string[];
}

export class LanguageDetector {
  detectFromBinary(filename: string, buffer: Buffer): DetectionResult | null {
    const extension = this.getFileExtension(filename).toLowerCase();
    const fileHeader = buffer.subarray(0, Math.min(512, buffer.length));
    
    // Windows executables - likely C/C++
    if (extension === '.exe' || extension === '.dll') {
      // Check for common C/C++ runtime signatures
      const headerStr = fileHeader.toString('latin1');
      if (headerStr.includes('MSVCR') || headerStr.includes('MSVCP') || headerStr.includes('vcruntime')) {
        return {
          language: 'C++',
          confidence: 0.8,
          method: 'binary_analysis',
          keywords: ['MSVC', 'Windows', 'executable']
        };
      }
      // Check for .NET assemblies
      if (headerStr.includes('CLR Header') || buffer.includes(Buffer.from([0x5A, 0x4D]))) {
        return {
          language: 'C#',
          confidence: 0.7,
          method: 'binary_analysis',
          keywords: ['.NET', 'CLR', 'assembly']
        };
      }
      return {
        language: 'C',
        confidence: 0.6,
        method: 'binary_analysis',
        keywords: ['Windows', 'executable', 'native']
      };
    }
    
    // Linux/Unix executables
    if (extension === '' && buffer[0] === 0x7F && buffer[1] === 0x45 && buffer[2] === 0x4C && buffer[3] === 0x46) {
      return {
        language: 'C',
        confidence: 0.7,
        method: 'binary_analysis',
        keywords: ['ELF', 'Linux', 'executable']
      };
    }
    
    // Java class files
    if (extension === '.class' || (buffer[0] === 0xCA && buffer[1] === 0xFE && buffer[2] === 0xBA && buffer[3] === 0xBE)) {
      return {
        language: 'Java',
        confidence: 0.9,
        method: 'binary_analysis',
        keywords: ['bytecode', 'JVM', 'class']
      };
    }
    
    // Python bytecode
    if (extension === '.pyc' || extension === '.pyo') {
      return {
        language: 'Python',
        confidence: 0.9,
        method: 'binary_analysis',
        keywords: ['bytecode', 'compiled']
      };
    }
    
    return null;
  }

  detectFromFilename(filename: string): DetectionResult | null {
    const extension = this.getFileExtension(filename);
    
    for (const [language, signature] of Object.entries(languageSignatures)) {
      if (signature.extensions.includes(extension)) {
        return {
          language,
          confidence: 0.8 * signature.weight,
          method: 'File Extension',
          keywords: [],
        };
      }
    }
    
    return null;
  }

  detectFromContent(content: string, filename?: string): DetectionResult {
    const scores: Record<string, { score: number; keywords: string[]; methods: string[] }> = {};
    
    // Initialize scores
    for (const language of Object.keys(languageSignatures)) {
      scores[language] = { score: 0, keywords: [], methods: [] };
    }

    // File extension boost
    if (filename) {
      const extensionResult = this.detectFromFilename(filename);
      if (extensionResult) {
        scores[extensionResult.language].score += 0.3;
        scores[extensionResult.language].methods.push('Extension');
      }
    }

    // Keyword analysis
    const contentLower = content.toLowerCase();
    const contentLines = content.split('\n');
    
    for (const [language, signature] of Object.entries(languageSignatures)) {
      let keywordScore = 0;
      const foundKeywords: string[] = [];
      
      for (const keyword of signature.keywords) {
        const keywordLower = keyword.toLowerCase();
        const occurrences = (contentLower.match(new RegExp(keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
        if (occurrences > 0) {
          keywordScore += Math.min(occurrences * 0.1, 0.3);
          foundKeywords.push(keyword);
        }
      }
      
      if (keywordScore > 0) {
        scores[language].score += keywordScore * signature.weight;
        scores[language].keywords = foundKeywords;
        scores[language].methods.push('Keywords');
      }
    }

    // Pattern analysis
    for (const [language, signature] of Object.entries(languageSignatures)) {
      let patternScore = 0;
      
      for (const pattern of signature.patterns) {
        const matches = content.match(pattern);
        if (matches) {
          patternScore += 0.2;
        }
      }
      
      if (patternScore > 0) {
        scores[language].score += patternScore * signature.weight;
        if (!scores[language].methods.includes('Syntax Patterns')) {
          scores[language].methods.push('Syntax Patterns');
        }
      }
    }

    // Find the best match
    let bestLanguage = 'Unknown';
    let bestScore = 0;
    let bestKeywords: string[] = [];
    let bestMethods: string[] = [];

    for (const [language, data] of Object.entries(scores)) {
      if (data.score > bestScore) {
        bestScore = data.score;
        bestLanguage = language;
        bestKeywords = data.keywords;
        bestMethods = data.methods;
      }
    }

    // Normalize confidence score
    const confidence = Math.min(bestScore, 1.0);
    
    return {
      language: confidence > 0.1 ? bestLanguage : 'Unknown',
      confidence: Math.round(confidence * 100) / 100,
      method: bestMethods.join(' + ') || 'Heuristic',
      keywords: bestKeywords.slice(0, 5), // Limit to top 5 keywords
    };
  }

  private getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    return lastDot !== -1 ? filename.substring(lastDot) : '';
  }
}

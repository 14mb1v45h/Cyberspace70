// Client-side language detection utilities for validation and preview
export interface LanguageHint {
  extension: string;
  language: string;
  confidence: number;
}

export const getLanguageHint = (filename: string): LanguageHint | null => {
  const extension = filename.substring(filename.lastIndexOf('.')).toLowerCase();
  
  const extensionMap: Record<string, { language: string; confidence: number }> = {
    '.py': { language: 'Python', confidence: 0.9 },
    '.js': { language: 'JavaScript', confidence: 0.8 },
    '.jsx': { language: 'JavaScript', confidence: 0.85 },
    '.ts': { language: 'TypeScript', confidence: 0.9 },
    '.tsx': { language: 'TypeScript', confidence: 0.9 },
    '.java': { language: 'Java', confidence: 0.9 },
    '.cpp': { language: 'C++', confidence: 0.9 },
    '.cc': { language: 'C++', confidence: 0.85 },
    '.cxx': { language: 'C++', confidence: 0.85 },
    '.c': { language: 'C', confidence: 0.8 },
    '.h': { language: 'C/C++', confidence: 0.7 },
    '.php': { language: 'PHP', confidence: 0.9 },
    '.rb': { language: 'Ruby', confidence: 0.9 },
    '.go': { language: 'Go', confidence: 0.9 },
    '.rs': { language: 'Rust', confidence: 0.9 },
    '.cs': { language: 'C#', confidence: 0.9 },
    '.swift': { language: 'Swift', confidence: 0.9 },
    '.kt': { language: 'Kotlin', confidence: 0.9 },
    '.scala': { language: 'Scala', confidence: 0.9 },
    '.html': { language: 'HTML', confidence: 0.8 },
    '.css': { language: 'CSS', confidence: 0.8 },
    '.json': { language: 'JSON', confidence: 0.9 },
    '.xml': { language: 'XML', confidence: 0.8 },
    '.yaml': { language: 'YAML', confidence: 0.8 },
    '.yml': { language: 'YAML', confidence: 0.8 },
  };

  const match = extensionMap[extension];
  if (match) {
    return {
      extension,
      language: match.language,
      confidence: match.confidence,
    };
  }

  return null;
};

export const isCodeFile = (filename: string): boolean => {
  return getLanguageHint(filename) !== null;
};

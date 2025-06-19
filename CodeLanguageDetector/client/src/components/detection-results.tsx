import { useQuery } from "@tanstack/react-query";
import { FileCode, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { FileWithResults } from "@shared/schema";

export default function DetectionResults() {
  const { data: files = [] } = useQuery<FileWithResults[]>({
    queryKey: ["/api/files"],
  });

  const filesWithResults = files.filter(file => file.results.length > 0);

  if (filesWithResults.length === 0) {
    return (
      <Card className="bg-white shadow-sm border border-slate-200">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <FileCode className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-800 mb-2">No Results Yet</h3>
            <p className="text-slate-500">Upload some code files to see detection results</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      'Python': 'bg-blue-100 text-blue-800',
      'JavaScript': 'bg-yellow-100 text-yellow-800',
      'TypeScript': 'bg-blue-100 text-blue-800',
      'Java': 'bg-orange-100 text-orange-800',
      'C++': 'bg-red-100 text-red-800',
      'C': 'bg-gray-100 text-gray-800',
      'PHP': 'bg-purple-100 text-purple-800',
      'Ruby': 'bg-red-100 text-red-800',
      'Go': 'bg-cyan-100 text-cyan-800',
      'Rust': 'bg-orange-100 text-orange-800',
    };
    return colors[language] || 'bg-gray-100 text-gray-800';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'bg-success';
    if (confidence >= 0.7) return 'bg-warning';
    return 'bg-slate-400';
  };

  const exportResults = () => {
    const data = filesWithResults.map(file => ({
      filename: file.filename,
      fileSize: file.fileSize,
      results: file.results.map(result => ({
        language: result.detectedLanguage,
        confidence: result.confidence,
        method: result.detectionMethod,
        keywords: result.keywords,
      })),
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'detection-results.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="bg-white shadow-sm border border-slate-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-800">Detection Results</h2>
          <Button
            variant="outline"
            onClick={exportResults}
            className="bg-slate-100 text-slate-600 hover:bg-slate-200"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Results
          </Button>
        </div>

        <div className="space-y-6">
          {filesWithResults.map((file) => (
            <div key={file.id} className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <FileCode className="w-5 h-5 text-slate-400" />
                  <div>
                    <h3 className="font-medium text-slate-800">{file.filename}</h3>
                    <p className="text-sm text-slate-500">
                      {file.originalPath || file.filename}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {file.results.map((result) => (
                    <Badge 
                      key={result.id}
                      className={getLanguageColor(result.detectedLanguage)}
                    >
                      {result.detectedLanguage}
                    </Badge>
                  ))}
                </div>
              </div>

              {file.results.map((result) => (
                <div key={result.id} className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">Confidence Score</span>
                      <span className="font-medium text-slate-800">
                        {Math.round(result.confidence * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={result.confidence * 100} 
                      className="w-full h-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                    <div>
                      Detection Method: 
                      <span className="font-medium text-slate-800 ml-1">
                        {result.detectionMethod}
                      </span>
                    </div>
                    <div>
                      File Size: 
                      <span className="font-medium text-slate-800 ml-1">
                        {(file.fileSize / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  </div>

                  {result.keywords && result.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {result.keywords.slice(0, 5).map((keyword, index) => (
                        <Badge 
                          key={index}
                          variant="secondary"
                          className="bg-slate-100 text-slate-600 text-xs"
                        >
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

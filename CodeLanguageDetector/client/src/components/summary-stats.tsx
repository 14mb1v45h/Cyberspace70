import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import type { FileWithResults, ProcessingStatus } from "@shared/schema";

export default function SummaryStats() {
  const { data: files = [] } = useQuery<FileWithResults[]>({
    queryKey: ["/api/files"],
  });

  const { data: status } = useQuery<ProcessingStatus>({
    queryKey: ["/api/stats/processing"],
  });

  const totalFiles = files.length;
  const processedFiles = files.filter(file => file.results.length > 0).length;
  const uniqueLanguages = new Set(
    files.flatMap(file => file.results.map(result => result.detectedLanguage))
  ).size;
  
  const avgConfidence = files.length > 0 
    ? Math.round(
        files
          .flatMap(file => file.results)
          .reduce((sum, result) => sum + result.confidence, 0) / 
        files.flatMap(file => file.results).length * 100
      ) || 0
    : 0;

  return (
    <Card className="bg-white shadow-sm border border-slate-200">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Summary</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Total Files</span>
            <span className="font-semibold text-slate-800">{totalFiles}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Processed</span>
            <span className="font-semibold text-slate-800">{processedFiles}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Languages Found</span>
            <span className="font-semibold text-slate-800">{uniqueLanguages}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Avg. Confidence</span>
            <span className="font-semibold text-slate-800">{avgConfidence}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

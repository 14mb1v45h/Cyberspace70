import { useQuery } from "@tanstack/react-query";
import { CheckCircle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { ProcessingStatus } from "@shared/schema";

export default function ProgressTracker() {
  const { data: status } = useQuery<ProcessingStatus>({
    queryKey: ["/api/stats/processing"],
    refetchInterval: 10000, // Fixed refresh interval
    staleTime: 5000,
  });

  if (!status || status.totalFiles === 0) {
    return null;
  }

  return (
    <Card className="bg-white shadow-sm border border-slate-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Processing Status</h2>
          <span className="text-sm text-slate-500">
            {status.processedFiles} of {status.totalFiles} complete
          </span>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-600">Overall Progress</span>
              <span className="font-medium text-slate-800">{status.progress}%</span>
            </div>
            <Progress value={status.progress} className="w-full h-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-success" />
              <span>Files Processed: {status.processedFiles}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-warning" />
              <span>Remaining: {status.totalFiles - status.processedFiles}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

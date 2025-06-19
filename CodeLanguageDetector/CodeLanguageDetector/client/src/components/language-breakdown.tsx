import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import type { LanguageStats } from "@shared/schema";

export default function LanguageBreakdown() {
  const { data: languageStats = [] } = useQuery<LanguageStats[]>({
    queryKey: ["/api/stats/languages"],
  });

  if (languageStats.length === 0) {
    return (
      <Card className="bg-white shadow-sm border border-slate-200">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Language Breakdown</h2>
          <div className="text-center py-4">
            <p className="text-slate-500 text-sm">No languages detected yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-sm border border-slate-200">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Language Breakdown</h2>
        <div className="space-y-3">
          {languageStats.map((lang) => (
            <div key={lang.language} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: lang.color }}
                />
                <span className="text-sm font-medium text-slate-700">
                  {lang.language}
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-slate-800">
                  {lang.count}
                </span>
                <span className="text-xs text-slate-500 ml-1">
                  ({lang.percentage}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

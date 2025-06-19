import { useState } from "react";
import { Code, Settings, HelpCircle } from "lucide-react";
import FileUpload from "@/components/file-upload";
import ProgressTracker from "@/components/progress-tracker";
import DetectionResults from "@/components/detection-results";
import SummaryStats from "@/components/summary-stats";
import LanguageBreakdown from "@/components/language-breakdown";
import DetectionSettings from "@/components/detection-settings";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadComplete = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-primary text-white p-2 rounded-lg">
                <Code className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">CodeDetect</h1>
                <p className="text-sm text-slate-500">Programming Language Detection</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-slate-600 hover:text-slate-800 p-2">
                <HelpCircle className="w-5 h-5" />
              </button>
              <button className="text-slate-600 hover:text-slate-800 p-2">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Upload and Results */}
          <div className="lg:col-span-2 space-y-6">
            <FileUpload onUploadComplete={handleUploadComplete} />
            <ProgressTracker key={`progress-${refreshKey}`} />
            <DetectionResults key={`results-${refreshKey}`} />
          </div>

          {/* Right Column - Stats and Settings */}
          <div className="space-y-6">
            <SummaryStats key={`stats-${refreshKey}`} />
            <LanguageBreakdown key={`breakdown-${refreshKey}`} />
            <DetectionSettings />
            
            {/* Help & Support */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Help & Support</h2>
              <div className="space-y-3 text-sm">
                <a href="#" className="flex items-center space-x-2 text-slate-600 hover:text-primary">
                  <HelpCircle className="w-4 h-4" />
                  <span>How it works</span>
                </a>
                <a href="#" className="flex items-center space-x-2 text-slate-600 hover:text-primary">
                  <Code className="w-4 h-4" />
                  <span>Supported formats</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { DetectionSettings } from "@shared/schema";

export default function DetectionSettings() {
  const { toast } = useToast();
  
  const { data: settings } = useQuery<DetectionSettings>({
    queryKey: ["/api/settings"],
  });

  const updateMutation = useMutation({
    mutationFn: async (newSettings: Partial<DetectionSettings>) => {
      const response = await apiRequest('PATCH', '/api/settings', newSettings);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Detection settings have been saved",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  const handleSettingChange = (key: keyof DetectionSettings, value: any) => {
    updateMutation.mutate({ [key]: value });
  };

  if (!settings) {
    return (
      <Card className="bg-white shadow-sm border border-slate-200">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Detection Settings</h2>
          <div className="text-center py-4">
            <p className="text-slate-500 text-sm">Loading settings...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-sm border border-slate-200">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Detection Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="extension-detection" className="text-sm font-medium text-slate-700">
              Enable file extension detection
            </Label>
            <Switch
              id="extension-detection"
              checked={settings.enableExtensionDetection || false}
              onCheckedChange={(checked) => 
                handleSettingChange('enableExtensionDetection', checked)
              }
              disabled={updateMutation.isPending}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="syntax-analysis" className="text-sm font-medium text-slate-700">
              Deep syntax analysis
            </Label>
            <Switch
              id="syntax-analysis"
              checked={settings.enableSyntaxAnalysis || false}
              onCheckedChange={(checked) => 
                handleSettingChange('enableSyntaxAnalysis', checked)
              }
              disabled={updateMutation.isPending}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="confidence-threshold" className="text-sm font-medium text-slate-700">
              Confidence threshold
            </Label>
            <Select
              value={((settings.confidenceThreshold || 0.7) * 100).toString()}
              onValueChange={(value) => 
                handleSettingChange('confidenceThreshold', parseInt(value) / 100)
              }
              disabled={updateMutation.isPending}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="50">50%</SelectItem>
                <SelectItem value="60">60%</SelectItem>
                <SelectItem value="70">70%</SelectItem>
                <SelectItem value="80">80%</SelectItem>
                <SelectItem value="90">90%</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="max-file-size" className="text-sm font-medium text-slate-700">
              Max file size (MB)
            </Label>
            <Input
              id="max-file-size"
              type="number"
              min="1"
              max="100"
              value={Math.round((settings.maxFileSize || 10485760) / (1024 * 1024))}
              onChange={(e) => 
                handleSettingChange('maxFileSize', parseInt(e.target.value) * 1024 * 1024)
              }
              disabled={updateMutation.isPending}
              className="w-16 text-sm"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CloudUpload, FileCode, Archive, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { UploadedFile } from "@shared/schema";

interface FileUploadProps {
  onUploadComplete?: () => void;
}

export default function FileUpload({ onUploadComplete }: FileUploadProps) {
  const { toast } = useToast();
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);

  const { data: files = [] } = useQuery<UploadedFile[]>({
    queryKey: ["/api/files"],
  });

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await apiRequest('POST', '/api/upload', formData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Files uploaded and processed successfully",
      });
      setUploadingFiles([]);
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      onUploadComplete?.();
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload files",
        variant: "destructive",
      });
      setUploadingFiles([]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (fileId: number) => {
      await apiRequest('DELETE', `/api/files/${fileId}`);
    },
    onSuccess: () => {
      toast({
        title: "File Deleted",
        description: "File and its results have been removed",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      onUploadComplete?.();
    },
    onError: (error) => {
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete file",
        variant: "destructive",
      });
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => {
      const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      const supportedExtensions = [
        '.py', '.js', '.jsx', '.ts', '.tsx', '.java', '.cpp', '.c', '.h',
        '.php', '.rb', '.go', '.rs', '.zip', '.html', '.css', '.json'
      ];
      return supportedExtensions.includes(extension);
    });

    if (validFiles.length !== acceptedFiles.length) {
      toast({
        title: "Unsupported Files",
        description: "Some files were skipped. Only code files and zip archives are supported.",
        variant: "destructive",
      });
    }

    if (validFiles.length > 0) {
      setUploadingFiles(validFiles);
      uploadMutation.mutate(validFiles);
    }
  }, [uploadMutation, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.py', '.js', '.jsx', '.ts', '.tsx', '.java', '.cpp', '.c', '.h', '.php', '.rb', '.go', '.rs', '.html', '.css'],
      'application/zip': ['.zip'],
      'application/json': ['.json'],
      'text/javascript': ['.js', '.jsx'],
      'text/typescript': ['.ts', '.tsx'],
      'text/x-python': ['.py'],
      'text/x-java-source': ['.java'],
      'text/x-c': ['.c', '.h'],
      'text/x-c++src': ['.cpp'],
    },
    multiple: true,
    noClick: false,
    noKeyboard: false,
  });

  const getFileIcon = (filename: string) => {
    const extension = filename.substring(filename.lastIndexOf('.')).toLowerCase();
    if (extension === '.zip') {
      return <Archive className="w-4 h-4" />;
    }
    return <FileCode className="w-4 h-4" />;
  };

  const getFileStatus = (file: UploadedFile) => {
    if (uploadMutation.isPending) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Processing</Badge>;
    }
    return <Badge variant="secondary" className="bg-green-100 text-green-800">Complete</Badge>;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <Card className="bg-white shadow-sm border border-slate-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Upload Files</h2>
          <span className="text-sm text-slate-500">Supports: .py, .js, .java, .cpp, .zip</span>
        </div>

        {/* Drag & Drop Area */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragActive 
              ? 'border-primary bg-blue-50' 
              : 'border-slate-300 hover:border-primary hover:bg-slate-50'
          }`}
        >
          <input {...getInputProps()} />
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
              <CloudUpload className="w-8 h-8 text-slate-400" />
            </div>
            <div>
              <p className="text-lg font-medium text-slate-700">
                {isDragActive ? "Drop files here" : "Drop your files here"}
              </p>
              <p className="text-sm text-slate-500">or click to browse</p>
            </div>
            <Button 
              type="button"
              className="bg-primary text-white hover:bg-blue-700"
              disabled={uploadMutation.isPending}
            >
              {uploadMutation.isPending ? "Processing..." : "Choose Files"}
            </Button>
          </div>
        </div>

        {/* File List */}
        {(files.length > 0 || uploadingFiles.length > 0) && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-slate-700 mb-3">
              Files ({files.length + uploadingFiles.length})
            </h3>
            <div className="space-y-2">
              {/* Show currently uploading files */}
              {uploadingFiles.map((file, index) => (
                <div key={`uploading-${index}`} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(file.name)}
                    <div>
                      <p className="text-sm font-medium text-slate-700">{file.name}</p>
                      <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      {uploadMutation.isPending ? "Processing" : "Queued"}
                    </Badge>
                  </div>
                </div>
              ))}

              {/* Show uploaded files */}
              {files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(file.filename)}
                    <div>
                      <p className="text-sm font-medium text-slate-700">{file.filename}</p>
                      <p className="text-xs text-slate-500">{formatFileSize(file.fileSize)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getFileStatus(file)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(file.id)}
                      disabled={deleteMutation.isPending}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import { useState, useRef } from "react";
import { Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface UploadBoxProps {
  onUploadComplete: () => void;
}

interface FileProgress {
  filename: string;
  status: "pending" | "processing" | "success" | "error" | "duplicate";
  message: string;
}

export default function UploadBox({ onUploadComplete }: UploadBoxProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fileProgress, setFileProgress] = useState<FileProgress[]>([]);
  const [uploadStatus, setUploadStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(
      (file) => file.type === "application/pdf"
    );

    if (files.length > 0) {
      handleUpload(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleUpload(Array.from(files));
    }
  };

  const handleUpload = async (files: File[]) => {
    setIsUploading(true);
    setUploadStatus({ type: null, message: "" });

    // Initialize progress tracking for all files
    const initialProgress: FileProgress[] = files.map(file => ({
      filename: file.name,
      status: "pending" as const,
      message: "Queued...",
    }));
    setFileProgress(initialProgress);

    // Validate files before upload
    const invalidFiles = files.filter(file => {
      const isValidType = file.type === "application/pdf";
      const isValidSize = file.size > 0 && file.size < 50 * 1024 * 1024; // 50MB limit
      return !isValidType || !isValidSize;
    });

    if (invalidFiles.length > 0) {
      setUploadStatus({
        type: "error",
        message: `${invalidFiles.length} file(s) invalid. Please upload PDFs under 50MB.`,
      });
      setIsUploading(false);
      setFileProgress([]);
      return;
    }

    try {
      // Process files one by one for real-time progress
      const results = {
        extracted: 0,
        duplicates: 0,
        failed: 0,
        loads: [] as any[],
        errors: [] as any[],
        duplicateDetails: [] as any[],
      };

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Update this file to processing
        setFileProgress(prev => prev.map((fp, idx) => 
          idx === i ? { ...fp, status: "processing" as const, message: "Extracting and analyzing..." } : fp
        ));

        try {
          const formData = new FormData();
          formData.append("files", file);

          const response = await fetch("/api/extract", {
            method: "POST",
            body: formData,
          });

          const data = await response.json();

          if (response.ok) {
            // Update results
            results.extracted += data.extracted;
            results.duplicates += data.duplicates;
            results.failed += data.failed;
            if (data.loads) results.loads.push(...data.loads);
            if (data.errors) results.errors.push(...data.errors);
            if (data.duplicateDetails) results.duplicateDetails.push(...data.duplicateDetails);

            // Check status of this specific file
            const successLoad = data.loads?.find((l: any) => l.source_file === file.name);
            const isDuplicate = data.duplicateDetails?.find((d: any) => d.filename === file.name);
            const hasError = data.errors?.find((e: any) => e.filename === file.name);

            // Update this file's status in real-time
            if (hasError) {
              setFileProgress(prev => prev.map((fp, idx) =>
                idx === i ? {
                  ...fp,
                  status: "error" as const,
                  message: hasError.error,
                } : fp
              ));
            } else if (isDuplicate) {
              setFileProgress(prev => prev.map((fp, idx) =>
                idx === i ? {
                  ...fp,
                  status: "duplicate" as const,
                  message: `Duplicate (Load ID: ${isDuplicate.load_id})`,
                } : fp
              ));
            } else if (successLoad) {
              setFileProgress(prev => prev.map((fp, idx) =>
                idx === i ? {
                  ...fp,
                  status: "success" as const,
                  message: "✓ Extracted successfully",
                } : fp
              ));
            }
          } else {
            throw new Error(data.error || "Upload failed");
          }
        } catch (fileError: any) {
          results.failed++;
          results.errors.push({
            filename: file.name,
            error: fileError.message || "Failed to process",
          });

          // Mark this file as error
          setFileProgress(prev => prev.map((fp, idx) =>
            idx === i ? {
              ...fp,
              status: "error" as const,
              message: fileError.message || "Failed to process",
            } : fp
          ));
        }
      }

      // All files processed - show final summary
      let message = `Successfully added ${results.extracted} new load(s)`;
      if (results.duplicates > 0) message += `, ${results.duplicates} duplicate(s) skipped`;
      if (results.failed > 0) message += `, ${results.failed} failed`;

      setUploadStatus({
        type: results.extracted > 0 ? "success" : "error",
        message: message,
      });

      if (results.extracted > 0) {
        onUploadComplete();
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      // Global error - mark all remaining files as error
      setFileProgress(prev => prev.map(fp =>
        fp.status === "pending" || fp.status === "processing" ? {
          ...fp,
          status: "error" as const,
          message: "Upload failed",
        } : fp
      ));

      setUploadStatus({
        type: "error",
        message: `Upload failed: ${error.message || "Unknown error"}. Please check your internet connection and try again.`,
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div
        className={`
          relative border-2 border-dashed rounded-2xl p-16 text-center
          transition-all duration-300 cursor-pointer group
          ${
            isDragging
              ? "border-blue-500 bg-blue-500/10 scale-[1.02]"
              : "border-white/20 glass-effect hover:border-blue-500/50"
          }
          ${isUploading ? "opacity-50 cursor-not-allowed" : ""}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="application/pdf"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />

        <div className="flex flex-col items-center justify-center space-y-6">
          {isUploading ? (
            <>
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center animate-pulse">
                  <Loader2 className="w-10 h-10 text-white animate-spin" />
                </div>
              </div>
              <div>
                <p className="text-xl font-semibold text-white mb-2">
                  Processing PDFs...
                </p>
                <p className="text-sm text-gray-400">
                  AI is extracting data from your files
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full opacity-20 blur-xl group-hover:opacity-40 transition-opacity"></div>
              </div>
              <div>
                <p className="text-xl font-semibold text-white mb-2">
                  Drop PDF files here or click to browse
                </p>
                <p className="text-sm text-gray-400 mb-1">
                  Upload one or more rate confirmation PDFs
                </p>
                <p className="text-xs text-gray-500">
                  Max 50MB per file • Only PDF format supported
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Live File Progress */}
      {fileProgress.length > 0 && (
        <div className="mt-4 space-y-2">
          {fileProgress.map((file, index) => (
            <div
              key={index}
              className="p-3 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm flex items-center justify-between"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                {file.status === "pending" && (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-400 border-t-transparent animate-spin flex-shrink-0" />
                )}
                {file.status === "processing" && (
                  <Loader2 className="w-5 h-5 text-blue-400 animate-spin flex-shrink-0" />
                )}
                {file.status === "success" && (
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                )}
                {file.status === "duplicate" && (
                  <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                )}
                {file.status === "error" && (
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {file.filename}
                  </p>
                  <p className={`text-xs ${
                    file.status === "success" ? "text-green-400" :
                    file.status === "duplicate" ? "text-yellow-400" :
                    file.status === "error" ? "text-red-400" :
                    "text-gray-400"
                  }`}>
                    {file.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Status Messages */}
      {uploadStatus.type && (
        <div
          className={`
            mt-4 p-5 rounded-xl flex items-start space-x-4 backdrop-blur-xl
            ${
              uploadStatus.type === "success"
                ? "bg-green-500/10 border border-green-500/30"
                : "bg-red-500/10 border border-red-500/30"
            }
          `}
        >
          {uploadStatus.type === "success" ? (
            <CheckCircle className="w-6 h-6 text-green-400 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-6 h-6 text-red-400 mt-0.5 flex-shrink-0" />
          )}
          <div className="flex-1">
            <p
              className={`text-sm font-medium whitespace-pre-wrap ${
                uploadStatus.type === "success"
                  ? "text-green-300"
                  : "text-red-300"
              }`}
            >
              {uploadStatus.message}
            </p>
           
            {uploadStatus.type === "error" && (
              <div className="mt-3 text-xs text-gray-400 space-y-1">
                <p className="font-semibold text-gray-300">Common issues:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>PDF is password-protected or encrypted</li>
                  <li>PDF is a scanned image (needs OCR)</li>
                  <li>File is corrupted or incomplete</li>
                  <li>Network timeout (try uploading one file at a time)</li>
                  <li>No OpenAI API credits remaining</li>
                </ul>
               
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

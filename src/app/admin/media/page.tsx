"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Trash2, Copy, Check, Image, FileText, File } from "lucide-react";
import GlassPanel from "@/components/ui/GlassPanel";

interface UploadedFile {
  url: string;
  filename: string;
  originalName: string;
  size: number;
  type: string;
}

export default function MediaPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true);

    for (const file of acceptedFiles) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          setFiles((prev) => [data, ...prev]);
        }
      } catch (error) {
        console.error("Upload failed:", error);
      }
    }

    setIsUploading(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
      "application/pdf": [".pdf"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <Image size={24} className="text-primary" />;
    if (type === "application/pdf") return <FileText size={24} className="text-red-400" />;
    return <File size={24} className="text-foreground/60" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Media</h1>
        <p className="text-foreground/60 mt-1">Upload and manage your files</p>
      </div>

      <GlassPanel>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
            isDragActive
              ? "border-primary bg-primary/10"
              : "border-glass-border hover:border-primary/50"
          }`}
        >
          <input {...getInputProps()} />
          <Upload
            size={48}
            className={`mx-auto mb-4 ${isDragActive ? "text-primary" : "text-foreground/40"}`}
          />
          {isDragActive ? (
            <p className="text-primary">Drop the files here...</p>
          ) : (
            <div>
              <p className="text-foreground/80 mb-2">
                Drag & drop files here, or click to select
              </p>
              <p className="text-sm text-foreground/50">
                Images (JPEG, PNG, GIF, WebP) and PDFs up to 10MB
              </p>
            </div>
          )}
          {isUploading && (
            <div className="mt-4">
              <div className="w-48 h-2 bg-glass-bg rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-primary rounded-full animate-pulse" />
              </div>
              <p className="text-sm text-foreground/60 mt-2">Uploading...</p>
            </div>
          )}
        </div>
      </GlassPanel>

      {files.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Uploaded Files</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {files.map((file) => (
                <motion.div
                  key={file.filename}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <GlassPanel hover className="relative group">
                    {file.type.startsWith("image/") && (
                      <div className="aspect-video rounded-lg overflow-hidden mb-3 bg-glass-bg">
                        <img
                          src={file.url}
                          alt={file.originalName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      {getFileIcon(file.type)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-sm">
                          {file.originalName}
                        </p>
                        <p className="text-xs text-foreground/50">
                          {formatSize(file.size)}
                        </p>
                      </div>
                    </div>

                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => copyToClipboard(file.url)}
                        className="p-2 rounded-lg bg-glass-bg hover:bg-primary/20 text-foreground/60 hover:text-primary"
                      >
                        {copiedUrl === file.url ? (
                          <Check size={16} className="text-green-400" />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                    </div>

                    <div className="mt-3 pt-3 border-t border-glass-border">
                      <p className="text-xs text-foreground/40 truncate">{file.url}</p>
                    </div>
                  </GlassPanel>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}

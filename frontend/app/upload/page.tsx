"use client";

import { useState, useCallback } from "react";
import { useLanguage } from "@/components/language-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { FileUp, X, Check, File, HardDrive, Wifi } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LabSidebar } from "@/components/lab-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardLayout } from "@/components/dashboard-layout";

interface FileWithStatus {
  file: File;
  id: string;
  progress: number;
  status: "idle" | "uploading" | "complete";
}

interface DropzoneProps {
  onDrop: (files: File[]) => void;
}

// Mock implementation of useDropzone since we don't have the actual package
function useDropzone({ onDrop }: DropzoneProps) {
  const getRootProps = () => ({
    onClick: () => {
      // This would normally trigger the file dialog
      const input = document.createElement("input");
      input.type = "file";
      input.multiple = true;
      input.onchange = (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (target.files) {
          onDrop(Array.from(target.files));
        }
      };
      input.click();
    },
  });

  const getInputProps = () => ({});

  const isDragActive = false;

  return { getRootProps, getInputProps, isDragActive };
}

export default function UploadPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [files, setFiles] = useState<FileWithStatus[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [
      ...prev,
      ...acceptedFiles.map((file) => ({
        file,
        id: Math.random().toString(36).substring(2),
        progress: 0,
        status: "idle" as const,
      })),
    ]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const removeFile = (id: string) => {
    setFiles(files.filter((file) => file.id !== id));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);

    // Simulate upload progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);

          // Update file statuses
          setFiles(
            files.map((file) => ({
              ...file,
              progress: 100,
              status: "complete" as const,
            }))
          );

          toast({
            title: "Upload complete",
            description: `Successfully uploaded ${files.length} files`,
          });

          return 0;
        }
        return prev + 5;
      });

      // Update individual file progress
      setFiles((prev) =>
        prev.map((file) => ({
          ...file,
          progress: Math.min(file.progress + Math.random() * 10, 100),
          status: file.progress >= 100 ? "complete" : "uploading",
        }))
      );
    }, 300);

    return () => clearInterval(interval);
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith(".pcap") || fileName.endsWith(".pcapng"))
      return <Wifi className="h-6 w-6 text-primary" />;
    if (
      fileName.endsWith(".img") ||
      fileName.endsWith(".dd") ||
      fileName.endsWith(".raw")
    )
      return <HardDrive className="h-6 w-6 text-secondary" />;
    return <File className="h-6 w-6 text-accent" />;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {t("uploadFiles")}
        </h1>

        <Card>
          <CardHeader>
            <CardTitle>{t("uploadFiles")}</CardTitle>
            <CardDescription>
              Upload disk images, memory dumps, network captures, or log files
              for analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
                isDragActive ? "border-primary bg-primary/10" : "border-muted"
              }`}
            >
              <input {...getInputProps()} />
              <FileUp className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">{t("dragAndDrop")}</p>
            </div>

            <AnimatePresence>
              {files.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  {files.map((file) => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center p-2 border rounded-md"
                    >
                      {getFileIcon(file.file.name)}
                      <div className="ml-2 flex-1">
                        <div className="flex justify-between">
                          <p className="text-sm font-medium">
                            {file.file.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(file.file.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                        <Progress value={file.progress} className="h-1 mt-1" />
                      </div>
                      {file.status === "complete" ? (
                        <Check className="h-5 w-5 ml-2 text-accent" />
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(file.id)}
                          disabled={uploading}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {files.length > 0 && (
              <Button
                onClick={uploadFiles}
                disabled={uploading}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <span className="mr-2">Uploading...</span>
                    <span>{progress}%</span>
                  </>
                ) : (
                  <>
                    <FileUp className="mr-2 h-4 w-4" />
                    Upload {files.length}{" "}
                    {files.length === 1 ? "file" : "files"}
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

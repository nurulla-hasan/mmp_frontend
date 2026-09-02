"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { UploadCloud, FileText, ImageIcon, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorToast } from "@/lib/utils";

interface CertificateUploadProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  disabled?: boolean;
}

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export function CertificateUpload({
  file,
  onFileChange,
  disabled = false,
}: CertificateUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const previewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);


  const validateAndSetFile = (selectedFile: File) => {
    if (!ALLOWED_MIME_TYPES.includes(selectedFile.type)) {
      ErrorToast("শুধুমাত্র PDF অথবা ছবি (JPG, PNG, WebP) ফাইল গ্রহণযোগ্য।");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      ErrorToast("ফাইলের আকার সর্বোচ্চ ১০ মেগাবাইট (10MB) হতে পারবে।");
      return;
    }

    onFileChange(selectedFile);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      validateAndSetFile(selected);
    }
    // reset input so same file can be re-selected if removed
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const handleRemove = () => {
    onFileChange(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const isPdf = file?.type === "application/pdf";
  const formattedSize = file
    ? file.size >= 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      : `${Math.round(file.size / 1024)} KB`
    : "";

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled}
      />

      {!file ? (
        /* Empty Upload Zone */
        <div
          onClick={() => !disabled && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`group flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
            isDragOver
              ? "border-primary bg-primary/10"
              : "border-border/80 bg-muted/20 hover:border-primary/50 hover:bg-muted/40"
          } ${disabled ? "opacity-60 pointer-events-none" : ""}`}
        >
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition-transform">
            <UploadCloud className="size-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              সার্টিফিকেট বা সনদপত্র ফাইল আপলোড করুন
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              ক্লিক করে ফাইল বাছুন অথবা এখানে ড্র্যাগ করে এনে ছাড়ুন
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/80 font-mono">
            <span>PDF, JPG, PNG বা WebP</span>
            <span>•</span>
            <span>সর্বোচ্চ ১০MB</span>
          </div>
        </div>
      ) : (
        /* Selected File Card Preview */
        <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 p-3.5 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            {isPdf ? (
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-500 ring-1 ring-red-500/20">
                <FileText className="size-5" />
              </div>
            ) : previewUrl ? (
              <div className="relative size-10 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt={file.name}
                  className="size-full object-cover"
                />
              </div>
            ) : (
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                <ImageIcon className="size-5" />
              </div>
            )}

            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-foreground truncate max-w-50 sm:max-w-xs md:max-w-md">
                {file.name}
              </p>
              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground font-mono">
                <span>{isPdf ? "PDF Document" : "Image File"}</span>
                <span>•</span>
                <span>{formattedSize}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {previewUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 text-xs px-2 text-muted-foreground hover:text-foreground"
                onClick={() => window.open(previewUrl, "_blank", "noopener,noreferrer")}
                title="প্রিভিউ দেখুন"
              >
                <ExternalLink className="size-3.5 mr-1" />
                <span className="hidden sm:inline">দেখুন</span>
              </Button>
            )}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-xs px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleRemove}
              disabled={disabled}
              title="মুছে ফেলুন"
            >
              <Trash2 className="size-3.5 mr-1" />
              <span className="hidden sm:inline">মুছুন</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}


"use client";

import { useState, useRef, useTransition } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { uploadProfileImageAction } from "@/app/(private)/(shell)/dashboard/profile/_actions/profile.action";
import { getInitials, ErrorToast } from "@/lib/utils";
import { ImageCropDialog } from "./image-crop-dialog";

interface ProfileAvatarUploadProps {
  src?: string | null;
  name?: string;
  isPro?: boolean;
  className?: string;
  size?: "default" | "sm" | "lg" | "xl";
  editable?: boolean;
}

export function ProfileAvatarUpload({
  src,
  name = "User",
  isPro = false,
  className = "",
  size = "xl",
  editable = true,
}: ProfileAvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith("image/")) {
      ErrorToast("Only image files (JPG, PNG, WebP) are allowed.");
      return;
    }

    // Validate size (max 10MB for raw upload before crop)
    if (file.size > 10 * 1024 * 1024) {
      ErrorToast("Maximum image size is 10MB.");
      return;
    }

    // Open Crop Dialog with raw selected image
    const rawUrl = URL.createObjectURL(file);
    setCropImageSrc(rawUrl);
    setIsCropOpen(true);
  };

  const handleCropComplete = (croppedFile: File) => {
    // Clean up raw crop URL
    if (cropImageSrc) {
      URL.revokeObjectURL(cropImageSrc);
      setCropImageSrc(null);
    }

    // Show optimistic preview of cropped image
    const croppedUrl = URL.createObjectURL(croppedFile);
    setPreview(croppedUrl);

    // Prepare FormData and trigger Server Action
    const formData = new FormData();
    formData.append("image", croppedFile);

    startTransition(async () => {
      try {
        const res = await uploadProfileImageAction(formData);
        if (res.success) {
          // SuccessToast("Profile picture updated successfully!");
        } else {
          setPreview(null);
          ErrorToast(res.message || "Failed to upload image. Please try again.");
        }
      } catch {
        setPreview(null);
        ErrorToast("An unexpected error occurred. Please try again.");
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    });
  };

  const handleCropClose = () => {
    if (cropImageSrc) {
      URL.revokeObjectURL(cropImageSrc);
      setCropImageSrc(null);
    }
    setIsCropOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const currentImage = preview || src || "";

  return (
    <div className="relative inline-block group">
      {/* Hidden File Input */}
      {editable && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/jpg, image/webp"
          className="hidden"
          onChange={handleFileChange}
          disabled={isPending}
          aria-label="Upload profile picture"
        />
      )}

      {/* Main Avatar */}
      <div className="relative rounded-full">
        <Avatar
          size={size}
          isPro={isPro}
          className={`${className} transition-opacity duration-200 ${
            isPending ? "opacity-60" : ""
          }`}
        >
          <AvatarImage src={currentImage} alt={name} />
          <AvatarFallback className="text-xl font-bold">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>

        {/* Loading Spinner Overlay */}
        {isPending && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-full bg-background/70 backdrop-blur-xs">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        )}
      </div>

      {/* Camera Badge / Button Trigger */}
      {editable && !isPending && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Change profile photo"
          title="Change Profile Picture"
          className="absolute -bottom-1 -right-1 z-10 flex size-8 cursor-pointer items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground shadow-md transition-all duration-150 hover:scale-110 hover:bg-primary/90 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Camera className="size-4" />
        </button>
      )}

      {/* Image Crop Dialog */}
      <ImageCropDialog
        open={isCropOpen}
        imageSrc={cropImageSrc}
        onClose={handleCropClose}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}

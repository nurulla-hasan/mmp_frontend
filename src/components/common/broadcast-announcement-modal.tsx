"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Info,
  Sparkles,
  Wrench,
  X,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TBroadcast, TBroadcastType } from "@/interface/broadcast";

function renderModalTypeBadge(type: TBroadcastType) {
  switch (type) {
    case "PROMO":
      return (
        <Badge variant="progress">
          <Sparkles />
          Special Announcement
        </Badge>
      );
    case "WARNING":
      return (
        <Badge variant="pending">
          <AlertTriangle />
          Important Notice
        </Badge>
      );
    case "MAINTENANCE":
      return (
        <Badge variant="admin">
          <Wrench />
          Maintenance Update
        </Badge>
      );
    case "INFO":
    default:
      return (
        <Badge variant="info">
          <Info />
          Announcement
        </Badge>
      );
  }
}

export function BroadcastAnnouncementModal() {
  const [open, setOpen] = useState(false);
  const [broadcast, setBroadcast] = useState<TBroadcast | null>(null);

  useEffect(() => {
    // Only run in browser
    if (typeof window === "undefined") return;

    const fetchActiveBroadcast = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
        const res = await fetch(`${apiUrl}/broadcasts/active`, {
          cache: "no-store",
        });
        const json = await res.json();

        if (json?.success && Array.isArray(json?.data) && json.data.length > 0) {
          // Find the first pinned broadcast, or fallback to the latest active broadcast
          const pinned =
            json.data.find((b: TBroadcast) => b.isPinned && b.isActive) ||
            json.data[0];

          if (pinned) {
            const storageKey = `mmp_broadcast_closed_${pinned.id}`;
            const isAlreadyClosed = localStorage.getItem(storageKey);

            if (!isAlreadyClosed) {
              setBroadcast(pinned);
              // Slight delay so page loads smoothly before showing modal
              const timer = setTimeout(() => {
                setOpen(true);
              }, 700);
              return () => clearTimeout(timer);
            }
          }
        }
      } catch {
        // Silently fail if network unavailable
      }
    };

    fetchActiveBroadcast();
  }, []);

  const handleClose = () => {
    if (broadcast) {
      try {
        localStorage.setItem(`mmp_broadcast_closed_${broadcast.id}`, "true");
      } catch {
        // Ignore localStorage error
      }
    }
    setOpen(false);
  };

  if (!broadcast) return null;

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent className="max-w-md p-6" showCloseButton={false}>
        <div className="flex flex-col gap-4">
          {/* Header row: Badge + Close (X) button */}
          <div className="flex items-center justify-between">
            {renderModalTypeBadge(broadcast.type)}
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={handleClose}
              aria-label="Close announcement"
            >
              <X />
            </Button>
          </div>

          {/* Title & Description */}
          <DialogHeader className="p-0 text-left">
            <DialogTitle className="text-base sm:text-lg font-bold leading-snug">
              {broadcast.title}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground whitespace-pre-line leading-relaxed pt-1.5">
              {broadcast.message}
            </DialogDescription>
          </DialogHeader>

          {/* Footer Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 pt-2 border-t border-border">
            <Button
              variant="outline"
             
              onClick={handleClose}
              className="w-full sm:w-auto"
            >
              বন্ধ করুন
            </Button>

            {broadcast.linkUrl && (
              <Button
                render={
                  <Link
                    href={broadcast.linkUrl}
                    onClick={handleClose}
                    className="w-full sm:w-auto"
                  />
                }
               
              >
                {broadcast.linkText || "বিস্তারিত দেখুন"}
                <ArrowRight />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

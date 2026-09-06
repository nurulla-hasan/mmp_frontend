"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Info,
  Sparkles,
  Wrench,
} from "lucide-react";

import { ModalWrapper } from "@/components/common/modal-wrapper";
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
        <Badge variant="destructive">
          <Wrench />
          Maintenance Notice
        </Badge>
      );
    case "INFO":
    default:
      return (
        <Badge variant="secondary">
          <Info />
          Announcement
        </Badge>
      );
  }
}

export function BroadcastAnnouncementModal() {
  const [broadcast, setBroadcast] = useState<TBroadcast | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function fetchActiveBroadcast() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://apis.mouzamappro.com/api/v1";
        const res = await fetch(`${apiUrl.replace(/\/$/, "")}/broadcasts/active`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data?.success && data?.data) {
          const list: TBroadcast[] = Array.isArray(data.data) ? data.data : [data.data];
          const item = list[0];
          if (!item) return;
          // Check if user already dismissed this announcement in this session/browser
          const closedId = localStorage.getItem(`mmp_broadcast_closed_${item.id}`);
          if (!closedId) {
            setBroadcast(item);
            setOpen(true);
          }
        }
      } catch {
        // Silently fail, announcements are non-critical
      }
    }

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
    <ModalWrapper
      open={open}
      onOpenChange={(val) => !val && handleClose()}
      title={broadcast.title}
      description=""
    >
      <div className="flex flex-col gap-4">
        {/* Type Badge */}
        <div>{renderModalTypeBadge(broadcast.type)}</div>

        {/* Description Body */}
        <p className="text-xs sm:text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
          {broadcast.message}
        </p>

        {/* Footer Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 pt-3 border-t border-border">
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
    </ModalWrapper>
  );
}

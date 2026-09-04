"use client";

import * as React from "react";
import Image from "next/image";
import { Download, X } from "lucide-react";

import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const DISMISS_KEY = "mmp_pwa_dismissed_time";
const DISMISS_DURATION_DAYS = 7;

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    React.useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    // Check if already installed as standalone
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone ===
        true;

    if (isStandalone) {
      return;
    }

    // Check if user recently dismissed
    const dismissedTime = localStorage.getItem(DISMISS_KEY);
    if (dismissedTime) {
      const diffMs = Date.now() - parseInt(dismissedTime, 10);
      const daysPassed = diffMs / (1000 * 60 * 60 * 24);
      if (daysPassed < DISMISS_DURATION_DAYS) {
        return;
      }
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setIsVisible(false);
      }
    } catch {
      // Ignored
    } finally {
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  };

  if (!isVisible || !deferredPrompt) {
    return null;
  }

  return (
    <aside
      aria-label="অ্যাপ ইনস্টলেশন"
      className="fixed bottom-4 right-4 z-50 flex max-w-sm items-center gap-3.5 rounded-2xl border border-primary/20 bg-background/95 p-3.5 shadow-xl shadow-primary/10 backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
    >
      <div className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-primary/20 bg-muted">
        <Image
          src="/icons/icon-192x192.png"
          alt="Mouza Map Pro"
          width={40}
          height={40}
          className="size-9 object-contain"
        />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-semibold text-foreground font-heading truncate">
          Mouza Map Pro অ্যাপ
        </h4>
        <p className="text-[11px] text-muted-foreground leading-tight line-clamp-1">
          অফলাইনে দ্রুত ব্যবহারের জন্য ইনস্টল করুন
        </p>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          size="sm"
          onClick={handleInstall}
          className="h-7 px-2.5 text-xs font-medium gap-1"
        >
          <Download className="size-3" />
          ইনস্টল
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={handleDismiss}
          className="size-7 text-muted-foreground hover:text-foreground"
          aria-label="বন্ধ করুন"
        >
          <X className="size-3.5" />
        </Button>
      </div>
    </aside>
  );
}


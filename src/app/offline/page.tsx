import type { Metadata } from "next";
import Link from "next/link";
import { Home, WifiOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { OfflineReloadButton } from "@/components/pwa/offline-reload-button";
import { Logo } from "@/components/common/logo";

export const metadata: Metadata = {
  title: "অফলাইন মোড — Mouza Map Pro",
  description: "আপনার ডিভাইসে ইন্টারনেট সংযোগ নেই।",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 text-center">
      <div className="mx-auto flex max-w-md flex-col items-center">
        <div className="mb-6">
          <Logo size="md" showText />
        </div>

        <div className="mb-6 flex size-20 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/10 text-destructive shadow-lg shadow-destructive/5">
          <WifiOff className="size-10" />
        </div>

        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          ইন্টারনেট সংযোগ বিচ্ছিন্ন
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          আপনার ডিভাইসে বর্তমানে কোনো ইন্টারনেট সংযোগ পাওয়া যাচ্ছে না। পূর্বের
          সংরক্ষিত ডেটা ও অফলাইন হিসাব দেখতে পারবেন, তবে নতুন তথ্য লোড করতে পুনরায়
          সংযোগ প্রয়োজন।
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <OfflineReloadButton />
          <Button
            variant="outline"
            render={<Link href="/" />}
            className="gap-2"
          >
            <Home className="size-4" />
            হোমে ফিরে যান
          </Button>
        </div>

        <p className="mt-8 text-xs text-muted-foreground/70">
          Mouza Map Pro PWA • অফলাইন মোড সক্রিয়
        </p>
      </div>
    </div>
  );
}


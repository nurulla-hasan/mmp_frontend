import { Suspense } from "react";
import type { Metadata } from "next";
import KmzViewerClient from "./kmz-viewer-client";

export const metadata: Metadata = {
  title: "কেএমজেড ম্যাপ ভিউয়ার — KMZ & KML Viewer | Mouza Map Pro",
  description:
    "Google Earth KMZ ও KML ফাইল সরাসরি ব্রাউজারে স্যাটেলাইট ম্যাপে দেখুন ও স্থানাঙ্ক পর্যবেক্ষণ করুন।",
  keywords: [
    "KMZ Viewer",
    "KML Viewer",
    "Google Earth Web",
    "Mouza KMZ",
    "কেএমজেড ম্যাপ ভিউয়ার",
  ],
  alternates: {
    canonical: "/tools/kmz-viewer",
  },
};

export default function KmzViewerPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-dvh place-items-center bg-background">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <KmzViewerClient />
    </Suspense>
  );
}

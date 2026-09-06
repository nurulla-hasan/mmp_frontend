import { Suspense } from "react";
import type { Metadata } from "next";
import KmzViewerClient from "./kmz-viewer-client";

export const metadata: Metadata = {
  title: "KMZ Map Viewer — Google Earth KMZ & KML Viewer | Mouza Map Pro",
  description:
    "View Google Earth KMZ and KML files directly on satellite maps and inspect coordinates.",
  keywords: [
    "KMZ Viewer",
    "KML Viewer",
    "Google Earth Web",
    "Mouza KMZ",
    "Map Viewer",
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

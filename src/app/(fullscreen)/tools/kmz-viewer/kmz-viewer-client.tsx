"use client";

import nextDynamic from "next/dynamic";

const KmzViewerStudio = nextDynamic(
  () => import("@/features/kmz-viewer/components/KmzViewerStudio"),
  { ssr: false },
);

export default function KmzViewerClient() {
  return <KmzViewerStudio />;
}

import type { Metadata } from "next";
import { Suspense } from "react";
import PantagraphClientWrapper from "./pantagraph-client-wrapper";

export const metadata: Metadata = {
  title: "Map Comparison & Pantagraph Tool — CS & BS Mouza Map Alignment",
  description:
    "Compare and align multiple mouza maps (CS, SA, RS, BS) side-by-side or overlaid using digital scaling and pantagraph tools.",
  keywords: [
    "Pantagraph",
    "Mouza Map Comparison",
    "CS BS Map Alignment",
    "Pantagraph Tool Bangladesh",
  ],
  alternates: {
    canonical: "/tools/pantagraph",
  },
  openGraph: {
    title: "Map Comparison & Pantagraph Tool | Mouza Map Pro",
    description:
      "Compare and align multiple mouza maps (CS, SA, RS, BS) side-by-side or overlaid using digital scaling and pantagraph tools.",
    url: "/tools/pantagraph",
  },
};

export default function PantagraphPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-dvh">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      }
    >
      <PantagraphClientWrapper />
    </Suspense>
  );
}

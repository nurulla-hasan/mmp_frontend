import { Loader2 } from "lucide-react";
import type { MapStyle } from "../types";

const SATELLITE_BLUR_PREVIEW =
  "https://mt1.google.com/vt/lyrs=y&x=26&y=14&z=5";
const STANDARD_BLUR_PREVIEW =
  "https://mt1.google.com/vt/lyrs=m&x=26&y=14&z=5";

type Props = {
  isReady: boolean;
  mapStyle?: MapStyle;
};

export default function KmzMapLoadingOverlay({
  isReady,
  mapStyle = "satellite",
}: Props) {
  const previewUri =
    mapStyle === "satellite" ? SATELLITE_BLUR_PREVIEW : STANDARD_BLUR_PREVIEW;

  return (
    <div
      className={`pointer-events-none absolute inset-0 z-20 flex items-center justify-center overflow-hidden bg-background transition-opacity duration-500 ${
        isReady ? "opacity-0" : "opacity-100"
      }`}
      aria-hidden={isReady}
    >
      {/* Blurry Low-Res Map Backdrop */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={previewUri}
        alt="Map preview loading"
        className="absolute inset-0 size-full scale-110 object-cover blur-md opacity-70"
      />

      {/* Dark Vignette / Gradient Mesh Overlay */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px]" />

      {/* Grid Lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[35%] left-0 right-0 border-t border-dashed border-primary/15" />
        <div className="absolute top-[65%] left-0 right-0 border-t border-dashed border-primary/15" />
        <div className="absolute left-[35%] top-0 bottom-0 border-l border-dashed border-primary/15" />
        <div className="absolute left-[65%] top-0 bottom-0 border-l border-dashed border-primary/15" />
        <div className="absolute top-1/2 left-1/2 size-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/30" />
      </div>

      {/* Status Pill */}
      <div className="relative flex items-center gap-2.5 rounded-full border border-primary/30 bg-card/90 px-4 py-2 text-card-foreground shadow-xl backdrop-blur-md">
        <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
        <Loader2 className="size-4 animate-spin text-primary" />
        <span className="text-xs font-medium">
          {mapStyle === "satellite"
            ? "স্যাটেলাইট ম্যাপ লোড হচ্ছে…"
            : "ম্যাপ লোড হচ্ছে…"}
        </span>
      </div>
    </div>
  );
}

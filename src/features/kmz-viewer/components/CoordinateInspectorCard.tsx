import { useState } from "react";
import { Check, Copy, ExternalLink, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { InspectedCoordinate } from "../types";
import { formatDMS } from "../utils/geoUtils";

type Props = {
  coordinate: InspectedCoordinate;
  onClose: () => void;
};

export default function CoordinateInspectorCard({ coordinate, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  const latText = coordinate.latitude.toFixed(6);
  const lngText = coordinate.longitude.toFixed(6);
  const decimalStr = `${latText}, ${lngText}`;
  const dmsLat = formatDMS(coordinate.latitude, true);
  const dmsLng = formatDMS(coordinate.longitude, false);
  const dmsStr = `${dmsLat}, ${dmsLng}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${decimalStr} (${dmsStr})`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${coordinate.latitude},${coordinate.longitude}`;

  return (
    <div className="w-full max-w-sm rounded-2xl border border-border bg-card/95 p-4 text-card-foreground shadow-2xl backdrop-blur-md transition-all animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <MapPin className="size-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold font-heading leading-tight">
              স্থানাঙ্ক পরীক্ষক
            </h4>
            <p className="text-[11px] text-muted-foreground">
              GPS Coordinates & Inspection
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="size-7 rounded-full text-muted-foreground hover:text-foreground"
          onClick={onClose}
          aria-label="Close coordinate inspector"
        >
          <X className="size-3.5" />
        </Button>
      </div>

      {/* Coordinate Values Box */}
      <div className="mb-3 space-y-2 rounded-xl border border-border/70 bg-muted/40 p-2.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Decimal (DD):</span>
          <span className="font-mono font-bold select-all text-foreground">
            {decimalStr}
          </span>
        </div>

        <div className="h-px bg-border/60" />

        <div className="flex items-start justify-between">
          <span className="text-muted-foreground">DMS:</span>
          <div className="text-right font-mono font-medium text-primary select-all">
            <div>{dmsLat}</div>
            <div>{dmsLng}</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant={copied ? "default" : "outline"}
          size="sm"
          className="flex-1 text-xs gap-1.5"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check className="size-3.5" />
              <span>কপি হয়েছে</span>
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              <span>কপি করুন</span>
            </>
          )}
        </Button>

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1"
        >
          <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 text-primary">
            <ExternalLink className="size-3.5" />
            <span>Google Maps</span>
          </Button>
        </a>
      </div>
    </div>
  );
}

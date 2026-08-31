"use client";

import { memo } from "react";
import {
  Download,
  FileUp,
  Loader2,
  Trash2,
  FileText,
  Crosshair,
  SlidersHorizontal,
  Globe2,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { AlignmentMode, ControlPair, GeoTransform } from "../types";
import type { KmzExportQuality } from "../utils/kmz";

type SettingsPanelProps = {
  image: HTMLImageElement | null;
  loadingFile: boolean;
  controlPairs: ControlPair[];
  alignmentMode: AlignmentMode;
  transform: GeoTransform | null;
  backgroundRemoved: boolean;
  processingBackground: boolean;
  backgroundSensitivity: number;
  lineColor: string;
  opacity: number;
  mapStyle: "satellite" | "street";
  exportQuality: KmzExportQuality;
  exportingKmz: boolean;
  residual: number | null;
  mapName: string;
  canExport: boolean;
  onUploadClick: () => void;
  onRemovePair: (id: string) => void;
  onSimilarityClick: () => void;
  onAffineClick: () => void;
  onBackgroundRemovedChange: (value: boolean) => void;
  onBackgroundSensitivityChange: (value: number) => void;
  onLineColorChange: (value: string) => void;
  onOpacityChange: (value: number) => void;
  onMapStyleChange: (value: "satellite" | "street") => void;
  onExportQualityChange: (value: KmzExportQuality) => void;
  onMapNameChange: (name: string) => void;
  onExport: () => void;
  onResetAlignment: () => void;
};

const sliderCls = (accent: "destructive" | "primary" = "primary") => {
  const base =
    "w-full h-1.5 appearance-none cursor-pointer rounded-full bg-muted [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-xs transition-all";
  if (accent === "destructive") {
    return `${base} accent-destructive [&::-webkit-slider-thumb]:bg-destructive`;
  }
  return `${base} accent-primary [&::-webkit-slider-thumb]:bg-primary`;
};

export default memo(function SettingsPanel({
  image,
  loadingFile,
  controlPairs,
  alignmentMode,
  transform,
  backgroundRemoved,
  processingBackground,
  backgroundSensitivity,
  lineColor,
  opacity,
  mapStyle,
  exportQuality,
  exportingKmz,
  residual,
  mapName,
  canExport,
  onUploadClick,
  onRemovePair,
  onSimilarityClick,
  onAffineClick,
  onBackgroundRemovedChange,
  onBackgroundSensitivityChange,
  onLineColorChange,
  onOpacityChange,
  onMapStyleChange,
  onExportQualityChange,
  onMapNameChange,
  onExport,
}: SettingsPanelProps) {
  return (
    <div className="space-y-4 p-4 md:p-5">
      {/* ── 1. Map Upload Section ── */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <FileUp className="size-3.5 text-primary" />
            <span>মৌজা ম্যাপ</span>
          </h3>
          {image && (
            <Badge
              variant="outline"
              className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
            >
              সংযুক্ত আছে
            </Badge>
          )}
        </div>

        {image ? (
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-primary/30 bg-primary/5 shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="flex size-7.5 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                <FileText className="size-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className="text-xs text-foreground truncate font-mono"
                  title={mapName || "mouza-map"}
                >
                  {mapName || "mouza-map"}
                </p>
                <p className="text-[10px] text-primary">
                  মৌজা ম্যাপ প্রস্তুত
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                variant="outline"
                size="icon"
                className="size-7.5 border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted"
                onClick={onUploadClick}
                disabled={loadingFile}
                title="ম্যাপ পরিবর্তন করুন"
              >
                <FileUp className="size-3.5" />
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            disabled={loadingFile}
            onClick={onUploadClick}
            className="w-full gap-1.5 text-xs h-9 border-primary/40 bg-primary/5 text-primary hover:bg-primary/15 hover:border-primary/60 transition-colors"
          >
            <FileUp className="size-3.5" />
            {loadingFile ? "লোড হচ্ছে…" : "নতুন PDF / Image আপলোড করুন"}
          </Button>
        )}
      </section>

      {/* ── When Image is Loaded: Show full Control Points & Alignment ── */}
      {image && (
        <>
          <Separator className="bg-border/60" />

          {/* 2. Control Points Section */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Crosshair className="size-3.5 text-primary" />
                <span>কন্ট্রোল পয়েন্ট</span>
              </h3>
              <Badge variant="outline" className="font-mono text-[10px]">
                {controlPairs.length} pair
              </Badge>
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {controlPairs.map((pair, index) => (
                <div
                  key={pair.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-border/70 bg-card p-2 shadow-xs"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary text-[10px] text-primary-foreground">
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-muted-foreground">
                      {pair.world.lat.toFixed(5)}, {pair.world.lng.toFixed(5)}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-6.5 border-border/80 text-destructive hover:bg-destructive/10 hover:border-destructive/40 shrink-0"
                    title="পয়েন্ট pair মুছুন"
                    aria-label="পয়েন্ট pair মুছুন"
                    onClick={() => onRemovePair(pair.id)}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              ))}

              {controlPairs.length === 0 && (
                <p className="text-[11px] leading-4 text-muted-foreground">
                  PDF-এ পয়েন্ট ক্লিক করলে World Map খুলবে। একই অবস্থানে ক্লিক করে পেয়ার করুন।
                </p>
              )}
            </div>
          </section>

          <Separator className="bg-border/60" />

          {/* 3. Alignment Section */}
          <section className="space-y-3">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <SlidersHorizontal className="size-3.5 text-primary" />
              <span>অ্যালাইনমেন্ট ও ট্র্যান্সফর্ম</span>
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={alignmentMode === "similarity" && transform ? "default" : "outline"}
                size="sm"
                disabled={controlPairs.length < 2}
                onClick={onSimilarityClick}
                className="text-xs h-8.5"
              >
                Similarity (২+ পয়েন্ট)
              </Button>
              <Button
                variant={alignmentMode === "affine" && transform ? "default" : "outline"}
                size="sm"
                disabled={controlPairs.length < 3}
                onClick={onAffineClick}
                className="text-xs h-8.5"
              >
                Affine (৩+ পয়েন্ট)
              </Button>
            </div>

            {transform && (
              <div className="flex items-center justify-between rounded-xl border border-primary/40 bg-primary/5 p-2.5 shadow-xs">
                <span className="text-xs text-primary flex items-center gap-1.5">
                  <Sparkles className="size-3.5" />
                  {alignmentMode === "affine" ? "Affine Refined" : "Similarity"}{" "}
                  Active
                </span>
                <Badge variant="outline" className="font-mono text-[10px] text-primary bg-primary/10 border-primary/30">
                  RMS {residual?.toFixed(2)}m
                </Badge>
              </div>
            )}
          </section>

          <Separator className="bg-border/60" />

          {/* 4. PDF Background Removal Card */}
          <section className="space-y-2.5 p-3 rounded-xl border border-border/70 bg-card shadow-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs text-foreground">
                <span>PDF ব্যাকগ্রাউন্ড রিমুভ</span>
                {processingBackground && (
                  <Loader2 className="size-3.5 animate-spin text-primary" />
                )}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={backgroundRemoved}
                aria-label="PDF background সরান"
                onClick={() => onBackgroundRemovedChange(!backgroundRemoved)}
                className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors ${
                  backgroundRemoved ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block size-4 rounded-full bg-background shadow-xs transition-transform ${
                    backgroundRemoved ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {backgroundRemoved && (
              <div className="space-y-2.5 pt-2 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    লাইন ধরার মাত্রা
                  </span>
                  <Badge variant="outline" className="font-mono text-[11px] text-primary bg-primary/5 border-primary/30">
                    {backgroundSensitivity}%
                  </Badge>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={backgroundSensitivity}
                  onChange={(event) =>
                    onBackgroundSensitivityChange(Number(event.target.value))
                  }
                  className={sliderCls("primary")}
                />

                <div className="space-y-1.5 pt-1">
                  <span className="text-xs text-muted-foreground">
                    লাইনের রং:
                  </span>
                  <div className="flex gap-2 items-center">
                    {[
                      { value: "#000000", label: "কালো" },
                      { value: "#DC2626", label: "লাল" },
                      { value: "#16A34A", label: "সবুজ" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        title={option.label}
                        aria-label={`${option.label} লাইন`}
                        onClick={() => onLineColorChange(option.value)}
                        className={`size-5 rounded-full transition-all border ${
                          lineColor === option.value
                            ? "ring-2 ring-primary ring-offset-1.5 ring-offset-card scale-110 border-foreground"
                            : "border-border/80 opacity-70 hover:opacity-100"
                        }`}
                        style={{ backgroundColor: option.value }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* 5. PDF Opacity Slider */}
          <section className="space-y-1.5 p-3 rounded-xl border border-border/70 bg-card shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-foreground">
                PDF ওপাসিটি
              </span>
              <Badge variant="outline" className="font-mono text-[11px]">
                {Math.round(opacity * 100)}%
              </Badge>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              value={Math.round(opacity * 100)}
              onChange={(event) =>
                onOpacityChange(Number(event.target.value) / 100)
              }
              className={sliderCls("primary")}
            />
          </section>
        </>
      )}

      <Separator className="bg-border/60" />

      {/* ── World Map Style Toggle (Always accessible) ── */}
      <section className="space-y-2">
        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Globe2 className="size-3.5 text-primary" />
          <span>World Map স্টাইল</span>
        </span>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant={mapStyle === "satellite" ? "default" : "outline"}
            size="sm"
            onClick={() => onMapStyleChange("satellite")}
            className="text-xs h-8"
          >
            Satellite
          </Button>
          <Button
            type="button"
            variant={mapStyle === "street" ? "default" : "outline"}
            size="sm"
            onClick={() => onMapStyleChange("street")}
            className="text-xs h-8"
          >
            Street
          </Button>
        </div>
      </section>

      <Separator className="bg-border/60" />

      {/* ── KMZ Export Section ── */}
      <section className="space-y-2.5">
        <h3 className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Download className="size-3.5 text-primary" />
          <span>KMZ এক্সপোর্ট (Google Earth)</span>
        </h3>

        <div className="space-y-2 p-3 rounded-xl border border-border/70 bg-card shadow-xs">
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={exportQuality === "optimized" ? "default" : "outline"}
              size="sm"
              onClick={() => onExportQualityChange("optimized")}
              className="text-xs h-8"
            >
              High · ছোট ফাইল
            </Button>
            <Button
              type="button"
              variant={exportQuality === "original" ? "default" : "outline"}
              size="sm"
              onClick={() => onExportQualityChange("original")}
              className="text-xs h-8"
            >
              Original কোয়ালিটি
            </Button>
          </div>
        </div>

        {image && (
          <>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">
                ফাইলের নাম:
              </label>
              <input
                value={mapName}
                onChange={(event) => onMapNameChange(event.target.value)}
                className="h-8.5 w-full rounded-lg border border-border/80 bg-background px-3 text-xs font-mono text-foreground outline-none focus:border-primary transition-colors"
                placeholder="mouza-map-name"
              />
            </div>

            <Button
              variant="default"
              size="sm"
              disabled={
                !transform || !canExport || processingBackground || exportingKmz
              }
              onClick={onExport}
              className="w-full h-9 gap-1.5 text-xs shadow-xs"
            >
              {exportingKmz ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Download className="size-3.5" />
              )}
              {exportingKmz ? "KMZ প্রস্তুত হচ্ছে…" : "KMZ ফাইল ডাউনলোড করুন"}
            </Button>
          </>
        )}
      </section>

      {/* ── Workflow Guide Card (Shown before upload so initial state is clean and zero scroll) ── */}
      {!image && (
        <>
          <Separator className="bg-border/60" />
          <div className="space-y-2 p-3 rounded-xl border border-primary/20 bg-primary/5 text-xs">
            <div className="flex items-center gap-1.5 text-primary font-medium">
              <HelpCircle className="size-3.5" />
              <span>জিওরেফারেন্সিং গাইড</span>
            </div>
            <div className="space-y-1 text-muted-foreground text-[11px] leading-relaxed">
              <p className="flex items-start gap-1.5">
                <span className="size-1.5 rounded-full bg-primary shrink-0 mt-1" />
                <span>১. মৌজা ম্যাপের PDF / Image আপলোড করুন।</span>
              </p>
              <p className="flex items-start gap-1.5">
                <span className="size-1.5 rounded-full bg-emerald-500 shrink-0 mt-1" />
                <span>২. ম্যাপ ও স্যাটেলাইটের একই অবস্থানে পয়েন্ট পেয়ার করুন।</span>
              </p>
              <p className="flex items-start gap-1.5">
                <span className="size-1.5 rounded-full bg-cyan-500 shrink-0 mt-1" />
                <span>৩. এক ক্লিকে Google Earth KMZ ফাইল ডাউনলোড করুন।</span>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
});

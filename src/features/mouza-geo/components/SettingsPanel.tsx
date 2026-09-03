"use client";

import { memo } from "react";
import {
  Download,
  FileUp,
  Loader2,
  Trash2,
  FileText,
  Crosshair,
  Globe2,
  HelpCircle,
  LocateFixed,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { ControlPair, GeoTransform } from "../types";
import type { KmzExportQuality } from "../utils/kmz";

type SettingsPanelProps = {
  image: HTMLImageElement | null;
  loadingFile: boolean;
  controlPairs: ControlPair[];
  transform: GeoTransform | null;
  backgroundRemoved: boolean;
  processingBackground: boolean;
  backgroundSensitivity: number;
  lineColor: string;
  opacity: number;
  mapStyle: "satellite" | "street";
  exportQuality: KmzExportQuality;
  exportingKmz: boolean;
  mapName: string;
  canExport: boolean;
  locating?: boolean;
  onUploadClick: () => void;
  onRemovePair: (id: string) => void;
  onLocateUser?: () => void;
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
  transform,
  backgroundRemoved,
  processingBackground,
  backgroundSensitivity,
  lineColor,
  opacity,
  mapStyle,
  exportQuality,
  exportingKmz,
  mapName,
  canExport,
  locating = false,
  onUploadClick,
  onRemovePair,
  onLocateUser,
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
            <span>Mouza Map</span>
          </h3>
          {image && (
            <Badge
              variant="outline"
              className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
            >
              Connected
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
                <p className="text-xs text-primary">
                  Mouza map ready
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
                title="Change Map"
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
            {loadingFile ? "Loading…" : "Upload New PDF / Image"}
          </Button>
        )}
      </section>

      {/* ── When Image is Loaded: Show Control Points, Background, Opacity ── */}
      {image && (
        <>
          <Separator className="bg-border/60" />

          {/* 2. Control Points Section */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Crosshair className="size-3.5 text-primary" />
                <span>Control Points</span>
              </h3>
              <Badge variant="outline" className="font-mono text-xs">
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
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary text-xs text-primary-foreground">
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground">
                      {pair.world.lat.toFixed(5)}, {pair.world.lng.toFixed(5)}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-6.5 border-border/80 text-destructive hover:bg-destructive/10 hover:border-destructive/40 shrink-0"
                    title="Remove point pair"
                    aria-label="Remove point pair"
                    onClick={() => onRemovePair(pair.id)}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              ))}

              {controlPairs.length === 0 && (
                <p className="text-xs leading-4 text-muted-foreground">
                  Click a point on the PDF to open World Map. Click the matching location to pair.
                </p>
              )}
            </div>
          </section>

          <Separator className="bg-border/60" />

          {/* 3. PDF Background Removal Card */}
          <section className="space-y-2.5 p-3 rounded-xl border border-border/70 bg-card shadow-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs text-foreground">
                <span>Remove PDF Background</span>
                {processingBackground && (
                  <Loader2 className="size-3.5 animate-spin text-primary" />
                )}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={backgroundRemoved}
                aria-label="Remove PDF background"
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
                    Line Detection Sensitivity
                  </span>
                  <Badge variant="outline" className="font-mono text-xs text-primary bg-primary/5 border-primary/30">
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
                    Line Color:
                  </span>
                  <div className="flex gap-2 items-center">
                    {[
                      { value: "#000000", label: "Black" },
                      { value: "#DC2626", label: "Red" },
                      { value: "#16A34A", label: "Green" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        title={option.label}
                        aria-label={`${option.label} line`}
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

          {/* 4. PDF Opacity Slider */}
          <section className="space-y-1.5 p-3 rounded-xl border border-border/70 bg-card shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-foreground">
                PDF Opacity
              </span>
              <Badge variant="outline" className="font-mono text-xs">
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

      {/* ── 5. GPS Location Section ── */}
      {onLocateUser && (
        <>
          <section className="space-y-2">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <LocateFixed className="size-3.5 text-primary" />
              <span>GPS Location</span>
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={locating}
              onClick={onLocateUser}
              className="w-full text-xs h-8.5 gap-1.5 border-border/80 hover:bg-muted"
            >
              {locating ? (
                <Loader2 className="size-3.5 animate-spin text-primary" />
              ) : (
                <LocateFixed className="size-3.5 text-primary" />
              )}
              <span>{locating ? "Locating…" : "My Current Location (GPS)"}</span>
            </Button>
          </section>

          <Separator className="bg-border/60" />
        </>
      )}

      {/* ── 6. World Map Style Toggle ── */}
      <section className="space-y-2">
        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Globe2 className="size-3.5 text-primary" />
          <span>World Map Style</span>
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

      {/* ── 7. KMZ Export Section ── */}
      <section className="space-y-2.5">
        <h3 className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Download className="size-3.5 text-primary" />
          <span>KMZ Export (Google Earth)</span>
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
              High · Small File
            </Button>
            <Button
              type="button"
              variant={exportQuality === "original" ? "default" : "outline"}
              size="sm"
              onClick={() => onExportQualityChange("original")}
              className="text-xs h-8"
            >
              Original Quality
            </Button>
          </div>
        </div>

        {image && (
          <>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">
                File Name:
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
              {exportingKmz ? "Preparing KMZ…" : "Download KMZ File"}
            </Button>
          </>
        )}
      </section>

      {/* ── Workflow Guide Card (Shown before upload) ── */}
      {!image && (
        <>
          <Separator className="bg-border/60" />
          <div className="space-y-2 p-3 rounded-xl border border-primary/20 bg-primary/5 text-xs">
            <div className="flex items-center gap-1.5 text-primary font-medium">
              <HelpCircle className="size-3.5" />
              <span>Georeferencing Guide</span>
            </div>
            <div className="space-y-1 text-muted-foreground text-xs leading-relaxed">
              <p className="flex items-start gap-1.5">
                <span className="size-1.5 rounded-full bg-primary shrink-0 mt-1" />
                <span>1. Upload a Mouza Map PDF / Image.</span>
              </p>
              <p className="flex items-start gap-1.5">
                <span className="size-1.5 rounded-full bg-emerald-500 shrink-0 mt-1" />
                <span>2. Pair corresponding points between the map and satellite view.</span>
              </p>
              <p className="flex items-start gap-1.5">
                <span className="size-1.5 rounded-full bg-cyan-500 shrink-0 mt-1" />
                <span>3. Download Google Earth KMZ file with 1 click.</span>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
});

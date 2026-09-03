"use client";

import { memo, useRef, useState, useCallback } from "react";
import { useShallow } from "zustand/shallow";
import {
  ImageUp,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  X,
  Layers,
  FileText,
  Download,
  Check,
  MapPin,
  Sparkles,
  Palette,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useTracerStore } from "../store/useTracerStore";
import { exportAsPDF, exportAsPNG } from "../utils/exportTracer";
import { extractImageFromPDF } from "@/features/land-measurement/utils/pdfHelper";
import { useMediaQuery } from "@/hooks/useUtilityHooks";
import { resizeImageForCanvas } from "@/lib/canvasImage";

// ─── Color presets ────────────────────────────────────────────────────────────
const COLOR_PRESETS = [
  "#DC2626", // Red
  "#16A34A", // Emerald Green
  "#2563EB", // Blue
  "#D97706", // Amber
  "#7C3AED", // Purple
  "#0891B2", // Cyan
  "#BE185D", // Pink
  "#0F172A", // Dark Slate
];

// ─── Background Section ───────────────────────────────────────────────────────
const BackgroundSection = memo(function BackgroundSection() {
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    backgroundImage,
    backgroundImageName,
    imageLoading,
    setBackground,
    setImageLoading,
  } = useTracerStore(
    useShallow((s) => ({
      backgroundImage: s.backgroundImage,
      backgroundImageName: s.backgroundImageName,
      imageLoading: s.imageLoading,
      setBackground: s.setBackground,
      setImageLoading: s.setImageLoading,
    })),
  );

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const fileName = file.name;
      e.target.value = "";
      setImageLoading(true);

      if (file.type === "application/pdf") {
        try {
          const img = await extractImageFromPDF(file);
          setBackground(await resizeImageForCanvas(img), fileName);
        } catch (err) {
          console.error("PDF load error:", err);
        } finally {
          setImageLoading(false);
        }
        return;
      }

      const url = URL.createObjectURL(file);
      const img = new window.Image();
      img.onload = async () => {
        try {
          setBackground(await resizeImageForCanvas(img), fileName);
        } catch (error: unknown) {
          console.error(
            "Image load error:",
            error instanceof Error ? error.message : "Unknown error",
          );
        } finally {
          URL.revokeObjectURL(url);
          setImageLoading(false);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        setImageLoading(false);
      };
      img.src = url;
    },
    [setBackground, setImageLoading],
  );

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <h3 className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <ImageUp className="size-3.5 text-primary" />
          <span>Background Map</span>
        </h3>
        {backgroundImage && (
          <Badge
            variant="outline"
            className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
          >
            Connected
          </Badge>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={handleUpload}
      />

      {backgroundImage ? (
        <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-border/80 bg-muted/30">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="flex size-7.5 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
              <FileText className="size-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="text-xs text-foreground truncate font-mono"
                title={backgroundImageName || "mouza_map.png"}
              >
                {backgroundImageName || "mouza_map.png"}
              </p>
              <p className="text-xs text-muted-foreground">
                Canvas Map
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              variant="outline"
              size="icon"
              className="size-7.5 border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted"
              onClick={() => inputRef.current?.click()}
              disabled={imageLoading}
              title="Change Map"
            >
              <ImageUp className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-7.5 border-border/80 text-destructive hover:text-destructive hover:bg-destructive/10 hover:border-destructive/40"
              onClick={() => setBackground(null)}
              title="Remove Map"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={imageLoading}
          className="w-full gap-1.5 text-xs h-9 border-border/80 hover:bg-primary/10 hover:text-primary hover:border-primary/40 transition-colors"
        >
          <ImageUp className="size-3.5" />
          {imageLoading ? "Loading..." : "Upload New Map"}
        </Button>
      )}
    </div>
  );
});

// ─── Layers Section ───────────────────────────────────────────────────────────
const LayersSection = memo(function LayersSection() {
  const {
    layers,
    activeLayerId,
    addLayer,
    removeLayer,
    setActiveLayer,
    toggleLayerVisibility,
    setLayerColor,
    setLayerLineWidth,
    renameLayer,
  } = useTracerStore(
    useShallow((s) => ({
      layers: s.layers,
      activeLayerId: s.activeLayerId,
      addLayer: s.addLayer,
      removeLayer: s.removeLayer,
      setActiveLayer: s.setActiveLayer,
      toggleLayerVisibility: s.toggleLayerVisibility,
      setLayerColor: s.setLayerColor,
      setLayerLineWidth: s.setLayerLineWidth,
      renameLayer: s.renameLayer,
    })),
  );

  const [expandedId, setExpandedId] = useState<string | null>('cs');
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="size-3.5 text-primary" />
          <span>Tracing Layers ({layers.length})</span>
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={addLayer}
          className="h-7 text-xs px-2.5 gap-1 text-primary hover:bg-primary/10 border-primary/30"
        >
          <Plus className="size-3" />
          Add
        </Button>
      </div>

      <div className="space-y-2">
        {layers.map((layer) => {
          const isActive = layer.id === activeLayerId;
          const isExpanded = expandedId === layer.id;

          return (
            <div
              key={layer.id}
              className={`rounded-xl border transition-all duration-200 ${
                isActive
                  ? "border-primary/50 bg-primary/5 shadow-xs"
                  : "border-border/70 bg-card hover:border-border"
              }`}
            >
              {/* Layer Row */}
              <div
                className="flex items-center gap-2 px-3 py-2.5 cursor-pointer select-none"
                onClick={() => setActiveLayer(layer.id)}
              >
                {/* Color Swatch / Indicator */}
                <div
                  className="size-3 rounded-full shrink-0 ring-1.5 ring-background shadow-xs transition-transform hover:scale-110"
                  style={{ backgroundColor: layer.color }}
                  title="Layer Color"
                />

                {/* Layer Name / Edit */}
                {editingId === layer.id ? (
                  <input
                    autoFocus
                    defaultValue={layer.name}
                    onClick={(e) => e.stopPropagation()}
                    onBlur={(e) => {
                      renameLayer(layer.id, e.target.value || layer.name);
                      setEditingId(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        renameLayer(
                          layer.id,
                          e.currentTarget.value || layer.name,
                        );
                        setEditingId(null);
                      }
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    className="flex-1 text-xs bg-background px-1.5 py-0.5 rounded border border-primary outline-none"
                  />
                ) : (
                  <span
                    className="flex-1 text-xs text-foreground truncate"
                    title="Double click to rename"
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      setEditingId(layer.id);
                    }}
                  >
                    {layer.name}
                  </span>
                )}

                {/* Stats badge */}
                <span className="text-[11px] text-muted-foreground font-mono shrink-0">
                  {layer.polygons.length} lines · {layer.labels.length} plots
                </span>

                {/* Visibility Toggle */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLayerVisibility(layer.id);
                  }}
                  className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted"
                  title={layer.visible ? "Hide" : "Show"}
                >
                  {layer.visible ? (
                    <Eye className="size-3.5 text-primary" />
                  ) : (
                    <EyeOff className="size-3.5 opacity-50" />
                  )}
                </button>

                {/* Expand Chevron */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedId(isExpanded ? null : layer.id);
                  }}
                  className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted"
                  title="Expand Settings"
                >
                  {isExpanded ? (
                    <ChevronDown className="size-3.5" />
                  ) : (
                    <ChevronRight className="size-3.5" />
                  )}
                </button>
              </div>

              {/* Expanded Layer Settings Drawer */}
              {isExpanded && (
                <div className="px-3 pb-3 pt-2.5 space-y-3 border-t border-border/60 bg-muted/20 rounded-b-xl">
                  {/* Line Thickness */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Line Width:
                    </span>
                    <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border border-border/60">
                      {[1, 2, 3, 4, 5].map((w) => (
                        <button
                          key={w}
                          type="button"
                          onClick={() => setLayerLineWidth(layer.id, w)}
                          className={`size-6 rounded text-xs font-mono transition-all ${
                            layer.lineWidth === w
                              ? "bg-primary text-primary-foreground shadow-xs"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Palette */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Palette className="size-3" />
                        Select Color:
                      </span>
                      <span className="font-mono text-xs">
                        {layer.color}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {COLOR_PRESETS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setLayerColor(layer.id, c)}
                          className={`size-4.5 rounded-full transition-all flex items-center justify-center ${
                            layer.color.toLowerCase() === c.toLowerCase()
                              ? "ring-2 ring-primary ring-offset-1.5 ring-offset-card scale-110"
                              : "hover:scale-105 opacity-70 hover:opacity-100"
                          }`}
                          style={{ backgroundColor: c }}
                        >
                          {layer.color.toLowerCase() === c.toLowerCase() && (
                            <Check className="size-2.5 text-white drop-shadow-xs" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Delete Layer Option */}
                  {layers.length > 1 && (
                    <div className="pt-1 text-right">
                      <button
                        type="button"
                        onClick={() => removeLayer(layer.id)}
                        className="text-xs text-destructive hover:underline inline-flex items-center gap-1"
                      >
                        <Trash2 className="size-3" />
                        Delete Layer
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

// ─── Drawing List Section ─────────────────────────────────────────────────────
const DrawingListSection = memo(function DrawingListSection() {
  const {
    layers,
    activeLayerId,
    selectedPolygonId,
    selectedLabelId,
    selectedLayerId,
    deletePolygon,
    selectPolygon,
    deleteLabel,
    selectLabel,
    setLabelText,
  } = useTracerStore(
    useShallow((s) => ({
      layers: s.layers,
      activeLayerId: s.activeLayerId,
      selectedPolygonId: s.selectedPolygonId,
      selectedLabelId: s.selectedLabelId,
      selectedLayerId: s.selectedLayerId,
      deletePolygon: s.deletePolygon,
      selectPolygon: s.selectPolygon,
      deleteLabel: s.deleteLabel,
      selectLabel: s.selectLabel,
      setLabelText: s.setLabelText,
    })),
  );

  const activeLayer = layers.find((l) => l.id === activeLayerId);
  if (
    !activeLayer ||
    (activeLayer.polygons.length === 0 && activeLayer.labels.length === 0)
  ) {
    return null;
  }

  return (
    <div className="space-y-3.5">
      {/* Polygons */}
      {activeLayer.polygons.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs text-muted-foreground uppercase tracking-wider flex items-center justify-between">
            <span>Boundary Lines</span>
            <Badge variant="outline" className="text-xs">
              {activeLayer.polygons.length}
            </Badge>
          </h3>
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {activeLayer.polygons.map((path, index) => {
              const isSelected =
                selectedPolygonId === path.id &&
                selectedLayerId === activeLayer.id;

              return (
                <div
                  key={path.id}
                  className={`flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 cursor-pointer transition-colors border ${
                    isSelected
                      ? "border-primary/40 bg-primary/10"
                      : "border-border/60 bg-muted/30 hover:bg-muted/60"
                  }`}
                  onClick={() => selectPolygon(activeLayer.id, path.id)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-3 h-0.5 rounded-full shrink-0"
                      style={{ backgroundColor: activeLayer.color }}
                    />
                    <span className="text-xs text-foreground truncate">
                      Line #{index + 1}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {path.points.length} points
                    </span>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        deletePolygon(activeLayer.id, path.id);
                      }}
                      className="text-muted-foreground hover:text-destructive transition-colors p-0.5 rounded"
                      title="Delete Line"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Dag Labels */}
      {activeLayer.labels.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs text-muted-foreground uppercase tracking-wider flex items-center justify-between">
            <span>Plot Numbers</span>
            <Badge variant="outline" className="text-xs">
              {activeLayer.labels.length}
            </Badge>
          </h3>
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {activeLayer.labels.map((label) => {
              const isSelected =
                selectedLabelId === label.id &&
                selectedLayerId === activeLayer.id;

              return (
                <div
                  key={label.id}
                  className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 cursor-pointer transition-colors border ${
                    isSelected
                      ? "border-primary/40 bg-primary/10"
                      : "border-border/60 bg-muted/30 hover:bg-muted/60"
                  }`}
                  onClick={() => selectLabel(activeLayer.id, label.id)}
                >
                  <MapPin
                    className="size-3.5 shrink-0"
                    style={{ color: activeLayer.color }}
                  />
                  <input
                    value={label.text}
                    onChange={(event) =>
                      setLabelText(activeLayer.id, label.id, event.target.value)
                    }
                    onClick={(event) => event.stopPropagation()}
                    placeholder="Enter plot no."
                    className="flex-1 text-xs bg-transparent outline-none placeholder:text-muted-foreground/40 min-w-0"
                  />
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      deleteLabel(activeLayer.id, label.id);
                    }}
                    className="text-muted-foreground hover:text-destructive transition-colors p-0.5 rounded"
                    title="Delete Plot Number"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
});

// ─── Export Section ───────────────────────────────────────────────────────────
const ExportSection = memo(function ExportSection() {
  const { layers, backgroundImage } = useTracerStore(
    useShallow((s) => ({
      layers: s.layers,
      backgroundImage: s.backgroundImage,
    })),
  );

  return (
    <div className="space-y-3">
      <h3 className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
        <Download className="size-3.5 text-primary" />
        <span>Export & Download</span>
      </h3>

      <div className="space-y-2.5">
        {layers.map((l) => (
          <div
            key={`export-${l.id}`}
            className="space-y-2 p-3 rounded-xl border border-border/80 bg-card shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="size-2 rounded-full shrink-0 ring-1 ring-background shadow-xs"
                  style={{ backgroundColor: l.color }}
                />
                <span className="text-xs text-foreground">
                  {l.name}
                </span>
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                {l.polygons.length} boundaries
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs h-8 gap-1 border-border/80 hover:bg-primary/10 hover:text-primary hover:border-primary/40 transition-colors"
                onClick={() => exportAsPDF(layers, backgroundImage, l.id)}
              >
                <FileText className="size-3" />
                Save PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs h-8 gap-1 border-border/80 hover:bg-primary/10 hover:text-primary hover:border-primary/40 transition-colors"
                onClick={() => exportAsPNG(layers, backgroundImage, l.id)}
              >
                <Download className="size-3" />
                Save PNG
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

const SidebarContent = memo(function SidebarContent() {
  return (
    <div className="flex-1 p-4 md:p-5 overflow-y-auto space-y-5">
      <BackgroundSection />
      <Separator className="bg-border/60" />
      <LayersSection />
      <Separator className="bg-border/60" />
      <DrawingListSection />
      <Separator className="bg-border/60" />
      <ExportSection />
    </div>
  );
});

// ─── Root Sidebar ─────────────────────────────────────────────────────────────
export const TracerSidebar = memo(function TracerSidebar({
  isOpen,
  onClose,
}: {
  isOpen?: boolean;
  onClose?: () => void;
}) {
  const isMobile = useMediaQuery("(max-width: 767px)");

  if (!isOpen) return null;

  return (
    <>
      {/* ── Desktop Floating Panel ── */}
      <div className="absolute left-4 top-16 max-h-[85dvh] w-84 bg-card/95 border border-border/80 flex-col z-20 hidden md:flex overflow-hidden rounded-2xl shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/70 shrink-0 bg-muted/40">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="size-3.5" />
            </div>
            <div>
              <h2 className="font-heading text-sm text-foreground">
                Digital Tracer
              </h2>
              <p className="text-xs text-muted-foreground">
                Map Tracing → Layers → Export
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 rounded-full shrink-0 text-muted-foreground hover:text-foreground"
            onClick={onClose}
          >
            <X className="size-3.5" />
          </Button>
        </div>
        <div className="overflow-y-auto" style={{ minHeight: 0 }}>
          <SidebarContent />
        </div>
      </div>

      {/* ── Mobile Bottom Sheet Drawer ── */}
      {isMobile && (
        <div className="md:hidden">
          <Drawer open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
            <DrawerContent className="max-h-[85dvh]">
              <DrawerHeader className="border-b border-border/70 py-3 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Sparkles className="size-3.5" />
                  </div>
                  <div>
                    <DrawerTitle className="text-left text-base font-heading text-foreground">
                      Digital Tracer
                    </DrawerTitle>
                    <p className="text-xs text-muted-foreground text-left">
                      Map Tracing → Layers → Export
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 rounded-full shrink-0"
                  onClick={onClose}
                >
                  <X className="size-3.5" />
                </Button>
              </DrawerHeader>
              <div className="overflow-y-auto">
                <SidebarContent />
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      )}
    </>
  );
});

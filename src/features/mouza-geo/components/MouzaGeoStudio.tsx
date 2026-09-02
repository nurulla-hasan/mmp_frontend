"use client";

import { useTheme } from "next-themes";
import { useEffect, useMemo, useRef, useState } from "react";
import { Globe, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerOverlay,
  DrawerPortal,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/useUtilityHooks";
import { ErrorToast, SuccessToast } from "@/lib/utils";
import EmptyState from "./EmptyState";
import GeoStudioToolbar from "./GeoStudioToolbar";
import GeoStudioTopNav from "./GeoStudioTopNav";
import SettingsPanel from "./SettingsPanel";
import SourceMapCanvas from "./SourceMapCanvas";
import WorldMapCanvas from "./WorldMapCanvas";
import type {
  AlignmentMode,
  ControlPair,
  GeoPoint,
  GeoTransform,
  InteractionTarget,
  MercatorPoint,
  Point2D,
} from "../types";
import {
  calculateResidualMeters,
  rotateGeoTransform,
  scaleGeoTransform,
  solveGeoTransform,
  translateGeoTransform,
} from "../utils/geoMath";
import { exportMouzaKmz, type KmzExportQuality } from "../utils/kmz";
import { extractImageFromPDF } from "@/features/land-measurement/utils/pdfHelper";
import { createProcessedPreview } from "../utils/imageProcessing";
import { loadImage, toDataUrl } from "../utils/imageUtils";

export default function MouzaGeoStudio() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const isMobile = useMediaQuery("(max-width: 767px)");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [processedImage, setProcessedImage] = useState<HTMLImageElement | null>(
    null,
  );
  const [mapName, setMapName] = useState("mouza-map");
  const [loadingFile, setLoadingFile] = useState(false);

  const [activeView, setActiveView] = useState<"source" | "world">("source");
  const [worldInitialized, setWorldInitialized] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pointMode, setPointMode] = useState(false);

  const [controlPairs, setControlPairs] = useState<ControlPair[]>([]);
  const [redoControlPairs, setRedoControlPairs] = useState<ControlPair[]>([]);
  const [pendingSource, setPendingSource] = useState<Point2D | null>(null);
  const [transform, setTransform] = useState<GeoTransform | null>(null);
  const [alignmentMode, setAlignmentMode] =
    useState<AlignmentMode>("similarity");

  const [backgroundRemoved, setBackgroundRemoved] = useState(false);
  const [processingBackground, setProcessingBackground] = useState(false);
  const [backgroundSensitivity, setBackgroundSensitivity] = useState(75);
  const [lineColor, setLineColor] = useState("#DC2626");
  const [opacity, setOpacity] = useState(0.72);
  const [mapStyle, setMapStyle] = useState<"satellite" | "street">("satellite");
  const [exportQuality, setExportQuality] =
    useState<KmzExportQuality>("optimized");
  const [exportingKmz, setExportingKmz] = useState(false);

  const [interactionTarget, setInteractionTarget] =
    useState<InteractionTarget>("map");

  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
    timestamp: number;
  } | null>(null);
  const [locating, setLocating] = useState(false);

  const overlayImage = backgroundRemoved && processedImage ? processedImage : image;

  const imageSize = useMemo(() => {
    if (!image) return { width: 0, height: 0 };
    return {
      width: image.naturalWidth || image.width,
      height: image.naturalHeight || image.height,
    };
  }, [image]);

  const imageCenter = useMemo(
    () => ({
      x: imageSize.width / 2,
      y: imageSize.height / 2,
    }),
    [imageSize],
  );

  const residual = useMemo(() => {
    if (!transform || controlPairs.length < 2) return null;
    return calculateResidualMeters(transform, controlPairs);
  }, [transform, controlPairs]);

  useEffect(() => {
    if (!image || !backgroundRemoved) {
      return;
    }

    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setProcessingBackground(true);
    });

    void createProcessedPreview(image, {
      sensitivity: backgroundSensitivity,
      lineColor,
    })
      .then((processed: HTMLImageElement) => {
        if (cancelled) return;
        setProcessedImage(processed);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        console.error("BG remove error:", error);
        ErrorToast("Could not remove background");
        setProcessedImage(null);
      })
      .finally(() => {
        if (!cancelled) setProcessingBackground(false);
      });

    return () => {
      cancelled = true;
    };
  }, [image, backgroundRemoved, backgroundSensitivity, lineColor]);

  const resetAlignment = () => {
    setControlPairs([]);
    setRedoControlPairs([]);
    setPendingSource(null);
    setTransform(null);
    setAlignmentMode("similarity");
    setInteractionTarget("map");
  };

  const handleFile = async (file: File) => {
    setLoadingFile(true);

    try {
      const loadedImage =
        file.type === "application/pdf"
          ? await extractImageFromPDF(file)
          : await loadImage(await toDataUrl(file));

      if (!loadedImage) throw new Error("Could not extract map from PDF");

      setImage(loadedImage);
      setProcessedImage(null);
      setBackgroundRemoved(false);
      setBackgroundSensitivity(75);
      setLineColor("#DC2626");
      setMapName(file.name.replace(/\.[^.]+$/, "") || "mouza-map");
      resetAlignment();
      setActiveView("source");
      setWorldInitialized(false);
      setPointMode(false);
    } catch (error: unknown) {
      ErrorToast(error instanceof Error ? error.message : "Could not load map");
    } finally {
      setLoadingFile(false);
    }
  };

  const fitTransform = (
    pairs: ControlPair[],
    mode: AlignmentMode,
    showToast = false,
  ) => {
    if (!image) return;

    try {
      const fitted = solveGeoTransform(pairs, imageSize, mode);
      setTransform(fitted);
      setAlignmentMode(mode);
      setInteractionTarget("map");

      if (showToast) {
        SuccessToast(
          mode === "affine"
            ? "Affine refinement applied"
            : "Similarity alignment applied",
        );
      }
    } catch (error: unknown) {
      if (showToast) {
        ErrorToast(
          error instanceof Error ? error.message : "Could not align map",
        );
      }
    }
  };

  const handleSourcePoint = (point: Point2D) => {
    setPendingSource(point);
    setWorldInitialized(true);
    setActiveView("world");
    setInteractionTarget("map");
  };

  const handleWorldPoint = (world: GeoPoint) => {
    if (!pendingSource) return;

    const nextPairs = [
      ...controlPairs,
      {
        id: `geo_pair_${Date.now()}_${controlPairs.length}`,
        source: pendingSource,
        world,
      },
    ];

    setControlPairs(nextPairs);
    setRedoControlPairs([]);
    setPendingSource(null);

    if (nextPairs.length >= 2) {
      fitTransform(
        nextPairs,
        alignmentMode === "affine" && nextPairs.length >= 3
          ? "affine"
          : "similarity",
        false,
      );
    }

    setActiveView("source");
  };

  const undoPair = () => {
    if (controlPairs.length === 0) return;
    const last = controlPairs[controlPairs.length - 1];
    const nextPairs = controlPairs.slice(0, -1);
    setControlPairs(nextPairs);
    setRedoControlPairs((prev) => [...prev, last]);

    const required = alignmentMode === "affine" ? 3 : 2;
    if (nextPairs.length >= required) {
      fitTransform(nextPairs, alignmentMode, false);
    } else if (nextPairs.length >= 2) {
      fitTransform(nextPairs, "similarity", false);
    } else {
      setTransform(null);
    }
  };

  const redoPair = () => {
    if (redoControlPairs.length === 0) return;
    const restored = redoControlPairs[redoControlPairs.length - 1];
    const nextPairs = [...controlPairs, restored];
    setControlPairs(nextPairs);
    setRedoControlPairs((prev) => prev.slice(0, -1));

    const required = alignmentMode === "affine" ? 3 : 2;
    if (nextPairs.length >= required) {
      fitTransform(nextPairs, alignmentMode, false);
    } else if (nextPairs.length >= 2) {
      fitTransform(nextPairs, "similarity", false);
    } else {
      setTransform(null);
    }
  };

  const removePair = (id: string) => {
    const removed = controlPairs.find((p) => p.id === id);
    if (removed) {
      setRedoControlPairs((prev) => [...prev, removed]);
    }
    const nextPairs = controlPairs.filter((pair) => pair.id !== id);
    setControlPairs(nextPairs);

    const required = alignmentMode === "affine" ? 3 : 2;

    if (nextPairs.length >= required) {
      fitTransform(nextPairs, alignmentMode, false);
    } else if (nextPairs.length >= 2) {
      fitTransform(nextPairs, "similarity", false);
    } else {
      setTransform(null);
    }
  };

  const handleTranslate = (delta: MercatorPoint) => {
    setTransform((current) =>
      current ? translateGeoTransform(current, delta) : current,
    );
  };

  const handleScale = (factor: number, anchor = imageCenter) => {
    setTransform((current) =>
      current ? scaleGeoTransform(current, anchor, factor) : current,
    );
  };

  const handleRotate = (angleRadians: number) => {
    setTransform((current) =>
      current
        ? rotateGeoTransform(current, imageCenter, angleRadians)
        : current,
    );
  };

  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      ErrorToast("Geolocation is not supported by your browser");
      return;
    }

    setLocating(true);
    setWorldInitialized(true);
    setActiveView("world");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          timestamp: Date.now(),
        });
        SuccessToast("Your current location was found");
      },
      (err) => {
        setLocating(false);
        console.error("Location error:", err);
        if (err.code === err.PERMISSION_DENIED) {
          ErrorToast("Location permission denied. Please allow location access in your browser settings");
        } else {
          ErrorToast("Could not determine location");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  const handleExport = async () => {
    if (exportingKmz) return;

    if (processingBackground) {
      ErrorToast("Please wait for background processing to finish before exporting");
      return;
    }

    if (!transform || !image) {
      ErrorToast("Please align map before exporting KMZ");
      return;
    }

    setExportingKmz(true);

    try {
      await exportMouzaKmz({
        transform,
        image,
        imageSize,
        name: mapName,
        transparent: backgroundRemoved,
        quality: exportQuality,
        backgroundSensitivity,
        lineColor,
      });
      SuccessToast(
        exportQuality === "optimized"
          ? "Optimized KMZ exported successfully"
          : "Original quality KMZ exported successfully",
      );
    } catch (error: unknown) {
      ErrorToast(
        error instanceof Error ? error.message : "Could not export KMZ",
      );
    } finally {
      setExportingKmz(false);
    }
  };

  return (
    <div
      className="relative h-dvh min-h-0 overflow-hidden"
      style={{
        backgroundColor: isDark ? "#121212" : "#ffffff",
        backgroundImage: isDark
          ? `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`
          : `linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)`,
        backgroundSize: "20px 20px",
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
          event.target.value = "";
        }}
      />

      <main className="absolute inset-0 min-h-0 min-w-0 overflow-hidden">
        {!image ? (
          <EmptyState
            onOpenSettings={() => setSettingsOpen(true)}
          />
        ) : (
          <>
            <div
              className={`absolute inset-0 ${
                activeView === "source"
                  ? "visible"
                  : "invisible pointer-events-none"
              }`}
            >
              <SourceMapCanvas
                image={overlayImage ?? image}
                imageSize={imageSize}
                controlPairs={controlPairs}
                pendingSource={pendingSource}
                active={activeView === "source"}
                pointMode={pointMode}
                onPlacePoint={handleSourcePoint}
              />
            </div>

            {worldInitialized && (
              <div
                className={`absolute inset-0 ${
                  activeView === "world"
                    ? "visible"
                    : "invisible pointer-events-none"
                }`}
              >
                <WorldMapCanvas
                  active={activeView === "world"}
                  image={overlayImage ?? image}
                  imageSize={imageSize}
                  transform={transform}
                  controlPairs={controlPairs}
                  waitingForWorldPoint={Boolean(pendingSource)}
                  pointMode={pointMode}
                  userLocation={userLocation}
                  opacity={opacity}
                  mapStyle={mapStyle}
                  interactionTarget={interactionTarget}
                  onPlaceWorldPoint={handleWorldPoint}
                  onTranslateOverlay={handleTranslate}
                  onScaleOverlay={handleScale}
                  onRotateOverlay={handleRotate}
                />
              </div>
            )}
          </>
        )}
      </main>

      <GeoStudioTopNav />

      {/* Desktop floating toolbar */}
      <div className="absolute right-3 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-0.5 rounded-2xl border border-border bg-card/90 p-1.5 shadow-xl md:flex">
        <GeoStudioToolbar
          settingsOpen={settingsOpen}
          activeView={activeView}
          transform={transform}
          alignmentMode={alignmentMode}
          controlPairsCount={controlPairs.length}
          pointMode={pointMode}
          locating={locating}
          canUndo={controlPairs.length > 0}
          canRedo={redoControlPairs.length > 0}
          onToggleSettings={() => setSettingsOpen((open) => !open)}
          onTogglePointMode={() => setPointMode((prev) => !prev)}
          onSelectView={(view) => {
            if (view === "world") setWorldInitialized(true);
            setActiveView(view);
          }}
          onLocateUser={handleLocateUser}
          onSimilarityClick={() => fitTransform(controlPairs, "similarity", true)}
          onAffineClick={() => fitTransform(controlPairs, "affine", true)}
          onUndo={undoPair}
          onRedo={redoPair}
          onResetAlignment={resetAlignment}
          mobile={false}
        />
      </div>

      {/* Mobile floating toolbar */}
      <div className="absolute bottom-4 left-1/2 z-40 flex w-fit max-w-[calc(100vw-1rem)] -translate-x-1/2 items-center gap-1 rounded-2xl border border-border bg-card/95 p-1.5 shadow-xl md:hidden">
        <GeoStudioToolbar
          settingsOpen={settingsOpen}
          activeView={activeView}
          transform={transform}
          alignmentMode={alignmentMode}
          controlPairsCount={controlPairs.length}
          pointMode={pointMode}
          locating={locating}
          canUndo={controlPairs.length > 0}
          canRedo={redoControlPairs.length > 0}
          onToggleSettings={() => setSettingsOpen((open) => !open)}
          onTogglePointMode={() => setPointMode((prev) => !prev)}
          onSelectView={(view) => {
            if (view === "world") setWorldInitialized(true);
            setActiveView(view);
          }}
          onLocateUser={handleLocateUser}
          onSimilarityClick={() => fitTransform(controlPairs, "similarity", true)}
          onAffineClick={() => fitTransform(controlPairs, "affine", true)}
          onUndo={undoPair}
          onRedo={redoPair}
          onResetAlignment={resetAlignment}
          mobile={true}
        />
      </div>

      {settingsOpen && (
        <>
          {/* Desktop settings sidebar */}
          <aside className="absolute left-4 top-16 z-50 hidden max-h-[85dvh] w-84 flex-col overflow-hidden rounded-2xl border border-border/80 bg-card/95 text-card-foreground shadow-xl md:flex">
            <header className="flex shrink-0 items-center justify-between border-b border-border/70 bg-muted/40 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Globe className="size-3.5" />
                </div>
                <div>
                  <h2 className="font-heading text-md text-foreground">
                    Mouza Georeferencing
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Pair Points → Align → Export KMZ
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setSettingsOpen(false)}
                className="size-7 shrink-0 rounded-full text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </Button>
            </header>
            <div className="overflow-y-auto" style={{ minHeight: 0 }}>
              <SettingsPanel
                image={image}
                loadingFile={loadingFile}
                controlPairs={controlPairs}
                transform={transform}
                backgroundRemoved={backgroundRemoved}
                processingBackground={processingBackground}
                backgroundSensitivity={backgroundSensitivity}
                lineColor={lineColor}
                opacity={opacity}
                mapStyle={mapStyle}
                exportQuality={exportQuality}
                exportingKmz={exportingKmz}
                mapName={mapName}
                canExport={
                  Boolean(image) && !processingBackground && !exportingKmz
                }
                locating={locating}
                onUploadClick={() => fileInputRef.current?.click()}
                onRemovePair={removePair}
                onLocateUser={handleLocateUser}
                onBackgroundRemovedChange={setBackgroundRemoved}
                onBackgroundSensitivityChange={setBackgroundSensitivity}
                onLineColorChange={setLineColor}
                onOpacityChange={setOpacity}
                onMapStyleChange={setMapStyle}
                onExportQualityChange={setExportQuality}
                onMapNameChange={setMapName}
                onExport={handleExport}
                onResetAlignment={resetAlignment}
              />
            </div>
          </aside>

          {/* Mobile settings drawer */}
          {isMobile && (
            <div className="md:hidden">
              <Drawer
                open={settingsOpen}
                onOpenChange={(open) => {
                  if (!open) setSettingsOpen(false);
                }}
              >
                <DrawerPortal>
                  <DrawerOverlay className="md:hidden" />
                  <DrawerContent className="flex max-h-[85dvh] flex-col md:hidden">
                    <header className="flex shrink-0 items-center justify-between border-b border-border/70 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Globe className="size-3.5" />
                        </div>
                        <div>
                          <h2 className="font-heading text-base font-bold text-foreground">
                            Mouza Georeferencing
                          </h2>
                          <p className="text-xs text-muted-foreground">
                            Pair Points → Align → Export KMZ
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setSettingsOpen(false)}
                        className="size-7 shrink-0 rounded-full text-muted-foreground hover:text-foreground"
                      >
                        <X className="size-3.5" />
                      </Button>
                    </header>
                    <div
                      className="flex-1 overflow-y-auto"
                      style={{ minHeight: 0 }}
                    >
                      <SettingsPanel
                        image={image}
                        loadingFile={loadingFile}
                        controlPairs={controlPairs}
                        transform={transform}
                        backgroundRemoved={backgroundRemoved}
                        processingBackground={processingBackground}
                        backgroundSensitivity={backgroundSensitivity}
                        lineColor={lineColor}
                        opacity={opacity}
                        mapStyle={mapStyle}
                        exportQuality={exportQuality}
                        exportingKmz={exportingKmz}
                        mapName={mapName}
                        canExport={
                          Boolean(image) &&
                          !processingBackground &&
                          !exportingKmz
                        }
                        locating={locating}
                        onUploadClick={() => fileInputRef.current?.click()}
                        onRemovePair={removePair}
                        onLocateUser={handleLocateUser}
                        onBackgroundRemovedChange={setBackgroundRemoved}
                        onBackgroundSensitivityChange={setBackgroundSensitivity}
                        onLineColorChange={setLineColor}
                        onOpacityChange={setOpacity}
                        onMapStyleChange={setMapStyle}
                        onExportQualityChange={setExportQuality}
                        onMapNameChange={setMapName}
                        onExport={handleExport}
                        onResetAlignment={resetAlignment}
                      />
                    </div>
                  </DrawerContent>
                </DrawerPortal>
              </Drawer>
            </div>
          )}
        </>
      )}
    </div>
  );
}

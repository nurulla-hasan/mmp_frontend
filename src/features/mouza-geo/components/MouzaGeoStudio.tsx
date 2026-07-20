"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerOverlay,
  DrawerPortal,
} from "@/components/ui/drawer";
import { extractImageFromPDF } from "@/features/land-measurement/utils/pdfHelper";
import { useMediaQuery } from "@/hooks/useUtilityHooks";
import { ErrorToast, SuccessToast } from "@/lib/utils";
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
import {
  exportMouzaKmz,
  type KmzExportQuality,
} from "../utils/kmz";
import { createProcessedPreview } from "../utils/imageProcessing";
import { loadImage, toDataUrl } from "../utils/imageUtils";
import EmptyState from "./EmptyState";
import GeoStudioToolbar from "./GeoStudioToolbar";
import GeoStudioTopNav from "./GeoStudioTopNav";
import SettingsPanel from "./SettingsPanel";
import SourceMapCanvas from "./SourceMapCanvas";
import WorldMapCanvas from "./WorldMapCanvas";

type ActiveView = "source" | "world";

export default function MouzaGeoStudio() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [overlayImage, setOverlayImage] = useState<HTMLImageElement | null>(null);
  const [mapName, setMapName] = useState("mouza-map");
  const [loadingFile, setLoadingFile] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeView, setActiveView] = useState<ActiveView>("source");
  const [worldInitialized, setWorldInitialized] = useState(false);
  const [interactionTarget, setInteractionTarget] =
    useState<InteractionTarget>("map");
  const [controlPairs, setControlPairs] = useState<ControlPair[]>([]);
  const [pendingSource, setPendingSource] = useState<Point2D | null>(null);
  const [alignmentMode, setAlignmentMode] =
    useState<AlignmentMode>("similarity");
  const [transform, setTransform] = useState<GeoTransform | null>(null);
  const [backgroundRemoved, setBackgroundRemoved] = useState(false);
  const [backgroundSensitivity, setBackgroundSensitivity] = useState(75);
  const [lineColor, setLineColor] = useState("#DC2626");
  const [processingBackground, setProcessingBackground] = useState(false);
  const [opacity, setOpacity] = useState(0.72);
  const [mapStyle, setMapStyle] = useState<"satellite" | "street">("satellite");
  const [exportQuality, setExportQuality] =
    useState<KmzExportQuality>("optimized");
  const [exportingKmz, setExportingKmz] = useState(false);

  const imageSize = useMemo(
    () => ({
      width: image?.naturalWidth || image?.width || 0,
      height: image?.naturalHeight || image?.height || 0,
    }),
    [image],
  );

  const imageCenter = useMemo(
    () => ({ x: imageSize.width / 2, y: imageSize.height / 2 }),
    [imageSize],
  );

  const residual = useMemo(
    () => (transform ? calculateResidualMeters(transform, controlPairs) : null),
    [controlPairs, transform],
  );

  useEffect(() => {
    if (!image) return;

    const controller = new AbortController();
    const delay = backgroundRemoved ? 220 : 0;

    const timer = window.setTimeout(() => {
      if (!backgroundRemoved) {
        setOverlayImage(image);
        setProcessingBackground(false);
        return;
      }

      setProcessingBackground(true);

      void createProcessedPreview(
        image,
        { sensitivity: backgroundSensitivity, lineColor },
        controller.signal,
      )
        .then((processedImage) => {
          setOverlayImage(processedImage);
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") {
            return;
          }

          ErrorToast(
            error instanceof Error
              ? error.message
              : "Background remove করা যায়নি",
          );
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setProcessingBackground(false);
          }
        });
    }, delay);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [backgroundRemoved, backgroundSensitivity, image, lineColor]);

  const resetAlignment = () => {
    setControlPairs([]);
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

      if (!loadedImage) throw new Error("PDF থেকে map পাওয়া যায়নি");

      setImage(loadedImage);
      setOverlayImage(loadedImage);
      setBackgroundRemoved(false);
      setBackgroundSensitivity(75);
      setLineColor("#DC2626");
      setMapName(file.name.replace(/\.[^.]+$/, "") || "mouza-map");
      resetAlignment();
      setActiveView("source");
      setWorldInitialized(false);
      setSettingsOpen(false);
      SuccessToast("মৌজা ম্যাপ প্রস্তুত হয়েছে");
    } catch (error: unknown) {
      ErrorToast(error instanceof Error ? error.message : "Map load করা যায়নি");
    } finally {
      setLoadingFile(false);
    }
  };

  const fitTransform = (
    pairs: ControlPair[],
    mode: AlignmentMode,
    showToast = true,
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
            ? "Affine refinement apply হয়েছে"
            : "Similarity alignment apply হয়েছে",
        );
      }
    } catch (error: unknown) {
      if (showToast) {
        ErrorToast(
          error instanceof Error ? error.message : "Alignment করা যায়নি",
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

  const removePair = (id: string) => {
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

  const handleScale = (factor: number) => {
    setTransform((current) =>
      current ? scaleGeoTransform(current, imageCenter, factor) : current,
    );
  };

  const handleRotate = (angleRadians: number) => {
    setTransform((current) =>
      current
        ? rotateGeoTransform(current, imageCenter, angleRadians)
        : current,
    );
  };

  const handleExport = async () => {
    if (exportingKmz) return;

    if (processingBackground) {
      ErrorToast("Background processing শেষ হলে export করুন");
      return;
    }

    if (!transform || !image) {
      ErrorToast("KMZ export-এর আগে map align করুন");
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
          ? "Optimized KMZ export হয়েছে"
          : "Original quality KMZ export হয়েছে",
      );
    } catch (error: unknown) {
      ErrorToast(
        error instanceof Error ? error.message : "KMZ export করা যায়নি",
      );
    } finally {
      setExportingKmz(false);
    }
  };

  return (
    <div className="relative h-dvh min-h-0 overflow-hidden bg-background">
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
            loadingFile={loadingFile}
            onUploadClick={() => fileInputRef.current?.click()}
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

      <GeoStudioTopNav
        image={image}
        activeView={activeView}
        alignmentMode={alignmentMode}
        transform={transform}
        onSourceClick={() => setActiveView("source")}
        onWorldClick={() => {
          setWorldInitialized(true);
          setActiveView("world");
        }}
      />

      {/* Desktop floating toolbar */}
      <div className="absolute right-3 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-0.5 rounded-2xl border border-border bg-card/90 p-1.5 shadow-xl md:flex">
        <GeoStudioToolbar
          settingsOpen={settingsOpen}
          activeView={activeView}
          transform={transform}
          pendingSource={pendingSource}
          interactionTarget={interactionTarget}
          image={image}
          canExport={Boolean(image) && !processingBackground && !exportingKmz}
          onToggleSettings={() => setSettingsOpen((open) => !open)}
          onSetInteractionTarget={setInteractionTarget}
          onScale={handleScale}
          onRotate={handleRotate}
          onExport={handleExport}
          onResetAlignment={resetAlignment}
          mobile={false}
        />
      </div>

      {/* Mobile floating toolbar */}
      <div
        className="absolute bottom-4 left-1/2 z-40 flex w-max max-w-[95vw] -translate-x-1/2 items-center gap-1 overflow-x-auto whitespace-nowrap rounded-2xl border border-border bg-card/95 p-1.5 shadow-xl md:hidden"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <GeoStudioToolbar
          settingsOpen={settingsOpen}
          activeView={activeView}
          transform={transform}
          pendingSource={pendingSource}
          interactionTarget={interactionTarget}
          image={image}
          canExport={Boolean(image) && !processingBackground && !exportingKmz}
          onToggleSettings={() => setSettingsOpen((open) => !open)}
          onSetInteractionTarget={setInteractionTarget}
          onScale={handleScale}
          onRotate={handleRotate}
          onExport={handleExport}
          onResetAlignment={resetAlignment}
          mobile={true}
        />
      </div>

      {settingsOpen && (
        <>
          {/* Desktop settings sidebar */}
          <aside className="absolute left-4 top-4 z-50 hidden max-h-[calc(100dvh-2rem)] w-80 flex-col overflow-hidden rounded-2xl border border-border bg-card/95 text-card-foreground shadow-2xl backdrop-blur-md md:flex">
            <header className="flex shrink-0 items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
              <div>
                <h2 className="font-heading text-sm font-semibold">
                  ম্যাপ ও সেটিংস
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  Point pair → Align → KMZ
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setSettingsOpen(false)}
                className="size-8 shrink-0 rounded-full"
              >
                <X className="size-4" />
              </Button>
            </header>
            <div className="overflow-y-auto" style={{ minHeight: 0 }}>
              <SettingsPanel
                image={image}
                loadingFile={loadingFile}
                controlPairs={controlPairs}
                alignmentMode={alignmentMode}
                transform={transform}
                backgroundRemoved={backgroundRemoved}
                processingBackground={processingBackground}
                backgroundSensitivity={backgroundSensitivity}
                lineColor={lineColor}
                opacity={opacity}
                mapStyle={mapStyle}
                exportQuality={exportQuality}
                exportingKmz={exportingKmz}
                residual={residual}
                mapName={mapName}
                canExport={Boolean(image) && !processingBackground && !exportingKmz}
                onUploadClick={() => fileInputRef.current?.click()}
                onRemovePair={removePair}
                onSimilarityClick={() =>
                  fitTransform(controlPairs, "similarity")
                }
                onAffineClick={() => fitTransform(controlPairs, "affine")}
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
                    <header className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
                      <div>
                        <h2 className="font-heading text-sm font-semibold">
                          ম্যাপ ও সেটিংস
                        </h2>
                        <p className="text-[11px] text-muted-foreground">
                          Point pair → Align → KMZ
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setSettingsOpen(false)}
                        className="size-8 shrink-0 rounded-full"
                      >
                        <X className="size-4" />
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
                        alignmentMode={alignmentMode}
                        transform={transform}
                        backgroundRemoved={backgroundRemoved}
                        processingBackground={processingBackground}
                        backgroundSensitivity={backgroundSensitivity}
                        lineColor={lineColor}
                        opacity={opacity}
                        mapStyle={mapStyle}
                        exportQuality={exportQuality}
                        exportingKmz={exportingKmz}
                        residual={residual}
                        mapName={mapName}
                        canExport={Boolean(image) && !processingBackground && !exportingKmz}
                        onUploadClick={() => fileInputRef.current?.click()}
                        onRemovePair={removePair}
                        onSimilarityClick={() =>
                          fitTransform(controlPairs, "similarity")
                        }
                        onAffineClick={() =>
                          fitTransform(controlPairs, "affine")
                        }
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

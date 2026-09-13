"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Calendar,
  Layers,
  Trash2,
  Upload,
  ArrowRight,
  Loader2,
  FileQuestion,
  Search,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { useShallow } from "zustand/shallow";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModalWrapper } from "@/components/common/modal-wrapper";
import { ConfirmationModal } from "@/components/common/confirmation-modal";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import {
  ErrorToast,
  formatDate,
} from "@/lib/utils";
import { LocalMapThumbnail } from "@/features/land-measurement/components/LocalMapThumbnail";
import { useMapStore } from "@/features/land-measurement/store/useMapStore";
import {
  getCalculationsAction,
  getCalculationByIdAction,
  deleteCalculationAction,
} from "@/features/land-measurement/actions/calculation.action";
import { calculatePolygonData } from "@/features/land-measurement/utils/calculations";
import { PLOT_COLOR_PALETTE } from "@/features/land-measurement/utils/canvas";
import {
  deleteLocalCalculationAssets,
  findLocalCalculationMapByName,
  getLocalCalculationMap,
  saveLocalCalculationMap,
  saveLocalCalculationThumbnailFromImage,
} from "@/features/land-measurement/utils/localMapStorage";
import type { TCalculation } from "@/interface/calculation";
import type { PlotRecord } from "@/features/land-measurement/types/map";

interface LoadCalculationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialCalculationId?: string | null;
}

const PAGE_LIMIT = 6;

export function LoadCalculationDialog({
  open,
  onOpenChange,
  initialCalculationId,
}: LoadCalculationDialogProps) {
  const {
    setPlots,
    setScale,
    setCurrentProjectId,
    processFile,
  } = useMapStore(
    useShallow((s) => ({
      setPlots: s.setPlots,
      setScale: s.setScale,
      setCurrentProjectId: s.setCurrentProjectId,
      processFile: s.processFile,
    })),
  );

  const [calculations, setCalculations] = useState<TCalculation[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pendingCalculation, setPendingCalculation] = useState<TCalculation | null>(null);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const [openingCalculationId, setOpeningCalculationId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        setPendingCalculation(null);
        setSearchTerm("");
      }
      onOpenChange(nextOpen);
    },
    [onOpenChange],
  );

  const applyCalculationPlots = useCallback(
    (calc: TCalculation) => {
      const scaleValue = calc.scalePxPerUnit || null;
      setScale(scaleValue);

      const loadedPlots: PlotRecord[] = (calc.plots || []).map((p, idx) => {
        let rawPoints: { x: number; y: number }[] = [];
        if (Array.isArray(p.points)) {
          rawPoints = p.points as unknown as { x: number; y: number }[];
        } else if (typeof p.points === "string") {
          try {
            rawPoints = JSON.parse(p.points);
          } catch {
            rawPoints = [];
          }
        }

        const results = calculatePolygonData(rawPoints, scaleValue);
        return {
          id: p.id || `${Date.now()}-${idx}`,
          name: p.plotNumber || `Plot ${idx + 1}`,
          points: rawPoints,
          results: results || {
            sqft: 0,
            shotok: Number(p.areaShotok) || 0,
            katha: Number(p.areaKatha) || 0,
            lengths: [],
            perimeter: 0,
          },
          color: PLOT_COLOR_PALETTE[idx % PLOT_COLOR_PALETTE.length],
        };
      });

      setPlots(loadedPlots);
      setCurrentProjectId(calc.id);
      if (typeof window !== "undefined" && window.location.search.includes("calculationId")) {
        window.history.replaceState(null, "", window.location.pathname);
      }
      handleOpenChange(false);
    },
    [handleOpenChange, setCurrentProjectId, setPlots, setScale],
  );

  const currentMapMatchesCalculation = useCallback((calc: TCalculation) => {
    const state = useMapStore.getState();
    if (!state.image || !state.selectedFile) return false;
    if (state.selectedFile.name !== calc.mapName) return false;

    const expectedWidth = Number(calc.imageWidth || 0);
    const expectedHeight = Number(calc.imageHeight || 0);
    const widthMatches = !expectedWidth || expectedWidth === state.image.naturalWidth;
    const heightMatches = !expectedHeight || expectedHeight === state.image.naturalHeight;
    return widthMatches && heightMatches;
  }, []);

  const cacheThumbnail = useCallback(async (calculationId: string) => {
    const currentImage = useMapStore.getState().image;
    if (!currentImage) return;
    try {
      await saveLocalCalculationThumbnailFromImage(calculationId, currentImage);
    } catch (error: unknown) {
      console.error("Could not cache saved-map thumbnail:", error);
    }
  }, []);

  const handleSelectCalculation = useCallback(
    async (calc: TCalculation) => {
      setOpeningCalculationId(calc.id);
      try {
        const localMap = await getLocalCalculationMap(calc.id);
        if (localMap) {
          const success = await processFile(localMap);
          if (success) {
            await cacheThumbnail(calc.id);
            applyCalculationPlots(calc);
            return;
          }
        }

        if (currentMapMatchesCalculation(calc)) {
          const currentFile = useMapStore.getState().selectedFile;
          if (currentFile) {
            try {
              await saveLocalCalculationMap(calc.id, currentFile);
            } catch (error: unknown) {
              console.error("Could not cache current map for saved measurement:", error);
            }
          }
          await cacheThumbnail(calc.id);
          applyCalculationPlots(calc);
          return;
        }

        if (calc.mapName) {
          const reusableMap = await findLocalCalculationMapByName(calc.mapName, calc.id);
          if (reusableMap) {
            const success = await processFile(reusableMap);
            if (success && currentMapMatchesCalculation(calc)) {
              try {
                await saveLocalCalculationMap(calc.id, reusableMap);
              } catch (error: unknown) {
                console.error("Could not bind reused local map to saved measurement:", error);
              }
              await cacheThumbnail(calc.id);
              applyCalculationPlots(calc);
              return;
            }
          }
        }

        setPendingCalculation(calc);
      } catch (error: unknown) {
        console.error("Could not restore saved local map:", error);
        setPendingCalculation(calc);
      } finally {
        setOpeningCalculationId(null);
      }
    },
    [
      applyCalculationPlots,
      cacheThumbnail,
      currentMapMatchesCalculation,
      processFile,
    ],
  );

  useEffect(() => {
    if (!open) return;

    let ignore = false;

    if (initialCalculationId) {
      getCalculationByIdAction(initialCalculationId).then((res) => {
        if (!ignore && res.success && res.data) {
          void handleSelectCalculation(res.data);
        }
      });
    }

    getCalculationsAction({
      page: 1,
      limit: PAGE_LIMIT,
      searchTerm: searchTerm.trim() || undefined,
    })
      .then((res) => {
        if (!ignore && res.success && res.data) {
          setCalculations(res.data);
          setPage(1);
          const total = res.meta?.total || res.data.length;
          const totalPages = res.meta?.totalPages || 1;
          setTotalCount(total);
          setHasMore(1 < totalPages);
        }
      })
      .catch(() => {
        if (!ignore) {
          ErrorToast("Could not load saved measurements list.");
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [open, initialCalculationId, searchTerm, handleSelectCalculation]);

  const loadMoreCalculations = useCallback(async () => {
    if (isLoading || isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    const nextPage = page + 1;

    try {
      const res = await getCalculationsAction({
        page: nextPage,
        limit: PAGE_LIMIT,
        searchTerm: searchTerm.trim() || undefined,
      });

      if (res.success && res.data) {
        setCalculations((prev) => [...prev, ...res.data]);
        setPage(nextPage);
        const totalPages = res.meta?.totalPages || 1;
        setHasMore(nextPage < totalPages);
      }
    } catch {
      ErrorToast("Failed to load more measurements.");
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoading, isLoadingMore, page, searchTerm]);

  const { sentinelRef } = useInfiniteScroll({
    onLoadMore: loadMoreCalculations,
    hasMore,
    isLoading: isLoading || isLoadingMore,
    rootMargin: "150px",
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pendingCalculation) return;

    const calcToApply = pendingCalculation;
    setIsProcessingUpload(true);
    try {
      const success = await processFile(file);
      if (success) {
        try {
          await saveLocalCalculationMap(calcToApply.id, file);
        } catch (error: unknown) {
          console.error("Could not cache selected map for saved measurement:", error);
        }
        await cacheThumbnail(calcToApply.id);
        applyCalculationPlots(calcToApply);
      }
    } catch {
      ErrorToast("Failed to process map file.");
    } finally {
      setIsProcessingUpload(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      const res = await deleteCalculationAction(deletingId);
      if (res.success) {
        setCalculations((prev) => prev.filter((c) => c.id !== deletingId));
        setTotalCount((prev) => Math.max(0, prev - 1));
        try {
          await deleteLocalCalculationAssets(deletingId);
        } catch (error: unknown) {
          console.error("Could not delete local measurement assets:", error);
        }
      } else {
        ErrorToast(res.message || "Failed to delete measurement.");
      }
    } catch {
      ErrorToast("Failed to delete measurement.");
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  return (
    <>
      <ModalWrapper
        open={open}
        onOpenChange={handleOpenChange}
        title="Saved Measurements"
        description="Select a previously saved measurement to reload onto the canvas."
      >
        {pendingCalculation ? (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Upload className="size-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-sm text-foreground">
                  Map file needed
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  A matching IndexedDB copy for <strong>&ldquo;{pendingCalculation.name}&rdquo;</strong> was not found in this browser. Select{" "}
                  <span className="text-primary font-medium">
                    &ldquo;{pendingCalculation.mapName || "Map File"}&rdquo;
                  </span>{" "}
                  once. After that, this browser/device will reopen it directly from local storage.
                </p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="flex items-center justify-between gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPendingCalculation(null)}
              >
                Back to List
              </Button>
              <Button
                type="button"
                size="sm"
                loading={isProcessingUpload}
                loadingText="Loading map..."
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
              >
                <Upload className="size-4" />
                Select Map File
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsLoading(true);
                  }}
                  placeholder="Search by measurement or map name..."
                  className="pl-9 h-9 text-xs"
                />
              </div>
              <Button
                variant="outline"
                size="lg"
                nativeButton={false}
                render={<Link href="/calculations" />}
                className="shrink-0 hidden sm:inline-flex"
                title="View all measurements in table"
              >
                <span>View All</span>
                <ExternalLink />
              </Button>
            </div>

            {isLoading ? (
              <div className="py-14 text-center text-muted-foreground space-y-2">
                <Loader2 className="mx-auto size-6 animate-spin text-primary" />
                <p className="text-xs">Loading measurements...</p>
              </div>
            ) : calculations.length === 0 ? (
              <div className="py-12 text-center space-y-2 rounded-lg border border-dashed p-6">
                <FileQuestion className="mx-auto size-8 text-muted-foreground/60" />
                <h4 className="font-semibold text-sm text-foreground">
                  {searchTerm ? "No results found" : "No saved measurements"}
                </h4>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  {searchTerm
                    ? "Try searching with a different name."
                    : "After drawing plots, tap 'Save' to keep your measurements."}
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {calculations.map((calc) => {
                  const plotCount = calc.plots?.length || 0;
                  const dateStr = formatDate(calc.createdAt);
                  const isOpening = openingCalculationId === calc.id;

                  return (
                    <div
                      key={calc.id}
                      className="group rounded-xl border bg-card p-3.5 sm:p-4 transition-all hover:border-primary/50 hover:bg-muted/20 space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        <LocalMapThumbnail
                          calculationId={calc.id}
                          alt={`${calc.name} map`}
                          className="size-12"
                        />

                        <div className="space-y-1.5 min-w-0 flex-1">
                          <h4 className="font-semibold text-sm text-foreground leading-snug wrap-break-word">
                            {calc.name}
                          </h4>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1 font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                              <Layers className="size-3 text-primary" />
                              {plotCount} {plotCount === 1 ? "Plot" : "Plots"}
                            </span>
                            {calc.mapName && (
                              <span className="inline-flex items-center gap-1 truncate max-w-44 sm:max-w-64" title={calc.mapName}>
                                🗺️ {calc.mapName}
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1 text-muted-foreground/80">
                              <Calendar className="size-3" />
                              {dateStr}
                            </span>
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive/80 hover:text-destructive hover:bg-destructive/10 shrink-0"
                          onClick={() => setDeletingId(calc.id)}
                          title="Delete"
                        >
                          <Trash2 />
                        </Button>
                      </div>

                      <div className="flex items-center justify-end pt-2 border-t border-border/50">
                        <Button
                          type="button"
                          variant="default"
                          size="sm"
                          onClick={() => void handleSelectCalculation(calc)}
                          loading={isOpening}
                          loadingText="Opening..."
                          className="w-full sm:w-auto"
                        >
                          <span>Load</span>
                          <ArrowRight />
                        </Button>
                      </div>
                    </div>
                  );
                })}

                <div ref={sentinelRef} className="py-3 text-center min-h-8">
                  {isLoadingMore && (
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <Loader2 className="size-4 animate-spin text-primary" />
                      <span>Loading more measurements...</span>
                    </div>
                  )}
                  {!hasMore && calculations.length > 0 && (
                    <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground/70 py-1">
                      <CheckCircle2 className="size-3.5 text-primary/70" />
                      <span>All {totalCount} measurements displayed</span>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </ModalWrapper>

      <ConfirmationModal
        open={!!deletingId}
        onOpenChange={(val) => !val && setDeletingId(null)}
        title="Delete measurement?"
        description="This measurement and all its associated plots will be permanently removed."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDelete}
      />
    </>
  );
}

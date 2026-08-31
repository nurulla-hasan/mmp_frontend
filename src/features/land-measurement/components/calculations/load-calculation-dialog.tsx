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
  SuccessToast,
  ErrorToast,
  formatDate,
  toBengaliDigits,
} from "@/lib/utils";
import { useMapStore } from "@/features/land-measurement/store/useMapStore";
import {
  getCalculationsAction,
  getCalculationByIdAction,
  deleteCalculationAction,
} from "@/features/land-measurement/actions/calculation.action";
import { calculatePolygonData } from "@/features/land-measurement/utils/calculations";
import { PLOT_COLOR_PALETTE } from "@/features/land-measurement/utils/canvas";
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
    image,
    setPlots,
    setScale,
    processFile,
  } = useMapStore(
    useShallow((s) => ({
      image: s.image,
      setPlots: s.setPlots,
      setScale: s.setScale,
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

  // Pending calculation waiting for map upload
  const [pendingCalculation, setPendingCalculation] = useState<TCalculation | null>(null);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);

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
      if (scaleValue) {
        setScale(scaleValue);
      }

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
          name: p.plotNumber || `প্লট ${toBengaliDigits(idx + 1)}`,
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
      SuccessToast(`"${calc.name}" পরিমাপ সফলভাবে ক্যানভাসে লোড হয়েছে!`);
      if (typeof window !== "undefined" && window.location.search.includes("calculationId")) {
        window.history.replaceState(null, "", window.location.pathname);
      }
      handleOpenChange(false);
    },
    [handleOpenChange, setPlots, setScale],
  );

  const handleSelectCalculation = useCallback(
    (calc: TCalculation) => {
      if (image) {
        applyCalculationPlots(calc);
      } else {
        setPendingCalculation(calc);
      }
    },
    [applyCalculationPlots, image],
  );

  // Initial & Search fetch in effect
  useEffect(() => {
    if (!open) return;

    let ignore = false;

    if (initialCalculationId) {
      getCalculationByIdAction(initialCalculationId).then((res) => {
        if (!ignore && res.success && res.data) {
          handleSelectCalculation(res.data);
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
          ErrorToast("সংরক্ষিত পরিমাপ তালিকা লোড করা সম্ভব হয়নি।");
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

  // Fetch Next Page for Infinite Scroll
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
      ErrorToast("পরবর্তী পরিমাপগুলো লোড করতে সমস্যা হয়েছে।");
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoading, isLoadingMore, page, searchTerm]);

  // Hook for Infinite Scroll (uses viewport/modal boundary)
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
        applyCalculationPlots(calcToApply);
      }
    } catch {
      ErrorToast("ম্যাপ ফাইল প্রসেস করতে সমস্যা হয়েছে।");
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
        SuccessToast("পরিমাপ সফলভাবে মুছে ফেলা হয়েছে।");
      } else {
        ErrorToast(res.message || "মুছতে সমস্যা হয়েছে।");
      }
    } catch {
      ErrorToast("পরিমাপ মুছতে সমস্যা হয়েছে।");
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
        title="সংরক্ষিত পরিমাপসমূহ"
        description="আপনার পূর্বে সংরক্ষিত পরিমাপ নির্বাচন করে ক্যানভাসে পুনরায় লোড করুন।"
      >
        {/* Pending Map Upload State */}
        {pendingCalculation ? (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Upload className="size-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-sm text-foreground">
                  ম্যাপ ইমেজ আপলোড প্রয়োজন
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong>&ldquo;{pendingCalculation.name}&rdquo;</strong> পরিমাপটি লোড করার জন্য{" "}
                  <span className="text-primary font-medium">
                    &ldquo;{pendingCalculation.mapName || "ম্যাপ ফাইল"}&rdquo;
                  </span>{" "}
                  ইমেজটি আপলোড করুন।
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
                তালিকায় ফিরে যান
              </Button>
              <Button
                type="button"
                size="sm"
                loading={isProcessingUpload}
                loadingText="ম্যাপ লোড হচ্ছে..."
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
              >
                <Upload className="size-4" />
                ম্যাপ ফাইল নির্বাচন করুন
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            {/* Header Controls: Search & Meta Bar */}
            <div className="flex items-center justify-between gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsLoading(true);
                  }}
                  placeholder="পরিমাপ বা ম্যাপের নাম দিয়ে খুঁজুন..."
                  className="pl-9 h-9 text-xs"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={<Link href="/calculations" />}
                className="h-9 px-3 text-xs gap-1.5 shrink-0 hidden sm:flex"
                title="সব পরিমাপ টেবিল আকারে দেখুন"
              >
                <span>সব দেখুন</span>
                <ExternalLink className="size-3.5" />
              </Button>
            </div>

            {/* List Body with Infinite Scroll */}
            {isLoading ? (
              <div className="py-14 text-center text-muted-foreground space-y-2">
                <Loader2 className="mx-auto size-6 animate-spin text-primary" />
                <p className="text-xs">পরিমাপ লোড হচ্ছে...</p>
              </div>
            ) : calculations.length === 0 ? (
              <div className="py-12 text-center space-y-2 rounded-lg border border-dashed p-6">
                <FileQuestion className="mx-auto size-8 text-muted-foreground/60" />
                <h4 className="font-semibold text-sm text-foreground">
                  {searchTerm ? "কোনো ফলাফল পাওয়া যায়নি" : "কোনো সংরক্ষিত পরিমাপ নেই"}
                </h4>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  {searchTerm
                    ? "ভিন্ন কোনো নাম লিখে অনুসন্ধান করুন।"
                    : "প্লট আঁকার পর “সেভ করুন” বাটনে ক্লিক করে পরিমাপ সংরক্ষণ করতে পারেন।"}
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {calculations.map((calc) => {
                  const plotCount = calc.plots?.length || 0;
                  const dateStr = formatDate(calc.createdAt);

                  return (
                    <div
                      key={calc.id}
                      className="group rounded-xl border bg-card p-3.5 sm:p-4 transition-all hover:border-primary/50 hover:bg-muted/20 space-y-3"
                    >
                      {/* Top Row: Title, Plot Count, Map and Delete Button */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <h4 className="font-semibold text-sm text-foreground leading-snug wrap-break-word">
                            {calc.name}
                          </h4>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1 font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                              <Layers className="size-3 text-primary" />
                              {toBengaliDigits(plotCount)}টি প্লট
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
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>

                      {/* Bottom Row: Load Action Button */}
                      <div className="flex items-center justify-end pt-2 border-t border-border/50">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleSelectCalculation(calc)}
                          className="w-full sm:w-auto gap-1.5 text-xs font-medium"
                        >
                          লোড করুন
                          <ArrowRight className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {/* Infinite Scroll Sentinel / Loading Indicator */}
                <div ref={sentinelRef} className="py-3 text-center min-h-8">
                  {isLoadingMore && (
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <Loader2 className="size-4 animate-spin text-primary" />
                      <span>আরও পরিমাপ লোড হচ্ছে...</span>
                    </div>
                  )}
                  {!hasMore && calculations.length > 0 && (
                    <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground/70 py-1">
                      <CheckCircle2 className="size-3.5 text-primary/70" />
                      <span>সবগুলো ({toBengaliDigits(totalCount)}টি) পরিমাপ দেখানো হয়েছে</span>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </ModalWrapper>

      {/* Confirmation Modal for deletion */}
      <ConfirmationModal
        open={!!deletingId}
        onOpenChange={(val) => !val && setDeletingId(null)}
        title="পরিমাপটি মুছে ফেলতে চান?"
        description="এই পরিমাপ এবং এর সাথে সম্পর্কিত সমস্ত প্লট স্থায়ীভাবে মুছে ফেলা হবে।"
        confirmText="মুছে ফেলুন"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDelete}
      />
    </>
  );
}

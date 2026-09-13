"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { FileText, Map as MapIcon, Trash2, Upload } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/common/confirmation-modal";
import { ModalWrapper } from "@/components/common/modal-wrapper";
import { SuccessToast, ErrorToast, formatDate, toBengaliDigits } from "@/lib/utils";
import { deleteCalculationAction } from "@/features/land-measurement/actions/calculation.action";
import { LocalMapThumbnail } from "@/features/land-measurement/components/LocalMapThumbnail";
import { useMapStore } from "@/features/land-measurement/store/useMapStore";
import { calculatePolygonData } from "@/features/land-measurement/utils/calculations";
import { PLOT_COLOR_PALETTE } from "@/features/land-measurement/utils/canvas";
import {
  deleteLocalCalculationAssets,
  getLocalCalculationMap,
  saveLocalCalculationMap,
  saveLocalCalculationThumbnailFromImage,
} from "@/features/land-measurement/utils/localMapStorage";
import type { TCalculation } from "@/interface/calculation";
import type { PlotRecord } from "@/features/land-measurement/types/map";

function CalculationActions({ calculation }: { calculation: TCalculation }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  const applyCalculationAndRedirect = () => {
    const scaleValue = calculation.scalePxPerUnit || null;
    const store = useMapStore.getState();
    store.setScale(scaleValue);

    const loadedPlots: PlotRecord[] = (calculation.plots || []).map((p, idx) => {
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

    store.setPlots(loadedPlots);
    store.setCurrentProjectId(calculation.id);
    SuccessToast(`"${calculation.name}" পরিমাপ সফলভাবে লোড হয়েছে!`);
    router.push("/tools/land-measurement");
  };

  const currentCanvasMatchesCalculation = () => {
    const state = useMapStore.getState();
    if (!state.image || !state.selectedFile) return false;
    if (state.selectedFile.name !== calculation.mapName) return false;

    const expectedWidth = Number(calculation.imageWidth || 0);
    const expectedHeight = Number(calculation.imageHeight || 0);
    const widthMatches = !expectedWidth || expectedWidth === state.image.naturalWidth;
    const heightMatches = !expectedHeight || expectedHeight === state.image.naturalHeight;
    return widthMatches && heightMatches;
  };

  const cacheThumbnailFromCurrentImage = async () => {
    const currentImage = useMapStore.getState().image;
    if (!currentImage) return;
    try {
      await saveLocalCalculationThumbnailFromImage(calculation.id, currentImage);
    } catch (error: unknown) {
      console.error("Could not cache saved-map thumbnail:", error);
    }
  };

  const handleOpenInMap = async () => {
    setIsOpening(true);
    try {
      const localMap = await getLocalCalculationMap(calculation.id);
      if (localMap) {
        const success = await useMapStore.getState().processFile(localMap);
        if (success) {
          await cacheThumbnailFromCurrentImage();
          applyCalculationAndRedirect();
          return;
        }
      }

      if (currentCanvasMatchesCalculation()) {
        const currentFile = useMapStore.getState().selectedFile;
        if (currentFile) {
          try {
            await saveLocalCalculationMap(calculation.id, currentFile);
          } catch (error: unknown) {
            console.error("Could not cache current map for saved measurement:", error);
          }
        }
        await cacheThumbnailFromCurrentImage();
        applyCalculationAndRedirect();
        return;
      }

      setIsUploadModalOpen(true);
    } catch (error: unknown) {
      console.error("Could not restore saved local map:", error);
      setIsUploadModalOpen(true);
    } finally {
      setIsOpening(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const success = await useMapStore.getState().processFile(file);
      if (success) {
        try {
          await saveLocalCalculationMap(calculation.id, file);
        } catch (error: unknown) {
          console.error("Could not cache selected map for saved measurement:", error);
        }
        await cacheThumbnailFromCurrentImage();
        setIsUploadModalOpen(false);
        applyCalculationAndRedirect();
      }
    } catch {
      ErrorToast("ম্যাপ ফাইল লোড করতে সমস্যা হয়েছে।");
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = () => {
    startDeleteTransition(async () => {
      try {
        const res = await deleteCalculationAction(calculation.id);
        if (res.success) {
          try {
            await deleteLocalCalculationAssets(calculation.id);
          } catch (error: unknown) {
            console.error("Could not delete local measurement assets:", error);
          }
          SuccessToast("পরিমাপ সফলভাবে মুছে ফেলা হয়েছে।");
          setIsDeleteModalOpen(false);
          router.refresh();
        } else {
          ErrorToast(res.message || "মুছতে সমস্যা হয়েছে।");
        }
      } catch {
        ErrorToast("পরিমাপ মুছতে সমস্যা হয়েছে।");
      }
    });
  };

  return (
    <div className="flex justify-end items-center gap-1.5">
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 text-xs"
        onClick={() => void handleOpenInMap()}
        loading={isOpening}
        loadingText="খুলছে..."
      >
        <MapIcon className="size-3.5" />
        ম্যাপে খুলুন
      </Button>

      <ModalWrapper
        open={isUploadModalOpen}
        onOpenChange={setIsUploadModalOpen}
        title="ম্যাপ ফাইল আপলোড করুন"
        description={`"${calculation.name}" পরিমাপটি ক্যানভাসে দেখতে হলে এর মূল ম্যাপ ইমেজটি প্রয়োজন।`}
      >
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Upload className="size-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-sm text-foreground">
                ম্যাপ ইমেজ নির্বাচন করুন
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                অনুগ্রহ করে{" "}
                <span className="text-primary font-semibold">
                  &ldquo;{calculation.mapName || "ম্যাপ ফাইল"}&rdquo;
                </span>{" "}
                সিলেক্ট করুন। একই ব্রাউজারে একবার নির্বাচন করলে পরেরবার ম্যাপটি স্বয়ংক্রিয়ভাবে পাওয়া যাবে।
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={handleFileUpload}
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsUploadModalOpen(false)}
            >
              বাতিল
            </Button>
            <Button
              type="button"
              loading={isProcessing}
              loadingText="ম্যাপ প্রসেস হচ্ছে..."
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              <Upload className="size-4" />
              ম্যাপ ফাইল নির্বাচন করুন
            </Button>
          </div>
        </div>
      </ModalWrapper>

      <ConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="পরিমাপটি মুছে ফেলতে চান?"
        description={`"${calculation.name}" পরিমাপ এবং এর সমস্ত প্লট স্থায়ীভাবে মুছে ফেলা হবে।`}
        confirmText="মুছে ফেলুন"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        trigger={
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-destructive hover:bg-destructive/10"
            title="মুছে ফেলুন"
          >
            <Trash2 className="size-4" />
          </Button>
        }
      />
    </div>
  );
}

export const calculationColumns: ColumnDef<TCalculation>[] = [
  {
    accessorKey: "name",
    header: "নাম",
    cell: ({ row }) => (
      <div className="flex min-w-52 items-center gap-3">
        <LocalMapThumbnail
          calculationId={row.original.id}
          alt={`${row.original.name} map`}
          className="size-11"
        />
        <div className="min-w-0 font-medium text-foreground">
          <div className="truncate">{row.original.name}</div>
          <div className="mt-0.5 max-w-52 truncate text-xs font-normal text-muted-foreground">
            {row.original.mapName || "ম্যাপ ফাইল"}
          </div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "তারিখ",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {formatDate(row.original.createdAt)}
      </span>
    ),
  },
  {
    accessorKey: "mapName",
    header: "ম্যাপের নাম",
    cell: ({ row }) => (
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <FileText className="size-4 shrink-0 text-muted-foreground/70" />
        {row.original.mapName || "ম্যাপ ফাইল"}
      </span>
    ),
  },
  {
    accessorKey: "scalePxPerUnit",
    header: "স্কেল",
    cell: ({ row }) => {
      const scale = row.original.scalePxPerUnit;
      return (
        <Badge variant="secondary">
          {scale ? `১ px ≈ ${(1 / scale).toFixed(2)} ft` : "লিংক স্কেল"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "plots",
    header: "মোট দাগ",
    cell: ({ row }) => {
      const count = row.original.plots?.length || 0;
      return (
        <span className="text-sm tabular-nums text-foreground">
          {toBengaliDigits(count)} টি
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "অ্যাকশন",
    meta: { headerClassName: "text-right" },
    cell: ({ row }) => <CalculationActions calculation={row.original} />,
  },
];

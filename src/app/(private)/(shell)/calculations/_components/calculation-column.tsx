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
import { useMapStore } from "@/features/land-measurement/store/useMapStore";
import { calculatePolygonData } from "@/features/land-measurement/utils/calculations";
import { PLOT_COLOR_PALETTE } from "@/features/land-measurement/utils/canvas";
import type { TCalculation } from "@/interface/calculation";
import type { PlotRecord } from "@/features/land-measurement/types/map";

function CalculationActions({ calculation }: { calculation: TCalculation }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const applyCalculationAndRedirect = () => {
    const scaleValue = calculation.scalePxPerUnit || null;
    if (scaleValue) {
      useMapStore.getState().setScale(scaleValue);
    }

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

    useMapStore.getState().setPlots(loadedPlots);
    SuccessToast(`"${calculation.name}" পরিমাপ সফলভাবে লোড হয়েছে!`);
    router.push("/tools/land-measurement");
  };

  const handleOpenInMap = () => {
    const currentImage = useMapStore.getState().image;
    if (currentImage) {
      applyCalculationAndRedirect();
    } else {
      setIsUploadModalOpen(true);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const success = await useMapStore.getState().processFile(file);
      if (success) {
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
          SuccessToast("পরিমাপ সফলভাবে মুছে ফেলা হয়েছে।");
          setIsDeleteModalOpen(false);
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
        onClick={handleOpenInMap}
      >
        <MapIcon className="size-3.5" />
        ম্যাপে খুলুন
      </Button>

      {/* Upload Modal when map is not in canvas */}
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
                সিলেক্ট করুন। আপলোড সম্পন্ন হলে ক্যানভাসে আপনার আঁকা সমস্ত দাগ স্বয়ংক্রিয়ভাবে প্রদর্শিত হবে।
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
              size="sm"
              onClick={() => setIsUploadModalOpen(false)}
            >
              বাতিল
            </Button>
            <Button
              type="button"
              size="sm"
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

      {/* Delete Confirmation Modal */}
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
      <div className="font-medium text-foreground">{row.original.name}</div>
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

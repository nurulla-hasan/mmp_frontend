"use client";

import { useState } from "react";
import { BookmarkCheck, MapPin, Calculator, Layers } from "lucide-react";
import { useShallow } from "zustand/shallow";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModalWrapper } from "@/components/common/modal-wrapper";
import { SuccessToast, ErrorToast, WarningToast, toBengaliDigits } from "@/lib/utils";
import { useMapStore } from "@/features/land-measurement/store/useMapStore";
import { saveCalculationAction } from "@/features/land-measurement/actions/calculation.action";

interface SaveCalculationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SaveCalculationDialog({
  open,
  onOpenChange,
}: SaveCalculationDialogProps) {
  const {
    plots,
    scale,
    image,
    imageName,
    selectedFile,
  } = useMapStore(
    useShallow((s) => ({
      plots: s.plots,
      scale: s.scale,
      image: s.image,
      imageName: s.imageName,
      selectedFile: s.selectedFile,
    })),
  );

  const defaultName = `পরিমাপ — ${new Date().toLocaleDateString("bn-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })}`;

  const [name, setName] = useState(defaultName);
  const [isSaving, setIsSaving] = useState(false);

  const totalShotok = plots.reduce((sum, p) => sum + (p.results?.shotok || 0), 0);
  const totalKatha = plots.reduce((sum, p) => sum + (p.results?.katha || 0), 0);
  const mapFileName = selectedFile?.name || imageName || "ম্যাপ ফাইল";

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      WarningToast("দয়া করে পরিমাপের একটি নাম দিন।");
      return;
    }

    if (plots.length === 0) {
      WarningToast("সেভ করার জন্য অন্তত একটি প্লট আঁকা প্রয়োজন।");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: name.trim(),
        mapName: mapFileName,
        scaleType: "link",
        scalePxPerUnit: scale || undefined,
        imageWidth: image?.naturalWidth,
        imageHeight: image?.naturalHeight,
        plots: plots.map((p, idx) => ({
          plotNumber: p.name || `প্লট ${toBengaliDigits(idx + 1)}`,
          points: p.points,
          areaSqLink: p.results?.sqft ? p.results.sqft * 2.29568 : 0,
          areaShotok: p.results?.shotok || 0,
          areaKatha: p.results?.katha || 0,
        })),
      };

      const result = await saveCalculationAction(payload);
      if (!result.success) {
        ErrorToast(result.message || "পরিমাপ সেভ করতে সমস্যা হয়েছে।");
        return;
      }

      SuccessToast(`"${name}" পরিমাপ সফলভাবে সেভ করা হয়েছে!`);
      onOpenChange(false);
    } catch (err: unknown) {
      ErrorToast(
        err instanceof Error ? err.message : "সেভ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ModalWrapper
      open={open}
      onOpenChange={onOpenChange}
      title="পরিমাপ সেভ করুন"
      description="বর্তমান ম্যাপ ও অঙ্কিত প্লটসমূহ আপনার প্রোফাইলে ক্যালকুলেশন হিসেবে সংরক্ষিত থাকবে।"
    >
      <form onSubmit={handleSave} className="space-y-4">
        {/* Calculation Summary Card */}
        <div className="rounded-lg border bg-muted/40 p-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5 text-primary" />
              ম্যাপ ফাইল:
            </span>
            <span className="font-medium text-foreground truncate max-w-50">
              {mapFileName}
            </span>
          </div>

          <div className="flex items-center justify-between text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Layers className="size-3.5 text-primary" />
              মোট প্লট:
            </span>
            <span className="font-semibold text-foreground">
              {plots.length}টি
            </span>
          </div>

          <div className="flex items-center justify-between text-muted-foreground border-t pt-1.5">
            <span className="flex items-center gap-1.5">
              <Calculator className="size-3.5 text-primary" />
              মোট ক্ষেত্রফল:
            </span>
            <span className="font-semibold text-primary">
              {totalShotok.toFixed(2)} শতক ({totalKatha.toFixed(2)} কাঠা)
            </span>
          </div>
        </div>

        {/* Input Name */}
        <div className="space-y-1.5">
          <Label htmlFor="calc-name" className="text-xs font-medium">
            পরিমাপের নাম *
          </Label>
          <Input
            id="calc-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="যেমন: মৌজা ৪২ - প্লট হিসাব"
            className="w-full"
            autoFocus
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            বাতিল
          </Button>
          <Button
            type="submit"
            disabled={plots.length === 0}
            loading={isSaving}
            loadingText="সেভ হচ্ছে..."
          >
            <BookmarkCheck className="size-4" />
            সেভ করুন
          </Button>
        </div>
      </form>
    </ModalWrapper>
  );
}

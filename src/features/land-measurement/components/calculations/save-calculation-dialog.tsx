"use client";

import { useState } from "react";
import { BookmarkCheck, MapPin, Calculator, Layers } from "lucide-react";
import { useShallow } from "zustand/shallow";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModalWrapper } from "@/components/common/modal-wrapper";
import { SuccessToast, ErrorToast, WarningToast } from "@/lib/utils";
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

  const defaultName = `Measurement — ${new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;

  const [name, setName] = useState(defaultName);
  const [isSaving, setIsSaving] = useState(false);

  const totalShotok = plots.reduce((sum, p) => sum + (p.results?.shotok || 0), 0);
  const totalKatha = plots.reduce((sum, p) => sum + (p.results?.katha || 0), 0);
  const mapFileName = selectedFile?.name || imageName || "Map File";

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      WarningToast("Please enter a name for the measurement.");
      return;
    }

    if (plots.length === 0) {
      WarningToast("At least one plot is required to save.");
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
          plotNumber: p.name || `Plot ${idx + 1}`,
          points: p.points,
          areaSqLink: p.results?.sqft ? p.results.sqft * 2.29568 : 0,
          areaShotok: p.results?.shotok || 0,
          areaKatha: p.results?.katha || 0,
        })),
      };

      const result = await saveCalculationAction(payload);
      if (!result.success) {
        ErrorToast(result.message || "Failed to save measurement.");
        return;
      }

      SuccessToast(`"${name}" measurement saved successfully!`);
      onOpenChange(false);
    } catch (err: unknown) {
      ErrorToast(
        err instanceof Error ? err.message : "Failed to save. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ModalWrapper
      open={open}
      onOpenChange={onOpenChange}
      title="Save Measurement"
      description="The current map and drawn plots will be saved to your profile calculations."
    >
      <form onSubmit={handleSave} className="space-y-4">
        {/* Calculation Summary Card */}
        <div className="rounded-lg border bg-muted/40 p-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5 text-primary" />
              Map File:
            </span>
            <span className="font-medium text-foreground truncate max-w-50">
              {mapFileName}
            </span>
          </div>

          <div className="flex items-center justify-between text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Layers className="size-3.5 text-primary" />
              Total Plots:
            </span>
            <span className="font-semibold text-foreground">
              {plots.length} {plots.length === 1 ? "plot" : "plots"}
            </span>
          </div>

          <div className="flex items-center justify-between text-muted-foreground border-t pt-1.5">
            <span className="flex items-center gap-1.5">
              <Calculator className="size-3.5 text-primary" />
              Total Area:
            </span>
            <span className="font-semibold text-primary">
              {totalShotok.toFixed(2)} shotok ({totalKatha.toFixed(2)} katha)
            </span>
          </div>
        </div>

        {/* Input Name */}
        <div className="space-y-1.5">
          <Label htmlFor="calc-name" className="text-xs font-medium">
            Measurement Name *
          </Label>
          <Input
            id="calc-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Mouza 42 - Plot Calculation"
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
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={plots.length === 0}
            loading={isSaving}
            loadingText="Saving..."
          >
            <BookmarkCheck className="size-4" />
            Save
          </Button>
        </div>
      </form>
    </ModalWrapper>
  );
}

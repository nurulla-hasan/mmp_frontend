"use client";

import { useState } from "react";
import { BookmarkCheck, FolderOpen } from "lucide-react";
import { useShallow } from "zustand/shallow";

import { Button } from "@/components/ui/button";
import { useMapStore } from "@/features/land-measurement/store/useMapStore";
import { SaveCalculationDialog } from "../calculations/save-calculation-dialog";
import { LoadCalculationDialog } from "../calculations/load-calculation-dialog";

export const SidebarPlottingPanel = () => {
  const {
    mode,
    image,
    scale,
    plots,
    plotsHistory,
    plotsFuture,
    startPlotDrawing,
    undoPlotAction,
    redoPlotAction,
    confirmClearPlot,
  } = useMapStore(
    useShallow((s) => ({
      mode: s.mode,
      image: s.image,
      scale: s.scale,
      plots: s.plots,
      plotsHistory: s.plotsHistory,
      plotsFuture: s.plotsFuture,
      startPlotDrawing: s.startPlotDrawing,
      undoPlotAction: s.undoPlotAction,
      redoPlotAction: s.redoPlotAction,
      confirmClearPlot: s.confirmClearPlot,
    })),
  );

  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [isLoadOpen, setIsLoadOpen] = useState(false);

  return (
    <div id="step-drawing" className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          3. Draw & Save Plots
        </label>
        <Button
          size="sm"
          onClick={startPlotDrawing}
          disabled={!image || !scale || mode === "drawing_plot" || mode === "calibrating"}
          className="w-full"
        >
          {mode === "drawing_plot"
            ? "Click corners on map"
            : plots.length > 0
              ? "Draw Another Plot"
              : "Draw Plot"}
        </Button>
      </div>

      <div className="text-xs text-muted-foreground">
        {plots.length === 1
          ? "1 plot completed"
          : plots.length > 1
            ? `${plots.length} plots completed`
            : ""}
      </div>

      {(plots.length > 0 || plotsFuture.length > 0) && mode !== "drawing_plot" && (
        <div className="flex gap-2">
          <Button
            onClick={undoPlotAction}
            disabled={plotsHistory.length === 0}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            Undo
          </Button>
          <Button
            onClick={redoPlotAction}
            disabled={plotsFuture.length === 0}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            Redo
          </Button>
          <Button
            onClick={() => confirmClearPlot()}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            Clear All
          </Button>
        </div>
      )}

      {plots.length > 0 && mode !== "manual_divide_plot" && mode !== "drawing_plot" && (
        <div className="space-y-2">
          <Button
            onClick={useMapStore.getState().startManualDivide}
            variant="secondary"
            size="sm"
            className="w-full"
          >
            Divide Plot
          </Button>

          <Button
            onClick={() => setIsSaveOpen(true)}
            variant="default"
            size="sm"
            className="w-full"
          >
            <BookmarkCheck />
            <span>Save Measurement</span>
          </Button>
        </div>
      )}

      <div className="border-t pt-2">
        <Button
          onClick={() => setIsLoadOpen(true)}
          variant="outline"
          size="sm"
          className="w-full text-muted-foreground"
        >
          <FolderOpen className="text-primary" />
          <span>Open Saved Measurements</span>
        </Button>
      </div>

      <SaveCalculationDialog open={isSaveOpen} onOpenChange={setIsSaveOpen} />
      <LoadCalculationDialog open={isLoadOpen} onOpenChange={setIsLoadOpen} />
    </div>
  );
};

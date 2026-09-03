import { memo, useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { useShallow } from 'zustand/shallow';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { X, Undo2, Redo2, ChevronLeft, ChevronRight, ChevronDown, Plus, Check } from 'lucide-react';
import { calculatePolygonData } from '@/features/land-measurement/utils/calculations';
import { splitPolygonByPolyline } from '@/features/land-measurement/utils/polygonDivision';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { useMapStore } from '@/features/land-measurement/store/useMapStore';

export const SidebarControls = memo(function SidebarControls() {
  const {
    mode,
    setMode,
    calibrationLine,
    setCalibrationLine,
    plotPoints,
    plotPointsFuture,
    plots,
    setIsDrawing,
    setIsModalOpen,
    setSnapHint,
    undoPlotAction,
    redoPlotAction,
    pendingAction,
    setPendingAction,
    executePendingAction,
    manualDividePlotId,
    manualCutLine,
    nudgeTarget,
    setNudgeTarget,
    nudgeManualCutLine,
    scale,
    setManualCutLine,
    executeManualDivide,
    cancelManualDivide,
    showManualScale,
    setShowManualScale,
    manualScale,
    setManualScale,
    handleManualScaleSubmit,
    addCenterPoint,
  } = useMapStore(
    useShallow((s) => ({
      mode: s.mode,
      setMode: s.setMode,
      calibrationLine: s.calibrationLine,
      setCalibrationLine: s.setCalibrationLine,
      plotPoints: s.plotPoints,
      plotPointsFuture: s.plotPointsFuture,
      plots: s.plots,
      plotsHistory: s.plotsHistory,
      plotsFuture: s.plotsFuture,
      setIsDrawing: s.setIsDrawing,
      setIsModalOpen: s.setIsModalOpen,
      setSnapHint: s.setSnapHint,
      undoPlotAction: s.undoPlotAction,
      redoPlotAction: s.redoPlotAction,
      pendingAction: s.pendingAction,
      setPendingAction: s.setPendingAction,
      executePendingAction: s.executePendingAction,
      confirmClearPlot: s.confirmClearPlot,
      manualDividePlotId: s.manualDividePlotId,
      manualCutLine: s.manualCutLine,
      nudgeTarget: s.nudgeTarget,
      setNudgeTarget: s.setNudgeTarget,
      nudgeManualCutLine: s.nudgeManualCutLine,
      scale: s.scale,
      setManualCutLine: s.setManualCutLine,
      executeManualDivide: s.executeManualDivide,
      cancelManualDivide: s.cancelManualDivide,
      showManualScale: s.showManualScale,
      setShowManualScale: s.setShowManualScale,
      manualScale: s.manualScale,
      setManualScale: s.setManualScale,
      handleManualScaleSubmit: s.handleManualScaleSubmit,
      addCenterPoint: s.addCenterPoint,
    })),
  );

  const [calibrationUndoStack, setCalibrationUndoStack] = useState<number[][]>([]);
  const [calibrationRedoStack, setCalibrationRedoStack] = useState<number[][]>([]);
  const prevCalibrationLineRef = useRef<number[]>([]);
  const isUndoRedoingRef = useRef(false);

  // Multi-touch-first point addition: fires instantly on pointerdown/touchstart
  // while dragging the map with another finger, debouncing duplicate browser clicks.
  const lastAddPointTriggerRef = useRef(0);
  const handleAddCenterPoint = useCallback(
    (e: React.SyntheticEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const now = performance.now();
      if (now - lastAddPointTriggerRef.current < 150) return;
      lastAddPointTriggerRef.current = now;
      addCenterPoint();
    },
    [addCenterPoint]
  );

  // Track point additions → push previous state to undo stack
  useEffect(() => {
    const prev = prevCalibrationLineRef.current;
    if (calibrationLine.length > prev.length) {
      if (!isUndoRedoingRef.current) {
        setCalibrationUndoStack((stack) => [...stack, prev]);
        setCalibrationRedoStack([]);
      }
      prevCalibrationLineRef.current = calibrationLine;
    } else if (calibrationLine.length < prev.length) {
      prevCalibrationLineRef.current = calibrationLine;
    }
  }, [calibrationLine]);

  const manualCutSplits = useMemo(() => {
    if (!manualDividePlotId || !manualCutLine || manualCutLine.length < 2 || !scale) return null;
    const plot = plots.find((item) => item.id === manualDividePlotId);
    if (!plot) return null;
    const splits = splitPolygonByPolyline(plot.points, manualCutLine);
    if (!splits || splits.poly1.length < 3 || splits.poly2.length < 3) return null;
    const resA = calculatePolygonData(splits.poly1, scale);
    const resB = calculatePolygonData(splits.poly2, scale);
    if (!resA || !resB) return null;
    return { resA, resB };
  }, [manualDividePlotId, manualCutLine, plots, scale]);

  const isManualCutValid = Boolean(manualCutSplits);

  const _handleModalSubmit = (val: number) => {
    setManualScale(val.toString());
    setIsModalOpen(false);
    setMode('none');
  };

  return (
    <>
      {mode === 'calibrating' && (
        <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 w-[calc(100vw-1rem)] max-w-md p-2 rounded-2xl bg-card/95 backdrop-blur-md border border-border shadow-2xl z-50 flex items-center justify-between gap-1.5">
          {showManualScale ? (
            <form onSubmit={handleManualScaleSubmit} className="flex items-center gap-1.5 w-full">
              <Button
                variant="ghost"
                size="icon-sm"
                type="button"
                onClick={() => setShowManualScale(false)}
                title="Calibrate by drawing scale line"
              >
                <ChevronLeft />
              </Button>
              <Input
                type="number"
                step="any"
                placeholder="Feet per pixel (e.g. 2.30)"
                value={manualScale}
                onChange={(e) => setManualScale(e.target.value)}
                className="h-7 text-xs font-mono bg-background flex-1 min-w-0"
                autoFocus
                required
              />
              <Button variant="default" size="sm" type="submit">
                <Check />
                <span>Set</span>
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                type="button"
                onClick={() => { setShowManualScale(false); setMode('none'); }}
                title="Cancel"
              >
                <X />
              </Button>
            </form>
          ) : (
            <>
              {/* Cancel Button */}
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => { setCalibrationLine([]); setIsDrawing(false); setMode('none'); }}
                title="Cancel calibration"
              >
                <X />
              </Button>

              {/* Undo / Redo */}
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => {
                  if (calibrationUndoStack.length > 0) {
                    isUndoRedoingRef.current = true;
                    const prevLine = calibrationUndoStack[calibrationUndoStack.length - 1];
                    setCalibrationUndoStack((stack) => stack.slice(0, -1));
                    setCalibrationRedoStack((stack) => [...stack, calibrationLine]);
                    setCalibrationLine(prevLine);
                    setIsDrawing(prevLine.length >= 2);
                    setTimeout(() => { isUndoRedoingRef.current = false; });
                  }
                }}
                disabled={calibrationUndoStack.length === 0}
                title="Undo"
              >
                <Undo2 />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => {
                  if (calibrationRedoStack.length > 0) {
                    isUndoRedoingRef.current = true;
                    const nextLine = calibrationRedoStack[calibrationRedoStack.length - 1];
                    setCalibrationRedoStack((stack) => stack.slice(0, -1));
                    setCalibrationUndoStack((stack) => [...stack, calibrationLine]);
                    setCalibrationLine(nextLine);
                    setIsDrawing(nextLine.length >= 2);
                    setTimeout(() => { isUndoRedoingRef.current = false; });
                  }
                }}
                disabled={calibrationRedoStack.length === 0}
                title="Redo"
              >
                <Redo2 />
              </Button>

              {/* Manual Scale Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowManualScale(true)}
                title="Enter scale value manually"
              >
                Manual
              </Button>

              {calibrationLine.length < 4 ? (
                <Button
                  variant="default"
                  size="sm"
                  onPointerDown={handleAddCenterPoint}
                  onTouchStart={handleAddCenterPoint}
                  onClick={handleAddCenterPoint}
                  className="ml-auto touch-manipulation select-none active:scale-95 transition-transform"
                  title="Add point at crosshair target"
                >
                  <Plus />
                  <span>Add Point</span>
                  <span className="ml-0.5 px-1.5 py-0.2 bg-white/20 rounded-full font-mono text-[10px]">
                    {calibrationLine.length / 2}/2
                  </span>
                </Button>
              ) : (
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <Input
                    id="modal-distance-input"
                    type="number"
                    placeholder="Real distance (ft)"
                    className="h-7 text-xs font-mono bg-background flex-1 min-w-0"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = parseFloat((e.target as HTMLInputElement).value);
                        if (!isNaN(val) && val > 0) {
                          _handleModalSubmit(val);
                        }
                      }
                    }}
                  />
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      const input = document.getElementById('modal-distance-input') as HTMLInputElement;
                      const val = parseFloat(input?.value);
                      if (!isNaN(val) && val > 0) {
                        _handleModalSubmit(val);
                      }
                    }}
                  >
                    <Check />
                    <span>Confirm</span>
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {mode === 'drawing_plot' && (
        <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 w-[calc(100vw-1rem)] max-w-md p-2 rounded-2xl bg-card/95 backdrop-blur-md border border-border shadow-2xl z-50 flex items-center justify-between gap-1.5">
          {/* Cancel */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => { setMode('none'); setIsDrawing(false); setSnapHint(false); }}
            title="Cancel drawing"
          >
            <X />
          </Button>

          {/* Undo / Redo */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={undoPlotAction}
            disabled={plotPoints.length === 0}
            title="Undo"
          >
            <Undo2 />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={redoPlotAction}
            disabled={plotPointsFuture.length === 0}
            title="Redo"
          >
            <Redo2 />
          </Button>

          {/* Add Point */}
          <Button
            variant="default"
            size="sm"
            onPointerDown={handleAddCenterPoint}
            onTouchStart={handleAddCenterPoint}
            onClick={handleAddCenterPoint}
            className="ml-auto touch-manipulation select-none active:scale-95 transition-transform"
            title="Add point at crosshair target"
          >
            <Plus />
            <span>Add Point</span>
            {plotPoints.length > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 bg-white/20 rounded-full font-mono text-[10px]">
                {plotPoints.length}
              </span>
            )}
          </Button>

          {/* Finish Plot */}
          <Button
            variant="default"
            size="sm"
            onClick={() => { setIsModalOpen(true); }}
            disabled={plotPoints.length < 3}
            title="Finish plot (requires at least 3 points)"
          >
            <Check />
            <span>Finish</span>
          </Button>
        </div>
      )}

      {mode === 'manual_divide_plot' && (
        <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 w-[calc(100vw-1rem)] max-w-lg p-2 sm:p-2.5 rounded-2xl bg-card/95 backdrop-blur-md border border-border shadow-2xl z-50 flex flex-col gap-1.5">
          {!manualDividePlotId ? (
            <div className="flex items-center justify-between px-1.5 py-0.5">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <span className="text-amber-600 dark:text-amber-400 font-semibold text-xs">
                  Click on the plot you want to divide
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={cancelManualDivide}
                title="Cancel"
              >
                <X />
              </Button>
            </div>
          ) : (
            <>
              {/* Row 1: Live Area Balance Display & Cancel */}
              <div className="flex items-center justify-between gap-1 px-0.5">
                {manualCutSplits ? (
                  <div className="flex items-center gap-1.5 text-xs font-mono select-none">
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-muted border border-border text-xs">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        1: {manualCutSplits.resA.shotok.toFixed(2)}
                      </span>
                      <span className="text-muted-foreground/40">|</span>
                      <span className="font-bold text-sky-600 dark:text-sky-400">
                        2: {manualCutSplits.resB.shotok.toFixed(2)}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={`h-5 text-[10px] px-1.5 font-mono ${
                        Math.abs(manualCutSplits.resA.shotok - manualCutSplits.resB.shotok) < 0.02
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 font-bold"
                          : "text-muted-foreground bg-muted/40 border-border/40"
                      }`}
                    >
                      Δ {Math.abs(manualCutSplits.resA.shotok - manualCutSplits.resB.shotok).toFixed(2)}
                    </Badge>
                  </div>
                ) : (
                  <span className="text-primary font-medium text-xs">
                    Drag points or nudge to adjust cut line
                  </span>
                )}

                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={cancelManualDivide}
                  className="ml-auto"
                  title="Cancel"
                >
                  <X />
                </Button>
              </div>

              {/* Row 2: Controls (Micro-Nudge, Points, Final Cut) */}
              <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-border/40">
                {/* 1. Micro-Nudge Fine Tuning Controls */}
                <div className="flex items-center gap-0.5 p-0.5 bg-muted rounded-lg border border-border">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => nudgeManualCutLine(-1)}
                    title="Nudge cut line left/backward"
                  >
                    <ChevronLeft />
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger
                      nativeButton={false}
                      render={<div className="inline-flex" />}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        title="Select nudge target"
                      >
                        <span>
                          {nudgeTarget === 'all'
                            ? 'Line'
                            : nudgeTarget === 'start'
                            ? '1st'
                            : '2nd'}
                        </span>
                        <ChevronDown />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      side="top"
                      align="center"
                      sideOffset={8}
                      className="w-28 p-1"
                    >
                      <DropdownMenuItem
                        onClick={() => setNudgeTarget('all')}
                        className={nudgeTarget === 'all' ? 'font-semibold text-primary bg-primary/10' : ''}
                      >
                        Full Line
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setNudgeTarget('start')}
                        className={nudgeTarget === 'start' ? 'font-semibold text-primary bg-primary/10' : ''}
                      >
                        1st Point
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setNudgeTarget('end')}
                        className={nudgeTarget === 'end' ? 'font-semibold text-primary bg-primary/10' : ''}
                      >
                        2nd Point
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => nudgeManualCutLine(1)}
                    title="Nudge cut line right/forward"
                  >
                    <ChevronRight />
                  </Button>
                </div>

                {/* 2. Number of Cut Points (+ / -) */}
                <div className="flex items-center gap-0.5 p-0.5 bg-muted rounded-lg border border-border">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={!manualCutLine || manualCutLine.length <= 2}
                    onClick={() => {
                      if (manualCutLine && manualCutLine.length > 2) {
                        setManualCutLine(manualCutLine.slice(0, -1));
                      }
                    }}
                    title="Decrease cut points"
                  >
                    -
                  </Button>
                  <span className="w-5 text-center font-bold text-xs font-mono">
                    {manualCutLine ? manualCutLine.length : 2}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => {
                      if (manualCutLine && manualCutLine.length >= 2) {
                        let insertIndex = 1;
                        let longestDistance = -1;

                        for (let i = 0; i < manualCutLine.length - 1; i++) {
                          const start = manualCutLine[i];
                          const end = manualCutLine[i + 1];
                          const distance = Math.hypot(end.x - start.x, end.y - start.y);
                          if (distance > longestDistance) {
                            longestDistance = distance;
                            insertIndex = i + 1;
                          }
                        }

                        const start = manualCutLine[insertIndex - 1];
                        const end = manualCutLine[insertIndex];
                        const newPoint = {
                          x: (start.x + end.x) / 2,
                          y: (start.y + end.y) / 2,
                        };

                        setManualCutLine([
                          ...manualCutLine.slice(0, insertIndex),
                          newPoint,
                          ...manualCutLine.slice(insertIndex),
                        ]);
                      }
                    }}
                    title="Increase cut points"
                  >
                    +
                  </Button>
                </div>

                {/* 3. Execute / Final Cut Button */}
                <Button
                  variant="default"
                  size="sm"
                  onClick={executeManualDivide}
                  disabled={!isManualCutValid}
                >
                  Final Cut
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      <AlertDialog open={pendingAction !== null} onOpenChange={(open) => !open && setPendingAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction?.type === 'clearMap'
                ? "Are you sure you want to clear the map and all measurements?"
                : "Are you sure you want to clear all plots?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executePendingAction} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Yes, Clear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});


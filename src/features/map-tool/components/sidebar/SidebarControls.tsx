import { memo, useMemo, useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Trash2, Undo2, Redo2 } from 'lucide-react';
import { splitPolygonByPolyline } from '@/features/map-tool/utils/polygonDivision';
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

import { useMapStore } from '@/features/map-tool/store/useMapStore';

export const SidebarControls = memo(function SidebarControls() {
  const {
    mode,
    setMode,
    calibrationLine,
    setCalibrationLine,
    plotPoints,
    plotPointsFuture,
    plots,
    plotsHistory,
    plotsFuture,
    setIsDrawing,
    setIsModalOpen,
    setSnapHint,
    undoPlotAction,
    redoPlotAction,
    pendingAction,
    setPendingAction,
    executePendingAction,
    confirmClearPlot,
    manualDividePlotId,
    manualCutLine,
    scale,
    setManualCutLine,
    executeManualDivide,
    cancelManualDivide,
    showManualScale,
    setShowManualScale,
    manualScale,
    setManualScale,
    handleManualScaleSubmit,
  } = useMapStore();

  const [calibrationUndoStack, setCalibrationUndoStack] = useState<number[][]>([]);
  const [calibrationRedoStack, setCalibrationRedoStack] = useState<number[][]>([]);
  const prevCalibrationLineRef = useRef<number[]>([]);
  const isUndoRedoingRef = useRef(false);

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

  const isManualCutValid = useMemo(() => {
    if (!manualDividePlotId || !manualCutLine || manualCutLine.length < 2 || !scale) return false;
    const plot = plots.find((item) => item.id === manualDividePlotId);
    if (!plot) return false;
    const splits = splitPolygonByPolyline(plot.points, manualCutLine);
    return Boolean(splits && splits.poly1.length >= 3 && splits.poly2.length >= 3);
  }, [manualDividePlotId, manualCutLine, plots, scale]);

  return (
    <>
      {mode === 'calibrating' && (
        <div className="absolute bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 w-[93%] md:w-auto p-3 rounded-lg bg-background border border-border shadow-xl z-50 flex flex-col gap-2">
          <div className="flex justify-evenly items-center gap-2 w-full">
            <div className='flex gap-2'>
            <Button size="sm" onClick={() => { setCalibrationLine([]); setIsDrawing(false); setMode('none'); }} variant="destructive" title="বাতিল করুন">
              <X />
            </Button>
          </div>

          <div className='flex gap-2'>
            <Button
              size="sm"
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
              variant="secondary"
              title="পূর্বাবস্থায় ফেরান"
            >
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
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
              variant="outline"
              title="পুনরায় ফেরান"
            >
              <Redo2 className="h-4 w-4" />
            </Button>
          </div>

            <div className='flex gap-2'>
              <Button
                size="sm"
                onClick={() => {
                  if (calibrationLine.length >= 4) {
                    setIsDrawing(false);
                    setMode('none');
                    setIsModalOpen(true);
                  }
                }}
                disabled={calibrationLine.length < 4}
              >
                স্কেল নিশ্চিত করুন
              </Button>
              <Button
                size="sm"
                variant={showManualScale ? 'default' : 'outline'}
                onClick={() => setShowManualScale(!showManualScale)}
              >
                ম্যানুয়াল স্কেল
              </Button>
            </div>
          </div>
          
          {showManualScale && (
            <form onSubmit={handleManualScaleSubmit} className="flex gap-2 w-full mt-1">
              <Input
                type="number"
                value={manualScale}
                onChange={(e) => setManualScale(e.target.value)}
                placeholder="পিক্সেল প্রতি ফুট (যেমন: 2.30)"
                className="flex-1 h-8 text-xs"
                step="any"
                min="0.000001"
                required
              />
              <Button size="sm" type="submit" variant="default" className="h-8">সেট করুন</Button>
            </form>
          )}
        </div>
      )}

      {(mode === 'drawing_plot' || plotsHistory.length > 0 || plotsFuture.length > 0 || plots.length > 0) && (
        <div className={`absolute top-4 md:top-auto md:bottom-4 left-1/2 -translate-x-1/2 w-max p-2 md:p-3 rounded-2xl bg-card/95 border border-border shadow-xl z-50 flex items-center gap-4 ${mode !== 'drawing_plot' ? 'md:hidden' : ''}`}>
          <div className='flex gap-1.5'>
            {mode === 'drawing_plot' && (
              <Button size="sm" onClick={() => { setMode('none'); setIsDrawing(false); setSnapHint(false); }} variant="destructive" title="আঁকা বন্ধ করুন">
                <X />
              </Button>
            )}
            <Button size="sm" onClick={() => confirmClearPlot()} disabled={plots.length === 0 && plotPoints.length === 0} variant="outline" title="সব প্লট মুছুন">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className='flex gap-1.5'>
            <Button size="sm" onClick={undoPlotAction} disabled={plotPoints.length === 0 && plotsHistory.length === 0} variant="secondary" title="পূর্বাবস্থায় ফেরান">
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              onClick={redoPlotAction}
              disabled={plotPointsFuture.length === 0 && (plotPoints.length > 0 || plotsFuture.length === 0)}
              variant="outline"
              title="পুনরায় ফেরান"
            >
              <Redo2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {mode === 'manual_divide_plot' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[93%] md:w-auto p-3 rounded-lg bg-background border border-border shadow-xl z-50 flex flex-wrap justify-center items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            {manualDividePlotId ? (
              <span className="text-primary font-semibold px-2">বিন্দুগুলো ড্র্যাগ করে লাইনটি সরান</span>
            ) : (
              <span className="text-amber-600 font-semibold px-2">যে প্লটটি কাটবেন তার ওপর ক্লিক করুন</span>
            )}
          </div>
          {manualDividePlotId && (
            <div className="flex items-center gap-1 bg-muted rounded-lg border">
              <Button
                size="sm"
                variant="ghost"
                className="px-2"
                disabled={!manualCutLine || manualCutLine.length <= 2}
                onClick={() => {
                  if (manualCutLine && manualCutLine.length > 2) {
                    setManualCutLine(manualCutLine.slice(0, -1));
                  }
                }}
              >
                -
              </Button>
              <span className="w-6 text-center font-bold text-sm">
                {manualCutLine ? manualCutLine.length : 2}
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="px-2"
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
              >
                +
              </Button>
            </div>
          )}
          {manualDividePlotId && (
            <Button
              size="sm"
              onClick={executeManualDivide}
              disabled={!isManualCutValid}
              className="bg-primary hover:bg-primary/90 text-white rounded-lg"
            >
              ফাইনাল কাট
            </Button>
          )}
          <Button size="sm" onClick={cancelManualDivide} variant="destructive" className="rounded-lg">বাতিল</Button>
        </div>
      )}

      <AlertDialog open={pendingAction !== null} onOpenChange={(open) => !open && setPendingAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>আপনি কি নিশ্চিত?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction?.type === 'clearMap'
                ? "আপনি কি নিশ্চিত যে আপনি ম্যাপ এবং সমস্ত ডেটা মুছে ফেলতে চান?"
                : "আপনি কি নিশ্চিত যে সব প্লট মুছে ফেলতে চান?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>বাতিল করুন</AlertDialogCancel>
            <AlertDialogAction onClick={executePendingAction} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              হ্যাঁ, মুছে ফেলুন
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});

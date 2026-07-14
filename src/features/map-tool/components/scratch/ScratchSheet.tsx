import { memo, useMemo, useRef, useState } from 'react';
import { useMapStore } from '@/features/map-tool/store/useMapStore';
import type { Point, SavedPlotRecord, ScratchLine } from '@/features/map-tool/types/map';
import {
  PAGE_WIDTH,
  PAGE_HEIGHT,
  SNAP_DISTANCE,
  SNAP_SCREEN_DISTANCE,
  createPlotLayouts,
  closestPointOnPolyline,
  closestPointOnSegment,
  pointInPolygon,
} from '@/features/map-tool/utils/scratchMath';
import { clampNumber } from '@/features/map-tool/utils/geometry';
import { downloadScratchPdf } from '@/features/map-tool/utils/scratchPdf';
import { ScratchSidebar } from './ScratchSidebar';
import { ScratchControls } from './ScratchControls';
import { ScratchPolygons } from './ScratchPolygons';
import { usePanZoom } from '@/hooks/usePanZoom';
import { PlotSheetLayout } from '@/features/map-tool/types/scratch';

type ScratchSheetProps = {
  savedPlots: SavedPlotRecord[];
  onDeleteSavedPlot: (plotId: string) => void;
};

type ScratchRedoAction = {
  line: ScratchLine | null;
  draftAfterRedo: Point | null;
};

type ScratchSnapResult = {
  point: Point;
  isSnapped: boolean;
};

export const ScratchSheet = memo(({ savedPlots, onDeleteSavedPlot }: ScratchSheetProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [lines, setLines] = useState<ScratchLine[]>([]);
  const [linesFuture, setLinesFuture] = useState<ScratchRedoAction[]>([]);
  const [draft, setDraft] = useState<Point | null>(null);
  const [isScratchDrawingActive, setIsScratchDrawingActive] = useState(false);
  const [forceHideMobilePanel, setForceHideMobilePanel] = useState(false);
  
  const {
    pagePan,
    pageZoom,
    setPageZoom,
    isPanning,
    startPan,
    movePan,
    stopPan,
    startPagePinch,
    movePagePinch,
    stopPagePinch
  } = usePanZoom();

  const svgRef = useRef<SVGSVGElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);

  const selectedPlots = useMemo(
    () => savedPlots.filter((plot) => selectedIds.includes(plot.id)),
    [savedPlots, selectedIds],
  );

  const plotLayouts = useMemo(() => createPlotLayouts(selectedPlots), [selectedPlots]);
  const getSnapDistance = () => SNAP_SCREEN_DISTANCE / pageZoom;

  const pageToMapFeet = (distance: number, nearPoint?: Point) => {
    const nearestLayout = nearPoint && plotLayouts.length > 0
      ? plotLayouts.reduce((best, current) => {
        const bestCenter = { x: best.slot.x + best.slot.width / 2, y: best.slot.y + best.slot.height / 2 };
        const currentCenter = { x: current.slot.x + current.slot.width / 2, y: current.slot.y + current.slot.height / 2 };
        const bestDistance = Math.hypot(nearPoint.x - bestCenter.x, nearPoint.y - bestCenter.y);
        const currentDistance = Math.hypot(nearPoint.x - currentCenter.x, nearPoint.y - currentCenter.y);
        return currentDistance < bestDistance ? current : best;
      })
      : plotLayouts[0];
    if (!nearestLayout) return distance;
    return distance / nearestLayout.scale / nearestLayout.plot.scale;
  };

  const toPagePoint = (point: Point, item: PlotSheetLayout) => ({
    x: item.offsetX + (point.x - item.bounds.minX) * item.scale,
    y: item.offsetY + (point.y - item.bounds.minY) * item.scale,
  });

  const getPlotPagePoints = (item: PlotSheetLayout) => item.plot.points.map((point: Point) => toPagePoint(point, item));

  const resolveScratchPoint = (point: Point): ScratchSnapResult => {
    const snapDistance = getSnapDistance();
    let firstPointOfChain: Point | null = null;
    if (draft && lines.length > 0) {
      firstPointOfChain = draft;
      for (let i = lines.length - 1; i >= 0; i--) {
        if (Math.hypot(lines[i].end.x - firstPointOfChain.x, lines[i].end.y - firstPointOfChain.y) <= snapDistance) {
          firstPointOfChain = lines[i].start;
        } else {
          break;
        }
      }
      if (Math.hypot(point.x - firstPointOfChain.x, point.y - firstPointOfChain.y) <= snapDistance) {
        return { point: firstPointOfChain, isSnapped: true };
      }
    }

    const boundaryPoint = plotLayouts.reduce(
      (best, layout) => {
        const candidate = closestPointOnPolyline(point, getPlotPagePoints(layout), true);
        return candidate.distance < best.distance ? candidate : best;
      },
      { point, distance: Number.POSITIVE_INFINITY },
    );
    const scratchSnap = lines.reduce(
      (best, line) => {
        const candidate = closestPointOnSegment(point, line.start, line.end);
        return candidate.distance < best.distance ? candidate : best;
      },
      { point, distance: Number.POSITIVE_INFINITY },
    );
    const bestSnap = boundaryPoint.distance <= scratchSnap.distance ? boundaryPoint : scratchSnap;
    const containingLayout = plotLayouts.find((layout) => pointInPolygon(point, getPlotPagePoints(layout)));

    if (bestSnap.distance <= snapDistance) return { point: bestSnap.point, isSnapped: true };
    if (!containingLayout && Number.isFinite(boundaryPoint.distance)) {
      return { point: boundaryPoint.point, isSnapped: true };
    }
    return { point, isSnapped: false };
  };

  const getCenterSnap = (): ScratchSnapResult | undefined => {
    if (selectedPlots.length === 0) return;
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const previewRect = previewRef.current?.getBoundingClientRect();
    const clientX = previewRect ? previewRect.left + previewRect.width / 2 : rect.left + rect.width / 2;
    const clientY = previewRect ? previewRect.top + previewRect.height / 2 : rect.top + rect.height / 2;
    return resolveScratchPoint({
      x: ((clientX - rect.left) / rect.width) * PAGE_WIDTH,
      y: ((clientY - rect.top) / rect.height) * PAGE_HEIGHT,
    });
  };

  const centerSnap = getCenterSnap();
  const centerPoint = centerSnap?.point;
  const visibleSnapPoint = isScratchDrawingActive && centerSnap?.isSnapped ? centerSnap.point : null;

  const addCenterPoint = () => {
    setForceHideMobilePanel(false);
    if (!isScratchDrawingActive) {
      setIsScratchDrawingActive(true);
      return;
    }

    const point = getCenterSnap()?.point;
    if (!point) return;
    const snapDistance = getSnapDistance();
    if (!draft) {
      setDraft(point);
      setLinesFuture([]);
      return;
    }
    if (Math.hypot(point.x - draft.x, point.y - draft.y) <= Math.min(SNAP_DISTANCE, snapDistance)) return;
    let firstPointOfChain: Point | null = null;
    if (draft && lines.length > 0) {
      firstPointOfChain = draft;
      for (let i = lines.length - 1; i >= 0; i--) {
        if (Math.hypot(lines[i].end.x - firstPointOfChain.x, lines[i].end.y - firstPointOfChain.y) <= snapDistance) {
          firstPointOfChain = lines[i].start;
        } else {
          break;
        }
      }
    }

    setLines((prev) => [...prev, { id: `${Date.now()}-${prev.length}`, start: draft, end: point, dashed: true }]);
    setLinesFuture([]);
    
    if (firstPointOfChain && Math.hypot(point.x - firstPointOfChain.x, point.y - firstPointOfChain.y) <= snapDistance) {
      setDraft(null);
      setIsScratchDrawingActive(false);
    } else {
      setDraft(point);
    }
  };

  const finishScratchChain = () => {
    setDraft(null);
    setIsScratchDrawingActive(false);
    setLinesFuture([]);
  };

  const undoScratchPoint = () => {
    if (lines.length === 0) {
      if (draft) {
        setLinesFuture((prev) => [...prev, { line: null, draftAfterRedo: draft }]);
      }
      setDraft(null);
      return;
    }
    const lastLine = lines[lines.length - 1];
    setLinesFuture((prev) => [...prev, { line: lastLine, draftAfterRedo: draft }]);
    setLines((prev) => prev.slice(0, -1));
    setDraft(lastLine.start);
  };

  const redoScratchPoint = () => {
    if (linesFuture.length === 0) return;
    const nextFuture = [...linesFuture];
    const redoAction = nextFuture.pop()!;
    setLinesFuture(nextFuture);

    if (redoAction.line) {
      setLines((prev) => [...prev, redoAction.line!]);
    }
    setDraft(redoAction.draftAfterRedo);
    setIsScratchDrawingActive(Boolean(redoAction.draftAfterRedo));
  };

  const clearAll = () => {
    setLines([]);
    setLinesFuture([]);
    setDraft(null);
    setIsScratchDrawingActive(false);
  };

  const downloadPdf = () => downloadScratchPdf(svgRef, selectedPlots);

  const hasMultiplePlots = selectedPlots.length > 1;

  return (
    <div className="scratch-sheet-root pt-6">
      <div className="scratch-sheet-panel bg-muted/50 border border-border rounded-lg p-4 mb-4">
        <div className="scratch-sheet-controls flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold">স্ক্র্যাচ শিট</h2>
          <ScratchControls 
            lines={lines} 
            draft={draft} 
            hasSelectedPlots={selectedPlots.length > 0} 
            isDrawingActive={isScratchDrawingActive}
            addCenterPoint={addCenterPoint} 
            undoScratchPoint={undoScratchPoint} 
            redoScratchPoint={redoScratchPoint}
            canRedoScratch={linesFuture.length > 0}
            finishScratchChain={finishScratchChain} 
            clearAll={clearAll} 
            downloadPdf={downloadPdf} 
          />
        </div>

        <div className="scratch-sheet-grid grid gap-4 lg:grid-cols-[260px_1fr]">
          <ScratchSidebar 
            savedPlots={savedPlots} 
            selectedIds={selectedIds} 
            setSelectedIds={setSelectedIds} 
            onDeleteSavedPlot={onDeleteSavedPlot} 
          />

          <div
            ref={previewRef}
            className={`scratch-sheet-preview-frame relative overflow-hidden bg-neutral-200 dark:bg-neutral-800 p-3 ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
            style={{ touchAction: 'none', overscrollBehavior: 'contain' }}
            onWheel={(event) => {
              const factor = Math.pow(1.0015, -event.deltaY);
              setPageZoom((current) => clampNumber(current * factor, 0.45, 20));
            }}
            onMouseDown={(event) => {
              event.preventDefault();
              startPan(event.clientX, event.clientY);
            }}
            onMouseMove={(event) => {
              if (isPanning) event.preventDefault();
              movePan(event.clientX, event.clientY);
            }}
            onMouseUp={stopPan}
            onMouseLeave={stopPan}
            onTouchStart={(event) => {
              if (event.touches.length >= 2) {
                startPagePinch(event.touches[0], event.touches[1]);
                return;
              }
              const touch = event.touches[0];
              if (touch) startPan(touch.clientX, touch.clientY);
            }}
            onTouchMove={(event) => {
              if (event.touches.length >= 2) {
                movePagePinch(event.touches[0], event.touches[1]);
                return;
              }
              const touch = event.touches[0];
              if (touch) movePan(touch.clientX, touch.clientY);
            }}
            onTouchEnd={(event) => {
              if (event.touches.length >= 2) return;
              stopPagePinch();
              if (event.touches.length === 1) {
                const touch = event.touches[0];
                startPan(touch.clientX, touch.clientY);
                return;
              }
              stopPan();
            }}
            >
            <svg
              ref={svgRef}
              className="scratch-sheet-page mx-auto block bg-white shadow-sm"
              viewBox={`0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}`}
              style={{
                transform: `translate(${pagePan.x}px, ${pagePan.y}px) scale(${pageZoom})`,
                transformOrigin: 'center center',
              }}
            >
              <rect width={PAGE_WIDTH} height={PAGE_HEIGHT} fill="white" />

              <ScratchPolygons 
                plotLayouts={plotLayouts} 
                hasMultiplePlots={hasMultiplePlots} 
                toPagePoint={toPagePoint}
                lines={lines}
                draft={draft}
                centerPoint={centerPoint}
                snapPoint={visibleSnapPoint}
                pageToMapFeet={pageToMapFeet}
                isShowDiagonals={useMapStore(s => s.isShowDiagonals)}
              />
            </svg>
            {selectedPlots.length > 0 && isScratchDrawingActive && (
              <div className="scratch-sheet-crosshair pointer-events-none absolute left-1/2 top-1/2 z-10 size-5 -translate-x-1/2 -translate-y-1/2">
                <svg width="20" height="20" viewBox="0 0 20 20" className="block" style={{ filter: 'drop-shadow(0px 0px 2px rgba(255,255,255,1))' }}>
                  <line x1="10" y1="2.5" x2="10" y2="8" stroke="#ef4444" strokeWidth="1.3" strokeLinecap="round" />
                  <line x1="10" y1="12" x2="10" y2="17.5" stroke="#ef4444" strokeWidth="1.3" strokeLinecap="round" />
                  <line x1="2.5" y1="10" x2="8" y2="10" stroke="#ef4444" strokeWidth="1.3" strokeLinecap="round" />
                  <line x1="12" y1="10" x2="17.5" y2="10" stroke="#ef4444" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile Fixed Bottom Sheet for Drawing Controls */}
      {!forceHideMobilePanel && (
        <ScratchControls 
          lines={lines} 
          draft={draft} 
          hasSelectedPlots={selectedPlots.length > 0} 
          isDrawingActive={isScratchDrawingActive}
          addCenterPoint={addCenterPoint} 
          undoScratchPoint={undoScratchPoint} 
          redoScratchPoint={redoScratchPoint}
          canRedoScratch={linesFuture.length > 0}
          finishScratchChain={finishScratchChain} 
          clearAll={clearAll} 
          downloadPdf={downloadPdf} 
          isMobileSheet={true} 
          onCloseMobilePanel={() => {
            setForceHideMobilePanel(true);
            finishScratchChain();
          }}
        />
      )}
    </div>
  );
});

ScratchSheet.displayName = 'ScratchSheet';

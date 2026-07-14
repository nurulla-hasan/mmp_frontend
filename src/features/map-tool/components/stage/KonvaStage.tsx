import React, { memo, useRef, useCallback } from 'react';
import { Stage, Layer } from 'react-konva';
import { useShallow } from 'zustand/shallow';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

import type Konva from 'konva';
import type { KonvaStageProps } from '@/features/map-tool/types/konva';
import { useStageEvents } from '@/hooks/map/useStageEvents';
import { useMapStore } from '@/features/map-tool/store/useMapStore';
import { STAGE_MIN_ZOOM, STAGE_MAX_ZOOM, STAGE_ZOOM_SPEED_FACTOR } from '@/features/map-tool/utils/canvas';

import { StageBackground } from './StageBackground';
import { StageCalibration } from './StageCalibration';
import { StagePlots } from './StagePlots';
import { StageActivePlot } from './StageActivePlot';
import { StageMeasurements } from './StageMeasurements';
import { StageMagnifier } from './StageMagnifier';
import { StageManualCut } from './StageManualCut';
import { clamp } from "@/lib/utils";

export const KonvaStage = memo((props: KonvaStageProps) => {
  const { containerRef, stageRef } = props;

  const { stageSize, mode, isPlotFinished, stageScale, stagePos, isPinching, plotPoints, isProcessingFile, addCenterPoint, finishPlot } =
    useMapStore(
      useShallow(s => ({
        stageSize: s.stageSize,
        mode: s.mode,
        isPlotFinished: s.isPlotFinished,
        stageScale: s.stageScale,
        stagePos: s.stagePos,
        isPinching: s.isPinching,
        plotPoints: s.plotPoints,
        isProcessingFile: s.isProcessingFile,
        addCenterPoint: s.addCenterPoint,
        finishPlot: s.finishPlot,
      }))
    );

  // Refs for wheel handler — always fresh, no stale closures, no re-render on change
  const stageScaleRef = useRef(stageScale);
  stageScaleRef.current = stageScale;
  const stagePosRef = useRef(stagePos);
  stagePosRef.current = stagePos;
  const wheelRafRef = useRef(0);
  const wheelAccumRef = useRef(0);

  const { setStageScale, setStagePos } = useMapStore(
    useShallow(s => ({ setStageScale: s.setStageScale, setStagePos: s.setStagePos }))
  );

  // Stable wheel handler — never recreated, reads fresh values from refs
  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    if (!stage) return;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    const oldScale = stageScaleRef.current;
    const oldPos = stagePosRef.current;
    const mousePointTo = {
      x: (pointer.x - oldPos.x) / oldScale,
      y: (pointer.y - oldPos.y) / oldScale,
    };
    wheelAccumRef.current += e.evt.deltaY;
    if (!wheelRafRef.current) {
      wheelRafRef.current = requestAnimationFrame(() => {
        wheelRafRef.current = 0;
        const delta = wheelAccumRef.current;
        wheelAccumRef.current = 0;
        const factor = Math.pow(STAGE_ZOOM_SPEED_FACTOR, -delta);
        const newScale = clamp(oldScale * factor, STAGE_MIN_ZOOM, STAGE_MAX_ZOOM);
        setStageScale(newScale);
        setStagePos({
          x: pointer.x - mousePointTo.x * newScale,
          y: pointer.y - mousePointTo.y * newScale,
        });
      });
    }
  }, [setStageScale, setStagePos]);

  const events = useStageEvents();

  const addButtonTouchRef = useRef(0);
  const addPointFromButton = useCallback(
    (event: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      addCenterPoint();
    },
    [addCenterPoint]
  );

  return (
    <div id="step-map-stage" className="relative border rounded-lg shadow-sm overflow-hidden cursor-grab touch-none select-none" ref={containerRef}>
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        onWheel={handleWheel}
        onMouseMove={events.onMouseMove}
        onTouchStart={events.onTouchStart}
        onTouchMove={events.onTouchMove}
        onTouchEnd={events.onTouchEnd}
        scaleX={stageScale}
        scaleY={stageScale}
        x={stagePos.x}
        y={stagePos.y}
        draggable={!isPinching}
        onDragMove={events.onDragMove}
        onDragEnd={events.onDragEnd}
      >
        <Layer id="background-layer" listening={false}>
          <StageBackground />
        </Layer>

        <Layer id="static-layer" listening={mode === 'manual_divide_plot'}>
          <StageCalibration />
          <StagePlots />
        </Layer>

        <Layer id="dynamic-layer">
          <StageManualCut />
          <StageActivePlot />
          <StageMeasurements />
          <StageMagnifier />
        </Layer>
      </Stage>

      {isProcessingFile && (
        <div className="absolute inset-0 z-60 flex items-center justify-center bg-background/75 backdrop-blur-sm">
          <div className="flex min-w-52 flex-col items-center gap-3 rounded-lg border border-border bg-card px-5 py-4 text-center shadow-lg">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
            <div>
              <p className="text-sm font-semibold text-foreground">ম্যাপ লোড হচ্ছে</p>
              <p className="mt-1 text-xs text-muted-foreground">বড় ফাইল হলে একটু সময় লাগতে পারে</p>
            </div>
          </div>
        </div>
      )}

      {/* UI Overlays */}
      {!isProcessingFile && (mode === 'calibrating' || mode === 'measuring' || (mode === 'drawing_plot' && !isPlotFinished)) && (
        <>
          <div
            className="pointer-events-none absolute z-50 size-6 -translate-x-1/2 -translate-y-1/2"
            style={{
              left: (stageSize.width || window.innerWidth) / 2,
              top: (stageSize.height || 400) / 2
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" className="block" style={{ filter: 'drop-shadow(0px 0px 2px rgba(255,255,255,1))' }}>
              <line x1="12" y1="2" x2="12" y2="10" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="12" y1="14" x2="12" y2="22" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="2" y1="12" x2="10" y2="12" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="14" y1="12" x2="22" y2="12" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="pointer-events-auto absolute bottom-3 right-3 z-50 flex items-center gap-2">
            {mode === 'drawing_plot' && (
              <Button
                variant="secondary"
                size="sm"
                disabled={plotPoints.length < 3}
                className=""
                onClick={(e) => {
                  e.stopPropagation();
                  finishPlot();
                }}
              >
                শেষ করুন
              </Button>
            )}
            <Button
              variant="default"
              size="sm"
              onClick={(e) => {
                if (Date.now() - addButtonTouchRef.current < 600) return;
                addPointFromButton(e);
              }}
              onTouchStart={(e) => {
                addButtonTouchRef.current = Date.now();
                addPointFromButton(e);
              }}
            >
              পয়েন্ট যোগ করুন
            </Button>
          </div>
        </>
      )}
    </div>
  );
});

KonvaStage.displayName = 'KonvaStage';

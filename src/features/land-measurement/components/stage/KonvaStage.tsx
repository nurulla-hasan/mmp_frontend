import React, { memo, useRef, useCallback } from 'react';
import { Stage, Layer } from 'react-konva';
import { useShallow } from 'zustand/shallow';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

import type Konva from 'konva';
import type { KonvaStageProps } from '@/features/land-measurement/types/konva';
import { useStageEvents } from '@/features/land-measurement/hooks/useStageEvents';
import { useMapStore } from '@/features/land-measurement/store/useMapStore';
import { STAGE_MIN_ZOOM, STAGE_MAX_ZOOM, STAGE_ZOOM_SPEED_FACTOR } from '@/features/land-measurement/utils/canvas';

import { StageBackground } from './StageBackground';
import { StageCalibration } from './StageCalibration';
import { StagePlots } from './StagePlots';
import { StageActivePlot } from './StageActivePlot';
import { StageMagnifier } from './StageMagnifier';
import { StageManualCut } from './StageManualCut';
import { clamp, cn } from "@/lib/utils";

export const KonvaStage = memo((props: KonvaStageProps) => {
    const { stageRef } = props;

    const { stageSize, mode, isPlotFinished, stageScale, stagePos, isPinching, plotPoints, isProcessingFile, isGeneratingTiles, tileProgress, image, addCenterPoint, finishPlot } =
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
                isGeneratingTiles: s.isGeneratingTiles,
                tileProgress: s.tileProgress,
                image: s.image,
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
        <div id="step-map-stage" className={cn(
            "absolute inset-0 touch-none select-none",
            (mode === 'drawing_plot' || mode === 'calibrating') ? "cursor-crosshair" : "cursor-grab"
        )}>
            <Stage
                ref={stageRef}
                width={stageSize.width}
                height={stageSize.height}
                onWheel={handleWheel}
                onMouseDown={events.onMouseDown}
                onClick={events.onClick}
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
                    <StageMagnifier />
                </Layer>
            </Stage>

            {isProcessingFile && (
                <div className="absolute inset-0 z-60 flex items-center justify-center bg-background/75 ">
                    <div className="flex min-w-52 flex-col items-center gap-3 rounded-lg border border-border bg-card px-5 py-4 text-center shadow-lg">
                        <Loader2 className="h-7 w-7 animate-spin text-primary" />
                        <div>
                            <p className="text-sm font-semibold text-foreground">ম্যাপ লোড হচ্ছে</p>
                            <p className="mt-1 text-xs text-muted-foreground">বড় ফাইল হলে একটু সময় লাগতে পারে</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Tile generation loading — non-blocking floating indicator */}
            {!isProcessingFile && isGeneratingTiles && image && (image.naturalWidth * image.naturalHeight > 2_000_000) && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-60 pointer-events-none">
                    <div className="flex w-60 flex-col gap-2 rounded-xl border border-border bg-card/95 backdrop-blur-md px-4 py-3 shadow-xl pointer-events-auto">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">
                                টাইল জেনারেট হচ্ছে...
                            </span>
                            <span className="ml-auto text-xs font-semibold text-primary">{tileProgress}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div
                                className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
                                style={{ width: `${tileProgress}%` }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* UI Overlays */}
            {!isProcessingFile && (mode === 'calibrating' || (mode === 'drawing_plot' && !isPlotFinished)) && (
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

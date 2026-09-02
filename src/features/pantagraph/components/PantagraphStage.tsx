'use client';

import { memo, useRef, useCallback, useEffect, useState } from 'react';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import { useShallow } from 'zustand/shallow';
import { useTheme } from 'next-themes';
import type Konva from 'konva';
import { usePantagraphStore } from '../store/usePantagraphStore';
import { MatchPointMarkers } from './MatchPointMarkers';
import { getPixelColor } from '../utils/getPixelColor';
import { clamp } from '@/lib/utils';
import { configureInteractiveKonva } from '@/lib/konvaPerformance';
import { usePantagraphTouch } from '../hooks/usePantagraphTouch';

configureInteractiveKonva();

const STAGE_MIN_ZOOM = 0.01;
const STAGE_MAX_ZOOM = 10;
const ZOOM_SPEED = 0.001;

export const PantagraphStage = memo(function PantagraphStage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });

  const {
    formerMap,
    currentMap,
    activeMap,
    canvasBg,
    stageScale,
    stagePos,
    isAligning,
    isPickingColor,
    pickingTarget,
    matchPoints,
    formerRotation,
    formerPosition,
    currentRotation,
    currentPosition,
    formerOpacity,
    currentOpacity,
    formerScaleX,
    formerScaleY,
    formerSkewX,
    formerSkewY,
    isLocked,
    setStageViewport,
  } = usePantagraphStore(
    useShallow((s) => ({
      formerMap: s.formerMap,
      currentMap: s.currentMap,
      activeMap: s.activeMap,
      canvasBg: s.canvasBg,
      stageScale: s.stageScale,
      stagePos: s.stagePos,
      isAligning: s.isAligning,
      isPickingColor: s.isPickingColor,
      pickingTarget: s.pickingTarget,
      matchPoints: s.matchPoints,
      formerRotation: s.formerRotation,
      formerPosition: s.formerPosition,
      currentRotation: s.currentRotation,
      currentPosition: s.currentPosition,
      formerOpacity: s.formerOpacity,
      currentOpacity: s.currentOpacity,
      formerScaleX: s.formerScaleX,
      formerScaleY: s.formerScaleY,
      formerSkewX: s.formerSkewX,
      formerSkewY: s.formerSkewY,
      isLocked: s.isLocked,
      imageLoading: s.imageLoading,
      setStageViewport: s.setStageViewport,
    }))
  );



  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  const { onTouchStart, onTouchMove, onTouchEnd, blockTapRef } =
    usePantagraphTouch(stageRef);

  const dragRafRef = useRef(0);
  const pendingDragRef = useRef<{
    target: 'former' | 'current';
    position: { x: number; y: number };
  } | null>(null);

  const commitMapPosition = useCallback((
    target: 'former' | 'current',
    position: { x: number; y: number },
    immediate = false,
  ) => {
    pendingDragRef.current = { target, position };

    const flush = () => {
      dragRafRef.current = 0;
      const pending = pendingDragRef.current;
      pendingDragRef.current = null;
      if (!pending) return;
      const store = usePantagraphStore.getState();
      if (pending.target === 'former') store.setFormerPosition(pending.position);
      else store.setCurrentPosition(pending.position);
    };

    if (immediate) {
      if (dragRafRef.current) cancelAnimationFrame(dragRafRef.current);
      flush();
    } else if (!dragRafRef.current) {
      dragRafRef.current = requestAnimationFrame(flush);
    }
  }, []);

  useEffect(() => () => {
    if (dragRafRef.current) cancelAnimationFrame(dragRafRef.current);
  }, []);

  // Keep latest stagePos/stageScale in refs so handleStageClick can read
  // fresh values without being recreated on every pan/zoom.
  const stagePosRef = useRef(stagePos);
  const stageScaleRef = useRef(stageScale);
  useEffect(() => { stagePosRef.current = stagePos; }, [stagePos]);
  useEffect(() => { stageScaleRef.current = stageScale; }, [stageScale]);

  // Sync stageRef to store
  useEffect(() => {
    usePantagraphStore.getState().setStageRef(stageRef.current);
  }, []);

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = Math.round(entry.contentRect.width);
        const height = Math.round(entry.contentRect.height);
        setStageSize((current) =>
          current.width === width && current.height === height
            ? current
            : { width, height },
        );
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Wheel zoom handler
  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      const stage = e.target.getStage();
      if (!stage) return;

      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const oldScale = stage.scaleX();
      const delta = -e.evt.deltaY * ZOOM_SPEED;
      const newScale = clamp(oldScale + delta * oldScale, STAGE_MIN_ZOOM, STAGE_MAX_ZOOM);

      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      };

      const newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      };

      setStageViewport(newScale, newPos);
    },
    [setStageViewport]
  );

  // Stage click — handles alignment point placement and color picking
  const handleStageClick = useCallback(
    async (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      const stage = e.target.getStage();
      if (!stage) return;
      if (blockTapRef.current) return;

      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      // Prevent accidental point placement if user dragged on mobile
      if (touchStartPosRef.current) {
        const dx = pointer.x - touchStartPosRef.current.x;
        const dy = pointer.y - touchStartPosRef.current.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 10) {
          // It was a drag, ignore this click/tap
          return;
        }
      }

      // Convert screen coordinates to stage coordinates using ref values
      const stageX = (pointer.x - stagePosRef.current.x) / stageScaleRef.current;
      const stageY = (pointer.y - stagePosRef.current.y) / stageScaleRef.current;

      const store = usePantagraphStore.getState();
      const { isPickingColor, pickingTarget } = store;

      // ---- Color picking mode ----
      if (isPickingColor && pickingTarget) {
        const sourceImg = pickingTarget === 'former' ? store.formerMapOriginal : store.currentMapOriginal;
        if (!sourceImg) return;

        // Reverse transform stageX, stageY to intrinsic image coordinates
        const posKey = pickingTarget === 'former' ? 'formerPosition' : 'currentPosition';
        const rotKey = pickingTarget === 'former' ? 'formerRotation' : 'currentRotation';

        const dx = stageX - store[posKey].x;
        const dy = stageY - store[posKey].y;
        const angleRad = (-store[rotKey] * Math.PI) / 180;

        const intrinsicX = dx * Math.cos(angleRad) - dy * Math.sin(angleRad);
        const intrinsicY = dx * Math.sin(angleRad) + dy * Math.cos(angleRad);

        // Sample pixel color from the original image at intrinsic coords
        const color = getPixelColor(sourceImg, intrinsicX, intrinsicY);

        if (pickingTarget === 'former') {
          store.setFormerBgColor(color);
        } else {
          store.setCurrentBgColor(color);
        }
        store.cancelColorPick();
        return;
      }

      // ---- Alignment point placement ----
      if (!isAligning) return;

      const { activeMap } = store;

      if (activeMap === 'former') {
        // Reverse transform stageX, stageY to intrinsic formerMap coordinates
        const dx = stageX - store.formerPosition.x;
        const dy = stageY - store.formerPosition.y;
        const angleRad = (-store.formerRotation * Math.PI) / 180;
        
        const intrinsicX = dx * Math.cos(angleRad) - dy * Math.sin(angleRad);
        const intrinsicY = dx * Math.sin(angleRad) + dy * Math.cos(angleRad);

        const id = `point-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        store.addMatchPoint({
          id,
          former: { x: intrinsicX, y: intrinsicY },
          current: null,
        });
        // Auto-switch to current map to place the matching point
        store.setActiveMap('current');
      } else {
        // Reverse transform stageX, stageY to intrinsic currentMap coordinates
        const dx = stageX - store.currentPosition.x;
        const dy = stageY - store.currentPosition.y;
        const angleRad = (-store.currentRotation * Math.PI) / 180;
        
        const intrinsicX = dx * Math.cos(angleRad) - dy * Math.sin(angleRad);
        const intrinsicY = dx * Math.sin(angleRad) + dy * Math.cos(angleRad);

        const incomplete = store.matchPoints.find((p) => p.current === null);
        if (incomplete) {
          store.updateMatchPoint(incomplete.id, { current: { x: intrinsicX, y: intrinsicY } });
          // Auto-switch back to former to place the next point
          store.setActiveMap('former');
        }
      }
    },
    [blockTapRef, isAligning]
  );

  const renderCurrentMap = () =>
    currentMap && (
      <KonvaImage
          key="current-map"
          image={currentMap}
          x={currentPosition.x}
          y={currentPosition.y}
          width={currentMap.width}
          height={currentMap.height}
          rotation={currentRotation}
          opacity={currentOpacity}
          imageSmoothingEnabled
          perfectDrawEnabled={false}
          draggable={!isLocked}
          onDragStart={(e) => {
            if (e.evt && 'touches' in e.evt && (e.evt as unknown as TouchEvent).touches?.length > 1) {
              e.target.stopDrag();
            }
          }}
          onDragMove={(e) => {
            if (e.evt && 'touches' in e.evt && (e.evt as unknown as TouchEvent).touches?.length > 1) {
              e.target.stopDrag();
              return;
            }
            commitMapPosition('current', { x: e.target.x(), y: e.target.y() });
          }}
          onDragEnd={(e) => {
            commitMapPosition('current', { x: e.target.x(), y: e.target.y() }, true);
          }}
        />
    );

  const renderFormerMap = () =>
    formerMap && (
      <KonvaImage
          key="former-map"
          image={formerMap}
          x={formerPosition.x}
          y={formerPosition.y}
          width={formerMap.width}
          height={formerMap.height}
          rotation={formerRotation}
          opacity={formerOpacity}
          scaleX={formerScaleX}
          scaleY={formerScaleY}
          skewX={formerSkewX}
          skewY={formerSkewY}
          imageSmoothingEnabled
          perfectDrawEnabled={false}
          draggable={!isLocked}
          onDragStart={(e) => {
            if (e.evt && 'touches' in e.evt && (e.evt as unknown as TouchEvent).touches?.length > 1) {
              e.target.stopDrag();
            }
          }}
          onDragMove={(e) => {
            if (e.evt && 'touches' in e.evt && (e.evt as unknown as TouchEvent).touches?.length > 1) {
              e.target.stopDrag();
              return;
            }
            commitMapPosition('former', { x: e.target.x(), y: e.target.y() });
          }}
          onDragEnd={(e) => {
            commitMapPosition('former', { x: e.target.x(), y: e.target.y() }, true);
          }}
        />
    );

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
      style={{ 
        cursor: isAligning || isPickingColor ? 'crosshair' : 'default',
        backgroundColor: canvasBg === 'auto' 
          ? (isDark ? '#121212' : '#ffffff')
          : canvasBg === 'dark' ? '#121212' : '#ffffff',
        backgroundImage: (canvasBg === 'auto' ? isDark : canvasBg === 'dark')
          ? `linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`
          : `linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px)`,
        backgroundSize: '20px 20px',
      }}
    >
      {/* Color picking mode indicator */}
      {isPickingColor && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <div className="bg-background/90 backdrop-blur border border-border rounded-lg px-4 py-2 shadow-lg">
            <p className="text-xs text-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Click on the {pickingTarget === 'former' ? 'Former (C.S)' : 'Current (B.S)'} map to pick a color
            </p>
          </div>
        </div>
      )}

      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        scaleX={stageScale}
        scaleY={stageScale}
        x={stagePos.x}
        y={stagePos.y}
        onWheel={handleWheel}
        onClick={handleStageClick}
        onTap={handleStageClick}
        onMouseDown={(e) => {
          const pos = e.target.getStage()?.getPointerPosition();
          if (pos) touchStartPosRef.current = pos;
        }}
        onTouchStart={(e) => {
          onTouchStart(e);
          const pos = e.target.getStage()?.getPointerPosition();
          if (pos) touchStartPosRef.current = pos;
        }}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        draggable={false}
      >
        <Layer>
          {/* Render inactive map first (so it stays underneath) */}
          {activeMap === 'former' ? renderCurrentMap() : renderFormerMap()}

          {/* Render active map last (so it stays on top) */}
          {activeMap === 'former' ? renderFormerMap() : renderCurrentMap()}

          {matchPoints.length > 0 && (
            <MatchPointMarkers />
          )}
        </Layer>
      </Stage>

      {/* ── Zoom indicator ─────────────────────────────────────────────────── */}
      <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm border border-border/50 rounded-md px-2 py-1 text-xs font-mono text-muted-foreground pointer-events-none z-20">
        {Math.round(stageScale * 100)}%
      </div>
    </div>
  );
});

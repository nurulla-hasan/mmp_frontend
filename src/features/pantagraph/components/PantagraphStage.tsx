'use client';

import { memo, useRef, useCallback, useEffect, useState } from 'react';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import { useShallow } from 'zustand/shallow';
import type Konva from 'konva';
import { usePantagraphStore } from '../store/usePantagraphStore';
import { MatchPointMarkers } from './MatchPointMarkers';
import { getPixelColor } from '../utils/getPixelColor';
import { clamp } from '@/lib/utils';

const STAGE_MIN_ZOOM = 0.1;
const STAGE_MAX_ZOOM = 10;
const ZOOM_SPEED = 0.001;

export const PantagraphStage = memo(function PantagraphStage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
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
    isLocked,
    setStageScale,
    setStagePos,
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
      isLocked: s.isLocked,
      setStageScale: s.setStageScale,
      setStagePos: s.setStagePos,
    }))
  );

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setStageSize({ width, height });
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

      setStageScale(newScale);
      setStagePos(newPos);
    },
    [setStageScale, setStagePos]
  );

  // Stage click — handles both alignment point placement AND color picking
  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const stage = e.target.getStage();
      if (!stage) return;

      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      // Convert screen coordinates to stage coordinates
      const stageX = (pointer.x - stagePos.x) / stageScale;
      const stageY = (pointer.y - stagePos.y) / stageScale;

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
    [isAligning, stagePos, stageScale]
  );

  const hasBothMaps = formerMap || currentMap;

  const renderCurrentMap = () =>
    currentMap && (
      <Layer key="current-map-layer">
        <KonvaImage
          image={currentMap}
          x={currentPosition.x}
          y={currentPosition.y}
          width={currentMap.width}
          height={currentMap.height}
          rotation={currentRotation}
          imageSmoothingEnabled
          perfectDrawEnabled={false}
          draggable={!isLocked}
          onDragEnd={(e) => {
            usePantagraphStore.getState().setCurrentPosition({ x: e.target.x(), y: e.target.y() });
          }}
        />
      </Layer>
    );

  const renderFormerMap = () =>
    formerMap && (
      <Layer key="former-map-layer">
        <KonvaImage
          image={formerMap}
          x={formerPosition.x}
          y={formerPosition.y}
          width={formerMap.width}
          height={formerMap.height}
          rotation={formerRotation}
          imageSmoothingEnabled
          perfectDrawEnabled={false}
          draggable={!isLocked}
          onDragEnd={(e) => {
            usePantagraphStore.getState().setFormerPosition({ x: e.target.x(), y: e.target.y() });
          }}
        />
      </Layer>
    );

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
      style={{ 
        cursor: isAligning || isPickingColor ? 'crosshair' : 'default',
        backgroundColor: canvasBg === 'white' ? '#ffffff' : '#121212',
        backgroundImage: canvasBg === 'white' 
          ? `linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px)`
          : `linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
        backgroundSize: '20px 20px',
      }}
    >
      {!hasBothMaps && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <p className="text-muted-foreground text-lg">
            তুলনা শুরু করতে সাবেক ও হাল ম্যাপ আপলোড করুন
          </p>
        </div>
      )}

      {/* Color picking mode indicator */}
      {isPickingColor && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <div className="bg-background/90 backdrop-blur border border-border rounded-lg px-4 py-2 shadow-lg">
            <p className="text-xs text-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              {pickingTarget === 'former' ? 'সাবেক' : 'হাল'} ম্যাপ থেকে রঙ বেছে নিতে ক্লিক করুন
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
      >
        {/* Render inactive map first (so it stays underneath) */}
        {activeMap === 'former' ? renderCurrentMap() : renderFormerMap()}

        {/* Render active map last (so it stays on top) */}
        {activeMap === 'former' ? renderFormerMap() : renderCurrentMap()}

        {/* Match point markers layer */}
        {matchPoints.length > 0 && (
          <Layer>
            <MatchPointMarkers />
          </Layer>
        )}
      </Stage>
    </div>
  );
});

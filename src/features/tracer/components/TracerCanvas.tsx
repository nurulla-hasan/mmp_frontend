'use client';

import { memo, useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { useShallow } from 'zustand/shallow';
import { useTheme } from 'next-themes';
import { Stage, Layer, Group, Image as KonvaImage } from 'react-konva';
import type Konva from 'konva';
import { useTracerStore, centroid } from '../store/useTracerStore';
import { getClosestPointOnSegment } from '@/features/land-measurement/utils/geometry';
import { useTracerTouch } from '../hooks/useTracerTouch';
import { CompletedPolygons } from './CompletedPolygons';
import { PendingPolygon } from './PendingPolygon';
import { getTracerSnappedPoint } from '../utils/snapping';
import { routeAlongPolygon } from '../utils/routing';



const TracerCanvas = memo(function TracerCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);

  // ── Viewport state ──────────────────────────────────────────────────────────
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [stagePos, setStagePos] = useState({ x: 32, y: 32 });
  const [stageScale, setStageScale] = useState(0.5);

  // ── Touch controls ─────────────────────────────────────────────────────────
  const { onTouchStart, onTouchMove, onTouchEnd, hasDraggedRef, blockTapRef } = useTracerTouch(
    stageScale,
    setStageScale,
    stagePos,
    setStagePos
  );

  // ── Pan tracking ────────────────────────────────────────────────────────────
  const isPanningRef = useRef(false);
  const panStart = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const spaceDown = useRef(false);
  const clickTimeRef = useRef(0); // timestamp of last click (for double-click detection)
  const rafRef = useRef<number>(0);

  // ── Snap-to-first-point ────────────────────────────────────────────────────
  const [snapActive, setSnapActive] = useState(false);
  const [edgeSnapped, setEdgeSnapped] = useState(false);
  const SNAP_DIST = 20; // screen pixels

  // ── Local state for drawing ────────────────────────────────────────────────
  const [hoverPoint, setHoverPoint] = useState<{ x: number; y: number } | null>(null);

  // ── Store ───────────────────────────────────────────────────────────────────
  const {
    backgroundImage, imageLoading,
    layers, activeLayerId,
    mode,
    pendingPoints,
    selectedPolygonId, selectedLayerId,
    addPendingPoints,
    commitPolygon, cancelDrawing,
    selectPolygon, deletePolygon,
    setPolygonLabelPosition,
    setPolygonLabel,
  } = useTracerStore(useShallow(s => ({
    backgroundImage: s.backgroundImage,
    imageLoading: s.imageLoading,
    layers: s.layers,
    activeLayerId: s.activeLayerId,
    mode: s.mode,
    pendingPoints: s.pendingPoints,
    selectedPolygonId: s.selectedPolygonId,
    selectedLayerId: s.selectedLayerId,
    addPendingPoints: s.addPendingPoints,
    commitPolygon: s.commitPolygon,
    cancelDrawing: s.cancelDrawing,
    selectPolygon: s.selectPolygon,
    deletePolygon: s.deletePolygon,
    setPolygonLabelPosition: s.setPolygonLabelPosition,
    setPolygonLabel: s.setPolygonLabel,
  })));

  const activeLayer = layers.find(l => l.id === activeLayerId);

  // Memoize all polygon points for fast snapping during mouse move
  const allPolyPoints = useMemo(() => layers.flatMap(l => l.polygons.map(p => p.points)), [layers]);

  // ── Resize observer ─────────────────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const r = entries[0].contentRect;
      setStageSize({ width: r.width, height: r.height });
    });
    ro.observe(el);
    setStageSize({ width: el.clientWidth, height: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  // ── Auto-fit background image when loaded ───────────────────────────────────
  useEffect(() => {
    if (!backgroundImage || stageSize.width === 0) return;
    const { naturalWidth: iw, naturalHeight: ih } = backgroundImage;
    const sc = Math.min((stageSize.width - 64) / iw, (stageSize.height - 64) / ih, 1);
    setStageScale(sc);
    setStagePos({
      x: (stageSize.width - iw * sc) / 2,
      y: (stageSize.height - ih * sc) / 2,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backgroundImage]);

  // ── Keyboard events ─────────────────────────────────────────────────────────
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.key === 'Escape') cancelDrawing();
      if (e.key === 'Enter' && pendingPoints.length >= 3) commitPolygon();
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedPolygonId && selectedLayerId) {
        deletePolygon(selectedLayerId, selectedPolygonId);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        const st = useTracerStore.getState();
        if (st.mode === 'polygon' && st.pendingPoints.length > 0) {
          st.undoPendingPoint();
        } else {
          st.undo();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        const st = useTracerStore.getState();
        if (st.mode === 'polygon' && st.pendingRedoPoints.length > 0) {
          st.redoPendingPoint();
        } else {
          st.redo();
        }
      }
      if (e.key === ' ') { e.preventDefault(); spaceDown.current = true; }
    };
    const onUp = (e: KeyboardEvent) => { if (e.key === ' ') spaceDown.current = false; };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => { window.removeEventListener('keydown', onDown); window.removeEventListener('keyup', onUp); };
  }, [pendingPoints.length, selectedPolygonId, selectedLayerId, commitPolygon, cancelDrawing, deletePolygon]);

  // ── Focus canvas for keyboard events ────────────────────────────────────────
  useEffect(() => {
    containerRef.current?.setAttribute('tabindex', '0');
  }, []);

  // ── Convert screen → image space ────────────────────────────────────────────
  const getImagePos = useCallback((): { x: number; y: number } | null => {
    const stage = stageRef.current;
    if (!stage) return null;
    const pos = stage.getPointerPosition();
    if (!pos) return null;
    return {
      x: (pos.x - stagePos.x) / stageScale,
      y: (pos.y - stagePos.y) / stageScale,
    };
  }, [stagePos, stageScale]);

  // ── Stage events ─────────────────────────────────────────────────────────────
  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;
    const ptr = stage.getPointerPosition();
    if (!ptr) return;
    const factor = e.evt.deltaY < 0 ? 1.15 : 1 / 1.15;
    const next = Math.max(0.05, Math.min(20, stageScale * factor));
    setStagePos({
      x: ptr.x - (ptr.x - stagePos.x) * (next / stageScale),
      y: ptr.y - (ptr.y - stagePos.y) * (next / stageScale),
    });
    setStageScale(next);
  }, [stageScale, stagePos]);

  const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    hasDraggedRef.current = false;
    if (e.evt.button === 1 || e.evt.button === 2 || spaceDown.current) {
      isPanningRef.current = true;
      panStart.current = { x: e.evt.clientX, y: e.evt.clientY, px: stagePos.x, py: stagePos.y };
      e.evt.preventDefault();
    }
  }, [stagePos, hasDraggedRef]);

  const candidateRays = useMemo(() => {
    const rays: { dx: number; dy: number; angle: number }[] = [];
    if (pendingPoints.length === 0) return rays;
    const lastPoint = pendingPoints[pendingPoints.length - 1];

    for (const poly of allPolyPoints) {
      for (let i = 0; i < poly.length; i++) {
        const p1 = poly[i];
        const p2 = poly[(i + 1) % poly.length];
        const closest = getClosestPointOnSegment(lastPoint, p1, p2);
        const distToSegment = Math.hypot(closest.x - lastPoint.x, closest.y - lastPoint.y);

        if (distToSegment < 1) { // lastPoint is on this segment
          const angle1 = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
          const angle2 = Math.atan2(p1.y - p2.y, p1.x - p2.x) * 180 / Math.PI;
          rays.push({ dx: p2.x - p1.x, dy: p2.y - p1.y, angle: angle1 });
          rays.push({ dx: p1.x - p2.x, dy: p1.y - p2.y, angle: angle2 });
        }
      }
    }
    return rays;
  }, [allPolyPoints, pendingPoints]);

  const resolveSnap = useCallback((pos: { x: number, y: number }) => {
    const snapThreshold = SNAP_DIST / stageScale;
    const finalPos = { ...pos };
    let isAngleSnapped = false;

    if (pendingPoints.length > 0) {
      const lastPoint = pendingPoints[pendingPoints.length - 1];

      if (candidateRays.length > 0) {
        const currentAngle = Math.atan2(pos.y - lastPoint.y, pos.x - lastPoint.x) * 180 / Math.PI;
        let bestRay = null;
        let minDiff = 5; // 5 degrees threshold

        for (const ray of candidateRays) {
          let diff = Math.abs(currentAngle - ray.angle);
          if (diff > 180) diff = 360 - diff;
          if (diff < minDiff) {
            minDiff = diff;
            bestRay = ray;
          }
        }

        if (bestRay) {
          const rayLen = Math.hypot(bestRay.dx, bestRay.dy);
          if (rayLen > 0) {
            const dirX = bestRay.dx / rayLen;
            const dirY = bestRay.dy / rayLen;
            const vx = pos.x - lastPoint.x;
            const vy = pos.y - lastPoint.y;
            const proj = vx * dirX + vy * dirY;

            if (proj > 0) {
              finalPos.x = lastPoint.x + proj * dirX;
              finalPos.y = lastPoint.y + proj * dirY;
              isAngleSnapped = true;
            }
          }
        }
      }
    }

    if (pendingPoints.length >= 3) {
      const first = pendingPoints[0];
      const dist = Math.hypot(finalPos.x - first.x, finalPos.y - first.y);
      if (dist <= snapThreshold) {
        return { point: first, polyIndex: null, vertexIndex: null, edgeIndex: null, isSnapFirst: true, isEdgeSnap: false };
      }
    }

    const snapped = getTracerSnappedPoint(finalPos, allPolyPoints, snapThreshold, 15);
    const isPointSnapped = snapped.point.x !== finalPos.x || snapped.point.y !== finalPos.y;

    return {
      point: snapped.point,
      polyIndex: snapped.polyIndex,
      vertexIndex: snapped.vertexIndex,
      edgeIndex: snapped.edgeIndex,
      isSnapFirst: false,
      isEdgeSnap: isPointSnapped || isAngleSnapped
    };
  }, [candidateRays, allPolyPoints, pendingPoints, stageScale]);

  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (isPanningRef.current && panStart.current) {
      const dx = e.evt.clientX - panStart.current.x;
      const dy = e.evt.clientY - panStart.current.y;
      if (Math.hypot(dx, dy) > 5) {
        hasDraggedRef.current = true;
      }
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = 0;
          setStagePos({
            x: panStart.current!.px + dx,
            y: panStart.current!.py + dy,
          });
        });
      }
    }
    if (mode === 'polygon' && pendingPoints.length > 0) {
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = 0;
          const pos = getImagePos();
          if (pos) {
            const resolved = resolveSnap(pos);
            setSnapActive(resolved.isSnapFirst);
            setEdgeSnapped(resolved.isEdgeSnap);
            setHoverPoint(resolved.point);
          }
        });
      }
    } else if (hoverPoint) {
      setHoverPoint(null);
    }
  }, [mode, pendingPoints.length, getImagePos, hoverPoint, resolveSnap, hasDraggedRef]);

  const handleMouseUp = useCallback(() => {
    isPanningRef.current = false;
    panStart.current = null;
  }, []);

  const handleClick = useCallback((e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    // Only allow left click or a clean single-finger tap.
    if ('button' in e.evt && e.evt.button !== 0) return;
    if (blockTapRef.current) return;
    if (mode !== 'polygon') return;
    if (isPanningRef.current || spaceDown.current) return;
    if (hasDraggedRef.current) return;
    // Ignore clicks on existing polygon elements
    if (e.target !== stageRef.current && e.target.hasName('polygon')) return;

    // Double-click detection: if two clicks happen within 300ms, treat as double-click
    const now = Date.now();
    const diff = now - clickTimeRef.current;
    
    // Ignore synthetic double events (like click immediately following tap on mobile)
    if (diff < 50) return;
    
    const isDbl = diff < 300;
    clickTimeRef.current = now;
    
    if (isDbl) {
      if (pendingPoints.length >= 3) { setSnapActive(false); commitPolygon(); }
      return;
    }

    const pos = getImagePos();
    if (!pos) return;

    // Apply edge/angle snap to placed point
    const resolved = resolveSnap(pos);

    let routedPath: Konva.Vector2d[] | null = null;
    
    if (pendingPoints.length > 0) {
      const prevPoint = pendingPoints[pendingPoints.length - 1];
      for (const poly of allPolyPoints) {
        const path = routeAlongPolygon(prevPoint, resolved.point, poly);
        if (path) {
          routedPath = path;
          break;
        }
      }
    }

    // Snap-to-first: if cursor is near first point, close polygon
    if (resolved.isSnapFirst && pendingPoints.length >= 3) {
      setSnapActive(false);
      commitPolygon();
      return;
    }

    const newPoints = [resolved.point];
    if (routedPath) {
      newPoints.unshift(...routedPath);
    }

    addPendingPoints(newPoints);
  }, [mode, getImagePos, addPendingPoints, commitPolygon, pendingPoints, allPolyPoints, resolveSnap, hasDraggedRef]);

  // Double-click is still handled here for browsers that fire native dblclick
  const handleDblClick = useCallback((e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if ('button' in e.evt && e.evt.button !== 0) return;
    if (mode !== 'polygon') return;
    if (pendingPoints.length >= 3) { setSnapActive(false); commitPolygon(); }
  }, [mode, pendingPoints.length, commitPolygon]);


  const cursorStyle = spaceDown.current
    ? 'grab'
    : mode === 'select'
      ? 'default'
      : snapActive
        ? 'pointer'
        : 'crosshair';

  const selectedLayer = layers.find(l => l.id === selectedLayerId);
  const selectedPolygon = selectedLayer?.polygons.find(p => p.id === selectedPolygonId);
  const showLabelInput = mode === 'select' && selectedPolygon;
  let labelScreenPos = { x: 0, y: 0 };
  if (showLabelInput && selectedPolygon) {
    const cx = selectedPolygon.labelX ?? centroid(selectedPolygon.points).x;
    const cy = selectedPolygon.labelY ?? centroid(selectedPolygon.points).y;
    labelScreenPos = {
      x: cx * stageScale + stagePos.x,
      y: cy * stageScale + stagePos.y,
    };
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden focus:outline-none"
      style={{
        cursor: cursorStyle,
        backgroundColor: isDark ? '#121212' : '#ffffff',
        backgroundImage: isDark
          ? `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`
          : `linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)`,
        backgroundSize: '20px 20px',
      }}
    >

      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
        onDblClick={handleDblClick}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTap={handleClick}
        onDblTap={handleDblClick}
        onContextMenu={(e) => e.evt.preventDefault()}
        style={{ display: 'block' }}
      >
        <Layer>
          <Group x={stagePos.x} y={stagePos.y} scaleX={stageScale} scaleY={stageScale}>

            {/* ── Background image (when loaded) ──────────────── */}
            {backgroundImage && (
              <KonvaImage image={backgroundImage} listening={false} perfectDrawEnabled={false} />
            )}

            {/* ── Completed polygon layers ──────────────────────────── */}
            <CompletedPolygons
              layers={layers}
              selectedPolygonId={selectedPolygonId}
              selectedLayerId={selectedLayerId}
              mode={mode}
              stageScale={stageScale}
              imageWidth={backgroundImage?.naturalWidth}
              selectPolygon={selectPolygon}
              setPolygonLabelPosition={setPolygonLabelPosition}
            />

            {/* ── Pending polygon being drawn ───────────────────────── */}
            {activeLayer && (
              <PendingPolygon
                pendingPoints={pendingPoints}
                activeLayerColor={activeLayer.color}
                activeLayerLineWidth={activeLayer.lineWidth}
                stageScale={stageScale}
                hoverPoint={hoverPoint}
                snapActive={snapActive}
                edgeSnapped={edgeSnapped}
              />
            )}
          </Group>
        </Layer>
      </Stage>

      {/* ── Floating Label Input ─────────────────────────────────── */}
      {showLabelInput && selectedPolygon && (
        <div
          className="absolute z-50 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-auto"
          style={{
            left: labelScreenPos.x,
            top: labelScreenPos.y,
          }}
        >
          <input
            autoFocus
            type="text"
            value={selectedPolygon.label}
            onChange={(e) => selectedLayer && setPolygonLabel(selectedLayer.id, selectedPolygon.id, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === 'Escape') {
                e.currentTarget.blur();
              }
            }}
            placeholder="নম্বর"
            className="w-16 h-8 text-center text-sm font-bold bg-background/90 border border-primary/50 text-foreground rounded shadow-lg outline-none focus:ring-2 focus:ring-primary/50"
            style={{ borderColor: selectedLayer?.color, color: selectedLayer?.color }}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* ── Drawing status bar ────────────────────────────────────────────── */}
      {pendingPoints.length > 0 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm border border-border rounded-full px-4 py-1.5 text-xs text-muted-foreground shadow-lg whitespace-nowrap pointer-events-none">
          {pendingPoints.length} পয়েন্ট
          {snapActive
            ? ' · ক্লিক করলেই বন্ধ হবে'
            : edgeSnapped
              ? ' · লাইনে স্ন্যাপ'
              : pendingPoints.length >= 3
                ? ' · প্রথম পয়েন্টের কাছে গিয়ে ক্লিক করুন বন্ধ করতে'
                : ` · আরও ${3 - pendingPoints.length}টা পয়েন্ট দরকার`}
          {' · Esc = বাতিল'}
        </div>
      )}

      {/* ── Hint when canvas is empty ─────────────────────────────────────── */}
      {!imageLoading && !backgroundImage && layers.every(l => l.polygons.length === 0) && pendingPoints.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
          <div className="text-center bg-background/50 backdrop-blur-sm rounded-2xl px-8 py-6 border border-border/30 shadow-sm max-w-sm">
            <div className="text-4xl mb-3 drop-shadow-sm">✏️</div>
            <p className="text-sm font-semibold text-foreground mb-1 font-heading">ডিজিটাল ম্যাপ ট্রেসিং</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              ডান পাশের সাইডবার থেকে পুরানো ম্যাপ আপলোড করুন<br />
              তারপর ক্লিক করে দাগের সীমানা আঁকুন
            </p>
          </div>
        </div>
      )}

      {/* ── Zoom indicator ─────────────────────────────────────────────────── */}
      <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm border border-border/50 rounded-md px-2 py-1 text-[10px] font-mono text-muted-foreground pointer-events-none">
        {Math.round(stageScale * 100)}%
      </div>
    </div>
  );
});

export default TracerCanvas;


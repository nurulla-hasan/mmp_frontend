'use client';

import { memo, useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { useShallow } from 'zustand/shallow';
import { useTheme } from 'next-themes';
import { Stage, Layer, Group, Image as KonvaImage, Line, Circle, Text } from 'react-konva';
import type Konva from 'konva';
import { useTracerStore, centroid, type TracerLayer } from '../store/useTracerStore';
import { getSnappedPoint } from '@/features/map-tool/utils/geometry';
import { useTracerTouch } from '../hooks/useTracerTouch';

// ── Memoized Completed Polygons ──────────────────────────────────────────────
const CompletedPolygons = memo(function CompletedPolygons({
  layers,
  selectedPolygonId,
  selectedLayerId,
  mode,
  stageScale,
  selectPolygon,
  setPolygonLabelPosition,
}: {
  layers: TracerLayer[];
  selectedPolygonId: string | null;
  selectedLayerId: string | null;
  mode: string;
  stageScale: number;
  selectPolygon: (layerId: string | null, polyId: string | null) => void;
  setPolygonLabelPosition: (layerId: string, polyId: string, x: number, y: number) => void;
}) {
  const labelFontSize = Math.max(8, 14 / stageScale);

  return (
    <>
      {layers.map(layer =>
        layer.visible
          ? layer.polygons.map(poly => {
              const flat = poly.points.flatMap(p => [p.x, p.y]);
              const c = centroid(poly.points);
              const isSelected = selectedPolygonId === poly.id && selectedLayerId === layer.id;
              return (
                <Group key={poly.id}>
                  <Line
                    name="polygon"
                    points={flat}
                    closed
                    stroke={isSelected ? '#F59E0B' : layer.color}
                    strokeWidth={(isSelected ? layer.lineWidth + 0.5 : layer.lineWidth) / stageScale}
                    fill={isSelected ? `${layer.color}1A` : 'transparent'}
                    hitStrokeWidth={14 / stageScale}
                    perfectDrawEnabled={false}
                    listening={mode === 'select'}
                    onClick={e => {
                      if (mode === 'select') {
                        e.cancelBubble = true;
                        selectPolygon(layer.id, poly.id);
                      }
                    }}
                  />
                  {poly.label ? (
                    <Text
                      x={poly.labelX ?? c.x}
                      y={poly.labelY ?? c.y}
                      text={poly.label}
                      fontSize={labelFontSize}
                      fontStyle="bold"
                      fill={layer.color}
                      align="center"
                      width={80 / stageScale}
                      offsetX={40 / stageScale}
                      offsetY={labelFontSize / 2}
                      draggable
                      onDragEnd={e => {
                        e.cancelBubble = true;
                        setPolygonLabelPosition(layer.id, poly.id, e.target.x(), e.target.y());
                      }}
                      listening={mode !== 'polygon'}
                    />
                  ) : null}
                </Group>
              );
            })
          : null,
      )}
    </>
  );
});

const TracerCanvas = memo(function TracerCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);

  // ── Viewport state ──────────────────────────────────────────────────────────
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [stagePos, setStagePos] = useState({ x: 32, y: 32 });
  const [stageScale, setStageScale] = useState(0.5);

  // ── Pan tracking ────────────────────────────────────────────────────────────
  const isPanningRef = useRef(false);
  const panStart = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const spaceDown = useRef(false);
  const clickTimeRef = useRef(0); // timestamp of last click (for double-click detection)

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
    addPendingPoint,
    commitPolygon, cancelDrawing,
    selectPolygon, deletePolygon,
    setPolygonLabelPosition,
  } = useTracerStore(useShallow(s => ({
    backgroundImage: s.backgroundImage,
    imageLoading: s.imageLoading,
    layers: s.layers,
    activeLayerId: s.activeLayerId,
    mode: s.mode,
    pendingPoints: s.pendingPoints,
    selectedPolygonId: s.selectedPolygonId,
    selectedLayerId: s.selectedLayerId,
    addPendingPoint: s.addPendingPoint,
    commitPolygon: s.commitPolygon,
    cancelDrawing: s.cancelDrawing,
    selectPolygon: s.selectPolygon,
    deletePolygon: s.deletePolygon,
    setPolygonLabelPosition: s.setPolygonLabelPosition,
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
    if (e.evt.button === 1 || e.evt.button === 2 || mode === 'pan' || spaceDown.current) {
      isPanningRef.current = true;
      panStart.current = { x: e.evt.clientX, y: e.evt.clientY, px: stagePos.x, py: stagePos.y };
      e.evt.preventDefault();
    }
  }, [mode, stagePos]);

  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (isPanningRef.current && panStart.current) {
      setStagePos({
        x: panStart.current.px + e.evt.clientX - panStart.current.x,
        y: panStart.current.py + e.evt.clientY - panStart.current.y,
      });
    }
    if (mode === 'polygon' && pendingPoints.length > 0) {
      const pos = getImagePos();
      if (pos) {
        const snapThreshold = SNAP_DIST / stageScale;

        // Snap to first point if close enough
        if (pendingPoints.length >= 3) {
          const first = pendingPoints[0];
          const dist = Math.hypot(pos.x - first.x, pos.y - first.y);
          if (dist <= snapThreshold) {
            setSnapActive(true);
            setEdgeSnapped(false);
            setHoverPoint({ x: first.x, y: first.y });
            return;
          }
        }

        // Snap to nearest edge/vertex of existing polygons (from all layers)
        const snapped = getSnappedPoint(pos, allPolyPoints, snapThreshold);
        const isEdgeSnapped = snapped.x !== pos.x || snapped.y !== pos.y;

        setSnapActive(false);
        setEdgeSnapped(isEdgeSnapped);
        setHoverPoint(snapped);
      }
    } else if (hoverPoint) {
      setHoverPoint(null);
    }
  }, [mode, pendingPoints, allPolyPoints, stageScale, getImagePos, hoverPoint]);

  const handleMouseUp = useCallback(() => {
    isPanningRef.current = false;
    panStart.current = null;
  }, []);

  const handleClick = useCallback((e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    // Only allow left click or touch
    if ('button' in e.evt && e.evt.button !== 0) return;
    if (mode !== 'polygon') return;
    if (isPanningRef.current || spaceDown.current) return;
    // Ignore clicks on existing polygon elements
    if (e.target !== stageRef.current && e.target.hasName('polygon')) return;

    // Double-click detection: if two clicks happen within 300ms, treat as double-click
    const now = Date.now();
    const isDbl = (now - clickTimeRef.current) < 300;
    clickTimeRef.current = now;
    if (isDbl) {
      if (pendingPoints.length >= 3) { setSnapActive(false); commitPolygon(); }
      return;
    }

    // Snap-to-first: if cursor is near first point, close polygon
    if (snapActive && pendingPoints.length >= 3) {
      setSnapActive(false);
      commitPolygon();
      return;
    }

    const pos = getImagePos();
    if (!pos) return;

    // Apply edge snap to placed point
    const snapThreshold = SNAP_DIST / stageScale;
    const snapped = getSnappedPoint(pos, allPolyPoints, snapThreshold);
    addPendingPoint(snapped);
  }, [mode, allPolyPoints, stageScale, getImagePos, addPendingPoint, commitPolygon, pendingPoints.length, snapActive]);

  // Double-click is still handled here for browsers that fire native dblclick
  const handleDblClick = useCallback((e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if ('button' in e.evt && e.evt.button !== 0) return;
    if (mode !== 'polygon') return;
    if (pendingPoints.length >= 3) { setSnapActive(false); commitPolygon(); }
  }, [mode, pendingPoints.length, commitPolygon]);

  // ── Pending points flat array ────────────────────────────────────────────────
  const flatPending = pendingPoints.flatMap(p => [p.x, p.y]);

  const cursorStyle = mode === 'pan' || spaceDown.current
    ? 'grab'
    : mode === 'select'
      ? 'default'
      : snapActive
        ? 'pointer'
        : 'crosshair';

  // ── Touch controls ─────────────────────────────────────────────────────────
  const { onTouchStart, onTouchMove, onTouchEnd } = useTracerTouch(
    stageScale,
    setStageScale,
    stagePos,
    setStagePos
  );

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
              selectPolygon={selectPolygon}
              setPolygonLabelPosition={setPolygonLabelPosition}
            />

            {/* ── Pending polygon being drawn ───────────────────────── */}
            {pendingPoints.length > 0 && activeLayer && (
              <Group listening={false}>
                {/* Completed edges so far */}
                {flatPending.length >= 4 && (
                  <Line
                    points={flatPending}
                    stroke={activeLayer.color}
                    strokeWidth={activeLayer.lineWidth / stageScale}
                    dash={[8 / stageScale, 4 / stageScale]}
                    perfectDrawEnabled={false}
                  />
                )}
                {/* Edge-snap indicator */}
                {hoverPoint && edgeSnapped && !snapActive && (
                  <Circle
                    x={hoverPoint.x}
                    y={hoverPoint.y}
                    radius={10 / stageScale}
                    stroke="#2563EB"
                    strokeWidth={2 / stageScale}
                    dash={[5 / stageScale, 4 / stageScale]}
                    opacity={0.7}
                  />
                )}
                {/* Rubber-band to cursor */}
                {hoverPoint && (
                  <Line
                    points={[
                      pendingPoints[pendingPoints.length - 1].x,
                      pendingPoints[pendingPoints.length - 1].y,
                      hoverPoint.x,
                      hoverPoint.y,
                    ]}
                    stroke={activeLayer.color}
                    strokeWidth={activeLayer.lineWidth / stageScale}
                    dash={[5 / stageScale, 5 / stageScale]}
                    opacity={0.5}
                    perfectDrawEnabled={false}
                  />
                )}
                {/* Vertex dots */}
                {pendingPoints.map((p, i) => (
                  <Group key={i}>
                    {i === 0 && snapActive && (
                      <Circle
                        x={p.x}
                        y={p.y}
                        radius={12 / stageScale}
                        stroke="#2563EB"
                        strokeWidth={2.5 / stageScale}
                        dash={[6 / stageScale, 4 / stageScale]}
                      />
                    )}
                    <Circle
                      x={p.x}
                      y={p.y}
                      radius={(i === 0 ? (snapActive ? 7 : 5) : 3.5) / stageScale}
                      fill={i === 0 ? (snapActive ? '#2563EB' : activeLayer.color) : '#ffffff'}
                      stroke={snapActive && i === 0 ? '#2563EB' : activeLayer.color}
                      strokeWidth={1.5 / stageScale}
                    />
                  </Group>
                ))}
              </Group>
            )}
          </Group>
        </Layer>
      </Stage>

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

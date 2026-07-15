'use client';

import { memo, useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { useShallow } from 'zustand/shallow';
import { Stage, Layer, Group, Image as KonvaImage, Line, Circle, Text } from 'react-konva';
import type Konva from 'konva';
import { useTracerStore, centroid } from '../store/useTracerStore';

const TracerCanvas = memo(function TracerCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);

  // ── Viewport state ──────────────────────────────────────────────────────────
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [stagePos, setStagePos] = useState({ x: 32, y: 32 });
  const [stageScale, setStageScale] = useState(0.5);

  // ── Pan tracking ────────────────────────────────────────────────────────────
  const isPanningRef = useRef(false);
  const panStart = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const spaceDown = useRef(false);
  const clickTimeRef = useRef(0); // timestamp of last click (for double-click detection)

  // ── Label popup local state ─────────────────────────────────────────────────
  const [labelValue, setLabelValue] = useState('');
  const labelInputRef = useRef<HTMLInputElement>(null);

  // ── Store ───────────────────────────────────────────────────────────────────
  const {
    backgroundImage, backgroundOpacity,
    layers, activeLayerId,
    mode,
    pendingPoints, hoverPoint,
    selectedPolygonId, selectedLayerId,
    pendingLabelId, pendingLabelLayerId,
    addPendingPoint, setHoverPoint,
    commitPolygon, cancelDrawing,
    setPolygonLabel, clearPendingLabel,
    selectPolygon, deletePolygon,
  } = useTracerStore(useShallow(s => ({
    backgroundImage: s.backgroundImage,
    backgroundOpacity: s.backgroundOpacity,
    layers: s.layers,
    activeLayerId: s.activeLayerId,
    mode: s.mode,
    pendingPoints: s.pendingPoints,
    hoverPoint: s.hoverPoint,
    selectedPolygonId: s.selectedPolygonId,
    selectedLayerId: s.selectedLayerId,
    pendingLabelId: s.pendingLabelId,
    pendingLabelLayerId: s.pendingLabelLayerId,
    addPendingPoint: s.addPendingPoint,
    setHoverPoint: s.setHoverPoint,
    commitPolygon: s.commitPolygon,
    cancelDrawing: s.cancelDrawing,
    setPolygonLabel: s.setPolygonLabel,
    clearPendingLabel: s.clearPendingLabel,
    selectPolygon: s.selectPolygon,
    deletePolygon: s.deletePolygon,
  })));

  const activeLayer = layers.find(l => l.id === activeLayerId);

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
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); useTracerStore.getState().undo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); useTracerStore.getState().redo(); }
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

  // ── Label popup: focus input when shown ─────────────────────────────────────
  useEffect(() => {
    if (pendingLabelId) {
      setLabelValue('');
      const t = setTimeout(() => labelInputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [pendingLabelId]);

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
      if (pos) setHoverPoint(pos);
    }
  }, [mode, pendingPoints.length, getImagePos, setHoverPoint]);

  const handleMouseUp = useCallback(() => {
    isPanningRef.current = false;
    panStart.current = null;
  }, []);

  const handleClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.evt.button !== 0 || mode !== 'polygon') return;
    if (isPanningRef.current || spaceDown.current) return;
    // Ignore clicks on existing polygon elements
    if (e.target !== stageRef.current && e.target.hasName('polygon')) return;

    // Double-click detection: if two clicks happen within 300ms, treat as double-click
    const now = Date.now();
    const isDbl = (now - clickTimeRef.current) < 300;
    clickTimeRef.current = now;
    if (isDbl) {
      if (pendingPoints.length >= 3) commitPolygon();
      return;
    }

    const pos = getImagePos();
    if (!pos) return;
    addPendingPoint(pos);
  }, [mode, getImagePos, addPendingPoint, commitPolygon, pendingPoints.length]);

  // Double-click is still handled here for browsers that fire native dblclick
  const handleDblClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.evt.button !== 0 || mode !== 'polygon') return;
    if (pendingPoints.length >= 3) commitPolygon();
  }, [mode, pendingPoints.length, commitPolygon]);

  // ── Label popup position (image-space → screen-space) ───────────────────────
  const labelScreenPos = useMemo(() => {
    if (!pendingLabelId || !pendingLabelLayerId) return null;
    const lyr = layers.find(l => l.id === pendingLabelLayerId);
    const poly = lyr?.polygons.find(p => p.id === pendingLabelId);
    if (!poly?.points.length) return null;
    const c = centroid(poly.points);
    return { x: c.x * stageScale + stagePos.x, y: c.y * stageScale + stagePos.y };
  }, [pendingLabelId, pendingLabelLayerId, layers, stageScale, stagePos]);

  const handleLabelSubmit = useCallback(() => {
    if (pendingLabelId && pendingLabelLayerId) {
      setPolygonLabel(pendingLabelLayerId, pendingLabelId, labelValue.trim());
    }
    clearPendingLabel();
    setLabelValue('');
  }, [pendingLabelId, pendingLabelLayerId, labelValue, setPolygonLabel, clearPendingLabel]);

  // ── Pending points flat array ────────────────────────────────────────────────
  const flatPending = pendingPoints.flatMap(p => [p.x, p.y]);

  // ── Dynamic font size (stays readable regardless of zoom) ───────────────────
  const labelFontSize = Math.max(8, 14 / stageScale);

  const cursorStyle = mode === 'pan' || spaceDown.current
    ? 'grab'
    : mode === 'select'
      ? 'default'
      : 'crosshair';

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden focus:outline-none"
      style={{
        cursor: cursorStyle,
        backgroundColor: '#121212',
        backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
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
        onContextMenu={(e) => e.evt.preventDefault()}
        style={{ display: 'block' }}
      >
        <Layer>
          <Group x={stagePos.x} y={stagePos.y} scaleX={stageScale} scaleY={stageScale}>

            {/* ── Background image (when loaded) ──────────────── */}
            {backgroundImage && (
              <KonvaImage image={backgroundImage} opacity={backgroundOpacity} listening={false} perfectDrawEnabled={false} />
            )}

            {/* ── Completed polygon layers ──────────────────────────── */}
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
                            x={c.x}
                            y={c.y}
                            text={poly.label}
                            fontSize={labelFontSize}
                            fontStyle="bold"
                            fill={layer.color}
                            align="center"
                            width={80 / stageScale}
                            offsetX={40 / stageScale}
                            offsetY={labelFontSize / 2}
                            listening={false}
                          />
                        ) : null}
                      </Group>
                    );
                  })
                : null,
            )}

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
                  <Circle
                    key={i}
                    x={p.x}
                    y={p.y}
                    radius={(i === 0 ? 5 : 3.5) / stageScale}
                    fill={i === 0 ? activeLayer.color : '#ffffff'}
                    stroke={activeLayer.color}
                    strokeWidth={1.5 / stageScale}
                  />
                ))}
              </Group>
            )}
          </Group>
        </Layer>
      </Stage>

      {/* ── Label input popup ─────────────────────────────────────────────── */}
      {labelScreenPos && pendingLabelId && (
        <div
          className="absolute z-50 bg-background border-2 border-primary/60 rounded-xl shadow-2xl p-3 w-56"
          style={{ left: labelScreenPos.x, top: labelScreenPos.y, transform: 'translate(-50%, calc(-100% - 12px))' }}
        >
          <p className="text-[10px] text-muted-foreground mb-1.5 font-heading">দাগ নম্বর লিখুন</p>
          <input
            ref={labelInputRef}
            value={labelValue}
            onChange={e => setLabelValue(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') { e.stopPropagation(); handleLabelSubmit(); }
              if (e.key === 'Escape') { e.stopPropagation(); clearPendingLabel(); setLabelValue(''); }
            }}
            placeholder="D 50"
            className="w-full px-2.5 py-1.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleLabelSubmit}
              className="flex-1 text-xs bg-primary text-primary-foreground rounded-lg py-1.5 hover:bg-primary/90 transition-colors font-medium"
            >
              সংরক্ষণ
            </button>
            <button
              onClick={() => { clearPendingLabel(); setLabelValue(''); }}
              className="text-xs text-muted-foreground hover:text-foreground px-2 transition-colors"
            >
              বাদ
            </button>
          </div>
        </div>
      )}

      {/* ── Drawing status bar ────────────────────────────────────────────── */}
      {pendingPoints.length > 0 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm border border-border rounded-full px-4 py-1.5 text-xs text-muted-foreground shadow-lg whitespace-nowrap pointer-events-none">
          {pendingPoints.length} পয়েন্ট
          {pendingPoints.length >= 3
            ? ' · দুই-ক্লিক বা Enter চাপুন বন্ধ করতে'
            : ` · আরও ${3 - pendingPoints.length}টা পয়েন্ট দরকার`}
          {' · Esc = বাতিল'}
        </div>
      )}

      {/* ── Hint when canvas is empty ─────────────────────────────────────── */}
      {!backgroundImage && layers.every(l => l.polygons.length === 0) && pendingPoints.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
          <div className="text-center bg-background/50 backdrop-blur-sm rounded-2xl px-8 py-6 border border-border/30">
            <div className="text-4xl mb-3">✏️</div>
            <p className="text-sm font-medium text-foreground mb-1">ডিজিটাল ম্যাপ ট্রেসিং</p>
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

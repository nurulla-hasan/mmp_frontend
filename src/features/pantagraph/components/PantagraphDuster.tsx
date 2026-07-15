'use client';

import { memo, useRef, useCallback, useState, useEffect } from 'react';
import { usePantagraphStore } from '../store/usePantagraphStore';
import { clamp } from '@/lib/utils';

interface PantagraphDusterProps {
  containerWidth: number;
  containerHeight: number;
  stagePos: { x: number; y: number };
  stageScale: number;
  target: 'former' | 'current';
}

export const PantagraphDuster = memo(function PantagraphDuster({
  containerWidth,
  containerHeight,
  stagePos,
  stageScale,
  target,
}: PantagraphDusterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const pointsRef = useRef<Array<{ x: number; y: number }>>([]);
  const cursorRef = useRef<HTMLDivElement>(null);
  const processingRef = useRef(false);
  const [showCursor, setShowCursor] = useState(true);

  // ── Coordinate helpers ──

  /** Convert screen (canvas-relative) coords → intrinsic image coords */
  const screenToIntrinsic = useCallback(
    (sx: number, sy: number): { x: number; y: number } | null => {
      const store = usePantagraphStore.getState();
      const mapKey = target === 'former' ? 'formerMap' : 'currentMap';
      const img = store[mapKey];
      if (!img) return null;

      const w = img.naturalWidth || img.width || 0;
      const h = img.naturalHeight || img.height || 0;
      if (!w || !h) return null;

      // Screen → Stage coords
      const stageX = (sx - stagePos.x) / stageScale;
      const stageY = (sy - stagePos.y) / stageScale;

      // Stage → Map coords (subtract map position)
      const posKey = target === 'former' ? 'formerPosition' : 'currentPosition';
      const rotKey = target === 'former' ? 'formerRotation' : 'currentRotation';
      const dx = stageX - store[posKey].x;
      const dy = stageY - store[posKey].y;

      const rad = (store[rotKey] * Math.PI) / 180;

      if (target === 'current') {
        // Current map: only rotation, no scale/skew
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        // Inverse of [cos, sin; -sin, cos]
        const ix = dx * cos - dy * sin;
        const iy = dx * sin + dy * cos;
        return { x: ix, y: iy };
      } else {
        // Former map: rotation + scale + skew
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        const sx = store.formerScaleX;
        const sy = store.formerScaleY;
        const tanKx = Math.tan(store.formerSkewX);

        // Konva forward matrix (translate → rotate → scale → skew):
        // a = sx*(cos + sin*tanKx),  b = sx*sin
        // c = sy*(-sin + cos*tanKx), d = sy*cos
        const a = sx * (cos + sin * tanKx);
        const bMat = sx * sin;
        const cMat = sy * (-sin + cos * tanKx);
        const d = sy * cos;
        const det = sx * sy;
        if (Math.abs(det) < 1e-10) return null;

        // Inverse: [ix iy] = [dx dy] * | a  b |⁻¹
        //                             | c  d |
        // Inverse of [a b; c d] = 1/det * [d -b; -c a]
        const ix = (dx * d - dy * bMat) / det;
        const iy = (a * dy - cMat * dx) / det;
        return { x: ix, y: iy };
      }
    },
    [stagePos, stageScale, target]
  );

  // ── Drawing helpers ──

  const drawCheckerboard = useCallback(
    (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
      const checkSize = 4;
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.clip();
      const startX = Math.floor((x - radius) / checkSize) * checkSize;
      const startY = Math.floor((y - radius) / checkSize) * checkSize;
      const endX = x + radius + checkSize;
      const endY = y + radius + checkSize;
      for (let cy = startY; cy < endY; cy += checkSize) {
        for (let cx = startX; cx < endX; cx += checkSize) {
          const col = Math.floor(cx / checkSize);
          const row = Math.floor(cy / checkSize);
          ctx.fillStyle = (row + col) % 2 === 0 ? '#ffffff' : '#888888';
          ctx.fillRect(cx, cy, checkSize, checkSize);
        }
      }
      ctx.restore();
    },
    []
  );

  const drawCheckerboardStroke = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      from: { x: number; y: number },
      to: { x: number; y: number },
      radius: number
    ) => {
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const step = Math.min(radius * 0.6, 5);
      if (dist < 1) {
        drawCheckerboard(ctx, from.x, from.y, radius);
        return;
      }
      const count = Math.ceil(dist / step);
      for (let i = 0; i <= count; i++) {
        const t = i / count;
        drawCheckerboard(ctx, from.x + dx * t, from.y + dy * t, radius);
      }
    },
    [drawCheckerboard]
  );

  // ── Wheel zoom (forward to Konva stage) ──

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const store = usePantagraphStore.getState();
      const stage = store.stageRef;
      if (!stage) return;

      const rect = canvas.getBoundingClientRect();
      const pointerX = e.clientX - rect.left;
      const pointerY = e.clientY - rect.top;

      const oldScale = store.stageScale;
      const delta = -e.deltaY * 0.001;
      const newScale = clamp(
        oldScale + delta * oldScale,
        0.1,
        10
      );

      const mousePointTo = {
        x: (pointerX - store.stagePos.x) / oldScale,
        y: (pointerY - store.stagePos.y) / oldScale,
      };

      store.setStageScale(newScale);
      store.setStagePos({
        x: pointerX - mousePointTo.x * newScale,
        y: pointerY - mousePointTo.y * newScale,
      });
    };

    const opts: AddEventListenerOptions = { passive: false };
    canvas.addEventListener('wheel', handler as EventListener, opts);
    return () => canvas.removeEventListener('wheel', handler as EventListener, opts);
  }, []);

  // ── Keyboard shortcuts (undo/redo) ──

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        usePantagraphStore.getState().undoEraser();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        usePantagraphStore.getState().redoEraser();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        usePantagraphStore.getState().redoEraser();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // ── Pointer event handlers ──

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (e.button !== 0) return; // left button only
      e.preventDefault();
      isDrawing.current = true;
      pointsRef.current = [];

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;

      const size = usePantagraphStore.getState().dusterSize;
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) drawCheckerboard(ctx, cx, cy, size);

      pointsRef.current.push({ x: cx, y: cy });
    },
    [drawCheckerboard]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      // Always move cursor
      const el = cursorRef.current;
      if (el) {
        el.style.left = `${e.clientX}px`;
        el.style.top = `${e.clientY}px`;
      }

      if (!isDrawing.current) return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;

      const prev = pointsRef.current[pointsRef.current.length - 1];
      if (!prev) return;

      pointsRef.current.push({ x: cx, y: cy });

      const size = usePantagraphStore.getState().dusterSize;
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) drawCheckerboardStroke(ctx, prev, { x: cx, y: cy }, size);
    },
    [drawCheckerboardStroke]
  );

  const handlePointerUp = useCallback(async () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;

    const points = pointsRef.current;
    pointsRef.current = [];

    if (points.length === 0) return;

    // Prevent concurrent processing
    if (processingRef.current) return;
    processingRef.current = true;
    setShowCursor(false);

    try {
      const store = usePantagraphStore.getState();
      const dusterSize = store.dusterSize;

      // Convert all screen points to intrinsic coords
      const intrinsicPoints: Array<{ x: number; y: number }> = [];
      for (const p of points) {
        const intr = screenToIntrinsic(p.x, p.y);
        if (!intr) continue;

        // Bounds check with margin
        const mapKey = target === 'former' ? 'formerMap' : 'currentMap';
        const img = store[mapKey];
        if (!img) continue;
        const w = img.naturalWidth || img.width || 0;
        const h = img.naturalHeight || img.height || 0;
        const margin = dusterSize + 5;
        if (
          intr.x >= -margin &&
          intr.y >= -margin &&
          intr.x < w + margin &&
          intr.y < h + margin
        ) {
          intrinsicPoints.push(intr);
        }
      }

      if (intrinsicPoints.length > 0) {
        // For many points, sample every 4th for performance
        let sampled: Array<{ x: number; y: number }>;
        if (intrinsicPoints.length <= 12) {
          sampled = intrinsicPoints;
        } else {
          sampled = [intrinsicPoints[0]];
          for (let i = 4; i < intrinsicPoints.length - 4; i += 4) {
            sampled.push(intrinsicPoints[i]);
          }
          sampled.push(intrinsicPoints[intrinsicPoints.length - 1]);
        }

        // Scale radius: screen pixels → intrinsic image pixels
        const intrinsicRadius = dusterSize / stageScale;
        await store.applyDusterStroke(target, sampled, intrinsicRadius);
      }
    } finally {
      processingRef.current = false;
      setShowCursor(true);

      // Clear overlay
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx && canvasRef.current) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  }, [screenToIntrinsic, target, stageScale]);

  const dusterSize = usePantagraphStore((s) => s.dusterSize);

  return (
    <>
      {/* Custom eraser cursor — follows mouse */}
      <div
        ref={cursorRef}
        className="fixed pointer-events-none z-50"
        style={{
          width: dusterSize * 2,
          height: dusterSize * 2,
          borderRadius: '50%',
          border: '2px solid rgba(255, 60, 60, 0.8)',
          backgroundColor: 'rgba(255, 60, 60, 0.15)',
          transform: 'translate(-50%, -50%)',
          display: showCursor ? 'block' : 'none',
        }}
      />
      {/* Transparent overlay that captures pointer events */}
      <canvas
        ref={canvasRef}
        width={containerWidth}
        height={containerHeight}
        className="absolute inset-0 z-20"
        style={{ cursor: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
    </>
  );
});

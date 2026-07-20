'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { ControlPair, Point2D } from '../types';

type SourceMapCanvasProps = {
  image: HTMLImageElement;
  controlPairs: ControlPair[];
  pendingSource: Point2D | null;
  active: boolean;
  onPlacePoint: (point: Point2D) => void;
};

type ViewState = {
  scale: number;
  x: number;
  y: number;
};

export default function SourceMapCanvas({
  image,
  controlPairs,
  pendingSource,
  active,
  onPlacePoint,
}: SourceMapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef<{
    id: number;
    clientX: number;
    clientY: number;
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [view, setView] = useState<ViewState>({ scale: 1, x: 0, y: 0 });

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      setSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!size.width || !size.height) return;
    const imageWidth = image.naturalWidth || image.width;
    const imageHeight = image.naturalHeight || image.height;
    const scale = Math.min(
      (size.width - 48) / imageWidth,
      (size.height - 48) / imageHeight,
      1,
    );
    const frame = requestAnimationFrame(() => {
      setView({
        scale,
        x: (size.width - imageWidth * scale) / 2,
        y: (size.height - imageHeight * scale) / 2,
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [image, size.height, size.width]);

  const getSourcePoint = useCallback(
    (clientX: number, clientY: number): Point2D | null => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return null;
      const point = {
        x: (clientX - rect.left - view.x) / view.scale,
        y: (clientY - rect.top - view.y) / view.scale,
      };
      const width = image.naturalWidth || image.width;
      const height = image.naturalHeight || image.height;
      if (point.x < 0 || point.y < 0 || point.x > width || point.y > height) {
        return null;
      }
      return point;
    },
    [image, view],
  );

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!active || event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointerRef.current = {
      id: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
    };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const pointer = pointerRef.current;
    if (!pointer || pointer.id !== event.pointerId) return;
    const dx = event.clientX - pointer.clientX;
    const dy = event.clientY - pointer.clientY;
    if (
      Math.hypot(
        event.clientX - pointer.startX,
        event.clientY - pointer.startY,
      ) > 4
    ) {
      pointer.moved = true;
    }
    pointer.clientX = event.clientX;
    pointer.clientY = event.clientY;
    if (pointer.moved) {
      setView((current) => ({ ...current, x: current.x + dx, y: current.y + dy }));
    }
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const pointer = pointerRef.current;
    pointerRef.current = null;
    if (!pointer || pointer.id !== event.pointerId || pointer.moved) return;
    const point = getSourcePoint(event.clientX, event.clientY);
    if (point) onPlacePoint(point);
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pointerX = event.clientX - rect.left;
    const pointerY = event.clientY - rect.top;
    const factor = event.deltaY < 0 ? 1.12 : 1 / 1.12;

    setView((current) => {
      const nextScale = Math.max(0.03, Math.min(16, current.scale * factor));
      const sourceX = (pointerX - current.x) / current.scale;
      const sourceY = (pointerY - current.y) / current.scale;
      return {
        scale: nextScale,
        x: pointerX - sourceX * nextScale,
        y: pointerY - sourceY * nextScale,
      };
    });
  };

  const markers = [
    ...controlPairs.map((pair, index) => ({
      id: pair.id,
      point: pair.source,
      label: index + 1,
      pending: false,
    })),
    ...(pendingSource
      ? [{ id: 'pending', point: pendingSource, label: controlPairs.length + 1, pending: true }]
      : []),
  ];

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full touch-none overflow-hidden bg-muted"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        pointerRef.current = null;
      }}
      onWheel={handleWheel}
    >
      {/* Blob/data URL source maps cannot use Next Image optimization. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.src}
        alt="আপলোড করা মৌজা ম্যাপ"
        draggable={false}
        className="pointer-events-none absolute left-0 top-0 max-w-none select-none shadow-2xl"
        style={{
          width: image.naturalWidth || image.width,
          height: image.naturalHeight || image.height,
          transformOrigin: '0 0',
          transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
        }}
      />

      {markers.map((marker) => (
        <div
          key={marker.id}
          className="pointer-events-none absolute z-10 flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-background bg-destructive text-xs font-bold text-destructive-foreground shadow-lg"
          style={{
            left: view.x + marker.point.x * view.scale,
            top: view.y + marker.point.y * view.scale,
            opacity: marker.pending ? 0.7 : 1,
          }}
        >
          {marker.label}
        </div>
      ))}

      <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-lg border border-border bg-background/90 px-3 py-2 text-center text-xs text-foreground shadow-lg backdrop-blur">
        Click: control point · Drag: pan · Wheel: zoom
      </div>
    </div>
  );
}

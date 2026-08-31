"use client";

import { MapPin } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import type { ControlPair, Point2D } from "../types";

type SourceMapCanvasProps = {
  image: HTMLImageElement;
  imageSize: { width: number; height: number };
  controlPairs: ControlPair[];
  pendingSource: Point2D | null;
  active: boolean;
  pointMode: boolean;
  onPlacePoint: (point: Point2D) => void;
};

type ViewState = { scale: number; x: number; y: number };
type ActivePointer = {
  clientX: number;
  clientY: number;
  startX: number;
  startY: number;
  moved: boolean;
};

const clampScale = (scale: number) => Math.max(0.03, Math.min(16, scale));

export default function SourceMapCanvas({
  image,
  imageSize,
  controlPairs,
  pendingSource,
  active,
  pointMode,
  onPlacePoint,
}: SourceMapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointersRef = useRef(new Map<number, ActivePointer>());
  const gestureUsedMultipleRef = useRef(false);
  const pinchRef = useRef<{
    distance: number;
    centerX: number;
    centerY: number;
  } | null>(null);
  const drawFrameRef = useRef<number | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [view, setView] = useState<ViewState>({ scale: 1, x: 0, y: 0 });

  const scheduleDraw = useCallback(() => {
    if (drawFrameRef.current !== null) {
      window.cancelAnimationFrame(drawFrameRef.current);
    }
    drawFrameRef.current = window.requestAnimationFrame(() => {
      drawFrameRef.current = null;
      const canvas = canvasRef.current;
      if (!canvas || !size.width || !size.height) return;

      const deviceMemory =
        (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
      const ratio = Math.min(
        window.devicePixelRatio || 1,
        deviceMemory <= 4 ? 1.5 : 2,
      );
      const pixelWidth = Math.round(size.width * ratio);
      const pixelHeight = Math.round(size.height * ratio);
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
        canvas.style.width = `${size.width}px`;
        canvas.style.height = `${size.height}px`;
      }

      const context = canvas.getContext("2d");
      if (!context) return;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, size.width, size.height);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.setTransform(
        view.scale * ratio,
        0,
        0,
        view.scale * ratio,
        view.x * ratio,
        view.y * ratio,
      );
      context.drawImage(image, 0, 0, imageSize.width, imageSize.height);
    });
  }, [image, imageSize.height, imageSize.width, size.height, size.width, view]);

  useEffect(() => {
    scheduleDraw();
  }, [scheduleDraw]);

  useEffect(
    () => () => {
      if (drawFrameRef.current !== null) {
        window.cancelAnimationFrame(drawFrameRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    const element = containerRef.current;
    if (!element || !active) return;
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = element.getBoundingClientRect();
      const pointerX = event.clientX - rect.left;
      const pointerY = event.clientY - rect.top;
      const factor = event.deltaY < 0 ? 1.12 : 1 / 1.12;
      setView((current) => {
        const nextScale = clampScale(current.scale * factor);
        const sourceX = (pointerX - current.x) / current.scale;
        const sourceY = (pointerY - current.y) / current.scale;
        return {
          scale: nextScale,
          x: pointerX - sourceX * nextScale,
          y: pointerY - sourceY * nextScale,
        };
      });
    };
    element.addEventListener("wheel", handleWheel, { passive: false });
    return () => element.removeEventListener("wheel", handleWheel);
  }, [active]);

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
    if (!size.width || !size.height || !imageSize.width || !imageSize.height)
      return;
    const scale = Math.max(
      0.03,
      Math.min(
        (size.width - 48) / imageSize.width,
        (size.height - 48) / imageSize.height,
        1,
      ),
    );
    const frame = window.requestAnimationFrame(() => {
      setView({
        scale,
        x: (size.width - imageSize.width * scale) / 2,
        y: (size.height - imageSize.height * scale) / 2,
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [imageSize.height, imageSize.width, size.height, size.width]);

  const getSourcePoint = useCallback(
    (clientX: number, clientY: number): Point2D | null => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return null;
      const point = {
        x: (clientX - rect.left - view.x) / view.scale,
        y: (clientY - rect.top - view.y) / view.scale,
      };
      if (
        point.x < 0 ||
        point.y < 0 ||
        point.x > imageSize.width ||
        point.y > imageSize.height
      ) {
        return null;
      }
      return point;
    },
    [imageSize.height, imageSize.width, view],
  );

  const getPinch = () => {
    const points = [...pointersRef.current.values()];
    if (points.length < 2) return null;
    const first = points[0];
    const second = points[1];
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return {
      distance: Math.max(
        1,
        Math.hypot(
          second.clientX - first.clientX,
          second.clientY - first.clientY,
        ),
      ),
      centerX: (first.clientX + second.clientX) / 2 - rect.left,
      centerY: (first.clientY + second.clientY) / 2 - rect.top,
    };
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!active || (event.pointerType === "mouse" && event.button !== 0))
      return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointersRef.current.set(event.pointerId, {
      clientX: event.clientX,
      clientY: event.clientY,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
    });
    if (pointersRef.current.size >= 2) {
      gestureUsedMultipleRef.current = true;
      pointersRef.current.forEach((pointer) => {
        pointer.moved = true;
      });
      pinchRef.current = getPinch();
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const pointer = pointersRef.current.get(event.pointerId);
    if (!pointer) return;
    const previousX = pointer.clientX;
    const previousY = pointer.clientY;
    pointer.clientX = event.clientX;
    pointer.clientY = event.clientY;

    if (pointersRef.current.size >= 2) {
      const previousPinch = pinchRef.current;
      const nextPinch = getPinch();
      if (previousPinch && nextPinch) {
        setView((current) => {
          const nextScale = clampScale(
            current.scale * (nextPinch.distance / previousPinch.distance),
          );
          const sourceX = (previousPinch.centerX - current.x) / current.scale;
          const sourceY = (previousPinch.centerY - current.y) / current.scale;
          return {
            scale: nextScale,
            x: nextPinch.centerX - sourceX * nextScale,
            y: nextPinch.centerY - sourceY * nextScale,
          };
        });
      }
      pinchRef.current = nextPinch;
      return;
    }

    if (
      Math.hypot(
        event.clientX - pointer.startX,
        event.clientY - pointer.startY,
      ) > 4
    ) {
      pointer.moved = true;
    }
    if (pointer.moved) {
      setView((current) => ({
        ...current,
        x: current.x + event.clientX - previousX,
        y: current.y + event.clientY - previousY,
      }));
    }
  };

  const finishPointer = (
    event: React.PointerEvent<HTMLDivElement>,
    cancelled = false,
  ) => {
    const pointer = pointersRef.current.get(event.pointerId);
    const wasOnlyPointer = pointersRef.current.size === 1;
    pointersRef.current.delete(event.pointerId);
    pinchRef.current = pointersRef.current.size >= 2 ? getPinch() : null;

    if (pointersRef.current.size === 1) {
      const remaining = [...pointersRef.current.values()][0];
      remaining.startX = remaining.clientX;
      remaining.startY = remaining.clientY;
      remaining.moved = true;
    }

    if (
      !cancelled &&
      pointer &&
      wasOnlyPointer &&
      !pointer.moved &&
      !gestureUsedMultipleRef.current
    ) {
      const point = getSourcePoint(event.clientX, event.clientY);
      if (point && pointMode) onPlacePoint(point);
    }
    if (pointersRef.current.size === 0) {
      gestureUsedMultipleRef.current = false;
    }
  };

  const markers = [
    ...controlPairs.map((pair, index) => ({
      id: pair.id,
      point: pair.source,
      label: index + 1,
      pending: false,
    })),
    ...(pendingSource
      ? [
          {
            id: "pending",
            point: pendingSource,
            label: controlPairs.length + 1,
            pending: true,
          },
        ]
      : []),
  ];

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full touch-none overflow-hidden bg-transparent ${
        pointMode ? "cursor-crosshair" : "cursor-grab active:cursor-grabbing"
      }`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={(event) => finishPointer(event)}
      onPointerCancel={(event) => finishPointer(event, true)}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 select-none"
        aria-label="আপলোড করা মৌজা ম্যাপ"
      />

      {markers.map((marker) => (
        <div
          key={marker.id}
          className="pointer-events-none absolute z-10 size-8 -translate-x-1/2 -translate-y-full drop-shadow-md select-none"
          style={{
            left: view.x + marker.point.x * view.scale,
            top: view.y + marker.point.y * view.scale,
            opacity: marker.pending ? 0.7 : 1,
          }}
        >
          <svg
            viewBox="0 0 28 36"
            className="w-full h-full"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer pin body */}
            <path
              d="M14 1C6.82 1 1 6.82 1 14C1 23.75 14 35 14 35C14 35 27 23.75 27 14C27 6.82 21.18 1 14 1Z"
              fill="#DC2626"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Crisp white inner badge */}
            <circle cx="14" cy="14" r="7.5" fill="#FFFFFF" />
            {/* Centered bold number label */}
            <text
              x="14"
              y="18"
              textAnchor="middle"
              fill="#DC2626"
              fontSize="11"
              fontWeight="bold"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              {marker.label}
            </text>
          </svg>
        </div>
      ))}

      <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-lg border border-border bg-background/90 px-3 py-1.5 text-center text-xs text-foreground shadow-lg backdrop-blur flex items-center gap-2">
        <span
          className={`size-2 rounded-full ${
            pointMode ? "bg-primary animate-pulse" : "bg-muted-foreground"
          }`}
        />
        <span>
          {pointMode
            ? "পয়েন্ট মোড চালু: ম্যাপে ক্লিক করে পয়েন্ট বসান · ড্র্যাগ: প্যান"
            : "প্যান মোড: ম্যাপ ড্র্যাগ করুন · পয়েন্ট বসাতে পয়েন্ট মোড অন করুন"}
        </span>
      </div>
    </div>
  );
}

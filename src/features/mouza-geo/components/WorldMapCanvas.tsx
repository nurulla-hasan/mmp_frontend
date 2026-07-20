'use client';

import 'maplibre-gl/dist/maplibre-gl.css';

import maplibregl, { type Map as MapLibreMap } from 'maplibre-gl';
import { useCallback, useEffect, useRef, useState } from 'react';

import type {
  ControlPair,
  GeoPoint,
  GeoTransform,
  MercatorPoint,
} from '../types';
import {
  applyGeoTransform,
  fromMercator,
  toMercator,
} from '../utils/geoMath';

type InteractionTarget = 'map' | 'pdf';

type WorldMapCanvasProps = {
  image: HTMLImageElement;
  transform: GeoTransform | null;
  controlPairs: ControlPair[];
  waitingForWorldPoint: boolean;
  opacity: number;
  interactionTarget: InteractionTarget;
  onPlaceWorldPoint: (point: GeoPoint) => void;
  onTranslateOverlay: (delta: MercatorPoint) => void;
  onScaleOverlay: (factor: number) => void;
  onRotateOverlay: (angleRadians: number) => void;
};

export default function WorldMapCanvas(props: WorldMapCanvasProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const propsRef = useRef(props);
  const dragRef = useRef<{ id: number; point: MercatorPoint } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const toScreenPoint = useCallback((source: { x: number; y: number }) => {
    const transform = propsRef.current.transform;
    const map = mapRef.current;
    if (!transform || !map) return null;

    const geo = fromMercator(applyGeoTransform(transform, source));
    return map.project([geo.lng, geo.lat]);
  }, []);

  const drawOverlay = useCallback(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    const map = mapRef.current;
    if (!canvas || !host || !map) return;

    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = host.clientWidth;
    const height = host.clientHeight;

    if (
      canvas.width !== Math.round(width * ratio) ||
      canvas.height !== Math.round(height * ratio)
    ) {
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    }

    const context = canvas.getContext('2d');
    if (!context) return;

    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);

    const { image, transform, opacity, controlPairs } = propsRef.current;

    if (transform) {
      const imageWidth = image.naturalWidth || image.width;
      const imageHeight = image.naturalHeight || image.height;
      const origin = toScreenPoint({ x: 0, y: 0 });
      const right = toScreenPoint({ x: imageWidth, y: 0 });
      const bottom = toScreenPoint({ x: 0, y: imageHeight });

      if (origin && right && bottom) {
        context.save();
        context.globalAlpha = opacity;
        context.setTransform(
          ((right.x - origin.x) / imageWidth) * ratio,
          ((right.y - origin.y) / imageWidth) * ratio,
          ((bottom.x - origin.x) / imageHeight) * ratio,
          ((bottom.y - origin.y) / imageHeight) * ratio,
          origin.x * ratio,
          origin.y * ratio,
        );
        context.drawImage(image, 0, 0, imageWidth, imageHeight);
        context.restore();
      }
    }

    controlPairs.forEach((pair, index) => {
      const point = map.project([pair.world.lng, pair.world.lat]);

      context.beginPath();
      context.fillStyle = 'rgb(37 99 235)';
      context.strokeStyle = 'white';
      context.lineWidth = 2;
      context.arc(point.x, point.y, 12, 0, Math.PI * 2);
      context.fill();
      context.stroke();

      context.fillStyle = 'white';
      context.font = '700 12px sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(String(index + 1), point.x, point.y);
    });
  }, [toScreenPoint]);

  useEffect(() => {
    propsRef.current = props;
    drawOverlay();
  }, [drawOverlay, props]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;

    const map = new maplibregl.Map({
      container: host,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [88.6354, 25.6217],
      zoom: 15,
      attributionControl: { compact: true },
      dragRotate: false,
      touchPitch: false,
      pitchWithRotate: false,
    });

    mapRef.current = map;
    map.touchZoomRotate.disableRotation();
    map.keyboard.disableRotation();

    const handleLoad = () => {
      if (cancelled) return;
      setLoading(false);
      setError(null);
      drawOverlay();
    };

    const handleMove = () => drawOverlay();

    const handleClick = (event: maplibregl.MapMouseEvent) => {
      const current = propsRef.current;
      if (!current.waitingForWorldPoint) return;

      current.onPlaceWorldPoint({
        lat: event.lngLat.lat,
        lng: event.lngLat.lng,
      });
    };

    const handleError = (event: maplibregl.ErrorEvent) => {
      if (cancelled || map.isStyleLoaded()) return;
      setLoading(false);
      setError(event.error?.message ?? 'Free map load করা যায়নি');
    };

    map.on('load', handleLoad);
    map.on('move', handleMove);
    map.on('resize', handleMove);
    map.on('click', handleClick);
    map.on('error', handleError);

    return () => {
      cancelled = true;
      map.off('load', handleLoad);
      map.off('move', handleMove);
      map.off('resize', handleMove);
      map.off('click', handleClick);
      map.off('error', handleError);
      map.remove();
      mapRef.current = null;
    };
  }, [drawOverlay]);

  const getMercatorAtPointer = (clientX: number, clientY: number) => {
    const host = hostRef.current;
    const map = mapRef.current;
    if (!host || !map) return null;

    const rect = host.getBoundingClientRect();
    const point = map.unproject([clientX - rect.left, clientY - rect.top]);
    return toMercator({ lat: point.lat, lng: point.lng });
  };

  const pdfInteractionEnabled =
    props.interactionTarget === 'pdf' &&
    Boolean(props.transform) &&
    !props.waitingForWorldPoint;

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!pdfInteractionEnabled || event.button !== 0) return;

    const point = getMercatorAtPointer(event.clientX, event.clientY);
    if (!point) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { id: event.pointerId, point };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;

    const next = getMercatorAtPointer(event.clientX, event.clientY);
    if (!next) return;

    propsRef.current.onTranslateOverlay({
      u: next.u - drag.point.u,
      v: next.v - drag.point.v,
    });
    drag.point = next;
  };

  const handleWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    if (!pdfInteractionEnabled) return;

    event.preventDefault();

    if (event.altKey) {
      propsRef.current.onRotateOverlay(event.deltaY < 0 ? -0.01 : 0.01);
      return;
    }

    propsRef.current.onScaleOverlay(event.deltaY < 0 ? 1.04 : 1 / 1.04);
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-muted">
      <div ref={hostRef} className="absolute inset-0" />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 touch-none"
        style={{ pointerEvents: pdfInteractionEnabled ? 'auto' : 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={() => {
          dragRef.current = null;
        }}
        onPointerCancel={() => {
          dragRef.current = null;
        }}
        onWheel={handleWheel}
      />

      {loading && (
        <div className="absolute inset-0 grid place-items-center bg-background/80 text-sm text-foreground">
          Free OpenStreetMap load হচ্ছে…
        </div>
      )}

      {error && (
        <div className="absolute inset-0 grid place-items-center bg-background p-6 text-center">
          <div className="max-w-md rounded-xl border border-border bg-card p-5 text-sm text-card-foreground shadow-lg">
            <p className="font-semibold">OpenStreetMap চালু করা যায়নি</p>
            <p className="mt-2 text-muted-foreground">{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && props.waitingForWorldPoint && (
        <div className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 rounded-lg border border-border bg-background/90 px-4 py-2 text-xs font-semibold text-foreground shadow-lg backdrop-blur">
          PDF point-এর একই জায়গায় OpenStreetMap-এ click করুন
        </div>
      )}

      {pdfInteractionEnabled && (
        <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-lg border border-border bg-background/90 px-3 py-2 text-center text-xs text-foreground shadow-lg backdrop-blur">
          Drag: PDF সরান · Wheel: scale · Alt + Wheel: rotate
        </div>
      )}
    </div>
  );
}

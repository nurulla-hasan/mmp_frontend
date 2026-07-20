'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type {
  ControlPair,
  GeoPoint,
  GeoTransform,
  GoogleMap,
  GoogleMapsApi,
  GoogleOverlayView,
  MercatorPoint,
} from '../types';
import {
  applyGeoTransform,
  fromMercator,
  toMercator,
} from '../utils/geoMath';
import { loadGoogleMaps } from '../utils/loadGoogleMaps';

type InteractionTarget = 'map' | 'pdf';

type WorldMapCanvasProps = {
  apiKey: string;
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

type CurrentProps = Omit<WorldMapCanvasProps, 'apiKey'>;

export default function WorldMapCanvas(props: WorldMapCanvasProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapRef = useRef<GoogleMap | null>(null);
  const mapsRef = useRef<GoogleMapsApi | null>(null);
  const bridgeRef = useRef<GoogleOverlayView | null>(null);
  const propsRef = useRef<CurrentProps>(props);
  const dragRef = useRef<{ id: number; point: MercatorPoint } | null>(null);
  const [error, setError] = useState<string | null>(() =>
    props.apiKey ? null : 'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY সেট করা হয়নি',
  );
  const [loading, setLoading] = useState(Boolean(props.apiKey));

  const toScreenPoint = useCallback((source: { x: number; y: number }) => {
    const transform = propsRef.current.transform;
    const maps = mapsRef.current;
    const bridge = bridgeRef.current;
    if (!transform || !maps || !bridge) return null;
    const geo = fromMercator(applyGeoTransform(transform, source));
    return bridge
      .getProjection()
      .fromLatLngToContainerPixel(new maps.LatLng(geo.lat, geo.lng));
  }, []);

  const drawOverlay = useCallback(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    const maps = mapsRef.current;
    const bridge = bridgeRef.current;
    if (!canvas || !host || !maps || !bridge) return;

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

    const projection = bridge.getProjection();
    controlPairs.forEach((pair, index) => {
      const point = projection.fromLatLngToContainerPixel(
        new maps.LatLng(pair.world.lat, pair.world.lng),
      );
      if (!point) return;
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
    if (!props.apiKey) {
      return;
    }

    let cancelled = false;
    let listeners: Array<{ remove: () => void }> = [];
    let bridge: GoogleOverlayView | null = null;

    void loadGoogleMaps(props.apiKey)
      .then((maps) => {
        if (cancelled || !hostRef.current) return;
        mapsRef.current = maps;
        const map = new maps.Map(hostRef.current, {
          center: { lat: 25.6217, lng: 88.6354 },
          zoom: 15,
          mapTypeId: maps.MapTypeId.HYBRID,
          streetViewControl: false,
          fullscreenControl: false,
          mapTypeControl: true,
          clickableIcons: false,
          gestureHandling: 'greedy',
        });
        mapRef.current = map;

        bridge = new maps.OverlayView();
        bridge.onAdd = () => undefined;
        bridge.draw = drawOverlay;
        bridge.onRemove = () => undefined;
        bridge.setMap(map);
        bridgeRef.current = bridge;

        listeners = [
          map.addListener('click', (event) => {
            const current = propsRef.current;
            if (!current.waitingForWorldPoint || !event.latLng) return;
            current.onPlaceWorldPoint({
              lat: event.latLng.lat(),
              lng: event.latLng.lng(),
            });
          }),
          map.addListener('idle', () => drawOverlay()),
          map.addListener('zoom_changed', () => drawOverlay()),
          map.addListener('center_changed', () => drawOverlay()),
        ];
        setLoading(false);
      })
      .catch((loadError: unknown) => {
        if (cancelled) return;
        setLoading(false);
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Google Maps load হয়নি',
        );
      });

    return () => {
      cancelled = true;
      listeners.forEach((listener) => listener.remove());
      bridge?.setMap(null);
      bridgeRef.current = null;
      mapRef.current = null;
    };
  }, [drawOverlay, props.apiKey]);

  const getMercatorAtPointer = (clientX: number, clientY: number) => {
    const host = hostRef.current;
    const bridge = bridgeRef.current;
    const maps = mapsRef.current;
    if (!host || !bridge || !maps) return null;
    const rect = host.getBoundingClientRect();
    const latLng = bridge.getProjection().fromContainerPixelToLatLng(
      new maps.Point(clientX - rect.left, clientY - rect.top),
      true,
    );
    return latLng ? toMercator({ lat: latLng.lat(), lng: latLng.lng() }) : null;
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
          Google Map load হচ্ছে…
        </div>
      )}
      {error && (
        <div className="absolute inset-0 grid place-items-center bg-background p-6 text-center">
          <div className="max-w-md rounded-xl border border-border bg-card p-5 text-sm text-card-foreground shadow-lg">
            <p className="font-semibold">Google Map চালু করা যায়নি</p>
            <p className="mt-2 text-muted-foreground">{error}</p>
          </div>
        </div>
      )}
      {!loading && !error && props.waitingForWorldPoint && (
        <div className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 rounded-lg border border-border bg-background/90 px-4 py-2 text-xs font-semibold text-foreground shadow-lg backdrop-blur">
          PDF point-এর একই জায়গায় Google Map-এ click করুন
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

"use client";

import "leaflet/dist/leaflet.css";

import type { LeafletMouseEvent, Map as LeafletMap, TileLayer } from "leaflet";
import { useCallback, useEffect, useRef, useState } from "react";

import type {
  ControlPair,
  GeoPoint,
  GeoTransform,
  MercatorPoint,
  Point2D,
} from "../types";
import { applyGeoTransform, fromMercator, toMercator } from "../utils/geoMath";

type InteractionTarget = "map" | "pdf";

function sourcePointAtWorld(
  transform: GeoTransform,
  world: MercatorPoint,
): Point2D | null {
  const determinant = transform.a * transform.d - transform.b * transform.c;
  if (Math.abs(determinant) < 1e-20) return null;
  const u = world.u - transform.tx;
  const v = world.v - transform.ty;
  return {
    x: (transform.d * u - transform.b * v) / determinant,
    y: (-transform.c * u + transform.a * v) / determinant,
  };
}

type WorldMapCanvasProps = {
  active: boolean;
  image: HTMLImageElement;
  imageSize: { width: number; height: number };
  transform: GeoTransform | null;
  controlPairs: ControlPair[];
  waitingForWorldPoint: boolean;
  opacity: number;
  mapStyle: "satellite" | "street";
  interactionTarget: InteractionTarget;
  onPlaceWorldPoint: (point: GeoPoint) => void;
  onTranslateOverlay: (delta: MercatorPoint) => void;
  onScaleOverlay: (factor: number, anchor?: Point2D) => void;
  onRotateOverlay: (angleRadians: number) => void;
};

export default function WorldMapCanvas(props: WorldMapCanvasProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const baseLayerRef = useRef<TileLayer | null>(null);
  const labelLayerRef = useRef<TileLayer | null>(null);
  const propsRef = useRef(props);
  const dragRef = useRef<{ id: number; point: MercatorPoint } | null>(null);
  const drawFrameRef = useRef<number | null>(null);
  const interactionFrameRef = useRef<number | null>(null);
  const pendingTranslationRef = useRef<MercatorPoint>({ u: 0, v: 0 });
  const pendingScaleRef = useRef(1);
  const pendingScaleAnchorRef = useRef<Point2D | null>(null);
  const pendingRotationRef = useRef(0);
  const touchPointsRef = useRef(new Map<number, { x: number; y: number }>());
  const pinchRef = useRef<{
    distance: number;
    center: MercatorPoint;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const installBaseMap = useCallback(
    (
      leaflet: typeof import("leaflet"),
      map: LeafletMap,
      style: "satellite" | "street",
    ) => {
      baseLayerRef.current?.remove();
      labelLayerRef.current?.remove();
      labelLayerRef.current = null;

      if (style === "satellite") {
        baseLayerRef.current = leaflet
          .tileLayer(
            "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            {
              minZoom: 2,
              maxZoom: 19,
              attribution: "Tiles &copy; Esri — Sources: Esri and contributors",
            },
          )
          .addTo(map);

        labelLayerRef.current = leaflet
          .tileLayer(
            "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
            {
              minZoom: 2,
              maxZoom: 19,
              attribution: "Labels &copy; Esri",
            },
          )
          .addTo(map);
        return;
      }

      baseLayerRef.current = leaflet
        .tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          minZoom: 2,
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
        })
        .addTo(map);
    },
    [],
  );

  const toScreenPoint = useCallback((source: { x: number; y: number }) => {
    const transform = propsRef.current.transform;
    const map = mapRef.current;
    if (!transform || !map) return null;

    const geo = fromMercator(applyGeoTransform(transform, source));
    return map.latLngToContainerPoint([geo.lat, geo.lng]);
  }, []);

  const drawOverlay = useCallback(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    const map = mapRef.current;
    if (!canvas || !host || !map) return;

    const deviceMemory =
      (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
    const ratio = Math.min(
      window.devicePixelRatio || 1,
      deviceMemory <= 4 ? 1.5 : 2,
    );
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

    const context = canvas.getContext("2d");
    if (!context) return;

    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);

    const { image, imageSize, transform, opacity, controlPairs } =
      propsRef.current;

    if (transform) {
      const imageWidth = imageSize.width;
      const imageHeight = imageSize.height;
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
      const point = map.latLngToContainerPoint([
        pair.world.lat,
        pair.world.lng,
      ]);

      const tipX = point.x;
      const tipY = point.y;
      context.beginPath();
      context.moveTo(tipX, tipY);
      context.bezierCurveTo(
        tipX - 3,
        tipY - 7,
        tipX - 13,
        tipY - 12,
        tipX - 13,
        tipY - 22,
      );
      context.arc(tipX, tipY - 22, 13, Math.PI, 0);
      context.bezierCurveTo(
        tipX + 13,
        tipY - 12,
        tipX + 3,
        tipY - 7,
        tipX,
        tipY,
      );
      context.closePath();
      context.fillStyle = "rgb(220 38 38)";
      context.strokeStyle = "white";
      context.lineWidth = 2;
      context.fill();
      context.stroke();

      context.fillStyle = "white";
      context.font = "700 12px sans-serif";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(String(index + 1), tipX, tipY - 22);
    });
  }, [toScreenPoint]);

  const scheduleDraw = useCallback(() => {
    if (drawFrameRef.current !== null) return;
    drawFrameRef.current = window.requestAnimationFrame(() => {
      drawFrameRef.current = null;
      drawOverlay();
    });
  }, [drawOverlay]);

  const scheduleInteraction = useCallback(() => {
    if (interactionFrameRef.current !== null) return;
    interactionFrameRef.current = window.requestAnimationFrame(() => {
      interactionFrameRef.current = null;
      const translation = pendingTranslationRef.current;
      const scale = pendingScaleRef.current;
      const scaleAnchor = pendingScaleAnchorRef.current;
      const rotation = pendingRotationRef.current;
      pendingTranslationRef.current = { u: 0, v: 0 };
      pendingScaleRef.current = 1;
      pendingScaleAnchorRef.current = null;
      pendingRotationRef.current = 0;

      if (translation.u || translation.v) {
        propsRef.current.onTranslateOverlay(translation);
      }
      if (scale !== 1) {
        propsRef.current.onScaleOverlay(scale, scaleAnchor ?? undefined);
      }
      if (rotation) propsRef.current.onRotateOverlay(rotation);
    });
  }, []);

  useEffect(() => {
    propsRef.current = props;
    if (props.active) scheduleDraw();
  }, [props, scheduleDraw]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    let map: LeafletMap | null = null;
    let resizeObserver: ResizeObserver | null = null;

    void import("leaflet")
      .then((leaflet) => {
        if (cancelled) return;

        map = leaflet
          .map(host, {
            center: [25.6217, 88.6354],
            zoom: 15,
            zoomControl: false,
            attributionControl: true,
            zoomAnimation: false,
            fadeAnimation: false,
            markerZoomAnimation: false,
          })
          .setView([25.6217, 88.6354], 15);

        mapRef.current = map;
        installBaseMap(leaflet, map, propsRef.current.mapStyle);

        const handleClick = (event: LeafletMouseEvent) => {
          const current = propsRef.current;
          if (!current.waitingForWorldPoint) return;

          current.onPlaceWorldPoint({
            lat: event.latlng.lat,
            lng: event.latlng.lng,
          });
        };

        map.on("click", handleClick);
        map.on("move zoom resize", scheduleDraw);
        map.whenReady(() => {
          if (cancelled) return;
          setLoading(false);
          setError(null);
          map?.invalidateSize({ pan: false });
          scheduleDraw();
        });

        resizeObserver = new ResizeObserver(() => {
          map?.invalidateSize({ pan: false });
          scheduleDraw();
        });
        resizeObserver.observe(host);
      })
      .catch((loadError: unknown) => {
        if (cancelled) return;
        setLoading(false);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "OpenStreetMap load করা যায়নি",
        );
      });

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      map?.remove();
      mapRef.current = null;
      baseLayerRef.current = null;
      labelLayerRef.current = null;
      if (drawFrameRef.current !== null) {
        window.cancelAnimationFrame(drawFrameRef.current);
        drawFrameRef.current = null;
      }
      if (interactionFrameRef.current !== null) {
        window.cancelAnimationFrame(interactionFrameRef.current);
        interactionFrameRef.current = null;
      }
    };
  }, [installBaseMap, scheduleDraw]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    let cancelled = false;

    void import("leaflet").then((leaflet) => {
      if (!cancelled && mapRef.current === map) {
        installBaseMap(leaflet, map, props.mapStyle);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [installBaseMap, props.mapStyle]);

  useEffect(() => {
    if (!props.active) return;

    const frame = window.requestAnimationFrame(() => {
      mapRef.current?.invalidateSize({ pan: false });
      scheduleDraw();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [props.active, scheduleDraw]);

  const getMercatorAtPointer = (clientX: number, clientY: number) => {
    const host = hostRef.current;
    const map = mapRef.current;
    if (!host || !map) return null;

    const rect = host.getBoundingClientRect();
    const point = map.containerPointToLatLng([
      clientX - rect.left,
      clientY - rect.top,
    ]);

    return toMercator({ lat: point.lat, lng: point.lng });
  };

  const pdfInteractionEnabled =
    props.interactionTarget === "pdf" &&
    Boolean(props.transform) &&
    !props.waitingForWorldPoint;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !pdfInteractionEnabled) return;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();

      if (event.altKey) {
        pendingRotationRef.current += event.deltaY < 0 ? -0.01 : 0.01;
        scheduleInteraction();
        return;
      }

      pendingScaleRef.current *= event.deltaY < 0 ? 1.04 : 1 / 1.04;
      const world = getMercatorAtPointer(event.clientX, event.clientY);
      const transform = propsRef.current.transform;
      if (world && transform) {
        pendingScaleAnchorRef.current = sourcePointAtWorld(transform, world);
      }
      scheduleInteraction();
    };

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, [pdfInteractionEnabled, scheduleInteraction]);

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (
      !pdfInteractionEnabled ||
      (event.pointerType === "mouse" && event.button !== 0)
    ) {
      return;
    }

    const point = getMercatorAtPointer(event.clientX, event.clientY);
    if (!point) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    touchPointsRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    if (touchPointsRef.current.size >= 2) {
      const points = [...touchPointsRef.current.values()];
      const centerX = (points[0].x + points[1].x) / 2;
      const centerY = (points[0].y + points[1].y) / 2;
      const center = getMercatorAtPointer(centerX, centerY);
      if (center) {
        pinchRef.current = {
          distance: Math.max(
            1,
            Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y),
          ),
          center,
        };
      }
      dragRef.current = null;
      return;
    }

    dragRef.current = { id: event.pointerId, point };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (touchPointsRef.current.has(event.pointerId)) {
      touchPointsRef.current.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY,
      });
    }

    if (touchPointsRef.current.size >= 2) {
      const points = [...touchPointsRef.current.values()];
      const centerX = (points[0].x + points[1].x) / 2;
      const centerY = (points[0].y + points[1].y) / 2;
      const center = getMercatorAtPointer(centerX, centerY);
      const distance = Math.max(
        1,
        Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y),
      );
      const previous = pinchRef.current;

      if (center && previous) {
        pendingTranslationRef.current.u += center.u - previous.center.u;
        pendingTranslationRef.current.v += center.v - previous.center.v;
        pendingScaleRef.current *= distance / previous.distance;
        const transform = propsRef.current.transform;
        if (transform) {
          pendingScaleAnchorRef.current = sourcePointAtWorld(
            transform,
            previous.center,
          );
        }
        scheduleInteraction();
      }

      if (center) pinchRef.current = { distance, center };
      return;
    }

    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;

    const next = getMercatorAtPointer(event.clientX, event.clientY);
    if (!next) return;

    pendingTranslationRef.current.u += next.u - drag.point.u;
    pendingTranslationRef.current.v += next.v - drag.point.v;
    scheduleInteraction();
    drag.point = next;
  };

  const finishPointer = (event: React.PointerEvent<HTMLCanvasElement>) => {
    touchPointsRef.current.delete(event.pointerId);
    pinchRef.current = null;
    dragRef.current = null;

    if (touchPointsRef.current.size === 1) {
      const [id, pointer] = [...touchPointsRef.current.entries()][0];
      const point = getMercatorAtPointer(pointer.x, pointer.y);
      if (point) dragRef.current = { id, point };
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-muted">
      <div ref={hostRef} className="absolute inset-0 z-0 bg-muted" />

      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-10 touch-none bg-transparent"
        style={{ pointerEvents: pdfInteractionEnabled ? "auto" : "none" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishPointer}
        onPointerCancel={finishPointer}
      />

      {loading && (
        <div className="absolute inset-0 z-20 grid place-items-center bg-background/80 text-sm text-foreground">
          Free OpenStreetMap load হচ্ছে…
        </div>
      )}

      {error && (
        <div className="absolute inset-0 z-20 grid place-items-center bg-background p-6 text-center">
          <div className="max-w-md rounded-xl border border-border bg-card p-5 text-sm text-card-foreground shadow-lg">
            <p className="font-semibold">OpenStreetMap চালু করা যায়নি</p>
            <p className="mt-2 text-muted-foreground">{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && props.waitingForWorldPoint && (
        <div className="pointer-events-none absolute left-1/2 top-4 z-20 -translate-x-1/2 rounded-lg border border-border bg-background/90 px-4 py-2 text-xs font-semibold text-foreground shadow-lg backdrop-blur">
          PDF point-এর একই জায়গায় OpenStreetMap-এ click করুন
        </div>
      )}

      {pdfInteractionEnabled && (
        <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-lg border border-border bg-background/90 px-3 py-2 text-center text-xs text-foreground shadow-lg backdrop-blur">
          Drag: PDF সরান · Pinch/Wheel: scale · Alt + Wheel: rotate
        </div>
      )}
    </div>
  );
}

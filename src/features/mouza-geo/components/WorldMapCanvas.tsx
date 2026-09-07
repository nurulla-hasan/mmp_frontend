"use client";

import "leaflet/dist/leaflet.css";

import type {
  LatLng,
  LeafletMouseEvent,
  Map as LeafletMap,
  TileLayer,
} from "leaflet";
import { useCallback, useEffect, useRef, useState } from "react";

import type {
  ControlPair,
  GeoPoint,
  GeoTransform,
  MercatorPoint,
  Point2D,
} from "../types";
import {
  applyGeoTransform,
  fromMercator,
  toMercator,
} from "../utils/geoMath";
import { InfoToast } from "@/lib/utils";

const LEAFLET_ZOOM_TRANSITION =
  "transform 250ms cubic-bezier(0, 0, 0.25, 1)";

type ZoomAnimationEvent = {
  center: LatLng;
  zoom: number;
};

type DrawnView = {
  lat: number;
  lng: number;
  zoom: number;
};

type InteractionTarget = "map" | "pdf";

type OverlayHandle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

type OverlayHandleInfo = {
  id: OverlayHandle;
  source: Point2D;
  anchor: Point2D;
};

function getOverlayHandles(
  imageSize: { width: number; height: number },
): OverlayHandleInfo[] {
  const { width, height } = imageSize;

  return [
    { id: "nw", source: { x: 0, y: 0 }, anchor: { x: width, y: height } },
    { id: "n", source: { x: width / 2, y: 0 }, anchor: { x: width / 2, y: height } },
    { id: "ne", source: { x: width, y: 0 }, anchor: { x: 0, y: height } },
    { id: "e", source: { x: width, y: height / 2 }, anchor: { x: 0, y: height / 2 } },
    { id: "se", source: { x: width, y: height }, anchor: { x: 0, y: 0 } },
    { id: "s", source: { x: width / 2, y: height }, anchor: { x: width / 2, y: 0 } },
    { id: "sw", source: { x: 0, y: height }, anchor: { x: width, y: 0 } },
    { id: "w", source: { x: 0, y: height / 2 }, anchor: { x: width, y: height / 2 } },
  ];
}

function decomposeAlongAxes(
  vector: MercatorPoint,
  xAxis: MercatorPoint,
  yAxis: MercatorPoint,
) {
  const determinant = xAxis.u * yAxis.v - xAxis.v * yAxis.u;
  if (Math.abs(determinant) < 1e-20) return null;

  return {
    x: (vector.u * yAxis.v - vector.v * yAxis.u) / determinant,
    y: (xAxis.u * vector.v - xAxis.v * vector.u) / determinant,
  };
}

function clampResizeFactor(value: number) {
  return Math.max(0.08, Math.min(12, value));
}

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
  image: HTMLImageElement | null;
  imageSize: { width: number; height: number };
  transform: GeoTransform | null;
  controlPairs: ControlPair[];
  waitingForWorldPoint: boolean;
  pointMode: boolean;
  opacity: number;
  mapStyle: "satellite" | "street";
  interactionTarget: InteractionTarget;
  manualAdjustmentEnabled: boolean;
  userLocation?: { lat: number; lng: number; timestamp: number } | null;
  onPlaceWorldPoint: (point: GeoPoint) => void;
  onTranslateOverlay: (delta: MercatorPoint) => void;
  onScaleOverlay: (factor: number, anchor?: Point2D) => void;
  onResizeOverlay: (
    anchor: Point2D,
    xFactor: number,
    yFactor: number,
  ) => void;
  onRotateOverlay: (angleRadians: number) => void;
};

export default function WorldMapCanvas(props: WorldMapCanvasProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const baseLayerRef = useRef<TileLayer | null>(null);
  const labelLayerRef = useRef<TileLayer | null>(null);
  const userMarkerRef = useRef<import("leaflet").CircleMarker | null>(null);
  const propsRef = useRef(props);
  const dragRef = useRef<{
    id: number;
    point: MercatorPoint;
    clientX: number;
    clientY: number;
  } | null>(null);
  const resizeHandleRef = useRef<OverlayHandleInfo | null>(null);
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
  const viewActiveTimestampRef = useRef<number>(0);
  const manualAdjustmentRef = useRef(false);
  const zoomAnimatingRef = useRef(false);
  const drawnViewRef = useRef<DrawnView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Cache device pixel ratio once — never changes at runtime
  const pixelRatioRef = useRef(
    Math.min(
      window.devicePixelRatio || 1,
      ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4) <= 4 ? 1.5 : 2,
    ),
  );

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
            "https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
            {
              subdomains: ["0", "1", "2", "3"],
              minZoom: 2,
              maxZoom: 22,
              maxNativeZoom: 20,
              keepBuffer: 8,
              updateWhenZooming: false,
              updateWhenIdle: false,
              attribution: "&copy; Google Maps",
            },
          )
          .addTo(map);
        return;
      }

      baseLayerRef.current = leaflet
        .tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          minZoom: 2,
          maxZoom: 22,
          maxNativeZoom: 19,
          keepBuffer: 8,
          updateWhenZooming: false,
          updateWhenIdle: false,
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

    const ratio = pixelRatioRef.current;
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

    if (transform && image && imageSize && imageSize.width > 0 && imageSize.height > 0) {
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

    if (transform && manualAdjustmentRef.current) {
      const topLeft = toScreenPoint({ x: 0, y: 0 });
      const topRight = toScreenPoint({ x: imageSize.width, y: 0 });
      const bottomRight = toScreenPoint({
        x: imageSize.width,
        y: imageSize.height,
      });
      const bottomLeft = toScreenPoint({ x: 0, y: imageSize.height });

      if (topLeft && topRight && bottomRight && bottomLeft) {
        context.save();
        context.beginPath();
        context.moveTo(topLeft.x, topLeft.y);
        context.lineTo(topRight.x, topRight.y);
        context.lineTo(bottomRight.x, bottomRight.y);
        context.lineTo(bottomLeft.x, bottomLeft.y);
        context.closePath();
        context.strokeStyle = "#10B981";
        context.lineWidth = 2;
        context.setLineDash([7, 5]);
        context.stroke();
        context.setLineDash([]);

        getOverlayHandles(imageSize).forEach((handle) => {
          const point = toScreenPoint(handle.source);
          if (!point) return;

          const isCorner =
            handle.id === "nw" ||
            handle.id === "ne" ||
            handle.id === "se" ||
            handle.id === "sw";
          const size = isCorner ? 12 : 10;

          context.fillStyle = "#ECFDF5";
          context.strokeStyle = "#059669";
          context.lineWidth = 2;
          context.fillRect(point.x - size / 2, point.y - size / 2, size, size);
          context.strokeRect(
            point.x - size / 2,
            point.y - size / 2,
            size,
            size,
          );
        });
        context.restore();
      }
    }

    // Set text properties once outside the loop
    context.font = "bold 11px system-ui, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";

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

      // White inner badge
      context.beginPath();
      context.arc(tipX, tipY - 22, 7.5, 0, Math.PI * 2);
      context.fillStyle = "white";
      context.fill();

      // Red bold number inside white badge
      context.fillStyle = "rgb(220 38 38)";
      context.fillText(String(index + 1), tipX, tipY - 22);
    });

    const center = map.getCenter();
    drawnViewRef.current = {
      lat: center.lat,
      lng: center.lng,
      zoom: map.getZoom(),
    };
  }, [toScreenPoint]);

  const scheduleDraw = useCallback(() => {
    if (zoomAnimatingRef.current || drawFrameRef.current !== null) return;
    drawFrameRef.current = window.requestAnimationFrame(() => {
      drawFrameRef.current = null;
      drawOverlay();
    });
  }, [drawOverlay]);

  const cancelScheduledDraw = useCallback(() => {
    if (drawFrameRef.current === null) return;
    window.cancelAnimationFrame(drawFrameRef.current);
    drawFrameRef.current = null;
  }, []);

  const beginZoomAnimation = useCallback(
    (center: LatLng, zoom: number) => {
      const canvas = canvasRef.current;
      const map = mapRef.current;
      const baseView = drawnViewRef.current;
      if (!canvas || !map || !baseView) return;

      cancelScheduledDraw();
      zoomAnimatingRef.current = true;

      const halfSize = map.getSize().multiplyBy(0.5);
      const targetPixelOrigin = map.project(center, zoom).subtract(halfSize);
      const baseCenterAtTarget = map
        .project([baseView.lat, baseView.lng], zoom)
        .subtract(targetPixelOrigin);
      const scale = map.getZoomScale(zoom, baseView.zoom);
      const translate = baseCenterAtTarget.subtract(halfSize.multiplyBy(scale));

      // Keep the wheel/pinch hot path transform-only. In particular, do not
      // redraw the canvas or force layout here: those operations delayed the
      // visible response to zoom-out input on large mouza images.
      canvas.style.transformOrigin = "0 0";
      canvas.style.willChange = "transform";
      canvas.style.transition = LEAFLET_ZOOM_TRANSITION;
      canvas.style.transform = `translate3d(${translate.x}px, ${translate.y}px, 0) scale(${scale})`;
    },
    [cancelScheduledDraw],
  );

  const finishZoomAnimation = useCallback(() => {
    const canvas = canvasRef.current;

    zoomAnimatingRef.current = false;
    cancelScheduledDraw();

    if (canvas) {
      canvas.style.transition = "none";
      canvas.style.transform = "none";
      canvas.style.transformOrigin = "0 0";
      canvas.style.willChange = "auto";
    }

    // One crisp redraw at the final map projection, never in the wheel path.
    drawOverlay();
  }, [cancelScheduledDraw, drawOverlay]);

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

  // Always keep propsRef in sync (no draw side-effect here)
  useEffect(() => {
    propsRef.current = props;
  });

  // Trigger redraws only when visually relevant props change
  useEffect(() => {
    if (props.active) scheduleDraw();
  }, [
    props.active,
    props.image,
    props.transform,
    props.opacity,
    props.controlPairs,
    props.userLocation,
    scheduleDraw,
  ]);

  useEffect(() => {
    manualAdjustmentRef.current = props.manualAdjustmentEnabled;
    scheduleDraw();
  }, [props.manualAdjustmentEnabled, scheduleDraw]);

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
            maxZoom: 22,
            zoomControl: false,
            attributionControl: true,
            zoomAnimation: true,
            fadeAnimation: true,
            markerZoomAnimation: true,
          })
          .setView([25.6217, 88.6354], 15);

        mapRef.current = map;
        installBaseMap(leaflet, map, propsRef.current.mapStyle);

        const handleClick = (event: LeafletMouseEvent) => {
          const current = propsRef.current;
          if (!current.pointMode) return;

          // Prevent ghost click immediately after switching to world view on mobile
          if (Date.now() - viewActiveTimestampRef.current < 400) {
            return;
          }

          if (!current.waitingForWorldPoint) {
            InfoToast("Select a point on the mouza map (PDF/Image) first");
            return;
          }

          current.onPlaceWorldPoint({
            lat: event.latlng.lat,
            lng: event.latlng.lng,
          });
        };

        const handleZoomAnim = (event: unknown) => {
          const zoomEvent = event as ZoomAnimationEvent;
          beginZoomAnimation(zoomEvent.center, zoomEvent.zoom);
        };

        map.on("click", handleClick);
        map.on("move resize moveend viewreset", scheduleDraw);
        map.on("zoomanim", handleZoomAnim);
        map.on("zoomend", finishZoomAnimation);
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
            : "Could not load OpenStreetMap",
        );
      });

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      map?.remove();
      mapRef.current = null;
      baseLayerRef.current = null;
      labelLayerRef.current = null;
      drawnViewRef.current = null;
      zoomAnimatingRef.current = false;
      cancelScheduledDraw();
      if (interactionFrameRef.current !== null) {
        window.cancelAnimationFrame(interactionFrameRef.current);
        interactionFrameRef.current = null;
      }
    };
  }, [
    beginZoomAnimation,
    cancelScheduledDraw,
    finishZoomAnimation,
    installBaseMap,
    scheduleDraw,
  ]);

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
    viewActiveTimestampRef.current = Date.now();

    const frame = window.requestAnimationFrame(() => {
      mapRef.current?.invalidateSize({ pan: false });
      scheduleDraw();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [props.active, scheduleDraw]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const container = map.getContainer();
    if (!container) return;

    if (props.pointMode) {
      container.classList.add("leaflet-crosshair");
      container.style.cursor = "crosshair";
    } else {
      container.classList.remove("leaflet-crosshair");
      container.style.cursor = "";
    }
  }, [props.pointMode]);

  useEffect(() => {
    if (!props.userLocation || !mapRef.current) return;
    const { lat, lng } = props.userLocation;
    const map = mapRef.current;

    void import("leaflet").then((leaflet) => {
      if (mapRef.current !== map) return;

      map.flyTo([lat, lng], 18, { duration: 1.2 });

      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
      }

      userMarkerRef.current = leaflet
        .circleMarker([lat, lng], {
          radius: 8,
          fillColor: "#3B82F6",
          color: "#FFFFFF",
          weight: 3,
          opacity: 1,
          fillOpacity: 0.9,
        })
        .addTo(map);
    });
  }, [props.userLocation]);

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
    props.manualAdjustmentEnabled &&
    props.interactionTarget === "map" &&
    Boolean(props.transform) &&
    !props.waitingForWorldPoint &&
    !props.pointMode;

  const getResizeHandleAtPointer = (
    clientX: number,
    clientY: number,
  ): OverlayHandleInfo | null => {
    const host = hostRef.current;
    if (!host) return null;

    const rect = host.getBoundingClientRect();
    const pointerX = clientX - rect.left;
    const pointerY = clientY - rect.top;

    return (
      getOverlayHandles(propsRef.current.imageSize).find((handle) => {
        const point = toScreenPoint(handle.source);
        return point ? Math.hypot(point.x - pointerX, point.y - pointerY) < 16 : false;
      }) ?? null
    );
  };

  const resizeFromHandle = (
    handle: OverlayHandleInfo,
    target: MercatorPoint,
  ) => {
    const transform = propsRef.current.transform;
    const { imageSize } = propsRef.current;
    if (!transform) return;

    const topLeft = applyGeoTransform(transform, { x: 0, y: 0 });
    const xAxis = {
      u: transform.a * imageSize.width,
      v: transform.c * imageSize.width,
    };
    const yAxis = {
      u: transform.b * imageSize.height,
      v: transform.d * imageSize.height,
    };
    const topRight = { u: topLeft.u + xAxis.u, v: topLeft.v + xAxis.v };
    const bottomLeft = { u: topLeft.u + yAxis.u, v: topLeft.v + yAxis.v };
    const bottomRight = {
      u: topRight.u + yAxis.u,
      v: topRight.v + yAxis.v,
    };

    let factors: { x: number; y: number } | null = null;

    if (handle.id === "nw") {
      factors = decomposeAlongAxes(
        { u: bottomRight.u - target.u, v: bottomRight.v - target.v },
        xAxis,
        yAxis,
      );
    } else if (handle.id === "ne") {
      const value = decomposeAlongAxes(
        { u: target.u - bottomLeft.u, v: target.v - bottomLeft.v },
        xAxis,
        yAxis,
      );
      factors = value ? { x: value.x, y: -value.y } : null;
    } else if (handle.id === "se") {
      factors = decomposeAlongAxes(
        { u: target.u - topLeft.u, v: target.v - topLeft.v },
        xAxis,
        yAxis,
      );
    } else if (handle.id === "sw") {
      const value = decomposeAlongAxes(
        { u: target.u - topRight.u, v: target.v - topRight.v },
        xAxis,
        yAxis,
      );
      factors = value ? { x: -value.x, y: value.y } : null;
    } else if (handle.id === "e") {
      factors = {
        x:
          ((target.u - bottomLeft.u + yAxis.u / 2) * xAxis.u +
            (target.v - bottomLeft.v + yAxis.v / 2) * xAxis.v) /
          (xAxis.u * xAxis.u + xAxis.v * xAxis.v),
        y: 1,
      };
    } else if (handle.id === "w") {
      factors = {
        x:
          ((topRight.u + yAxis.u / 2 - target.u) * xAxis.u +
            (topRight.v + yAxis.v / 2 - target.v) * xAxis.v) /
          (xAxis.u * xAxis.u + xAxis.v * xAxis.v),
        y: 1,
      };
    } else if (handle.id === "s") {
      factors = {
        x: 1,
        y:
          ((target.u - topRight.u + xAxis.u / 2) * yAxis.u +
            (target.v - topRight.v + xAxis.v / 2) * yAxis.v) /
          (yAxis.u * yAxis.u + yAxis.v * yAxis.v),
      };
    } else if (handle.id === "n") {
      factors = {
        x: 1,
        y:
          ((bottomLeft.u + xAxis.u / 2 - target.u) * yAxis.u +
            (bottomLeft.v + xAxis.v / 2 - target.v) * yAxis.v) /
          (yAxis.u * yAxis.u + yAxis.v * yAxis.v),
      };
    }

    if (!factors || !Number.isFinite(factors.x) || !Number.isFinite(factors.y)) {
      return;
    }

    propsRef.current.onResizeOverlay(
      handle.anchor,
      clampResizeFactor(factors.x),
      clampResizeFactor(factors.y),
    );
  };

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

      const map = mapRef.current;
      const host = hostRef.current;
      if (!map || !host) return;

      const rect = host.getBoundingClientRect();
      const point = [
        event.clientX - rect.left,
        event.clientY - rect.top,
      ] as [number, number];
      const zoomLocation = map.containerPointToLatLng(point);
      const nextZoom = map.getZoom() + (event.deltaY < 0 ? 1 : -1);
      map.setZoomAround(zoomLocation, nextZoom);
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

    const resizeHandle = getResizeHandleAtPointer(event.clientX, event.clientY);
    event.currentTarget.setPointerCapture(event.pointerId);

    if (resizeHandle) {
      resizeHandleRef.current = resizeHandle;
      dragRef.current = null;
      return;
    }
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

    dragRef.current = {
      id: event.pointerId,
      point,
      clientX: event.clientX,
      clientY: event.clientY,
    };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const resizeHandle = resizeHandleRef.current;
    if (resizeHandle) {
      const target = getMercatorAtPointer(event.clientX, event.clientY);
      if (target) resizeFromHandle(resizeHandle, target);
      return;
    }

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

    const map = mapRef.current;
    if (!map) return;

    map.panBy(
      [drag.clientX - event.clientX, drag.clientY - event.clientY],
      { animate: false },
    );
    drag.clientX = event.clientX;
    drag.clientY = event.clientY;
  };

  const finishPointer = (event: React.PointerEvent<HTMLCanvasElement>) => {
    resizeHandleRef.current = null;
    touchPointsRef.current.delete(event.pointerId);
    pinchRef.current = null;
    dragRef.current = null;

    if (touchPointsRef.current.size === 1) {
      const [id, pointer] = [...touchPointsRef.current.entries()][0];
      const point = getMercatorAtPointer(pointer.x, pointer.y);
      if (point) {
        dragRef.current = {
          id,
          point,
          clientX: pointer.x,
          clientY: pointer.y,
        };
      }
    }
  };

  const isCrosshair = props.pointMode;

  return (
    <div
      className={`relative h-full w-full overflow-hidden bg-muted ${
        isCrosshair
          ? "cursor-crosshair [&_.leaflet-container]:cursor-crosshair! [&_.leaflet-grab]:cursor-crosshair! [&_.leaflet-interactive]:cursor-crosshair!"
          : "cursor-grab active:cursor-grabbing"
      }`}
    >
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
          Loading satellite map…
        </div>
      )}

      {error && (
        <div className="absolute inset-0 z-20 grid place-items-center bg-background p-6 text-center">
          <div className="max-w-md rounded-xl border border-border bg-card p-5 text-sm text-card-foreground shadow-lg">
            <p className="font-semibold">Could not load map</p>
            <p className="mt-2 text-muted-foreground">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}

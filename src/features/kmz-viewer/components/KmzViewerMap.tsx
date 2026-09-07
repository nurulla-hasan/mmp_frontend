"use client";

import "leaflet/dist/leaflet.css";

import type { LatLng, Map as LeafletMap, TileLayer } from "leaflet";
import { useCallback, useEffect, useRef, useState } from "react";
import type { InspectedCoordinate, KmzData, MapStyle, UserLocation } from "../types";
import { computeKmzBounds, createBaseTileLayer, drawKmzCanvas } from "../utils/leafletMapUtils";

const LEAFLET_ZOOM_TRANSITION = "transform 250ms cubic-bezier(0, 0, 0.25, 1)";

type ZoomAnimationEvent = {
  center: LatLng;
  zoom: number;
};

type DrawnView = {
  lat: number;
  lng: number;
  zoom: number;
};

type PendingZoomOut = {
  targetZoom: number;
  inverseTransform: string;
};

type Props = {
  kmzData: KmzData | null;
  opacity: number;
  mapStyle: MapStyle;
  userLocation?: UserLocation | null;
  fitBoundsTrigger?: number;
  zoomInTrigger?: number;
  zoomOutTrigger?: number;
  onInspectCoordinate?: (coord: InspectedCoordinate) => void;
  onMapReady?: () => void;
};

export default function KmzViewerMap({
  kmzData, opacity, mapStyle, userLocation,
  fitBoundsTrigger = 0, zoomInTrigger = 0, zoomOutTrigger = 0,
  onInspectCoordinate, onMapReady,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const baseLayerRef = useRef<TileLayer | null>(null);
  const drawFrameRef = useRef<number | null>(null);
  const imagesRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const imageLoadGenerationRef = useRef(0);
  const zoomAnimatingRef = useRef(false);
  const drawnViewRef = useRef<DrawnView | null>(null);
  const pendingZoomOutRef = useRef<PendingZoomOut | null>(null);
  const [error, setError] = useState<string | null>(null);

  const propsRef = useRef({ kmzData, opacity, mapStyle, userLocation, onInspectCoordinate });
  propsRef.current = { kmzData, opacity, mapStyle, userLocation, onInspectCoordinate };
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const isDrawnRef = useRef(false);

  const drawOverlay = useCallback(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    const map = mapRef.current;
    if (!canvas || !host || !map) return;

    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = host.clientWidth;
    const height = host.clientHeight;

    if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    }

    let context = ctxRef.current;
    if (!context) {
      context = canvas.getContext("2d");
      ctxRef.current = context;
    }
    if (!context) return;

    const { kmzData: curKmz, opacity: curOpacity, userLocation: curLoc } = propsRef.current;
    if (!curKmz && !curLoc) {
      if (isDrawnRef.current) {
        context.clearRect(0, 0, width, height);
        isDrawnRef.current = false;
      }
      drawnViewRef.current = null;
      return;
    }

    isDrawnRef.current = true;
    drawKmzCanvas(context, map, curKmz, imagesRef.current, curOpacity, curLoc, ratio, width, height);

    const center = map.getCenter();
    drawnViewRef.current = {
      lat: center.lat,
      lng: center.lng,
      zoom: map.getZoom(),
    };
  }, []);

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

  const beginZoomAnimation = useCallback((center: LatLng, zoom: number) => {
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

    canvas.style.transformOrigin = "0 0";
    canvas.style.willChange = "transform";

    if (scale >= 1) {
      // Zooming in: the already-rendered KMZ contains the full target viewport.
      // Transform that same bitmap with Leaflet so map + KMZ move as one layer.
      pendingZoomOutRef.current = null;
      canvas.style.transition = LEAFLET_ZOOM_TRANSITION;
      canvas.style.transform = `translate3d(${translate.x}px, ${translate.y}px, 0) scale(${scale})`;
      return;
    }

    // Zooming out reveals geography outside the current canvas. Leaflet updates its
    // logical view before the CSS animation finishes, so redraw the full target view
    // on the following zoom event and animate it from the exact inverse transform.
    const inverseScale = 1 / scale;
    const inverseTranslateX = -translate.x / scale;
    const inverseTranslateY = -translate.y / scale;
    pendingZoomOutRef.current = {
      targetZoom: zoom,
      inverseTransform: `translate3d(${inverseTranslateX}px, ${inverseTranslateY}px, 0) scale(${inverseScale})`,
    };
  }, [cancelScheduledDraw]);

  const handleMapZoom = useCallback(() => {
    const map = mapRef.current;
    const canvas = canvasRef.current;
    const pending = pendingZoomOutRef.current;

    if (!map || !canvas || !pending) {
      scheduleDraw();
      return;
    }

    if (Math.abs(map.getZoom() - pending.targetZoom) > 0.001) return;

    pendingZoomOutRef.current = null;
    cancelScheduledDraw();

    // Render the complete target viewport first, then animate it from the old visual
    // position to its final position. This prevents blank KMZ edges on zoom-out.
    canvas.style.transition = "none";
    canvas.style.transformOrigin = "0 0";
    canvas.style.willChange = "transform";
    canvas.style.transform = pending.inverseTransform;
    drawOverlay();

    // Force the inverse transform to become the animation's starting frame.
    void canvas.offsetWidth;
    canvas.style.transition = LEAFLET_ZOOM_TRANSITION;
    canvas.style.transform = "none";
  }, [cancelScheduledDraw, drawOverlay, scheduleDraw]);

  const finishZoomAnimation = useCallback(() => {
    const canvas = canvasRef.current;

    pendingZoomOutRef.current = null;
    zoomAnimatingRef.current = false;
    cancelScheduledDraw();

    if (canvas) {
      canvas.style.transition = "none";
      canvas.style.transform = "none";
      canvas.style.transformOrigin = "0 0";
      canvas.style.willChange = "auto";
    }

    // Final projection is drawn synchronously in the same event turn as Leaflet's
    // zoom completion, so there is no map-first / KMZ-second paint.
    drawOverlay();
  }, [cancelScheduledDraw, drawOverlay]);

  // Load tile images with generation guards so old KMZ image callbacks cannot repopulate the cache.
  useEffect(() => {
    const currentMap = imagesRef.current;
    const generation = imageLoadGenerationRef.current + 1;
    imageLoadGenerationRef.current = generation;
    const pendingImages: HTMLImageElement[] = [];

    if (!kmzData) {
      currentMap.clear();
      scheduleDraw();
      return () => {
        if (imageLoadGenerationRef.current === generation) imageLoadGenerationRef.current += 1;
      };
    }

    const currentUrls = new Set(kmzData.tiles.map((t) => t.url));
    currentMap.forEach((_, url) => {
      if (!currentUrls.has(url)) currentMap.delete(url);
    });

    kmzData.tiles.forEach((tile) => {
      if (currentMap.has(tile.url)) return;

      const img = new Image();
      img.decoding = "async";
      pendingImages.push(img);
      let settled = false;

      const onDone = () => {
        if (settled) return;
        settled = true;
        if (imageLoadGenerationRef.current !== generation || !currentUrls.has(tile.url)) return;
        currentMap.set(tile.url, img);
        scheduleDraw();
      };

      img.onload = onDone;
      img.onerror = () => {
        if (settled) return;
        settled = true;
        if (imageLoadGenerationRef.current === generation) {
          console.error("Failed to load KMZ tile:", tile.url);
        }
      };
      img.src = tile.url;

      // Cached images can already be complete before the load handler is observed.
      if (img.complete && img.naturalWidth > 0) onDone();
    });

    return () => {
      if (imageLoadGenerationRef.current === generation) imageLoadGenerationRef.current += 1;
      pendingImages.forEach((img) => {
        img.onload = null;
        img.onerror = null;
      });
    };
  }, [kmzData, scheduleDraw]);

  // Redraw on visual prop change.
  useEffect(() => {
    scheduleDraw();
  }, [kmzData, opacity, userLocation, scheduleDraw]);

  // Map Initialization
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    let map: LeafletMap | null = null;
    let resizeObserver: ResizeObserver | null = null;

    void import("leaflet")
      .then((leaflet) => {
        if (cancelled) return;
        map = leaflet.map(host, {
          center: [23.8103, 90.4125],
          zoom: 13,
          maxZoom: 22,
          zoomControl: false,
          attributionControl: false,
        });

        mapRef.current = map;
        baseLayerRef.current = createBaseTileLayer(leaflet, propsRef.current.mapStyle).addTo(map);

        const handleZoomAnim = (event: unknown) => {
          const zoomEvent = event as ZoomAnimationEvent;
          beginZoomAnimation(zoomEvent.center, zoomEvent.zoom);
        };

        map.on("move resize moveend viewreset", scheduleDraw);
        map.on("zoom", handleMapZoom);
        map.on("zoomanim", handleZoomAnim);
        map.on("zoomend", finishZoomAnimation);
        map.on("click", (e) => {
          propsRef.current.onInspectCoordinate?.({
            latitude: e.latlng.lat,
            longitude: e.latlng.lng,
          });
        });

        map.whenReady(() => {
          if (cancelled) return;
          map?.invalidateSize({ pan: false });
          onMapReady?.();
          const curKmz = propsRef.current.kmzData;
          if (curKmz && map) {
            const b = computeKmzBounds(curKmz);
            if (b) {
              map.fitBounds(b, { padding: [40, 40], maxZoom: 19, animate: false });
            }
          }
          scheduleDraw();
        });

        resizeObserver = new ResizeObserver(() => {
          map?.invalidateSize({ pan: false });
          scheduleDraw();
        });
        resizeObserver.observe(host);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Map load error");
      });

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      map?.remove();
      mapRef.current = null;
      baseLayerRef.current = null;
      ctxRef.current = null;
      drawnViewRef.current = null;
      pendingZoomOutRef.current = null;
      zoomAnimatingRef.current = false;
      cancelScheduledDraw();
    };
  }, [beginZoomAnimation, cancelScheduledDraw, finishZoomAnimation, handleMapZoom, onMapReady, scheduleDraw]);

  // Map style toggle
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    let cancelled = false;
    void import("leaflet").then((leaflet) => {
      if (cancelled || mapRef.current !== map) return;
      baseLayerRef.current?.remove();
      baseLayerRef.current = createBaseTileLayer(leaflet, mapStyle).addTo(map);
    });
    return () => {
      cancelled = true;
    };
  }, [mapStyle]);

  // Fit bounds on KMZ load or explicit fit trigger. One pass is sufficient; ResizeObserver handles layout changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!kmzData || !map) return;
    const bounds = computeKmzBounds(kmzData);
    if (!bounds) return;

    map.invalidateSize({ pan: false });
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 19, animate: false });
    scheduleDraw();
  }, [fitBoundsTrigger, kmzData, scheduleDraw]);

  useEffect(() => {
    if (zoomInTrigger > 0) mapRef.current?.zoomIn();
  }, [zoomInTrigger]);

  useEffect(() => {
    if (zoomOutTrigger > 0) mapRef.current?.zoomOut();
  }, [zoomOutTrigger]);

  useEffect(() => {
    if (userLocation) mapRef.current?.flyTo([userLocation.lat, userLocation.lng], 18, { duration: 1.2 });
  }, [userLocation]);

  return (
    <div className="relative size-full select-none touch-none">
      <div ref={hostRef} className="absolute inset-0 z-0 bg-transparent" />
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-10 bg-transparent"
      />
      {error && (
        <div className="pointer-events-none absolute inset-0 z-30 grid place-items-center bg-background/50 backdrop-blur-sm">
          <div className="rounded-xl bg-destructive/10 p-4 text-destructive text-sm font-semibold">
            {error}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import "leaflet/dist/leaflet.css";

import type { Map as LeafletMap, TileLayer } from "leaflet";
import { useCallback, useEffect, useRef, useState } from "react";
import type { InspectedCoordinate, KmzData, MapStyle, UserLocation } from "../types";
import { computeKmzBounds, createBaseTileLayer, drawKmzCanvas } from "../utils/leafletMapUtils";

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
      return;
    }
    isDrawnRef.current = true;
    drawKmzCanvas(context, map, curKmz, imagesRef.current, curOpacity, curLoc, ratio, width, height);
  }, []);

  const scheduleDraw = useCallback(() => {
    if (drawFrameRef.current !== null) return;
    drawFrameRef.current = window.requestAnimationFrame(() => {
      drawFrameRef.current = null;
      drawOverlay();
    });
  }, [drawOverlay]);

  // Load tile images
  useEffect(() => {
    const currentMap = imagesRef.current;
    if (!kmzData) {
      currentMap.clear();
      scheduleDraw();
      return;
    }

    const currentUrls = new Set(kmzData.tiles.map((t) => t.url));
    currentMap.forEach((_, url) => {
      if (!currentUrls.has(url)) currentMap.delete(url);
    });

    kmzData.tiles.forEach((tile) => {
      if (currentMap.has(tile.url)) return;
      const img = new Image();
      const onDone = () => {
        currentMap.set(tile.url, img);
        scheduleDraw();
      };
      img.onload = onDone;
      img.onerror = () => console.error("Failed to load KMZ tile:", tile.url);
      img.src = tile.url;
      if (img.complete && img.naturalWidth > 0) onDone();
    });
  }, [kmzData, scheduleDraw]);

  // Redraw on visual prop change
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
        map.on("move zoom resize moveend zoomend viewreset", scheduleDraw);
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
      if (drawFrameRef.current !== null) {
        window.cancelAnimationFrame(drawFrameRef.current);
        drawFrameRef.current = null;
      }
    };
  }, [onMapReady, scheduleDraw]);

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

  // Fit bounds on kmzData load or trigger
  useEffect(() => {
    const map = mapRef.current;
    if (!kmzData || !map) return;
    const bounds = computeKmzBounds(kmzData);
    if (bounds) {
      map.invalidateSize({ pan: false });
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 19, animate: false });
      scheduleDraw();
      const timer = setTimeout(() => {
        if (!mapRef.current) return;
        mapRef.current.invalidateSize({ pan: false });
        mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 19, animate: false });
        scheduleDraw();
      }, 150);
      return () => clearTimeout(timer);
    }
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

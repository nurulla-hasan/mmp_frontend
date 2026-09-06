"use client";

import "leaflet/dist/leaflet.css";

import type { Map as LeafletMap, TileLayer } from "leaflet";
import { useCallback, useEffect, useRef, useState } from "react";
import { type KmzData } from "../types";

type KmzViewerCanvasProps = {
  active: boolean;
  kmzData: KmzData;
  opacity: number;
  mapStyle: "satellite" | "street";
  userLocation?: { lat: number; lng: number; timestamp: number } | null;
  fitBoundsTrigger?: number;
};

export default function KmzViewerCanvas(props: KmzViewerCanvasProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const baseLayerRef = useRef<TileLayer | null>(null);
  const propsRef = useRef(props);
  const drawFrameRef = useRef<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Cache device pixel ratio once — never changes at runtime
  const pixelRatioRef = useRef(
    Math.min(
      window.devicePixelRatio || 1,
      ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4) <= 4 ? 1.5 : 2,
    ),
  );

  // Store loaded images for rendering
  const imagesRef = useRef<Map<string, HTMLImageElement>>(new Map());

  const installBaseMap = useCallback(
    (
      leaflet: typeof import("leaflet"),
      map: LeafletMap,
      style: "satellite" | "street",
    ) => {
      baseLayerRef.current?.remove();

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

    const { kmzData, opacity } = propsRef.current;
    const loadedImages = imagesRef.current;

    context.globalAlpha = opacity;

    kmzData.tiles.forEach((tile) => {
      const image = loadedImages.get(tile.url);
      if (!image) return;

      const imageWidth = tile.width;
      const imageHeight = tile.height;

      // Project corners to screen coordinates
      // Corners are: [Bottom-Left, Bottom-Right, Top-Right, Top-Left]
      const origin = map.latLngToContainerPoint([tile.corners[3].lat, tile.corners[3].lng]); // Top-Left
      const right = map.latLngToContainerPoint([tile.corners[2].lat, tile.corners[2].lng]); // Top-Right
      const bottom = map.latLngToContainerPoint([tile.corners[0].lat, tile.corners[0].lng]); // Bottom-Left

      if (origin && right && bottom) {
        context.save();
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
    });

    // Draw GPS User Location Marker on top of tiles
    if (propsRef.current.userLocation) {
      const { lat, lng } = propsRef.current.userLocation;
      const pt = map.latLngToContainerPoint([lat, lng]);
      if (pt) {
        context.save();
        context.setTransform(ratio, 0, 0, ratio, 0, 0);

        // Accuracy pulse circle
        context.beginPath();
        context.arc(pt.x, pt.y, 16, 0, Math.PI * 2);
        context.fillStyle = "rgba(59, 130, 246, 0.25)";
        context.fill();

        // White halo border
        context.beginPath();
        context.arc(pt.x, pt.y, 8, 0, Math.PI * 2);
        context.fillStyle = "#ffffff";
        context.shadowColor = "rgba(0, 0, 0, 0.4)";
        context.shadowBlur = 6;
        context.fill();

        // Core blue circle
        context.beginPath();
        context.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
        context.fillStyle = "#2563eb";
        context.fill();

        context.restore();
      }
    }

  }, []);

  const scheduleDraw = useCallback(() => {
    if (drawFrameRef.current !== null) return;
    drawFrameRef.current = window.requestAnimationFrame(() => {
      drawFrameRef.current = null;
      drawOverlay();
    });
  }, [drawOverlay]);

  // Load images when kmzData changes; clear stale entries to prevent memory leaks
  useEffect(() => {
    const currentMap = imagesRef.current;
    const currentUrls = new Set(props.kmzData.tiles.map((t) => t.url));

    // Remove images for tiles that no longer exist
    currentMap.forEach((_, url) => {
      if (!currentUrls.has(url)) currentMap.delete(url);
    });

    props.kmzData.tiles.forEach((tile) => {
      if (!currentMap.has(tile.url)) {
        const img = new Image();
        img.onload = () => {
          currentMap.set(tile.url, img);
          scheduleDraw();
        };
        img.onerror = (e) => {
          console.error("Failed to load tile image:", tile.url, e);
        };
        img.src = tile.url;
        if (img.complete && img.naturalWidth > 0) {
          currentMap.set(tile.url, img);
          scheduleDraw();
        }
      }
    });
  }, [props.kmzData, scheduleDraw]);

  // Always keep propsRef in sync (no draw side-effect here)
  useEffect(() => {
    propsRef.current = props;
  });

  // Trigger redraws only when visually relevant props change
  useEffect(() => {
    if (props.active) scheduleDraw();
  }, [
    props.active,
    props.kmzData,
    props.opacity,
    props.userLocation,
    scheduleDraw,
  ]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    let map: LeafletMap | null = null;
    let resizeObserver: ResizeObserver | null = null;

    void import("leaflet")
      .then((leaflet) => {
        if (cancelled) return;

        // Calculate initial bounds to fit all tiles
        let minLat = 90;
        let maxLat = -90;
        let minLng = 180;
        let maxLng = -180;

        propsRef.current.kmzData.tiles.forEach((tile) => {
          tile.corners.forEach((corner) => {
            if (corner.lat < minLat) minLat = corner.lat;
            if (corner.lat > maxLat) maxLat = corner.lat;
            if (corner.lng < minLng) minLng = corner.lng;
            if (corner.lng > maxLng) maxLng = corner.lng;
          });
        });

        const initialCenter: [number, number] = [
          (minLat + maxLat) / 2 || 25.6217,
          (minLng + maxLng) / 2 || 88.6354,
        ];

        map = leaflet
          .map(host, {
            center: initialCenter,
            zoom: 15,
            maxZoom: 22,
            zoomControl: false,
            attributionControl: true,
            zoomAnimation: true,
            fadeAnimation: true,
            markerZoomAnimation: true,
          });
          
        if (minLat !== 90 && maxLat !== -90) {
           map.fitBounds([
             [minLat, minLng],
             [maxLat, maxLng]
           ]);
        } else {
           map.setView(initialCenter, 15);
        }

        mapRef.current = map;
        installBaseMap(leaflet, map, propsRef.current.mapStyle);

        map.on("move zoom resize", scheduleDraw);
        map.whenReady(() => {
          if (cancelled) return;
          setLoading(false);
          setError(null);
          map?.invalidateSize({ pan: false });
          if (propsRef.current.userLocation && map) {
            map.flyTo([propsRef.current.userLocation.lat, propsRef.current.userLocation.lng], 18, { duration: 0.5 });
          }
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
      if (drawFrameRef.current !== null) {
        window.cancelAnimationFrame(drawFrameRef.current);
        drawFrameRef.current = null;
      }
    };
  }, [installBaseMap, scheduleDraw]);

  useEffect(() => {
    if (!props.userLocation || !mapRef.current) return;
    const { lat, lng } = props.userLocation;
    const map = mapRef.current;

    map.flyTo([lat, lng], 18, { duration: 1.2 });
    scheduleDraw();
  }, [props.userLocation, scheduleDraw]);

  const fitKmzBounds = useCallback(() => {
    const map = mapRef.current;
    if (!map || !props.kmzData.tiles.length) return;

    let minLat = 90;
    let maxLat = -90;
    let minLng = 180;
    let maxLng = -180;

    props.kmzData.tiles.forEach((tile) => {
      tile.corners.forEach((corner) => {
        if (corner.lat < minLat) minLat = corner.lat;
        if (corner.lat > maxLat) maxLat = corner.lat;
        if (corner.lng < minLng) minLng = corner.lng;
        if (corner.lng > maxLng) maxLng = corner.lng;
      });
    });

    if (minLat !== 90 && maxLat !== -90) {
      map.fitBounds(
        [
          [minLat, minLng],
          [maxLat, maxLng],
        ],
        { padding: [50, 50], maxZoom: 19 }
      );
      scheduleDraw();
    }
  }, [props.kmzData, scheduleDraw]);

  useEffect(() => {
    if (props.fitBoundsTrigger) {
      fitKmzBounds();
    }
  }, [props.fitBoundsTrigger, fitKmzBounds]);

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

  return (
    <div className="relative h-full w-full select-none touch-none">
      <div ref={hostRef} className="absolute inset-0 z-0 bg-transparent" />
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-10 bg-transparent"
        style={{ touchAction: "none" }}
      />

      {loading && (
        <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center bg-background/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm font-medium text-muted-foreground shadow-sm">
              Loading Map...
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center bg-background/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2 rounded-xl bg-destructive/10 p-6 text-destructive">
            <p className="font-semibold text-destructive">{error}</p>
            <p className="text-sm opacity-80">
              Please check your connection and try again
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

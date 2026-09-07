import type {
  LatLng,
  Map as LeafletMap,
  TileLayer,
  TileLayerOptions,
} from "leaflet";

export type ToolMapStyle = "satellite" | "street";

export const LEAFLET_ZOOM_TRANSITION =
  "transform 250ms cubic-bezier(0, 0, 0.25, 1)";

export const KMZ_TILE_PERFORMANCE = {
  keepBuffer: 3,
  updateWhenZooming: false,
  updateWhenIdle: true,
} as const;

export const GEO_TILE_PERFORMANCE = {
  keepBuffer: 8,
  updateWhenZooming: false,
  updateWhenIdle: false,
} as const;

type TilePerformanceOptions = Pick<
  TileLayerOptions,
  "keepBuffer" | "updateWhenZooming" | "updateWhenIdle"
>;

type CreateToolMapOptions = {
  center: [number, number];
  zoom: number;
  attributionControl: boolean;
  zoomAnimation?: boolean;
  fadeAnimation?: boolean;
  markerZoomAnimation?: boolean;
};

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

type CanvasZoomSyncOptions = {
  map: LeafletMap;
  canvas: HTMLCanvasElement;
  drawOverlay: () => void;
  scheduleDraw: () => void;
  cancelScheduledDraw: () => void;
};

export type LeafletCanvasZoomSync = {
  isAnimating: () => boolean;
  recordDrawnView: () => void;
  clearDrawnView: () => void;
  handleZoomAnim: (event: unknown) => void;
  handleZoom: () => void;
  handleZoomEnd: () => void;
  reset: () => void;
};

export function createToolLeafletMap(
  leaflet: typeof import("leaflet"),
  host: HTMLElement,
  options: CreateToolMapOptions,
): LeafletMap {
  return leaflet.map(host, {
    center: options.center,
    zoom: options.zoom,
    maxZoom: 22,
    zoomControl: false,
    attributionControl: options.attributionControl,
    zoomAnimation: options.zoomAnimation ?? true,
    fadeAnimation: options.fadeAnimation ?? true,
    markerZoomAnimation: options.markerZoomAnimation ?? true,
  });
}

export function createToolBaseTileLayer(
  leaflet: typeof import("leaflet"),
  style: ToolMapStyle,
  performance: TilePerformanceOptions,
): TileLayer {
  const commonOptions = {
    minZoom: 2,
    maxZoom: 22,
    keepBuffer: performance.keepBuffer,
    updateWhenZooming: performance.updateWhenZooming,
    updateWhenIdle: performance.updateWhenIdle,
  };

  if (style === "satellite") {
    return leaflet.tileLayer(
      "https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
      {
        ...commonOptions,
        subdomains: ["0", "1", "2", "3"],
        maxNativeZoom: 20,
        attribution: "&copy; Google Maps",
      },
    );
  }

  return leaflet.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    ...commonOptions,
    maxNativeZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
  });
}

export function createLeafletCanvasZoomSync({
  map,
  canvas,
  drawOverlay,
  scheduleDraw,
  cancelScheduledDraw,
}: CanvasZoomSyncOptions): LeafletCanvasZoomSync {
  let zoomAnimating = false;
  let drawnView: DrawnView | null = null;
  let pendingZoomOut: PendingZoomOut | null = null;

  const recordDrawnView = () => {
    const center = map.getCenter();
    drawnView = {
      lat: center.lat,
      lng: center.lng,
      zoom: map.getZoom(),
    };
  };

  const clearDrawnView = () => {
    drawnView = null;
  };

  const handleZoomAnim = (event: unknown) => {
    const zoomEvent = event as ZoomAnimationEvent;
    const baseView = drawnView;
    if (!baseView) return;

    cancelScheduledDraw();
    zoomAnimating = true;

    const halfSize = map.getSize().multiplyBy(0.5);
    const targetPixelOrigin = map
      .project(zoomEvent.center, zoomEvent.zoom)
      .subtract(halfSize);
    const baseCenterAtTarget = map
      .project([baseView.lat, baseView.lng], zoomEvent.zoom)
      .subtract(targetPixelOrigin);
    const scale = map.getZoomScale(zoomEvent.zoom, baseView.zoom);
    const translate = baseCenterAtTarget.subtract(halfSize.multiplyBy(scale));

    canvas.style.transformOrigin = "0 0";
    canvas.style.willChange = "transform";

    if (scale >= 1) {
      pendingZoomOut = null;
      canvas.style.transition = LEAFLET_ZOOM_TRANSITION;
      canvas.style.transform = `translate3d(${translate.x}px, ${translate.y}px, 0) scale(${scale})`;
      return;
    }

    const inverseScale = 1 / scale;
    const inverseTranslateX = -translate.x / scale;
    const inverseTranslateY = -translate.y / scale;
    pendingZoomOut = {
      targetZoom: zoomEvent.zoom,
      inverseTransform: `translate3d(${inverseTranslateX}px, ${inverseTranslateY}px, 0) scale(${inverseScale})`,
    };
  };

  const handleZoom = () => {
    const pending = pendingZoomOut;

    if (!pending) {
      scheduleDraw();
      return;
    }

    if (Math.abs(map.getZoom() - pending.targetZoom) > 0.001) return;

    pendingZoomOut = null;
    cancelScheduledDraw();

    canvas.style.transition = "none";
    canvas.style.transformOrigin = "0 0";
    canvas.style.willChange = "transform";
    canvas.style.transform = pending.inverseTransform;
    drawOverlay();

    void canvas.offsetWidth;
    canvas.style.transition = LEAFLET_ZOOM_TRANSITION;
    canvas.style.transform = "none";
  };

  const handleZoomEnd = () => {
    pendingZoomOut = null;
    zoomAnimating = false;
    cancelScheduledDraw();

    canvas.style.transition = "none";
    canvas.style.transform = "none";
    canvas.style.transformOrigin = "0 0";
    canvas.style.willChange = "auto";

    drawOverlay();
  };

  const reset = () => {
    pendingZoomOut = null;
    drawnView = null;
    zoomAnimating = false;
    canvas.style.transition = "none";
    canvas.style.transform = "none";
    canvas.style.transformOrigin = "0 0";
    canvas.style.willChange = "auto";
  };

  return {
    isAnimating: () => zoomAnimating,
    recordDrawnView,
    clearDrawnView,
    handleZoomAnim,
    handleZoom,
    handleZoomEnd,
    reset,
  };
}

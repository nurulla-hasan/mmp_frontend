import type { Map as LeafletMap, TileLayer } from "leaflet";
import type { KmzData, MapStyle, UserLocation } from "../types";

export function createBaseTileLayer(
  leaflet: typeof import("leaflet"),
  style: MapStyle,
): TileLayer {
  if (style === "satellite") {
    return leaflet.tileLayer(
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
    );
  }

  return leaflet.tileLayer(
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      minZoom: 2,
      maxZoom: 22,
      maxNativeZoom: 19,
      keepBuffer: 8,
      updateWhenZooming: false,
      updateWhenIdle: false,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    },
  );
}

export function computeKmzBounds(
  kmzData: KmzData,
): [[number, number], [number, number]] | null {
  if (!kmzData.tiles.length) return null;

  let minLat = 90;
  let maxLat = -90;
  let minLng = 180;
  let maxLng = -180;

  kmzData.tiles.forEach((tile) => {
    tile.corners.forEach((corner) => {
      if (corner.lat < minLat) minLat = corner.lat;
      if (corner.lat > maxLat) maxLat = corner.lat;
      if (corner.lng < minLng) minLng = corner.lng;
      if (corner.lng > maxLng) maxLng = corner.lng;
    });
  });

  if (minLat === 90 || maxLat === -90) return null;

  return [
    [minLat, minLng],
    [maxLat, maxLng],
  ];
}

export function drawKmzCanvas(
  context: CanvasRenderingContext2D,
  map: LeafletMap,
  kmzData: KmzData | null,
  images: Map<string, HTMLImageElement>,
  opacity: number,
  userLocation: UserLocation | null | undefined,
  ratio: number,
  width: number,
  height: number,
) {
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, width, height);

  if (kmzData) {
    context.globalAlpha = opacity;

    kmzData.tiles.forEach((tile) => {
      const image = images.get(tile.url);
      if (!image) return;

      const imageWidth = tile.width;
      const imageHeight = tile.height;

      // Corners: [Bottom-Left (0), Bottom-Right (1), Top-Right (2), Top-Left (3)]
      const origin = map.latLngToContainerPoint([
        tile.corners[3].lat,
        tile.corners[3].lng,
      ]);
      const right = map.latLngToContainerPoint([
        tile.corners[2].lat,
        tile.corners[2].lng,
      ]);
      const bottom = map.latLngToContainerPoint([
        tile.corners[0].lat,
        tile.corners[0].lng,
      ]);

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
  }

  // Draw GPS user location marker
  if (userLocation) {
    const pt = map.latLngToContainerPoint([
      userLocation.lat,
      userLocation.lng,
    ]);
    if (pt) {
      context.save();
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      // Accuracy pulse ring
      context.beginPath();
      context.arc(pt.x, pt.y, 18, 0, Math.PI * 2);
      context.fillStyle = "rgba(37, 99, 235, 0.22)";
      context.fill();

      // White halo
      context.beginPath();
      context.arc(pt.x, pt.y, 8, 0, Math.PI * 2);
      context.fillStyle = "#ffffff";
      context.shadowColor = "rgba(0, 0, 0, 0.35)";
      context.shadowBlur = 6;
      context.fill();

      // Blue dot
      context.beginPath();
      context.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
      context.fillStyle = "#2563eb";
      context.fill();

      context.restore();
    }
  }
}

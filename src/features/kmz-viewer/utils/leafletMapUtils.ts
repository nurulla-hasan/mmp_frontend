import type { Map as LeafletMap } from "leaflet";
import type { GeoBounds, KmzData, UserLocation } from "../types";

const VIEWPORT_PADDING = 0.12;

export function computeKmzBounds(kmzData: KmzData): GeoBounds | null {
  if (kmzData.bounds) return kmzData.bounds;

  let minLat = 90;
  let maxLat = -90;
  let minLng = 180;
  let maxLng = -180;
  const track = (lat: number, lng: number) => {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  };

  kmzData.tiles.forEach((t) => t.corners.forEach((c) => track(c.lat, c.lng)));
  kmzData.features?.forEach((f) => {
    f.rings?.forEach((r) => r.forEach((c) => track(c.lat, c.lng)));
    f.path?.forEach((c) => track(c.lat, c.lng));
    if (f.point) track(f.point.lat, f.point.lng);
  });

  if (minLat === 90 || maxLat === -90) return null;
  return [[minLat, minLng], [maxLat, maxLng]];
}

function boundsIntersectsViewport(
  bounds: GeoBounds | undefined,
  south: number,
  west: number,
  north: number,
  east: number,
): boolean {
  if (!bounds) return true;
  const [[minLat, minLng], [maxLat, maxLng]] = bounds;
  return maxLat >= south && minLat <= north && maxLng >= west && minLng <= east;
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
    const visibleBounds = map.getBounds().pad(VIEWPORT_PADDING);
    const south = visibleBounds.getSouth();
    const west = visibleBounds.getWest();
    const north = visibleBounds.getNorth();
    const east = visibleBounds.getEast();

    context.save();
    context.globalAlpha = Math.max(0.05, Math.min(1, opacity));

    // 1. Draw only raster tiles that intersect the visible map area.
    for (const tile of kmzData.tiles) {
      if (!boundsIntersectsViewport(tile.bounds, south, west, north, east)) continue;

      const image = images.get(tile.url);
      if (!image) continue;
      const imgW = image.naturalWidth || tile.width || 2048;
      const imgH = image.naturalHeight || tile.height || 2048;

      const origin = map.latLngToContainerPoint([tile.corners[3].lat, tile.corners[3].lng]);
      const right = map.latLngToContainerPoint([tile.corners[2].lat, tile.corners[2].lng]);
      const bottom = map.latLngToContainerPoint([tile.corners[0].lat, tile.corners[0].lng]);

      context.save();
      context.setTransform(
        ((right.x - origin.x) / imgW) * ratio,
        ((right.y - origin.y) / imgW) * ratio,
        ((bottom.x - origin.x) / imgH) * ratio,
        ((bottom.y - origin.y) / imgH) * ratio,
        origin.x * ratio,
        origin.y * ratio,
      );
      context.drawImage(image, 0, 0, imgW, imgH);
      context.restore();
    }

    // 2. Draw only vector features that intersect the visible map area.
    if (kmzData.features && kmzData.features.length > 0) {
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      for (const feat of kmzData.features) {
        if (!boundsIntersectsViewport(feat.bounds, south, west, north, east)) continue;

        // Polygons
        if (feat.type === "Polygon" && feat.rings && feat.rings.length > 0) {
          context.save();
          context.beginPath();
          feat.rings.forEach((ring) => {
            ring.forEach((pt, i) => {
              const cp = map.latLngToContainerPoint([pt.lat, pt.lng]);
              if (i === 0) context.moveTo(cp.x, cp.y);
              else context.lineTo(cp.x, cp.y);
            });
            context.closePath();
          });
          context.fillStyle = feat.fillColor || "rgba(59, 130, 246, 0.25)";
          context.fill("evenodd");
          context.strokeStyle = feat.strokeColor || "#3b82f6";
          context.lineWidth = Math.max(1, feat.strokeWidth || 2);
          context.lineJoin = "round";
          context.stroke();

          // Label anchor is precomputed during parsing, avoiding a second full vertex projection pass.
          const labelPoint = feat.labelPoint;
          if (feat.name && labelPoint) {
            const cp = map.latLngToContainerPoint([labelPoint.lat, labelPoint.lng]);
            context.save();
            context.font = "bold 11px sans-serif";
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.fillStyle = "#ffffff";
            context.shadowColor = "rgba(0,0,0,0.8)";
            context.shadowBlur = 4;
            context.fillText(feat.name, cp.x, cp.y);
            context.restore();
          }
          context.restore();
        }

        // LineStrings
        if (feat.type === "LineString" && feat.path && feat.path.length >= 2) {
          context.save();
          context.beginPath();
          feat.path.forEach((pt, i) => {
            const cp = map.latLngToContainerPoint([pt.lat, pt.lng]);
            if (i === 0) context.moveTo(cp.x, cp.y);
            else context.lineTo(cp.x, cp.y);
          });
          context.strokeStyle = feat.strokeColor || "#3b82f6";
          context.lineWidth = Math.max(1.5, feat.strokeWidth || 2.5);
          context.lineCap = "round";
          context.lineJoin = "round";
          context.stroke();
          context.restore();
        }

        // Points
        if (feat.type === "Point" && feat.point) {
          const cp = map.latLngToContainerPoint([feat.point.lat, feat.point.lng]);
          context.save();
          context.beginPath();
          context.arc(cp.x, cp.y, 6, 0, Math.PI * 2);
          context.fillStyle = feat.strokeColor || "#3b82f6";
          context.shadowColor = "rgba(0, 0, 0, 0.4)";
          context.shadowBlur = 4;
          context.fill();
          context.shadowBlur = 0;
          context.shadowColor = "transparent";
          context.lineWidth = 2;
          context.strokeStyle = "#ffffff";
          context.stroke();

          if (feat.name) {
            context.save();
            context.font = "bold 11px sans-serif";
            context.textAlign = "left";
            context.textBaseline = "middle";
            context.fillStyle = "#ffffff";
            context.shadowColor = "rgba(0,0,0,0.9)";
            context.shadowBlur = 4;
            context.fillText(feat.name, cp.x + 9, cp.y);
            context.restore();
          }
          context.restore();
        }
      }
    }

    context.restore();
  }

  // 3. Draw GPS User Location
  if (userLocation) {
    const pt = map.latLngToContainerPoint([userLocation.lat, userLocation.lng]);
    context.save();
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.beginPath();
    context.arc(pt.x, pt.y, 18, 0, Math.PI * 2);
    context.fillStyle = "rgba(37, 99, 235, 0.22)";
    context.fill();

    context.beginPath();
    context.arc(pt.x, pt.y, 8, 0, Math.PI * 2);
    context.fillStyle = "#ffffff";
    context.shadowColor = "rgba(0, 0, 0, 0.35)";
    context.shadowBlur = 6;
    context.fill();

    context.beginPath();
    context.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
    context.fillStyle = "#2563eb";
    context.fill();
    context.restore();
  }
}

import { unzipSync } from "fflate";
import { type GeoPoint, type KmzData, type KmzFeature, type KmzTile } from "../types";

function parseKmlColor(kmlHex?: string | null): { stroke?: string; fill?: string } {
  if (!kmlHex || kmlHex.length < 6) return {};
  const clean = kmlHex.trim().toLowerCase().padStart(8, "f");
  const a = parseInt(clean.slice(0, 2), 16) / 255;
  const b = parseInt(clean.slice(2, 4), 16);
  const g = parseInt(clean.slice(4, 6), 16);
  const r = parseInt(clean.slice(6, 8), 16);
  return {
    stroke: `rgba(${r}, ${g}, ${b}, ${Math.max(0.6, a)})`,
    fill: `rgba(${r}, ${g}, ${b}, ${Math.min(0.35, a * 0.5)})`,
  };
}

function parseCoords(text?: string | null): GeoPoint[] {
  if (!text) return [];
  const points: GeoPoint[] = [];
  const coordRegex = /(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)(?:\s*,\s*-?\d+(?:\.\d+)?)?/g;
  let match: RegExpExecArray | null;
  while ((match = coordRegex.exec(text)) !== null) {
    const lng = parseFloat(match[1]);
    const lat = parseFloat(match[2]);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      points.push({ lat, lng });
    }
  }
  return points;
}

function getMimeType(filename: string, buf?: Uint8Array): string {
  if (buf && buf.length > 4) {
    if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "image/png";
    if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
    if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46) return "image/webp";
  }
  const lower = filename.toLowerCase();
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  return "image/png";
}

interface ZipImageIndex {
  exactMap: Map<string, Uint8Array>;
  basenameMap: Map<string, Uint8Array>;
  singleImage: Uint8Array | null;
}

function buildZipImageIndex(unzippedFiles: Record<string, Uint8Array>): ZipImageIndex {
  const exactMap = new Map<string, Uint8Array>();
  const basenameMap = new Map<string, Uint8Array>();
  const images: Uint8Array[] = [];

  for (const [key, data] of Object.entries(unzippedFiles)) {
    const cleanKey = key.replace(/^[./\\]+/, "").replace(/\\/g, "/").trim().toLowerCase();
    exactMap.set(cleanKey, data);
    const basename = cleanKey.split("/").pop() || cleanKey;
    basenameMap.set(basename, data);

    if (cleanKey.endsWith(".png") || cleanKey.endsWith(".jpg") || cleanKey.endsWith(".jpeg") || cleanKey.endsWith(".webp")) {
      images.push(data);
    }
  }

  return {
    exactMap,
    basenameMap,
    singleImage: images.length === 1 ? images[0] : null,
  };
}

function findImageInZip(index: ZipImageIndex, href: string): Uint8Array | null {
  if (!href) return null;
  const cleanHref = decodeURIComponent(href.replace(/^[./\\]+/, "").replace(/\\/g, "/").trim().toLowerCase());
  const hrefBasename = cleanHref.split("/").pop() || cleanHref;

  const exact = index.exactMap.get(cleanHref);
  if (exact) return exact;

  for (const [cleanKey, data] of index.exactMap) {
    if (cleanKey.endsWith("/" + cleanHref) || cleanHref.endsWith("/" + cleanKey)) return data;
  }

  const byBase = index.basenameMap.get(hrefBasename);
  if (byBase) return byBase;

  return index.singleImage;
}

function parseRotatedBox(n: number, s: number, e: number, w: number, rotDeg: number): [GeoPoint, GeoPoint, GeoPoint, GeoPoint] {
  if (Math.abs(rotDeg) < 0.001) {
    return [{ lat: s, lng: w }, { lat: s, lng: e }, { lat: n, lng: e }, { lat: n, lng: w }];
  }
  const cLat = (n + s) / 2;
  const cLng = (e + w) / 2;
  const rad = (rotDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const transform = (lat: number, lng: number): GeoPoint => {
    const dLng = lng - cLng;
    const dLat = lat - cLat;
    return { lat: cLat + dLat * cos + dLng * sin, lng: cLng + dLng * cos - dLat * sin };
  };
  return [transform(s, w), transform(s, e), transform(n, e), transform(n, w)];
}

export async function parseKmzFile(file: File): Promise<KmzData> {
  const isKml = file.name.toLowerCase().endsWith(".kml");
  const kmlStrings: string[] = [];
  let unzippedFiles: Record<string, Uint8Array> = {};

  if (isKml) {
    kmlStrings.push(await file.text());
  } else {
    try {
      const buffer = await file.arrayBuffer();
      unzippedFiles = unzipSync(new Uint8Array(buffer));
      for (const [key, data] of Object.entries(unzippedFiles)) {
        if (key.toLowerCase().endsWith(".kml")) {
          kmlStrings.push(new TextDecoder("utf-8").decode(data));
        }
      }
    } catch {
      kmlStrings.push(await file.text());
    }
  }

  if (!kmlStrings.length) throw new Error("No readable KML content found in file");

  const parser = new DOMParser();
  const tiles: KmzTile[] = [];
  const features: KmzFeature[] = [];
  let docName = file.name.replace(/\.(kmz|kml)$/i, "");

  let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
  const trackCoord = (p: GeoPoint) => {
    if (p.lat < minLat) minLat = p.lat;
    if (p.lat > maxLat) maxLat = p.lat;
    if (p.lng < minLng) minLng = p.lng;
    if (p.lng > maxLng) maxLng = p.lng;
  };

  for (const kmlText of kmlStrings) {
    const xmlDoc = parser.parseFromString(kmlText, "text/xml");
    const nameNode = xmlDoc.getElementsByTagNameNS("*", "name")[0] || xmlDoc.getElementsByTagName("name")[0];
    if (nameNode?.textContent?.trim()) docName = nameNode.textContent.trim();

    // 1. Parse Styles
    const styleMap = new Map<string, { strokeColor?: string; strokeWidth?: number; fillColor?: string }>();
    const styleNodes = Array.from(xmlDoc.getElementsByTagNameNS("*", "Style"));
    styleNodes.forEach((s) => {
      const id = s.getAttribute("id");
      if (!id) return;
      const lineCol = s.getElementsByTagNameNS("*", "LineStyle")[0]?.getElementsByTagNameNS("*", "color")[0]?.textContent;
      const lineW = Number(s.getElementsByTagNameNS("*", "LineStyle")[0]?.getElementsByTagNameNS("*", "width")[0]?.textContent) || 2;
      const polyCol = s.getElementsByTagNameNS("*", "PolyStyle")[0]?.getElementsByTagNameNS("*", "color")[0]?.textContent;
      const strokeParsed = parseKmlColor(lineCol);
      const polyParsed = parseKmlColor(polyCol);
      styleMap.set(`#${id}`, {
        strokeColor: strokeParsed.stroke || polyParsed.stroke || "#3b82f6",
        strokeWidth: Math.max(1.5, Math.min(6, lineW)),
        fillColor: polyParsed.fill || strokeParsed.fill || "rgba(59, 130, 246, 0.25)",
      });
    });

    // 2. Parse Ground Overlays
    const imageIndex = buildZipImageIndex(unzippedFiles);
    const overlays = Array.from(xmlDoc.getElementsByTagNameNS("*", "GroundOverlay"));
    for (const ov of overlays) {
      const href = (ov.getElementsByTagNameNS("*", "Icon")[0]?.getElementsByTagNameNS("*", "href")[0]?.textContent || "").trim();
      let corners: [GeoPoint, GeoPoint, GeoPoint, GeoPoint] | null = null;

      const quadCoords = ov.getElementsByTagNameNS("*", "LatLonQuad")[0]?.getElementsByTagNameNS("*", "coordinates")[0]?.textContent;
      if (quadCoords) {
        const pts = parseCoords(quadCoords);
        if (pts.length >= 4) corners = [pts[0], pts[1], pts[2], pts[3]];
      }

      if (!corners) {
        const box = ov.getElementsByTagNameNS("*", "LatLonBox")[0];
        if (box) {
          const getV = (t: string) => Number(box.getElementsByTagNameNS("*", t)[0]?.textContent);
          const [n, s, e, w, r] = [getV("north"), getV("south"), getV("east"), getV("west"), getV("rotation") || 0];
          if (!isNaN(n) && !isNaN(s) && !isNaN(e) && !isNaN(w)) corners = parseRotatedBox(n, s, e, w, r);
        }
      }

      if (!corners || !href) continue;
      corners.forEach(trackCoord);

      const buf = findImageInZip(imageIndex, href);
      let url = href;
      if (buf) {
        const cleanArrayBuffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
        const blob = new Blob([cleanArrayBuffer], { type: getMimeType(href, buf) });
        url = URL.createObjectURL(blob);
      }

      tiles.push({ url, corners });
    }

    // 3. Parse Placemarks (Vector Polygons, Lines, Points)
    const placemarks = Array.from(xmlDoc.getElementsByTagNameNS("*", "Placemark"));
    placemarks.forEach((pm, idx) => {
      const pmName = pm.getElementsByTagNameNS("*", "name")[0]?.textContent?.trim();
      const pmDesc = pm.getElementsByTagNameNS("*", "description")[0]?.textContent?.trim();
      const styleUrl = pm.getElementsByTagNameNS("*", "styleUrl")[0]?.textContent?.trim();
      const st = (styleUrl ? styleMap.get(styleUrl) : undefined) || {
        strokeColor: "#3b82f6",
        strokeWidth: 2,
        fillColor: "rgba(59, 130, 246, 0.22)",
      };

      // Polygons
      const polys = Array.from(pm.getElementsByTagNameNS("*", "Polygon"));
      polys.forEach((poly) => {
        const outerNode = poly.getElementsByTagNameNS("*", "outerBoundaryIs")[0] || poly.getElementsByTagNameNS("*", "LinearRing")[0] || poly;
        const outerCoords = outerNode.getElementsByTagNameNS("*", "coordinates")[0]?.textContent || outerNode.textContent;
        const outer = parseCoords(outerCoords);
        if (outer.length >= 3) {
          outer.forEach(trackCoord);
          const rings = [outer];
          Array.from(poly.getElementsByTagNameNS("*", "innerBoundaryIs")).forEach((inner) => {
            const inCoords = parseCoords(inner.getElementsByTagNameNS("*", "coordinates")[0]?.textContent || inner.textContent);
            if (inCoords.length >= 3) rings.push(inCoords);
          });
          features.push({
            id: `poly-${idx}-${features.length}`,
            name: pmName,
            description: pmDesc,
            type: "Polygon",
            rings,
            ...st,
          });
        }
      });

      // LineStrings
      const lines = Array.from(pm.getElementsByTagNameNS("*", "LineString"));
      lines.forEach((line) => {
        const pts = parseCoords(line.getElementsByTagNameNS("*", "coordinates")[0]?.textContent);
        if (pts.length >= 2) {
          pts.forEach(trackCoord);
          features.push({
            id: `line-${idx}-${features.length}`,
            name: pmName,
            description: pmDesc,
            type: "LineString",
            path: pts,
            ...st,
          });
        }
      });

      // Points
      const points = Array.from(pm.getElementsByTagNameNS("*", "Point"));
      points.forEach((pt) => {
        const pts = parseCoords(pt.getElementsByTagNameNS("*", "coordinates")[0]?.textContent);
        if (pts.length >= 1) {
          trackCoord(pts[0]);
          features.push({
            id: `point-${idx}-${features.length}`,
            name: pmName,
            description: pmDesc,
            type: "Point",
            point: pts[0],
            ...st,
          });
        }
      });
    });
  }

  if (tiles.length === 0 && features.length === 0) {
    throw new Error("No map overlays or vector features found in the KMZ/KML file");
  }

  const validBounds = minLat !== 90 && maxLat !== -90 && minLng !== 180 && maxLng !== -180;
  return {
    name: docName,
    tiles,
    features,
    bounds: validBounds ? [[minLat, minLng], [maxLat, maxLng]] : null,
    summary: {
      tileCount: tiles.length,
      polygonCount: features.filter((f) => f.type === "Polygon").length,
      lineCount: features.filter((f) => f.type === "LineString").length,
      pointCount: features.filter((f) => f.type === "Point").length,
    },
  };
}

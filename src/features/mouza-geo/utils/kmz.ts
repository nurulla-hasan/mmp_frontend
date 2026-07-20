import type { GeoPoint, GeoTransform } from '../types';
import { getOverlayCorners } from './geoMath';

const encoder = new TextEncoder();

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function concatBytes(parts: Uint8Array[]): Uint8Array {
  const length = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(length);
  let offset = 0;
  for (const part of parts) {
    output.set(part, offset);
    offset += part.length;
  }
  return output;
}

function writeHeader(length: number, writer: (view: DataView) => void) {
  const bytes = new Uint8Array(length);
  writer(new DataView(bytes.buffer));
  return bytes;
}

function createStoredZip(files: Array<{ name: string; data: Uint8Array }>) {
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let localOffset = 0;

  for (const file of files) {
    const name = encoder.encode(file.name);
    const checksum = crc32(file.data);
    const localHeader = writeHeader(30, (view) => {
      view.setUint32(0, 0x04034b50, true);
      view.setUint16(4, 20, true);
      view.setUint16(6, 0x0800, true);
      view.setUint16(8, 0, true);
      view.setUint32(14, checksum, true);
      view.setUint32(18, file.data.length, true);
      view.setUint32(22, file.data.length, true);
      view.setUint16(26, name.length, true);
    });

    localParts.push(localHeader, name, file.data);

    const centralHeader = writeHeader(46, (view) => {
      view.setUint32(0, 0x02014b50, true);
      view.setUint16(4, 20, true);
      view.setUint16(6, 20, true);
      view.setUint16(8, 0x0800, true);
      view.setUint16(10, 0, true);
      view.setUint32(16, checksum, true);
      view.setUint32(20, file.data.length, true);
      view.setUint32(24, file.data.length, true);
      view.setUint16(28, name.length, true);
      view.setUint32(42, localOffset, true);
    });

    centralParts.push(centralHeader, name);
    localOffset += localHeader.length + name.length + file.data.length;
  }

  const centralDirectory = concatBytes(centralParts);
  const end = writeHeader(22, (view) => {
    view.setUint32(0, 0x06054b50, true);
    view.setUint16(8, files.length, true);
    view.setUint16(10, files.length, true);
    view.setUint32(12, centralDirectory.length, true);
    view.setUint32(16, localOffset, true);
  });

  return concatBytes([...localParts, centralDirectory, end]);
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const commaIndex = dataUrl.indexOf(',');
  if (commaIndex < 0) throw new Error('Overlay image data পাওয়া যায়নি');
  const metadata = dataUrl.slice(0, commaIndex);
  const payload = dataUrl.slice(commaIndex + 1);

  if (!metadata.includes(';base64')) {
    return encoder.encode(decodeURIComponent(payload));
  }

  const binary = window.atob(payload);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function coordinateText(points: GeoPoint[]) {
  return points.map((point) => `${point.lng},${point.lat}`).join(' ');
}

export type KmzExportQuality = 'optimized' | 'original';

const OPTIMIZED_MAX_DIMENSION = 6144;
const OPTIMIZED_MAX_PIXELS = 24_000_000;

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: 'image/jpeg' | 'image/png',
  quality?: number,
) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error('KMZ image optimize করা যায়নি')),
      type,
      quality,
    );
  });
}

async function createOptimizedOverlay(
  image: HTMLImageElement,
  transparent: boolean,
) {
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  const dimensionScale = Math.min(
    1,
    OPTIMIZED_MAX_DIMENSION / Math.max(sourceWidth, sourceHeight),
  );
  const pixelScale = Math.min(
    1,
    Math.sqrt(OPTIMIZED_MAX_PIXELS / (sourceWidth * sourceHeight)),
  );
  const scale = Math.min(dimensionScale, pixelScale);
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');

  if (!context) throw new Error('KMZ image canvas তৈরি করা যায়নি');

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';

  if (!transparent) {
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
  }

  context.drawImage(image, 0, 0, width, height);

  const extension = transparent ? 'png' : 'jpg';
  const blob = await canvasToBlob(
    canvas,
    transparent ? 'image/png' : 'image/jpeg',
    transparent ? undefined : 0.9,
  );
  const data = new Uint8Array(await blob.arrayBuffer());
  canvas.width = 1;
  canvas.height = 1;

  return { data, extension };
}

function getOriginalOverlay(dataUrl: string) {
  const isJpeg = /^data:image\/jpe?g[;,]/i.test(dataUrl);
  return {
    data: dataUrlToBytes(dataUrl),
    extension: isJpeg ? 'jpg' : 'png',
  };
}

export async function exportMouzaKmz(options: {
  transform: GeoTransform;
  image: HTMLImageElement;
  imageDataUrl: string;
  imageSize: { width: number; height: number };
  name: string;
  transparent: boolean;
  quality: KmzExportQuality;
}) {
  const overlay =
    options.quality === 'optimized'
      ? await createOptimizedOverlay(options.image, options.transparent)
      : getOriginalOverlay(options.imageDataUrl);
  const overlayPath = `files/mouza-map.${overlay.extension}`;
  const corners = getOverlayCorners(options.transform, options.imageSize);
  const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2">
  <Document>
    <name>${options.name.replace(/[<>&]/g, '')}</name>
    <GroundOverlay>
      <name>${options.name.replace(/[<>&]/g, '')}</name>
      <Icon><href>${overlayPath}</href></Icon>
      <altitudeMode>clampToGround</altitudeMode>
      <gx:LatLonQuad>
        <coordinates>${coordinateText(corners)}</coordinates>
      </gx:LatLonQuad>
    </GroundOverlay>
  </Document>
</kml>`;

  const archive = createStoredZip([
    { name: 'doc.kml', data: encoder.encode(kml) },
    { name: overlayPath, data: overlay.data },
  ]);
  const archiveBuffer = new ArrayBuffer(archive.byteLength);
  new Uint8Array(archiveBuffer).set(archive);
  const blob = new Blob([archiveBuffer], {
    type: 'application/vnd.google-earth.kmz',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${options.name.trim() || 'mouza-map'}.kmz`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

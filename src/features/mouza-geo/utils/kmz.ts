import type { GeoPoint, GeoTransform } from '../types';
import { applyGeoTransform, fromMercator } from './geoMath';

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

function coordinateText(points: GeoPoint[]) {
  return points.map((point) => `${point.lng},${point.lat}`).join(' ');
}

export type KmzExportQuality = 'optimized' | 'original';

const TILE_SIZE = 2048;

type OverlayTile = {
  column: number;
  row: number;
  x: number;
  y: number;
  width: number;
  height: number;
  path: string;
  data: Uint8Array;
};

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

function getTileCorners(transform: GeoTransform, tile: OverlayTile) {
  return [
    { x: tile.x, y: tile.y + tile.height },
    { x: tile.x + tile.width, y: tile.y + tile.height },
    { x: tile.x + tile.width, y: tile.y },
    { x: tile.x, y: tile.y },
  ].map((point) => fromMercator(applyGeoTransform(transform, point)));
}

async function createOverlayTiles(
  image: HTMLImageElement,
  transparent: boolean,
  quality: KmzExportQuality,
) {
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  const columns = Math.ceil(sourceWidth / TILE_SIZE);
  const rows = Math.ceil(sourceHeight / TILE_SIZE);
  const extension = transparent || quality === 'original' ? 'png' : 'jpg';
  const mimeType = extension === 'png' ? 'image/png' : 'image/jpeg';
  const canvas = document.createElement('canvas');
  const tiles: OverlayTile[] = [];

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const x = column * TILE_SIZE;
      const y = row * TILE_SIZE;
      const width = Math.min(TILE_SIZE, sourceWidth - x);
      const height = Math.min(TILE_SIZE, sourceHeight - y);
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');

      if (!context) throw new Error('KMZ tile canvas তৈরি করা যায়নি');

      if (!transparent) {
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, width, height);
      }

      context.drawImage(
        image,
        x,
        y,
        width,
        height,
        0,
        0,
        width,
        height,
      );

      const blob = await canvasToBlob(
        canvas,
        mimeType,
        mimeType === 'image/jpeg' ? 0.94 : undefined,
      );

      tiles.push({
        column,
        row,
        x,
        y,
        width,
        height,
        path: `files/tile-${row}-${column}.${extension}`,
        data: new Uint8Array(await blob.arrayBuffer()),
      });
    }
  }

  canvas.width = 1;
  canvas.height = 1;
  return tiles;
}

export async function exportMouzaKmz(options: {
  transform: GeoTransform;
  image: HTMLImageElement;
  imageSize: { width: number; height: number };
  name: string;
  transparent: boolean;
  quality: KmzExportQuality;
}) {
  const tiles = await createOverlayTiles(
    options.image,
    options.transparent,
    options.quality,
  );
  const safeName = options.name.replace(/[<>&]/g, '');
  const overlays = tiles
    .map(
      (tile) => `
    <GroundOverlay>
      <name>${safeName} ${tile.row + 1}-${tile.column + 1}</name>
      <drawOrder>1</drawOrder>
      <Icon><href>${tile.path}</href></Icon>
      <altitudeMode>clampToGround</altitudeMode>
      <gx:LatLonQuad>
        <coordinates>${coordinateText(getTileCorners(options.transform, tile))}</coordinates>
      </gx:LatLonQuad>
    </GroundOverlay>`,
    )
    .join('');
  const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2">
  <Document>
    <name>${safeName}</name>
    <Folder>
      <name>${safeName} high-resolution tiles</name>${overlays}
    </Folder>
  </Document>
</kml>`;

  const archive = createStoredZip([
    { name: 'doc.kml', data: encoder.encode(kml) },
    ...tiles.map((tile) => ({ name: tile.path, data: tile.data })),
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

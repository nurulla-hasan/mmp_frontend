import { strToU8, Zip, ZipPassThrough } from 'fflate';

import type { GeoPoint, GeoTransform } from '../types';
import { applyGeoTransform, fromMercator } from './geoMath';
import { processGeoPixelBuffer } from './imageProcessing';

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
          : reject(new Error('Could not optimize KMZ image')),
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

function createTileDescriptors(
  width: number,
  height: number,
  extension: 'jpg' | 'png',
) {
  const columns = Math.ceil(width / TILE_SIZE);
  const rows = Math.ceil(height / TILE_SIZE);
  const tiles: OverlayTile[] = [];

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const x = column * TILE_SIZE;
      const y = row * TILE_SIZE;
      tiles.push({
        column,
        row,
        x,
        y,
        width: Math.min(TILE_SIZE, width - x),
        height: Math.min(TILE_SIZE, height - y),
        path: `files/tile-${row}-${column}.${extension}`,
      });
    }
  }

  return tiles;
}

function addStoredFile(zip: Zip, name: string, data: Uint8Array) {
  const entry = new ZipPassThrough(name);
  zip.add(entry);
  entry.push(data, true);
}

function nextPaint() {
  return new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => resolve());
  });
}

export async function exportMouzaKmz(options: {
  transform: GeoTransform;
  image: HTMLImageElement;
  imageSize: { width: number; height: number };
  name: string;
  transparent: boolean;
  quality: KmzExportQuality;
  backgroundSensitivity: number;
  lineColor: string;
  onProgress?: (progress: number) => void;
}) {
  const sourceWidth = options.imageSize.width;
  const sourceHeight = options.imageSize.height;
  const extension =
    options.transparent || options.quality === 'original' ? 'png' : 'jpg';
  const mimeType = extension === 'png' ? 'image/png' : 'image/jpeg';
  const tiles = createTileDescriptors(sourceWidth, sourceHeight, extension);
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

  const archiveParts: ArrayBuffer[] = [];
  let resolveArchive!: () => void;
  let rejectArchive!: (error: Error) => void;
  const archiveDone = new Promise<void>((resolve, reject) => {
    resolveArchive = resolve;
    rejectArchive = reject;
  });
  const zip = new Zip((error, chunk, final) => {
    if (error) {
      rejectArchive(error);
      return;
    }
    archiveParts.push(
      chunk.buffer.slice(
        chunk.byteOffset,
        chunk.byteOffset + chunk.byteLength,
      ) as ArrayBuffer,
    );
    if (final) resolveArchive();
  });

  addStoredFile(zip, 'doc.kml', strToU8(kml));
  const canvas = document.createElement('canvas');

  try {
    for (let index = 0; index < tiles.length; index += 1) {
      const tile = tiles[index];
      canvas.width = tile.width;
      canvas.height = tile.height;
      const context = canvas.getContext('2d', { willReadFrequently: options.transparent });
      if (!context) throw new Error('Could not create KMZ tile canvas');

      if (!options.transparent) {
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, tile.width, tile.height);
      }
      context.drawImage(
        options.image,
        tile.x,
        tile.y,
        tile.width,
        tile.height,
        0,
        0,
        tile.width,
        tile.height,
      );

      if (options.transparent) {
        const pixels = context.getImageData(0, 0, tile.width, tile.height);
        const processed = await processGeoPixelBuffer(pixels.data, {
          sensitivity: options.backgroundSensitivity,
          lineColor: options.lineColor,
        });
        const outputPixels = new Uint8ClampedArray(processed.length);
        outputPixels.set(processed);
        context.putImageData(
          new ImageData(outputPixels, tile.width, tile.height),
          0,
          0,
        );
      }

      const blob = await canvasToBlob(
        canvas,
        mimeType,
        mimeType === 'image/jpeg' ? 0.94 : undefined,
      );
      addStoredFile(zip, tile.path, new Uint8Array(await blob.arrayBuffer()));
      options.onProgress?.((index + 1) / tiles.length);
      await nextPaint();
    }

    zip.end();
    await archiveDone;
  } finally {
    canvas.width = 1;
    canvas.height = 1;
  }

  const blob = new Blob(archiveParts, {
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

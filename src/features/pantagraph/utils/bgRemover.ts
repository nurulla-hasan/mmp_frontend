import { blobToImage, resizeImageForCanvas } from '@/lib/canvasImage';
import { runPixelTask } from './pixelWorker';

type RGBColor = { r: number; g: number; b: number };

/** Parse a hex color string like "#aabbcc" or "#abc" to R,G,B. */
export function parseHex(hex: string): RGBColor {
  const value = hex.replace(/^#/, '');
  if (value.length === 3) {
    return {
      r: parseInt(value[0] + value[0], 16),
      g: parseInt(value[1] + value[1], 16),
      b: parseInt(value[2] + value[2], 16),
    };
  }
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}

function processPixelsSync(
  data: Uint8ClampedArray,
  colors: RGBColor[],
  tolerance: number,
): void {
  const feather = 20;
  for (let i = 0; i < data.length; i += 4) {
    let minAlpha = 255;
    for (const color of colors) {
      const distance = Math.max(
        Math.abs(data[i] - color.r),
        Math.abs(data[i + 1] - color.g),
        Math.abs(data[i + 2] - color.b),
      );

      if (distance <= tolerance) {
        minAlpha = 0;
        break;
      }
      if (distance < tolerance + feather) {
        minAlpha = Math.min(
          minAlpha,
          Math.round(((distance - tolerance) / feather) * 255),
        );
      }
    }
    if (minAlpha < 255) data[i + 3] = minAlpha;
  }
}

function processAlphaSync(data: Uint8ClampedArray, edge0: number, edge1: number): void {
  const range = Math.max(edge1 - edge0, 0.01);
  for (let i = 3; i < data.length; i += 4) {
    const alpha = data[i] / 255;
    const t = Math.max(0, Math.min(1, (alpha - edge0) / range));
    data[i] = Math.round(t * t * (3 - 2 * t) * 255);
  }
}

async function processPixels(
  data: Uint8ClampedArray,
  colors: RGBColor[],
  tolerance: number,
): Promise<Uint8ClampedArray> {
  const task = runPixelTask(data, { type: 'removeBg', colors, tolerance });
  if (task) {
    try {
      return await task;
    } catch {
      // The source data was not transferred, so it remains safe for fallback.
    }
  }
  processPixelsSync(data, colors, tolerance);
  return data;
}

async function processAlpha(
  data: Uint8ClampedArray,
  edge0: number,
  edge1: number,
): Promise<Uint8ClampedArray> {
  const task = runPixelTask(data, { type: 'smoothAlpha', edge0, edge1 });
  if (task) {
    try {
      return await task;
    } catch {
      // Continue with the same source data on the main thread.
    }
  }
  processAlphaSync(data, edge0, edge1);
  return data;
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to encode processed image'));
    }, 'image/png');
  });
}

function createImageData(
  data: Uint8ClampedArray,
  width: number,
  height: number,
): ImageData {
  const view = new Uint8ClampedArray(
    data.buffer as ArrayBuffer,
    data.byteOffset,
    data.length,
  );
  return new ImageData(view, width, height);
}

/** Remove target color(s) from a map without blocking the main thread. */
export async function removeBackground(
  img: HTMLImageElement,
  colors?: RGBColor[],
  tolerance = 60,
  lineSmoothing = 2,
  onProgress?: (pct: number) => void,
): Promise<HTMLImageElement> {
  const source = await resizeImageForCanvas(img);
  const width = source.naturalWidth || source.width;
  const height = source.naturalHeight || source.height;
  const canvas = document.createElement('canvas');
  let smoothCanvas: HTMLCanvasElement | null = null;
  canvas.width = width;
  canvas.height = height;

  try {
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('Canvas 2D context not available');

    context.drawImage(source, 0, 0, width, height);
    const imageData = context.getImageData(0, 0, width, height);

    let colorsToRemove = colors;
    if (!colorsToRemove?.length) {
      const edgeColor = detectEdgeColor(imageData.data, width, height);
      colorsToRemove = [{
        r: Math.round(edgeColor.r),
        g: Math.round(edgeColor.g),
        b: Math.round(edgeColor.b),
      }];
      tolerance = edgeColor.isWhite ? 50 : 70;
    }

    onProgress?.(0.1);
    const processedData = await processPixels(imageData.data, colorsToRemove, tolerance);
    context.putImageData(createImageData(processedData, width, height), 0, 0);
    onProgress?.(0.75);

    let outputCanvas = canvas;
    if (lineSmoothing > 0) {
      smoothCanvas = document.createElement('canvas');
      smoothCanvas.width = width;
      smoothCanvas.height = height;
      const smoothContext = smoothCanvas.getContext('2d', { willReadFrequently: true });
      if (!smoothContext) throw new Error('Canvas 2D context not available');

      smoothContext.filter = `blur(${lineSmoothing * 0.2}px)`;
      smoothContext.drawImage(canvas, 0, 0);
      smoothContext.filter = 'none';
      smoothContext.globalAlpha = 0.6;
      smoothContext.drawImage(canvas, 0, 0);
      smoothContext.globalAlpha = 1;

      const strength = lineSmoothing / 5;
      const edge0 = Math.max(0, 0.05 + 0.15 * (1 - strength));
      const edge1 = 0.5 + 0.2 * (1 - strength);
      const finalData = smoothContext.getImageData(0, 0, width, height);
      const smoothedData = await processAlpha(finalData.data, edge0, edge1);
      smoothContext.putImageData(createImageData(smoothedData, width, height), 0, 0);
      outputCanvas = smoothCanvas;
    }

    onProgress?.(0.9);
    const result = await blobToImage(await canvasToBlob(outputCanvas));
    onProgress?.(1);
    return result;
  } finally {
    canvas.width = 1;
    canvas.height = 1;
    if (smoothCanvas) {
      smoothCanvas.width = 1;
      smoothCanvas.height = 1;
    }
  }
}

function detectEdgeColor(
  data: Uint8ClampedArray,
  width: number,
  height: number,
): RGBColor & { isWhite: boolean } {
  let rTotal = 0;
  let gTotal = 0;
  let bTotal = 0;
  let count = 0;

  const sample = (index: number) => {
    rTotal += data[index];
    gTotal += data[index + 1];
    bTotal += data[index + 2];
    count++;
  };

  for (let x = 0; x < width; x += 3) sample(x * 4);
  const bottomRow = (height - 1) * width * 4;
  for (let x = 0; x < width; x += 3) sample(bottomRow + x * 4);
  for (let y = 1; y < height - 1; y += 3) sample(y * width * 4);
  for (let y = 1; y < height - 1; y += 3) sample(y * width * 4 + (width - 1) * 4);

  const r = rTotal / count;
  const g = gTotal / count;
  const b = bTotal / count;
  return { r, g, b, isWhite: r > 180 && g > 180 && b > 180 };
}
